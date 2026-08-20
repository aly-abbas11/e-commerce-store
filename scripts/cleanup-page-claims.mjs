#!/usr/bin/env node
/**
 * Removes unsupported support/delivery/return claims from the seeded
 * trust/legal page docs (About, Contact, Privacy, Terms, Shipping & Returns,
 * FAQ) in live Sanity. Applies the exact same wording as scripts/trust-pages.mjs
 * so re-seeding stays consistent.
 *
 * Usage:
 *   node scripts/cleanup-page-claims.mjs
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

/* old seeded wording -> neutral truthful wording (mirrors trust-pages.mjs) */
const REPLACEMENTS = [
  ["Customer-first support — real humans answer within 24 hours.", "Customer-first support — real humans answer every message."],
  ["Questions about an order, a product, or anything else? We reply within one business day.", "Questions about an order, a product, or anything else? Send us a message and we'll help."],
  ["We reply to every message within one business day — usually much faster.", "Send us a message and we'll help out."],
  ["Response time: within 24 hours, every message answered", "Response: every message is read and answered"],
  ["Payment information — collected and processed by our payment providers; we never store full card details.", "Payment information — for Cash on Delivery orders we record the order total and delivery details; no card details are involved."],
  ["Delivery times and costs are described on the Shipping & Returns page, which is part of these terms. Our 30-day return policy applies to all orders — see that page for details.", "Delivery costs and how returns work are described on the Shipping & Returns page, which is part of these terms. Return eligibility is confirmed per order — see that page for details."],
  ["Delivery times, costs, tracking, and our 30-day return policy — all in one place.", "Delivery costs, tracking, and how returns work — all in one place."],
  ["We dispatch orders from our warehouse within 1–2 business days (Monday to Saturday). During busy periods such as sales, dispatch can take up to 3 business days — we'll always let you know if there's a delay.", "We dispatch orders from our warehouse as quickly as possible after confirmation. You'll always get a tracking link by email as soon as your order ships."],
  ["Standard delivery: 3–5 business days — PKR 199 flat rate.", "Standard delivery — PKR 199 flat rate."],
  ["Cash on Delivery is available nationwide (PKR 99 fee applies).", "Cash on Delivery is available — pay when your order arrives."],
  ["If your order hasn't arrived within the estimated window, contact us within 2 days of the delivery estimate passing — we'll open a trace with the courier right away.", "If your order hasn't arrived when you'd expect, contact us and we'll open a trace with the courier."],
  ["You can return any item within 30 days of delivery for a refund or exchange, no matter the reason. The item must be unused, in its original packaging, with all accessories included.", "If you're not happy with your order, contact us and we'll make it right. Returned items must be unused and in their original packaging, with all accessories included."],
  ["We'll confirm the return and email you a prepaid return label (or arrange a pickup).", "We'll confirm the return and tell you how to send the item back."],
  ["Once we receive and check the item, your refund is processed within 3–5 business days.", "Once we receive and check the item, your refund is processed."],
  ["COD orders are refunded via bank transfer — you'll receive the details with your return confirmation.", "You'll receive the refund details with your return confirmation."],
  ["Received something damaged, or a product that stops working? Tell us within 48 hours of delivery with a photo or video, and we'll send a replacement or refund immediately — you don't need to return the damaged item first.", "Received something damaged, or a product that stops working? Contact us right away with a photo or video, and we'll arrange a replacement or refund."],
  ["Beyond the 30-day return window, every product carries the warranty stated on its product page. Contact us with your order number and we'll handle it under warranty.", "Every product carries the warranty stated on its product page where applicable. Contact us with your order number and we'll handle it."],
  ["Quick answers to the questions we hear most. Can't find yours? Send us a message and a real human will reply within 24 hours.", "Quick answers to the questions we hear most. Can't find yours? Send us a message and a real human will reply."],
  ["Orders dispatch within 1–2 business days. Standard delivery takes 3–5 business days; express takes 1–2 business days after dispatch. You'll get a tracking link by email as soon as your order ships.", "Orders are dispatched once confirmed, and you'll get a tracking link by email as soon as your order ships. Delivery times vary by courier and destination."],
  ["Yes. COD is available nationwide with a PKR 99 fee, and it's our most popular payment method. A store representative may call to confirm larger orders before dispatch.", "Yes, cash on delivery is available. A store representative may call to confirm larger orders before dispatch."],
  ["Yes — our courier network covers all major cities and most smaller towns. Delivery to remote areas can take an extra 1–3 business days. Enter your address at checkout to see the exact estimate.", "Yes — our courier network covers all major cities and most smaller towns. Enter your address at checkout and we'll confirm availability for your area."],
  ["You can return any item within 30 days of delivery, in its original condition, for a full refund or exchange. The return is free — we provide the label or arrange pickup. See the Shipping & Returns page for the full process.", "If you're not happy with your order, contact us and we'll make it right. See the Shipping & Returns page for the full process."],
  ["Once we receive and check the returned item, refunds are processed within 3–5 business days. Card payments go back to your card; COD orders are refunded via bank transfer.", "Once we receive and check the returned item, we'll process your refund. COD orders are refunded via bank transfer."],
  ["Every product is sourced from the brand or an authorized distributor, and each batch is sample-tested before we list it. If an item is ever not as described, you're covered by our 30-day policy.", "Every product is sample-tested by our team before we list it. If an item is ever not as described, contact us and we'll make it right."],
  ["Yes. Payments are processed by our payment providers over encrypted connections, and we never store full card details on our servers.", "Yes. Orders are paid by cash on delivery, so no card details are ever involved."],
  ["Every product carries the warranty stated on its product page, covering manufacturing defects under normal use. Beyond the 30-day window, just contact us with your order number and we'll handle it under warranty.", "Every product carries the warranty stated on its product page where applicable, covering manufacturing defects under normal use. Contact us with your order number and we'll handle it."],
  ["Tell us within 48 hours of delivery with a photo or video and we'll send a replacement or refund immediately — no need to return the damaged item first.", "Contact us with a photo or video and we'll arrange a replacement or refund."],
  ["Email support@voltgear.store or use the contact form — we answer every message within one business day.", "Email support@voltgear.store or use the contact form — we answer every message."],
];

/* list items to remove entirely (fabricated claims with no replacement) */
const REMOVE_ITEMS = [
  "Express delivery: 1–2 business days — PKR 499 flat rate.",
  "Refunds go back to your original payment method.",
  "If you used a discount or gift card, the value is credited back accordingly.",
];

const headingReplacements = [["Returns — 30 days, no fuss", "Returns"]];

function replaceInText(text, applied) {
  let out = text;
  for (const [old, next] of REPLACEMENTS) {
    if (out.includes(old)) {
      out = out.replaceAll(old, next);
      applied[old] = (applied[old] ?? 0) + 1;
    }
  }
  for (const [old, next] of headingReplacements) {
    if (out === old) {
      out = next;
      applied[old] = (applied[old] ?? 0) + 1;
    }
  }
  return out;
}

function walkSections(sections, applied) {
  if (!Array.isArray(sections)) return sections;
  for (const section of sections) {
    if (!section || typeof section !== "object") continue;
    switch (section._type) {
      case "paragraph":
      case "heading":
      case "quote":
        if (typeof section.text === "string") section.text = replaceInText(section.text, applied);
        break;
      case "callout":
        if (typeof section.title === "string") section.title = replaceInText(section.title, applied);
        if (typeof section.text === "string") section.text = replaceInText(section.text, applied);
        break;
      case "cta":
        if (typeof section.label === "string") section.label = replaceInText(section.label, applied);
        break;
      case "contactForm":
        if (typeof section.heading === "string") section.heading = replaceInText(section.heading, applied);
        break;
      case "list":
        if (Array.isArray(section.items)) {
          section.items = section.items
            .filter((item) => !REMOVE_ITEMS.includes(item))
            .map((item) => replaceInText(item, applied));
        }
        break;
      case "faq":
        if (Array.isArray(section.items)) {
          for (const item of section.items) {
            if (item?.question) item.question = replaceInText(item.question, applied);
            if (item?.answer) item.answer = replaceInText(item.answer, applied);
          }
        }
        break;
    }
  }
  return sections;
}

const slugs = ["about", "contact", "privacy-policy", "terms-of-service", "shipping-returns", "faq"];
const applied = {};
let changed = 0;

for (const slug of slugs) {
  const doc = await client.fetch(
    `*[_type == "page" && slug.current == $slug][0]{_id, excerpt, seo, sections}`,
    { slug }
  );
  if (!doc) {
    console.log(`- ${slug}: not found, skipped`);
    continue;
  }
  const excerpt = replaceInText(doc.excerpt ?? "", applied);
  const seoDescription = replaceInText(doc.seo?.description ?? "", applied);
  const sections = walkSections(doc.sections, applied);
  const patch = { excerpt, sections };
  if (typeof seoDescription === "string") patch.seo = { ...(doc.seo ?? {}), description: seoDescription };
  await client
    .patch(doc._id)
    .set(patch)
    .commit()
    .then(() => {
      changed += 1;
      console.log(`✓ ${slug} — updated`);
    })
    .catch((e) => console.error(`✗ ${slug}`, e.message));
}

console.log(`\nPages updated: ${changed}`);
const unmatched = REPLACEMENTS.filter(([old]) => !applied[old]);
if (unmatched.length) {
  console.warn(`⚠ replacements never applied (${unmatched.length}):`);
  for (const [old] of unmatched) console.warn(`  - ${old.slice(0, 90)}…`);
} else {
  console.log("All replacements applied ✓");
}