#!/usr/bin/env node
/**
 * Deletes all storefront content documents (products, pages, testimonials,
 * orders, email events, site settings, hero) so the dataset can be re-seeded
 * cleanly. Image assets are kept and reused by the seed's URL dedupe.
 *
 * Usage: node scripts/reset-content.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(file) {
  const path = resolve(root, file);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv(".env.local");
loadEnv(".env");

const projectId = process.env.SANITY_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error("Missing SANITY_PROJECT_ID / SANITY_API_TOKEN in .env.local");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
});

const types = [
  "product",
  "page",
  "testimonial",
  "order",
  "emailEvent",
  "siteSettings",
  "heroSection",
];

const docs = await client.fetch(
  `*[_type in $types]{_id}`,
  { types }
);

if (!docs.length) {
  console.log("Nothing to delete.");
  process.exit(0);
}

const tx = client.transaction();
for (const d of docs) tx.delete(d._id);
await tx.commit();

console.log(`Done: deleted ${docs.length} content documents.`);
