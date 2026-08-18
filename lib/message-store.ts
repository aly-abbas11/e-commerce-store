import type { QueryParams } from "@sanity/client";

import { getWriteClient } from "@/lib/sanity/write";
import { getAllOrders } from "@/lib/order-store";
import { normalizePhone } from "@/lib/messaging";
import type {
  BroadcastContact,
  MessageCampaign,
  MessageRecipient,
} from "@/lib/types";

const BROADCAST_DOC_ID = "broadcast.contacts";

interface BroadcastDoc {
  _id?: string;
  manual?: { id: string; phone: string; name?: string; city?: string; note?: string }[];
  suppressed?: string[];
}

interface StoredRecipient {
  phone: string;
  name?: string;
  status: MessageRecipient["status"];
  messageId?: string;
  sentAt?: string;
  error?: string;
}

async function fetchAdmin<T>(query: string, params?: QueryParams): Promise<T | null> {
  const client = getWriteClient();
  if (!client) return null;
  try {
    return await client.fetch<T>(query, params as QueryParams);
  } catch (err) {
    console.error("[messaging] fetch failed:", err);
    return null;
  }
}

async function ensureBroadcastDoc(client: NonNullable<ReturnType<typeof getWriteClient>>) {
  const existing = await client.fetch<BroadcastDoc | null>(
    `*[_id == $id][0]`,
    { id: BROADCAST_DOC_ID } as QueryParams
  );
  if (existing) return existing;
  return client.create({
    _id: BROADCAST_DOC_ID,
    _type: "broadcastSettings",
    manual: [],
    suppressed: [],
  });
}

/**
 * Contacts = unique phone numbers pulled from orders + manually added ones,
 * minus suppressed numbers. Order-derived contacts carry name + city from the
 * most recent order so broadcasts can be personalized.
 */
export async function getContacts(): Promise<{
  contacts: BroadcastContact[];
  manualCount: number;
  suppressed: string[];
}> {
  const client = getWriteClient();
  const manual: BroadcastDoc["manual"] = [];
  const suppressed: string[] = [];
  if (client) {
    try {
      const doc = await ensureBroadcastDoc(client);
      if (doc.manual) manual.push(...doc.manual);
      if (doc.suppressed) suppressed.push(...doc.suppressed);
    } catch {
      // continue with empty lists
    }
  }

  const orders = await getAllOrders();
  const suppressedSet = new Set(suppressed);

  const fromOrders = new Map<string, { name: string; city: string; lastAt: number }>();
  for (const order of orders) {
    const phone = normalizePhone(order.customer?.phone ?? "");
    if (!phone) continue;
    const existing = fromOrders.get(phone);
    const at = new Date(order.createdAt).getTime();
    if (!existing || at > existing.lastAt) {
      fromOrders.set(phone, {
        name: order.customer?.name ?? "",
        city: order.customer?.city ?? "",
        lastAt: at,
      });
    }
  }

  const contacts: BroadcastContact[] = [];
  fromOrders.forEach((info, phone) => {
    if (suppressedSet.has(phone)) return;
    contacts.push({
      id: `order-${phone}`,
      phone,
      name: info.name || undefined,
      city: info.city || undefined,
      source: "order",
    });
  });

  const manualIds = new Set<string>();
  for (const m of manual ?? []) {
    const phone = normalizePhone(m.phone);
    if (!phone || suppressedSet.has(phone)) continue;
    if (fromOrders.has(phone)) continue; // order-derived wins
    manualIds.add(m.id);
    contacts.push({
      id: `manual-${m.id}`,
      phone,
      name: m.name || undefined,
      city: m.city || undefined,
      note: m.note || undefined,
      source: "manual",
    });
  }

  contacts.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

  return {
    contacts,
    manualCount: manualIds.size,
    suppressed,
  };
}

export async function addManualContact(input: {
  phone: string;
  name?: string;
  city?: string;
  note?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const phone = normalizePhone(input.phone);
  if (!phone) return { ok: false, error: "Enter a valid Pakistani mobile number." };

  const client = getWriteClient();
  if (!client) {
    console.info(
      "[messaging][dev] would add manual contact",
      JSON.stringify({ ...input, phone })
    );
    return { ok: true };
  }

  const doc = await ensureBroadcastDoc(client);
  const list = doc.manual ?? [];
  if (list.some((m) => normalizePhone(m.phone) === phone)) {
    return { ok: false, error: "That number is already in your manual list." };
  }
  const { contacts } = await getContacts();
  if (contacts.some((c) => c.phone === phone)) {
    return {
      ok: false,
      error: "That number already exists (from an order or manual list).",
    };
  }
  list.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    phone,
    name: input.name?.trim() || undefined,
    city: input.city?.trim() || undefined,
    note: input.note?.trim() || undefined,
  });
  const suppressed = (doc.suppressed ?? []).filter((p) => p !== phone);
  await client
    .patch(doc._id ?? BROADCAST_DOC_ID)
    .set({ manual: list, ...(suppressed.length !== (doc.suppressed ?? []).length ? { suppressed } : {}) })
    .commit();
  return { ok: true };
}

export async function removeContact(phoneRaw: string): Promise<{ ok: boolean }> {
  const phone = normalizePhone(phoneRaw);
  if (!phone) return { ok: false };
  const client = getWriteClient();
  if (!client) {
    console.info(`[messaging][dev] would remove/suppress ${phone}`);
    return { ok: true };
  }

  const doc = await ensureBroadcastDoc(client);
  const id = doc._id ?? BROADCAST_DOC_ID;
  const manual = (doc.manual ?? []).filter((m) => normalizePhone(m.phone) !== phone);
  const suppressed = Array.from(new Set([...(doc.suppressed ?? []), phone]));
  await client.patch(id).set({ manual, suppressed }).commit();
  return { ok: true };
}

export async function unSuppress(phoneRaw: string): Promise<{ ok: boolean }> {
  const phone = normalizePhone(phoneRaw);
  if (!phone) return { ok: false };
  const client = getWriteClient();
  if (!client) return { ok: true };
  const doc = await ensureBroadcastDoc(client);
  await client
    .patch(doc._id ?? BROADCAST_DOC_ID)
    .set({ suppressed: (doc.suppressed ?? []).filter((p) => p !== phone) })
    .commit();
  return { ok: true };
}

const campaignFields = `{
  _id,
  name,
  text,
  recipients,
  sent,
  failed,
  queued,
  "createdAt": _createdAt
}`;

export async function createCampaign(
  name: string | undefined,
  text: string,
  results: { phone: string; name?: string; status: MessageRecipient["status"]; messageId?: string; error?: string }[]
): Promise<string | null> {
  const client = getWriteClient();
  if (!client) {
    console.info(
      "[messaging][dev] would persist campaign",
      JSON.stringify({ name, text, results }, null, 2)
    );
    return `campaign-${Date.now()}`;
  }

  const recipients: StoredRecipient[] = results.map((r) => ({
    phone: r.phone,
    ...(r.name ? { name: r.name } : {}),
    status: r.status,
    ...(r.messageId ? { messageId: r.messageId } : {}),
    ...(r.error ? { error: r.error } : {}),
    ...(r.status === "sent" ? { sentAt: new Date().toISOString() } : {}),
  }));

  const sent = recipients.filter((r) => r.status === "sent").length;
  const failed = recipients.filter((r) => r.status === "failed").length;

  const doc = await client.create({
    _id: `messageCampaign.${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    _type: "messageCampaign",
    ...(name?.trim() ? { name: name.trim() } : {}),
    text,
    recipients,
    sent,
    failed,
    queued: recipients.length - sent - failed,
  });
  return doc._id;
}

export async function listCampaigns(): Promise<MessageCampaign[]> {
  return (
    (await fetchAdmin<MessageCampaign[]>(
      `*[_type == "messageCampaign"] | order(_createdAt desc)${campaignFields}`
    )) ?? []
  );
}

export async function getCampaign(id: string): Promise<MessageCampaign | null> {
  return fetchAdmin<MessageCampaign>(
    `*[_id == $id][0]${campaignFields}`,
    { id } as QueryParams
  );
}

export async function updateCampaignResults(
  id: string,
  recipients: MessageRecipient[]
): Promise<boolean> {
  const client = getWriteClient();
  if (!client) return false;
  try {
    await client
      .patch(id)
      .set({
        recipients,
        sent: recipients.filter((r) => r.status === "sent").length,
        failed: recipients.filter((r) => r.status === "failed").length,
        queued: recipients.filter((r) => r.status === "queued").length,
      })
      .commit();
    return true;
  } catch (err) {
    console.error("[messaging] updateCampaignResults failed:", err);
    return false;
  }
}
