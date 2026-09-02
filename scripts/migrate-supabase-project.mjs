/**
 * One-time migration: copy all public schema rows + product-images storage
 * from the old Supabase project to the linked/new project.
 *
 * Usage:
 *   OLD_SUPABASE_URL=... OLD_SUPABASE_SERVICE_ROLE_KEY=... \
 *   NEW_SUPABASE_URL=... NEW_SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/migrate-supabase-project.mjs
 */
import { createClient } from "@supabase/supabase-js";

const OLD_URL = process.env.OLD_SUPABASE_URL;
const OLD_KEY = process.env.OLD_SUPABASE_SERVICE_ROLE_KEY;
const NEW_URL = process.env.NEW_SUPABASE_URL;
const NEW_KEY = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY;

if (!OLD_URL || !OLD_KEY || !NEW_URL || !NEW_KEY) {
  console.error(
    "Set OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_ROLE_KEY, NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const oldHost = new URL(OLD_URL).hostname;
const newHost = new URL(NEW_URL).hostname;

const oldClient = createClient(OLD_URL, OLD_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const newClient = createClient(NEW_URL, NEW_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Tables in FK-safe order (parents before children). */
const TABLES = [
  "products",
  "product_images",
  "product_variants",
  "product_reviews",
  "categories",
  "site_settings",
  "hero_sections",
  "pages",
  "testimonials",
  "analytics_visitors",
  "analytics_sessions",
  "analytics_events",
  "analytics_saved_reports",
  "orders",
  "order_items",
  "order_status_history",
  "email_events",
  "message_campaigns",
  "message_recipients",
  "broadcast_contacts",
  "broadcast_suppressed",
  "review_submissions",
  "hero_slides",
  "contact_submissions",
  "collections",
  "collection_products",
  "email_templates",
  "promo_codes",
];

const SINGLETON_TABLES = new Set(["site_settings", "hero_sections"]);

function rewriteUrls(value) {
  if (typeof value === "string") {
    return value.split(oldHost).join(newHost);
  }
  if (Array.isArray(value)) return value.map(rewriteUrls);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = rewriteUrls(v);
    return out;
  }
  return value;
}

async function fetchAll(client, table) {
  const pageSize = 1000;
  let from = 0;
  /** @type {Record<string, unknown>[]} */
  const rows = [];
  for (;;) {
    const { data, error } = await client
      .from(table)
      .select("*")
      .range(from, from + pageSize - 1);
    if (error) {
      if (error.code === "PGRST205" || error.message.includes("Could not find")) {
        return [];
      }
      throw new Error(`${table} read: ${error.message}`);
    }
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

async function copyTable(table) {
  const rows = await fetchAll(oldClient, table);
  if (!rows.length) {
    console.log(`${table}: skip (0 rows)`);
    return 0;
  }

  const payload = rows.map((row) => rewriteUrls(row));

  // Clear target table first (idempotent re-run)
  if (SINGLETON_TABLES.has(table)) {
    await newClient.from(table).delete().gte("id", 0);
  } else {
    const { error: delErr } = await newClient
      .from(table)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (delErr && !delErr.message.includes("0 rows")) {
      console.warn(`${table} pre-delete: ${delErr.message}`);
    }
  }

  const chunk = 200;
  let inserted = 0;
  for (let i = 0; i < payload.length; i += chunk) {
    const slice = payload.slice(i, i + chunk);
    const { error } = await newClient.from(table).upsert(slice, { onConflict: "id" });
    if (error) throw new Error(`${table} upsert: ${error.message}`);
    inserted += slice.length;
  }
  console.log(`${table}: ${inserted} rows`);
  return inserted;
}

async function listAllFiles(client, bucket, prefix = "") {
  const { data, error } = await client.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) throw error;
  /** @type {string[]} */
  const paths = [];
  for (const item of data ?? []) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id) paths.push(path);
    else {
      const nested = await listAllFiles(client, bucket, path);
      paths.push(...nested);
    }
  }
  return paths;
}

async function copyStorage() {
  const bucket = "product-images";
  const { data: buckets } = await oldClient.storage.listBuckets();
  if (!buckets?.some((b) => b.name === bucket)) {
    console.log(`${bucket}: skip (no bucket on source)`);
    return 0;
  }

  const { data: newBuckets } = await newClient.storage.listBuckets();
  if (!newBuckets?.some((b) => b.name === bucket)) {
    const { error } = await newClient.storage.createBucket(bucket, { public: true });
    if (error) throw new Error(`create bucket: ${error.message}`);
    console.log(`${bucket}: created on target`);
  }

  const paths = await listAllFiles(oldClient, bucket);
  if (!paths.length) {
    console.log(`${bucket}: skip (0 files)`);
    return 0;
  }

  let copied = 0;
  for (const path of paths) {
    const { data: blob, error: dlErr } = await oldClient.storage.from(bucket).download(path);
    if (dlErr) {
      console.warn(`${bucket}/${path}: download failed — ${dlErr.message}`);
      continue;
    }
    const buf = Buffer.from(await blob.arrayBuffer());
    const { error: upErr } = await newClient.storage.from(bucket).upload(path, buf, {
      upsert: true,
      contentType: blob.type || "application/octet-stream",
    });
    if (upErr) {
      console.warn(`${bucket}/${path}: upload failed — ${upErr.message}`);
      continue;
    }
    copied++;
  }
  console.log(`${bucket}: ${copied}/${paths.length} files`);
  return copied;
}

console.log(`Migrating ${oldHost} → ${newHost}`);
let totalRows = 0;
for (const table of TABLES) {
  totalRows += await copyTable(table);
}
await copyStorage();
console.log(`Done. ${totalRows} total rows copied.`);
