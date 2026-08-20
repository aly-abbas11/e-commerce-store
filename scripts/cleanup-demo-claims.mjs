#!/usr/bin/env node
/**
 * One-off maintenance script: removes seeded demo claims from the live
 * storefront documents so the storefront never displays invented numbers
 * (hero stats, warranty/return durations).
 *
 * Usage:
 *   node scripts/cleanup-demo-claims.mjs
 *
 * Requires (in .env.local):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN
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

if (!projectId || !token) {
  console.error("Missing config. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN in .env.local.");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });

/* siteSettings — demo claims removed; structured fields start unset */
await client
  .patch("siteSettings")
  .set({
    returnPolicy: "",
    warrantyInfo: "",
    warrantyMonths: null,
    returnWindowDays: null,
    codEnabled: true,
    announcement: {
      enabled: false,
      message: "",
      countdownEnabled: false,
      startsAt: null,
      endsAt: null,
    },
  })
  .commit()
  .then(() => console.log("✓ siteSettings — demo warranty/return claims cleared, announcement disabled"))
  .catch((e) => console.error("✗ siteSettings", e.message));

/* heroSection — fake stats removed (stats schema stays for real data later) */
await client
  .patch("heroSection")
  .unset(["stats"])
  .commit()
  .then(() => console.log("✓ heroSection — fake stats removed"))
  .catch((e) => console.error("✗ heroSection", e.message));

/* products — mark embedded reviews as demo fixtures and zero fabricated
   rating/reviewCount aggregates (no real customer reviews exist yet) */
const products = await client.fetch(
  `*[_type == "product"]{_id, "nReviews": count(reviews)}`
);
for (const p of products) {
  const patch = { rating: 0, reviewCount: 0 };
  for (let i = 0; i < p.nReviews; i++) patch[`reviews[${i}].isDemo`] = true;
  await client
    .patch(p._id)
    .set(patch)
    .commit()
    .then(() => console.log(`✓ product ${p._id} — ${p.nReviews} reviews marked demo, rating/count zeroed`))
    .catch((e) => console.error(`✗ product ${p._id}`, e.message));
}

/* testimonials — mark seeded demo testimonials so production queries exclude them */
const testimonials = await client.fetch(`*[_type == "testimonial"]{_id}`);
for (const t of testimonials) {
  await client
    .patch(t._id)
    .set({ isDemo: true })
    .commit()
    .then(() => console.log(`✓ testimonial ${t._id} — marked demo`))
    .catch((e) => console.error(`✗ testimonial ${t._id}`, e.message));
}