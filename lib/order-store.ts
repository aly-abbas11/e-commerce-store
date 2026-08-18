import type { QueryParams } from "@sanity/client";

import { getWriteClient } from "@/lib/sanity/write";
import {
  ordersByEmailQuery,
  ordersQuery,
  pendingEmailEventsQuery,
  recentWinbackQuery,
} from "@/lib/sanity/queries";
import type {
  EmailEventKind,
  Order,
  OrderCustomer,
  OrderItem,
  OrderStatus,
} from "@/lib/types";

/**
 * Order + email-flow persistence.
 *
 * Production backend: Sanity (`order` and `emailEvent` documents).
 * Without SANITY_API_TOKEN / NEXT_PUBLIC_SANITY_PROJECT_ID this degrades to
 * logging — the store keeps working, nothing is persisted.
 *
 * Orders and email events are PII-bearing, so they are stored with dotted
 * (private) document IDs and always read through the write client (token).
 * Anonymous visitors can never query them — Sanity hides dotted IDs from
 * unauthenticated requests by design.
 */

export interface NewOrderInput {
  orderId: string;
  customer: OrderCustomer;
  items: OrderItem[];
  payment: string;
  subtotal: number;
  shipping: number;
  total: number;
}

/** Authenticated fetch used only for private (dotted-ID) documents. */
async function fetchAdmin<T>(
  query: string,
  params?: QueryParams
): Promise<T | null> {
  const client = getWriteClient();
  if (!client) return null;
  try {
    return await client.fetch<T>(query, params as QueryParams);
  } catch (err) {
    console.error("[admin] fetch failed:", err);
    return null;
  }
}

export async function createOrder(order: NewOrderInput): Promise<string | null> {
  const client = getWriteClient();
  if (!client) {
    console.info("[order][dev] would persist:", JSON.stringify(order, null, 2));
    return order.orderId;
  }
  try {
    await client.create({
      _id: `order.${order.orderId}`,
      _type: "order",
      orderId: order.orderId,
      customer: order.customer,
      items: order.items,
      payment: order.payment,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      status: "new",
    });
    return order.orderId;
  } catch (err) {
    console.error("[order] create failed:", err);
    return null;
  }
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  return (await fetchAdmin<Order[]>(ordersByEmailQuery, { email })) ?? [];
}

export async function getAllOrders(): Promise<Order[]> {
  return (await fetchAdmin<Order[]>(ordersQuery)) ?? [];
}

/** Load a single order by its public orderId (field, not document _id). */
export async function getOrderById(orderId: string): Promise<Order | null> {
  return fetchAdmin<Order | null>(
    `*[_type == "order" && orderId == $orderId][0]{
      _id,
      orderId,
      customer,
      items,
      payment,
      subtotal,
      shipping,
      total,
      status,
      statusUpdatedAt,
      statusHistory,
      "createdAt": _createdAt
    }`,
    { orderId }
  );
}

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

/**
 * Update an order's status and append a history entry.
 * Returns the updated order, or null if not found / failed.
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<Order | null> {
  const client = getWriteClient();
  if (!client) {
    console.info(
      `[orders][dev] would update ${orderId} -> ${status}${note ? ` (${note})` : ""}`
    );
    return null;
  }
  const current = await getOrderById(orderId);
  if (!current) return null;
  const now = new Date().toISOString();
  const historyEntry = { status, ...(note ? { note } : {}), at: now };
  try {
    await client
      .patch(current._id)
      .set({ status, statusUpdatedAt: now })
      .setIfMissing({ statusHistory: [] })
      .insert("after", "statusHistory[-1]", [historyEntry])
      .commit();
    return getOrderById(orderId);
  } catch (err) {
    console.error("[orders] status update failed:", err);
    return null;
  }
}

/**
 * Queue a delayed email event. The flow runner (app/api/flows) picks these up
 * once `dueAt` has passed.
 */
export async function enqueueEmailEvent(
  kind: EmailEventKind,
  email: string,
  data: unknown,
  delayMs: number
): Promise<void> {
  const client = getWriteClient();
  const dueAt = new Date(Date.now() + delayMs).toISOString();
  const payload = JSON.stringify(data);
  if (!client) {
    console.info(
      `[flows][dev] queued ${kind} -> ${email} (due ${dueAt}): ${payload}`
    );
    return;
  }
  try {
    await client.create({
      _id: `emailEvent.${kind}.${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      _type: "emailEvent",
      kind,
      email,
      data: payload,
      dueAt,
    });
  } catch (err) {
    console.error("[flows] enqueue failed:", err);
  }
}

interface PendingEvent {
  _id: string;
  kind: EmailEventKind;
  email: string;
  data?: string;
  dueAt?: string;
}

export async function getPendingEmailEvents(): Promise<PendingEvent[]> {
  const now = new Date().toISOString();
  return (
    (await fetchAdmin<PendingEvent[]>(pendingEmailEventsQuery, { now })) ?? []
  );
}

export async function markEmailSent(
  eventId: string,
  sentAt = new Date().toISOString()
): Promise<void> {
  const client = getWriteClient();
  if (!client) return;
  try {
    await client.patch(eventId).set({ sentAt }).commit();
  } catch (err) {
    console.error("[flows] mark sent failed:", err);
  }
}

/** True if a win-back email was already created for this customer recently. */
export async function recentWinbackExists(
  email: string,
  sinceIso: string
): Promise<boolean> {
  const id = await fetchAdmin<string | null>(recentWinbackQuery, {
    email,
    since: sinceIso,
  });
  return Boolean(id);
}
