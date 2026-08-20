#!/usr/bin/env node
/**
 * STEP 3 truth cleanup — homepage claim hygiene (idempotent).
 *
 * Fixes unsupported marketing claims that were still present in live content:
 *   1. Hero primary CTA "Shop Best Sellers" → "Shop Featured Products"
 *      (no sales data exists to support a "Best Sellers" label).
 *   2. Hero subheadline "…backed by a 2-year warranty" → removes the claim
 *      (warrantyMonths is not configured).
 *   3. Product "Best Seller" badges → cleared (same reason).
 *
 * "New" badges are left untouched (not a forbidden claim; reflects current
 * catalog additions).
 *
 * Usage: node scripts/cleanup-homepage-claims.mjs
 * Requires SANITY_API_TOKEN in .env.local.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const envFile = resolve(root, ".env.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing config. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN (write token) in .env.local, then re-run."
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });

let changed = 0;

async function patchHero() {
  const hero = await client.fetch(
    `*[_type == "heroSection"][0]{_id, primaryCta, subheadline}`
  );
  if (!hero) return;

  const patch = {};
  if (hero.primaryCta?.label === "Shop Best Sellers") {
    patch.primaryCta = { ...hero.primaryCta, label: "Shop Featured Products" };
  }
  if (hero.subheadline?.includes("2-year warranty")) {
    patch.subheadline = hero.subheadline.replace(
      /, and backed by a 2-year warranty\.$/,
      "."
    );
  }
  if (Object.keys(patch).length) {
    await client.patch(hero._id).set(patch).commit();
    changed += 1;
    console.log("✓ hero — CTA/subheadline claim cleaned");
  } else {
    console.log("- hero — already clean");
  }
}

async function patchSeoDescription() {
  const settings = await client.fetch(
    `*[_type == "siteSettings"][0]{_id, seo}`
  );
  if (!settings?.seo?.description?.includes("2-year warranty")) {
    console.log("- seo.description — already clean");
    return;
  }
  const description = settings.seo.description.replace(/ and a 2-year warranty/, "");
  await client.patch(settings._id).set({ seo: { ...settings.seo, description } }).commit();
  changed += 1;
  console.log("✓ seo.description — warranty claim removed");
}

async function patchBadges() {
  const products = await client.fetch(
    `*[_type == "product" && badge == "Best Seller"]{_id, "slug": slug.current}`
  );
  for (const p of products) {
    await client.patch(p._id).set({ badge: null }).commit();
    changed += 1;
    console.log(`✓ ${p.slug} — "Best Seller" badge cleared`);
  }
  if (!products.length) console.log("- no Best Seller badges to clear");
}

await patchHero();
await patchSeoDescription();
await patchBadges();
console.log(changed ? `\nChanged ${changed} document(s).` : "\nNothing to change.");