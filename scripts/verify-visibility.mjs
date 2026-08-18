#!/usr/bin/env node
/**
 * Verifies Sanity read visibility for the storefront:
 *   - Anonymous (public) reads see products/pages/testimonials/hero/settings
 *   - Anonymous reads CANNOT see orders/emailEvents/reviewSubmissions (PII)
 *   - Token reads see everything
 *
 * Usage: node scripts/verify-visibility.mjs
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

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

const base = { projectId, dataset, apiVersion: "2024-01-01", useCdn: false };
const anon = createClient(base);
const tok = token ? createClient({ ...base, token }) : null;

const counts = async (c) => {
  const r = await c.fetch(
    `{ "products": count(*[_type == "product"]), "pages": count(*[_type == "page"]), "testimonials": count(*[_type == "testimonial"]), "hero": count(*[_type == "heroSection"]), "settings": count(*[_type == "siteSettings"]), "orders": count(*[_type == "order"]), "emailEvents": count(*[_type == "emailEvent"]), "reviews": count(*[_type == "reviewSubmission"]) }`
  );
  const sampleIds = await c.fetch(`*[_type == "product"]{_id}[0..2]._id`);
  return { ...r, sampleProductIds: sampleIds };
};

const a = await counts(anon);
console.log("ANONYMOUS :", JSON.stringify(a, null, 1));

if (!tok) {
  console.log("No token configured — skipping token comparison.");
  process.exit(0);
}
const t = await counts(tok);
console.log("TOKEN     :", JSON.stringify(t, null, 1));

const pubTypes = ["products", "pages", "testimonials", "hero", "settings"];
const privTypes = ["orders", "emailEvents", "reviews"];

let pass = true;
for (const k of pubTypes) {
  if (a[k] === 0 && t[k] > 0) {
    console.log(`FAIL: ${k} not publicly readable (anon=0, token=${t[k]})`);
    pass = false;
  }
}
for (const k of privTypes) {
  if (a[k] > 0) {
    console.log(`FAIL: ${k} publicly visible (anon=${a[k]}) — PII leak`);
    pass = false;
  }
}
if (a.orders !== t.orders) {
  console.log(`NOTE: orders count differs anon=${a.orders} token=${t.orders} (expected — private)`);
}

console.log(pass ? "\nPASS: visibility model is correct." : "\nFAIL: fix visibility issues.");
process.exit(pass ? 0 : 1);
