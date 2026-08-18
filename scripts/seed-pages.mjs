#!/usr/bin/env node
/**
 * Seed the 6 trust/legal pages (About, Contact, Privacy, Terms, Shipping & Returns, FAQ).
 *
 * Usage:
 *   node scripts/seed-pages.mjs
 *
 * Requires (in .env.local or environment):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID   your Sanity project id
 *   NEXT_PUBLIC_SANITY_DATASET      dataset (default "production")
 *   SANITY_API_TOKEN                a write token (Sanity Manage → API → Tokens)
 *
 * Re-running is safe: pages are upserted by slug (stable _id page.<slug>).
 * Every page stays fully editable afterwards in Sanity Studio → Pages.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { TRUST_PAGES } from "./trust-pages.mjs";

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

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing config. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN (write token) in .env.local, then re-run."
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
});

let created = 0;
let updated = 0;

for (const page of TRUST_PAGES) {
  const existing = await client.fetch(
    `*[_type == "page" && slug.current == $slug][0]{_id, "existed": true}`,
    { slug: page.slug.current }
  );
  await client.createOrReplace(page);
  if (existing?.existed) updated++;
  else created++;
  console.log(
    `  ${existing?.existed ? "updated" : "created"}  /${page.slug.current}  — ${page.title}`
  );
}

console.log(`\nDone: ${created} created, ${updated} updated.`);
console.log("Edit them any time in Sanity Studio → Pages. The site refreshes within ~60s.");
