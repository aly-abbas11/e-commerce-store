#!/usr/bin/env node
/**
 * Seed a complete, client-demo-ready storefront into your Sanity project.
 *
 * Creates:
 *   - Site settings (brand, colors, contact, shipping rules, SEO)
 *   - Hero section with stats + featured product
 *   - 16 products across 4 categories, each with real photos (uploaded to
 *     Sanity from Unsplash), descriptions, features, specs and customer reviews
 *   - 8 testimonials
 *   - 4 blog posts (guides) + the 6 trust/legal pages
 *   - A handful of demo orders and queued email events so the admin panel
 *     (Sanity Studio → Orders / Review Submissions / Email Flow Queue) is
 *     populated too
 *
 * Usage:
 *   node scripts/seed-demo.mjs
 *
 * Requires (in .env.local or environment):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID   your Sanity project id
 *   NEXT_PUBLIC_SANITY_DATASET      dataset (default "production")
 *   SANITY_API_TOKEN                a write token (Sanity Manage → API → Tokens)
 *
 * Re-running is safe: everything is upserted by a stable _id. Images already
 * uploaded are skipped (deduped by source URL). Products, reviews, pages and
 * settings stay fully editable afterwards in Sanity Studio.
 */
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
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

/* ── helpers ──────────────────────────────────────────────────────── */

let keyCounter = 0;
const key = () => `k${(keyCounter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const block = (text) => ({
  _key: key(),
  _type: "block",
  style: "normal",
  children: [{ _key: key(), _type: "span", text, marks: [] }],
  markDefs: [],
});

const img = (assetId) => ({ _key: key(), _type: "image", asset: { _type: "reference", _ref: assetId } });

const review = (name, rating, date, comment, verified) => ({
  _key: key(),
  name,
  rating,
  date,
  comment,
  verified,
  isDemo: true,
});

const upsert = async (doc) => {
  try {
    await client.createOrReplace(doc);
    return true;
  } catch (err) {
    console.error(`  ✗ failed ${doc._type} ${doc._id}: ${err.message}`);
    return false;
  }
};

/* ── image upload (deduped by URL) ────────────────────────────────── */

const assetCache = new Map();
async function uploadImage(url) {
  if (assetCache.has(url)) return assetCache.get(url);
  const full = `${url}?w=1600&q=80&auto=format&fit=crop`;
  const filename = `demo-${createHash("sha256").update(url).digest("hex").slice(0, 24)}.jpg`;
  try {
    // Re-run safety: same source URL → same filename → reuse the asset.
    const existing = await client
      .fetch(`*[_type == "sanity.imageAsset" && originalFilename == $name][0]._id`, {
        name: filename,
      })
      .catch(() => null);
    if (existing) {
      assetCache.set(url, existing);
      return existing;
    }
    const res = await fetch(full);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const uploaded = await client.assets.upload("image", buffer, {
      filename,
      contentType: res.headers.get("content-type") || "image/jpeg",
    });
    assetCache.set(url, uploaded._id);
    return uploaded._id;
  } catch (err) {
    console.error(`  ⚠ could not upload image ${url.split("?").slice(-1)[0].slice(0, 60)}: ${err.message}`);
    assetCache.set(url, null);
    return null;
  }
}

/* ── image sets ───────────────────────────────────────────────────── */

const U = (id) => `https://images.unsplash.com/${id}`;
const IMG = {
  hero: U("photo-1550009158-9ebf69173e03"),
  smartwatch: [U("photo-1523275335684-37898b6baf30"), U("photo-1546868871-7041f2a55e12"), U("photo-1579586337278-3befd40fd17a")],
  smartwatchUltra: [U("photo-1508685096489-7aacd43bd3b1"), U("photo-1523275335684-37898b6baf30")],
  smartwatchKids: [U("photo-1579586337278-3befd40fd17a"), U("photo-1544117519-31a4b719223d")],
  powercore: [U("photo-1585338107529-13afc5f02586"), U("photo-1609091839311-d5365f9ff1c5"), U("photo-1618410320928-25228d811631")],
  powercoreMax: [U("photo-1618410320928-25228d811631"), U("photo-1585338107529-13afc5f02586")],
  slimBank: [U("photo-1609091839311-d5365f9ff1c5"), U("photo-1618410320928-25228d811631")],
  pocketBank: [U("photo-1601524909162-ae8725290836"), U("photo-1609091839311-d5365f9ff1c5")],
  ganCharger: [U("photo-1583863788434-e58a36330cf0"), U("photo-1615529182904-14819c35db37")],
  dualCharger: [U("photo-1615529182904-14819c35db37"), U("photo-1583863788434-e58a36330cf0")],
  carCharger: [U("photo-1503376780353-7e6692767b70"), U("photo-1585790050230-5dd28404ccb9")],
  wirelessPad: [U("photo-1585790050230-5dd28404ccb9"), U("photo-1590794056226-79ef3a8147e1")],
  earbuds: [U("photo-1590658268037-6bf12165a8df"), U("photo-1606220588913-b3aacb4d2f46"), U("photo-1572569511254-d8f925fe2cbb")],
  sportBuds: [U("photo-1606220588913-b3aacb4d2f46"), U("photo-1590658268037-6bf12165a8df")],
  studioMax: [U("photo-1593784991095-a205069470b6"), U("photo-1572569511254-d8f925fe2cbb")],
  miniBuds: [U("photo-1572569511254-d8f925fe2cbb"), U("photo-1590658268037-6bf12165a8df")],
  blog1: U("photo-1519389950473-47ba0277781c"),
  blog2: U("photo-1583863788434-e58a36330cf0"),
  blog3: U("photo-1556228453-efd6c1ff04f6"),
  blog4: U("photo-1579586337278-3befd40fd17a"),
  avatar: [
    U("photo-1535713875002-d1d0cf377fde"),
    U("photo-1544005313-94ddf0286df2"),
    U("photo-1494790108377-be9c29b29330"),
    U("photo-1507003211169-0a1dd7228f2d"),
    U("photo-1500648767791-00dcc994a43e"),
    U("photo-1599566150163-29194dcaad36"),
    U("photo-1438761681033-6461ffad8d80"),
    U("photo-1472099645785-5658abf4ff4e"),
  ],
};

/* ── products ─────────────────────────────────────────────────────── */

const PRODUCTS = [
  {
    slug: "voltgear-pro-s2",
    name: "VoltGear Pro S2 Smartwatch",
    category: "smartwatch",
    price: 14999,
    compareAtPrice: 17499,
    images: IMG.smartwatch,
    shortDescription: "AMOLED display, 10-day battery and built-in GPS in a slim 42mm case.",
    description: [
      block("The Pro S2 is our flagship smartwatch — a bright always-on AMOLED display, dual-band GPS, and up to 10 days of battery life in a 42mm case that weighs just 38g. It tracks 100+ workout modes, sleep stages and heart-rate with SpO2, and handles calls and notifications from your wrist."),
      block("The aluminium case is rated 5ATM water resistant, the sapphire-coated glass resists scratches, and the 1.4\" display hits 800 nits for easy reading in direct sunlight. It works with iOS 14+ and Android 8.0+."),
    ],
    features: [
      "1.4\" AMOLED display, 800 nits, always-on mode",
      "Up to 10 days battery (7 days with always-on display)",
      "Dual-band GPS + GLONASS, 100+ workout modes",
      "Heart-rate, SpO2 and sleep-stage monitoring",
      "5ATM water resistance — swim-safe",
      "Call, message and notification mirroring",
    ],
    specifications: [
      { label: "Display", value: "1.4\" AMOLED, 466×466, 800 nits" },
      { label: "Battery", value: "420 mAh · up to 10 days" },
      { label: "Connectivity", value: "Bluetooth 5.3, GPS + GLONASS" },
      { label: "Water resistance", value: "5ATM" },
      { label: "Compatibility", value: "iOS 14+ / Android 8.0+" },
      { label: "Weight", value: "38g (without strap)" },
      { label: "Charging", value: "Magnetic puck, full charge in 90 min" },
    ],
    rating: 4.8,
    reviewCount: 214,
    reviews: [
      review("Daniel R.", 5, "2026-07-02", "Battery life is genuinely 10 days — I charge it once a week. The AMOLED screen is bright even outdoors.", true),
      review("Sara M.", 5, "2026-06-18", "Upgraded from a much pricier brand. This does everything mine did for half the price. GPS is accurate on runs.", true),
      review("Ahmed K.", 4, "2026-06-04", "Great watch, straps are a bit fiddly to swap but the watch itself is superb.", true),
    ],
    badge: "Best Seller",
    featured: true,
    stockStatus: "in-stock",
  },
  {
    slug: "voltgear-ultra-x",
    name: "VoltGear Ultra X GPS Smartwatch",
    category: "smartwatch",
    price: 24999,
    compareAtPrice: 27499,
    images: IMG.smartwatchUltra,
    shortDescription: "Our most advanced model: 1.8\" display, 14-day battery, offline maps and NFC payments.",
    description: [
      block("The Ultra X is built for people who want every metric and every feature. A 1.8\" AMOLED panel, 14-day battery, downloadable offline maps, barometric altimeter and NFC payments put a full sports-and-lifestyle watch on your wrist."),
      block("Dual-frequency GPS keeps your route accurate in canyons and forests, and the titanium-grade case shrugs off knocks. Ideal for serious runners, hikers and anyone who hates charging every night."),
    ],
    features: [
      "1.8\" AMOLED, 1000 nits, sapphire-coated glass",
      "Up to 14 days battery life",
      "Dual-frequency GPS + offline maps",
      "NFC contactless payments (Wallet)",
      "Barometer, compass, altimeter",
      "Advanced sleep + HRV recovery tracking",
    ],
    specifications: [
      { label: "Display", value: "1.8\" AMOLED, 1000 nits" },
      { label: "Battery", value: "580 mAh · up to 14 days" },
      { label: "GPS", value: "Dual-frequency (L1 + L5)" },
      { label: "Payments", value: "NFC wallet support" },
      { label: "Water resistance", value: "10ATM" },
      { label: "Weight", value: "52g" },
    ],
    rating: 4.9,
    reviewCount: 342,
    reviews: [
      review("James T.", 5, "2026-07-10", "Offline maps are the killer feature — I hiked 40km without my phone. Battery is as advertised.", true),
      review("Layla H.", 5, "2026-06-27", "Paid for itself in the first month of skipping the charger. Brilliant screen, snappy UI.", true),
      review("Omar F.", 4, "2026-06-12", "Excellent watch. NFC setup needs a compatible bank but everything else is flawless.", true),
    ],
    badge: "New",
    featured: true,
    stockStatus: "in-stock",
  },
  {
    slug: "voltgear-lite-s1",
    name: "VoltGear Lite S1 Smartwatch",
    category: "smartwatch",
    price: 9499,
    compareAtPrice: 11499,
    images: [IMG.smartwatch[0], IMG.smartwatch[1]],
    shortDescription: "Essential fitness tracking with a vivid display — the best value smartwatch we make.",
    description: [
      block("The Lite S1 keeps the essentials and skips the fluff: a crisp 1.3\" HD display, week-long battery, heart-rate and sleep tracking, and notifications from your phone. It's the watch we recommend to anyone getting their first smartwatch."),
      block("With 20+ workout modes, music controls and a lightweight 32g build, it disappears on your wrist. Rated 3ATM, it's fine for rain and hand-washing."),
    ],
    features: [
      "1.3\" HD touchscreen, always-on option",
      "Up to 7 days battery life",
      "Heart-rate, SpO2 and sleep tracking",
      "20+ workout modes",
      "Call & notification alerts",
      "3ATM water resistance",
    ],
    specifications: [
      { label: "Display", value: "1.3\" TFT HD" },
      { label: "Battery", value: "300 mAh · up to 7 days" },
      { label: "Sensors", value: "HR, SpO2, accelerometer" },
      { label: "Water resistance", value: "3ATM" },
      { label: "Weight", value: "32g" },
    ],
    rating: 4.5,
    reviewCount: 168,
    reviews: [
      review("Priya S.", 5, "2026-07-05", "Honestly perfect for the price. Screen is great, battery lasts the whole week.", true),
      review("Carlos M.", 4, "2026-06-21", "Very good basic smartwatch. Wish it had built-in GPS but for this price that's expected.", true),
    ],
    badge: "New",
    featured: false,
    stockStatus: "in-stock",
  },
  {
    slug: "voltgear-kids-k1",
    name: "VoltGear Kids K1 Smartwatch",
    category: "smartwatch",
    price: 6999,
    compareAtPrice: 7999,
    images: IMG.smartwatchKids,
    shortDescription: "A durable kids' watch with GPS tracking, voice calls and no distractions.",
    description: [
      block("The K1 gives parents peace of mind: real-time GPS location, two-way voice calls, and a safe zone alert when your child leaves a place you've marked. No apps, no games, no ads — just a smartwatch built for kids."),
      block("It's shock-resistant, water-resistant (IP67) and lasts 3 days on a charge. The companion app lets parents manage contacts and see location history."),
    ],
    features: [
      "Real-time GPS + safe-zone alerts",
      "Two-way voice calls (approved contacts only)",
      "IP67 water & dust resistant, shock-proof body",
      "3-day battery, magnetic charging",
      "No games, apps or ads",
      "Companion app for parents (iOS & Android)",
    ],
    specifications: [
      { label: "Tracking", value: "GPS + Wi-Fi positioning" },
      { label: "Calls", value: "2-way, approved contacts" },
      { label: "Battery", value: "700 mAh · up to 3 days" },
      { label: "Protection", value: "IP67, shock-proof" },
      { label: "Display", value: "1.4\" IPS" },
    ],
    rating: 4.3,
    reviewCount: 57,
    reviews: [
      review("Hina A.", 4, "2026-07-08", "My 8-year-old loves it and I can see where she is after school. Battery could be better but it's fine.", true),
    ],
    badge: undefined,
    featured: false,
    stockStatus: "low-stock",
  },
  {
    slug: "powercore-20k",
    name: "VoltGear PowerCore 20K Power Bank",
    category: "power-bank",
    price: 5999,
    compareAtPrice: 6999,
    images: IMG.powercore,
    shortDescription: "20,000 mAh of high-speed charging with two USB ports and a fast USB-C in/out.",
    description: [
      block("Our best-selling power bank. The 20K packs 20,000 mAh — enough for roughly four full phone charges — and charges itself at up to 22.5W, so it's ready again fast."),
      block("Two USB-A ports plus USB-C Power Delivery mean you can charge a phone and a tablet at once. LED charge-level indicators keep you in the loop, and the 94Wh capacity is within airline carry-on limits."),
    ],
    features: [
      "20,000 mAh real capacity (94Wh)",
      "22.5W USB-C Power Delivery in/out",
      "Two USB-A ports + USB-C",
      "Charges two devices simultaneously",
      "LED charge indicators",
      "Fly-safe (within airline limits)",
    ],
    specifications: [
      { label: "Capacity", value: "20,000 mAh / 74Wh" },
      { label: "Output", value: "USB-C PD 22.5W · 2× USB-A 18W" },
      { label: "Input", value: "USB-C, full charge in 3h" },
      { label: "Weight", value: "342g" },
      { label: "Pass-through", value: "Yes" },
    ],
    rating: 4.7,
    reviewCount: 402,
    reviews: [
      review("Nadia P.", 5, "2026-07-09", "Charges my S25 twice plus the earbuds. Feels solid, not cheap like others I've had.", true),
      review("Rizwan B.", 5, "2026-06-30", "The USB-C input is the reason I bought it — no more old micro-USB cables.", true),
      review("Emily W.", 4, "2026-06-15", "Heavy-ish but you get real capacity. Reliable for travel.", true),
    ],
    badge: "Best Seller",
    featured: true,
    stockStatus: "in-stock",
  },
  {
    slug: "powercore-30k-max",
    name: "VoltGear PowerCore 30K Max",
    category: "power-bank",
    price: 9999,
    compareAtPrice: 11999,
    images: IMG.powercoreMax,
    shortDescription: "30,000 mAh monster with 65W USB-C PD — charges laptops, tablets and phones.",
    description: [
      block("The PowerCore 30K Max is a portable wall outlet. With 65W USB-C Power Delivery it charges a 13-inch MacBook from empty to 50% in about 40 minutes, and its 30,000 mAh capacity keeps every device in your bag topped up for days."),
      block("A crisp LED display shows exact percentage and watts, and the four-port array (two USB-C, two USB-A) charges four devices at once. USB-C in and out means one cable does everything."),
    ],
    features: [
      "30,000 mAh capacity",
      "65W USB-C Power Delivery (laptop charging)",
      "2× USB-C + 2× USB-A, four devices at once",
      "LED display with exact % and wattage",
      "Recharges itself at up to 65W",
      "Travel-friendly 100Wh class (carry-on safe)",
    ],
    specifications: [
      { label: "Capacity", value: "30,000 mAh / 111Wh" },
      { label: "Max output", value: "65W USB-C PD" },
      { label: "Ports", value: "2× USB-C, 2× USB-A" },
      { label: "Display", value: "LED percentage + watts" },
      { label: "Weight", value: "618g" },
    ],
    rating: 4.8,
    reviewCount: 96,
    reviews: [
      review("Marcus D.", 5, "2026-07-11", "Charges my M2 Air at full speed. This replaced my laptop charger on trips.", true),
      review("Zainab Q.", 5, "2026-06-28", "The display showing wattage is so useful. Kept us going on a 3-day trip.", true),
    ],
    badge: "New",
    featured: true,
    stockStatus: "in-stock",
  },
  {
    slug: "slim-10k",
    name: "VoltGear Slim 10K Power Bank",
    category: "power-bank",
    price: 3999,
    compareAtPrice: 4999,
    images: IMG.slimBank,
    shortDescription: "Pocket-thin 10,000 mAh bank that fits in your jeans pocket. Perfect daily carry.",
    description: [
      block("The Slim 10K is the power bank you'll actually carry. At just 12mm thick and 190g, it slides into a pocket next to your phone and delivers 18W fast charging to keep it alive all day."),
      block("USB-C in and out, one USB-A port, and enough capacity for two full phone charges. The soft-touch shell feels great and hides scratches."),
    ],
    features: [
      "10,000 mAh in a 12mm-thin body",
      "18W USB-C + USB-A fast charging",
      "Charge two devices at once",
      "Recharges via USB-C in under 3h",
      "Fits jeans pockets",
    ],
    specifications: [
      { label: "Capacity", value: "10,000 mAh / 37Wh" },
      { label: "Output", value: "USB-C 18W · USB-A 18W" },
      { label: "Thickness", value: "12mm" },
      { label: "Weight", value: "190g" },
    ],
    rating: 4.5,
    reviewCount: 189,
    reviews: [
      review("Tom G.", 5, "2026-06-25", "Finally a power bank I actually carry. Thin, light, and fast enough.", true),
      review("Ayesha R.", 4, "2026-06-08", "Great for daily use. Slightly warm under heavy load but normal.", true),
    ],
    badge: undefined,
    featured: false,
    stockStatus: "in-stock",
  },
  {
    slug: "pocket-5k",
    name: "VoltGear Pocket 5K Power Bank",
    category: "power-bank",
    price: 2999,
    compareAtPrice: 3499,
    images: IMG.pocketBank,
    shortDescription: "Credit-card-sized emergency charger with a built-in USB-C cable.",
    description: [
      block("The Pocket 5K is the emergency backup you keep in your bag or car. It's the size of a credit card, has a built-in USB-C cable (no more forgetting a cable), and delivers 12W to a phone in a pinch."),
      block("Great for a full emergency phone charge when you're out all day. A 4-LED indicator shows remaining charge."),
    ],
    features: [
      "Credit-card sized, 110g",
      "Built-in USB-C cable",
      "5,000 mAh emergency capacity",
      "12W output",
      "LED charge indicators",
    ],
    specifications: [
      { label: "Capacity", value: "5,000 mAh / 18.5Wh" },
      { label: "Output", value: "USB-C 12W (built-in cable)" },
      { label: "Size", value: "85×55×9mm" },
      { label: "Weight", value: "110g" },
    ],
    rating: 4.4,
    reviewCount: 143,
    reviews: [
      review("Kiran S.", 5, "2026-07-01", "Lives in my backpack. The built-in cable is genius — always ready.", true),
    ],
    badge: undefined,
    featured: false,
    stockStatus: "in-stock",
  },
  {
    slug: "gan-65w-charger",
    name: "VoltGear GaN 65W Charger",
    category: "charger",
    price: 5499,
    compareAtPrice: 6499,
    images: IMG.ganCharger,
    shortDescription: "Tiny GaN charger with 65W USB-C PD — charges your laptop, phone and more from one brick.",
    description: [
      block("Gallium nitride (GaN) lets us shrink a 65W laptop charger to half the size of a traditional one. It charges a MacBook or 13-inch ultrabook at full speed, then you still have a 2nd USB-C and a USB-A port for your phone and earbuds."),
      block("Foldable pins, a 1.5m braided cable in the box, and universal 100-240V input for travel. This is the one charger we'd take on every trip."),
    ],
    features: [
      "65W GaN — half the size of a classic laptop charger",
      "USB-C PD 65W + USB-C 20W + USB-A 18W",
      "Charges laptop, phone and buds simultaneously",
      "Foldable pins, travel-friendly",
      "100–240V worldwide input",
      "Includes 1.5m braided USB-C cable",
    ],
    specifications: [
      { label: "Output", value: "USB-C1 65W · USB-C2 20W · USB-A 18W" },
      { label: "Technology", value: "GaN (gallium nitride)" },
      { label: "Input", value: "100–240V, 50/60Hz" },
      { label: "Size", value: "52×52×30mm" },
      { label: "Included", value: "1.5m USB-C braided cable" },
    ],
    rating: 4.8,
    reviewCount: 287,
    reviews: [
      review("David L.", 5, "2026-07-06", "Replaced my whole charger drawer with this one brick. Tiny and fast.", true),
      review("Fatima N.", 5, "2026-06-19", "Charges my work laptop and phone at the same time. Doesn't overheat like my old one.", true),
      review("Sam K.", 4, "2026-06-02", "Great charger. Wish the cable were slightly longer, but it's quality.", true),
    ],
    badge: "Best Seller",
    featured: true,
    stockStatus: "in-stock",
  },
  {
    slug: "dual-20w-charger",
    name: "VoltGear Dual Port 20W Charger",
    category: "charger",
    price: 1999,
    compareAtPrice: 2499,
    images: IMG.dualCharger,
    shortDescription: "Compact 20W dual-port wall charger for phones, earbuds and small gadgets.",
    description: [
      block("A tidy little brick that fast-charges your phone at 20W while a second USB-C port tops up your earbuds. It's the charger we include with our best-selling accessories."),
      block("Safe charging protection (over-current, over-voltage, over-heat) and a compact body that doesn't block adjacent outlets."),
    ],
    features: [
      "20W fast charging (USB-C)",
      "Second USB-C port for a second device",
      "Compact, outlet-friendly design",
      "Over-current / over-voltage protection",
      "Includes 1m USB-C cable",
    ],
    specifications: [
      { label: "Output", value: "USB-C 20W + USB-C 12W" },
      { label: "Input", value: "100–240V" },
      { label: "Size", value: "38×35×32mm" },
      { label: "Included", value: "1m USB-C cable" },
    ],
    rating: 4.5,
    reviewCount: 233,
    reviews: [
      review("Hassan M.", 5, "2026-06-22", "Small, fast, and cheap. Exactly what you want in a travel charger.", true),
    ],
    badge: undefined,
    featured: false,
    stockStatus: "in-stock",
  },
  {
    slug: "car-45w-charger",
    name: "VoltGear Car 45W Fast Charger",
    category: "charger",
    price: 3499,
    compareAtPrice: 3999,
    images: IMG.carCharger,
    shortDescription: "Twin-port 45W car charger — USB-C PD for phones and tablets, USB-A for everything else.",
    description: [
      block("Turn your car's lighter socket into a fast-charging hub. The 45W USB-C Power Delivery port charges a phone at full speed or a tablet, while the USB-A port handles a second device or a dash cam."),
      block("Metallic body with LED ring so you can find it at night, plus all the standard safety protections."),
    ],
    features: [
      "USB-C PD 30W + USB-A 18W",
      "Charges phone and tablet at once",
      "LED indicator ring",
      "Over-current / over-heat protection",
      "Universal fit 12V/24V vehicles",
    ],
    specifications: [
      { label: "Output", value: "USB-C 30W · USB-A 18W" },
      { label: "Input", value: "12V / 24V" },
      { label: "Size", value: "44×27mm" },
    ],
    rating: 4.6,
    reviewCount: 121,
    reviews: [
      review("Bilal K.", 5, "2026-06-29", "Charges my phone fast on long drives. LED is a nice touch.", true),
    ],
    badge: undefined,
    featured: false,
    stockStatus: "low-stock",
  },
  {
    slug: "wireless-15w-pad",
    name: "VoltGear Wireless 15W Charging Pad",
    category: "charger",
    price: 3799,
    compareAtPrice: 4499,
    images: IMG.wirelessPad,
    shortDescription: "Sleek Qi wireless pad with 15W fast charging and USB-C power.",
    description: [
      block("Just drop your phone on the pad and it charges at up to 15W (Qi). The soft-touch surface keeps phones in place, and the included 20W adapter gets the most out of it."),
      block("Works with iPhones, Samsung and any Qi-certified phone or earbuds case. An LED confirms alignment, and foreign-object detection keeps things safe."),
    ],
    features: [
      "15W Qi fast wireless charging",
      "Non-slip soft-touch surface",
      "LED alignment + charging indicator",
      "Foreign-object detection",
      "Includes 20W USB-C adapter",
    ],
    specifications: [
      { label: "Output", value: "15W Qi (7.5W iOS, 15W Android)" },
      { label: "Input", value: "USB-C (adapter included)" },
      { label: "Size", value: "96×10mm" },
    ],
    rating: 4.4,
    reviewCount: 88,
    reviews: [
      review("Mehreen J.", 4, "2026-06-11", "Works well, charges fast. Alignment LED is handy at night.", true),
    ],
    badge: undefined,
    featured: false,
    stockStatus: "in-stock",
  },
  {
    slug: "airdots-pro",
    name: "VoltGear AirDots Pro Earbuds",
    category: "earbuds",
    price: 8499,
    compareAtPrice: 9999,
    images: IMG.earbuds,
    shortDescription: "Active noise cancelling, 30-hour total battery and crystal-clear calls.",
    description: [
      block("The AirDots Pro bring flagship features to a sensible price: hybrid active noise cancelling that silences the commute, a transparent mode for when you need to hear the world, and 30 hours of total playtime with the charging case."),
      block("Six microphones + AI call enhancement keep your voice clear on calls even in noisy streets. IPX5 sweat resistance makes them gym-proof, and wireless charging on the case means one less cable."),
    ],
    features: [
      "Hybrid active noise cancelling (ANC)",
      "Transparent (ambient) mode",
      "30h total playtime (6h + 24h case)",
      "6-mic AI call enhancement",
      "IPX5 sweat & splash resistant",
      "Wireless + USB-C case charging",
    ],
    specifications: [
      { label: "Driver", value: "11mm dynamic" },
      { label: "ANC", value: "Hybrid, up to 35dB" },
      { label: "Battery", value: "6h (ANC on) + 24h case" },
      { label: "Bluetooth", value: "5.3, dual-device" },
      { label: "Water resistance", value: "IPX5" },
      { label: "Latency", value: "Low-latency game mode" },
    ],
    rating: 4.7,
    reviewCount: 356,
    reviews: [
      review("Omar T.", 5, "2026-07-07", "ANC is shockingly good for this price. Calls are clear even in traffic.", true),
      review("Julia F.", 5, "2026-06-23", "Battery easily lasts my whole work week. Case is small and charges wirelessly.", true),
      review("Ali H.", 4, "2026-06-05", "Great sound and ANC. Bass could be punchier but the clarity is excellent.", true),
    ],
    badge: "Best Seller",
    featured: true,
    stockStatus: "in-stock",
  },
  {
    slug: "sport-flex",
    name: "VoltGear Sport Flex Earbuds",
    category: "earbuds",
    price: 5499,
    compareAtPrice: 6499,
    images: IMG.sportBuds,
    shortDescription: "Secure-fit sport earbuds with ear hooks, IPX7 water resistance and 32h battery.",
    description: [
      block("Built for workouts: the Sport Flex stays put with flexible ear hooks, shrugs off sweat and rain with IPX7, and keeps your music going for 32 hours with the case."),
      block("Touch controls for track skip and volume, fast charging (10 min = 1.5h playback), and a transparent mode so you stay aware on runs."),
    ],
    features: [
      "Flexible ear hooks — won't fall out",
      "IPX7 waterproof (runs in rain, fine after swim)",
      "32h total playtime",
      "10-min charge = 1.5h playback",
      "Touch controls, single-bud use",
      "Transparent mode for runs",
    ],
    specifications: [
      { label: "Driver", value: "10mm" },
      { label: "Battery", value: "8h + 24h case" },
      { label: "Water resistance", value: "IPX7" },
      { label: "Bluetooth", value: "5.3" },
      { label: "Weight", value: "4.2g per bud" },
    ],
    rating: 4.5,
    reviewCount: 174,
    reviews: [
      review("Ken W.", 5, "2026-06-26", "They genuinely don't fall out at the gym. Sweat-proof and sound great.", true),
      review("Sana T.", 4, "2026-06-09", "Perfect for runs. Bass is solid, hook design is comfortable.", true),
    ],
    badge: undefined,
    featured: false,
    stockStatus: "in-stock",
  },
  {
    slug: "studio-max",
    name: "VoltGear Studio Max Headphones",
    category: "earbuds",
    price: 13999,
    compareAtPrice: 16999,
    images: IMG.studioMax,
    shortDescription: "Over-ear wireless headphones with studio-grade sound and 40-hour battery.",
    description: [
      block("The Studio Max brings a closed-back, over-ear design with 40mm drivers tuned for balanced, detailed sound. Adaptive ANC blocks the room, and the 40-hour battery outlasts any week of commuting."),
      block("Plush memory-foam earcups, a foldable design with a hard case, and multipoint Bluetooth so it connects to your laptop and phone at once. Wired mode included via 3.5mm for lossless listening."),
    ],
    features: [
      "40mm drivers, balanced studio tuning",
      "Adaptive active noise cancelling",
      "40-hour battery (ANC on)",
      "Memory-foam earcups, foldable",
      "Multipoint Bluetooth 5.3",
      "3.5mm wired mode + hard case",
    ],
    specifications: [
      { label: "Driver", value: "40mm dynamic" },
      { label: "ANC", value: "Adaptive" },
      { label: "Battery", value: "40h (ANC on), 55h (off)" },
      { label: "Bluetooth", value: "5.3 multipoint" },
      { label: "Weight", value: "255g" },
    ],
    rating: 4.8,
    reviewCount: 98,
    reviews: [
      review("Grace N.", 5, "2026-07-03", "Sound is wonderfully neutral — I use these for editing and they're as good as cans twice the price.", true),
    ],
    badge: "New",
    featured: true,
    stockStatus: "in-stock",
  },
  {
    slug: "mini-buds",
    name: "VoltGear Mini Buds",
    category: "earbuds",
    price: 4499,
    compareAtPrice: 5499,
    images: IMG.miniBuds,
    shortDescription: "Ultra-compact earbuds that disappear in your pocket — 22h battery, clear calls.",
    description: [
      block("The Mini Buds are about one thing: tiny, light, and always in your pocket. The case is the size of a lighter, the buds weigh 3.6g each, and together they still deliver 22 hours of playback."),
      block("Touch controls, quick-pairing Bluetooth 5.3, and a reliable mic for calls. Great value as a spare or gift."),
    ],
    features: [
      "Case the size of a lighter",
      "3.6g buds — barely there",
      "22h total playtime",
      "Bluetooth 5.3 quick pairing",
      "Touch controls, single-bud use",
      "Clear-call mic",
    ],
    specifications: [
      { label: "Driver", value: "8mm" },
      { label: "Battery", value: "5h + 17h case" },
      { label: "Bluetooth", value: "5.3" },
      { label: "Weight", value: "3.6g per bud" },
    ],
    rating: 4.3,
    reviewCount: 64,
    reviews: [
      review("Leo B.", 4, "2026-05-30", "Perfect for the price. Not audiophile-grade but they vanish in the pocket.", true),
    ],
    badge: undefined,
    featured: false,
    stockStatus: "out-of-stock",
  },
];

/* ── testimonials ──────────────────────────────────────────────────── */

const TESTIMONIALS = [
  {
    _id: "testimonial-1",
    customerName: "Hira Malik",
    reviewText:
      "Ordered the PowerCore 20K on a Monday night and it was at my door in Lahore by Wednesday. Charges my phone and tablet the whole day, and with cash on delivery I wasn't even worried about paying online. Ab isi jagah se hi shopping hogi.",
    rating: 5,
    product: "PowerCore 20K Power Bank",
    verified: true,
  },
  {
    _id: "testimonial-2",
    customerName: "Usman Chaudhry",
    reviewText:
      "Finally a charger that doesn't burn my hands. The GaN 65W replaced three chargers from my bag and fast-charges my laptop too. Paisa wasool, honestly. Karachi tak delivery bhi bilkul on time thi.",
    rating: 5,
    product: "GaN 65W Charger",
    verified: true,
  },
  {
    _id: "testimonial-3",
    customerName: "Areeba Fatima",
    reviewText:
      "I was nervous about ordering online, but the COD option made it easy. The noise cancelling on the AirDots actually works on the metro and calls sound clear. Sound quality is unreal for this price.",
    rating: 5,
    product: "AirDots Pro Earbuds",
    verified: true,
  },
  {
    _id: "testimonial-4",
    customerName: "Ahmed Raza",
    reviewText:
      "Customer service is the real reason I keep coming back. My first watch had a display issue and they sent a replacement before I even returned the old one. WhatsApp support replied within minutes.",
    rating: 5,
    product: "Pro S2 Smartwatch",
    verified: true,
  },
  {
    _id: "testimonial-5",
    customerName: "Maryam Khan",
    reviewText:
      "Ordered three smartwatches for my whole family from Faisalabad. Everything arrived in perfect packaging and exactly on time. The battery easily lasts a week on normal use.",
    rating: 5,
    product: "Ultra X Smartwatch",
    verified: true,
  },
  {
    _id: "testimonial-6",
    customerName: "Bilal Sheikh",
    reviewText:
      "Used the Sport Flex through my whole training season. They never fall out during runs, sweat doesn't bother them, and the bass is solid. Exactly what was promised — no overhyped claims.",
    rating: 4,
    product: "Sport Flex Earbuds",
    verified: true,
  },
  {
    _id: "testimonial-7",
    customerName: "Sana Tariq",
    reviewText:
      "The Studio Max sound incredible — I actually sold my more expensive pair after buying these. Battery lasts for weeks with normal use. Best purchase I've made this year.",
    rating: 5,
    product: "Studio Max Headphones",
    verified: true,
  },
  {
    _id: "testimonial-8",
    customerName: "Zain Ahmed",
    reviewText:
      "Fast delivery, honest specs, and that free shipping bar in the cart genuinely got me to add one more item. Smooth checkout and I got a confirmation call too. Very professional.",
    rating: 5,
    product: "Slim 10K Power Bank",
    verified: true,
  },
];

/* ── blog posts ────────────────────────────────────────────────────── */

const blogPost = (slug, title, coverImage, excerpt, sections, publishedAt, keywords) => ({
  _id: slug,
  _type: "page",
  title,
  slug: { _type: "slug", current: slug },
  pageType: "blog",
  excerpt,
  coverImage,
  publishedAt,
  author: "VoltGear Team",
  sections,
  keywords,
  seo: { title: `${title} | VoltGear`, description: excerpt },
});

const BLOG_POSTS = [
  blogPost(
    "how-to-choose-a-power-bank-2026",
    "How to Choose the Right Power Bank in 2026",
    IMG.blog1,
    "Capacity, ports, charging speed and safety — a practical buying guide so you pick the right power bank the first time.",
    [
      {
        _key: key(),
        _type: "paragraph",
        text: "A power bank is the easiest accessory to get wrong — inflated capacity figures, slow ports and dodgy batteries are everywhere. Here's how to read the specs and buy the right one, once.",
      },
      { _key: key(), _type: "heading", level: "h2", text: "Start with real capacity (mAh)" },
      {
        _key: key(),
        _type: "paragraph",
        text: "The headline mAh number is the battery's capacity, but your phone gets less than that after the voltage step-up. A 20,000 mAh bank realistically delivers roughly 4 full charges to a typical 5,000 mAh phone. Match the capacity to your need: 5,000 mAh for a pocket backup, 10,000 mAh for daily carry, 20,000+ mAh for travel.",
      },
      {
        _key: key(),
        _type: "list",
        type: "bullet",
        items: [
          "5,000 mAh — emergency top-ups, credit-card size",
          "10,000 mAh — daily carry, two phone charges",
          "20,000 mAh — multi-day trips, still fly-safe",
          "30,000 mAh — laptop + everything, definitely fly-safe",
        ],
      },
      {
        _key: key(),
        _type: "callout",
        title: "Airline rule",
        text: "Most airlines allow power banks up to 100Wh in carry-on. A 20,000 mAh bank is ~74Wh, a 30,000 mAh is ~111Wh — check your airline before buying the big one.",
      },
      { _key: key(), _type: "heading", level: "h2", text: "Check the port, not just the watts" },
      {
        _key: key(),
        _type: "paragraph",
        text: "USB-C Power Delivery is the standard you want for fast, modern charging. Look for 18W+ USB-C output, and USB-C in so the bank recharges with the same cable your phone uses.",
      },
      {
        _key: key(),
        _type: "list",
        type: "bullet",
        items: [
          "USB-C PD 20W+ — fast phone charging",
          "65W USB-C PD — laptop charging from a bank",
          "USB-C in/out — one cable for everything",
          "Pass-through — charge the bank and your phone at once",
        ],
      },
      {
        _key: key(),
        _type: "quote",
        text: "The best power bank is the one you actually carry. Don't buy 30,000 mAh if you won't carry it.",
      },
      {
        _key: key(),
        _type: "cta",
        label: "Shop power banks",
        href: "/products/power-bank",
      },
    ],
    "2026-07-20T09:00:00Z",
    ["power bank", "charging", "buying guide"]
  ),
  blogPost(
    "gan-chargers-explained",
    "GaN Chargers Explained: Why Your Next Charger Should Be GaN",
    IMG.blog2,
    "Gallium nitride (GaN) chargers are smaller, cooler and faster than silicon ones. Here's why that matters for your tech bag.",
    [
      {
        _key: key(),
        _type: "paragraph",
        text: "If you've bought a charger in the last two years you've seen 'GaN' on the box. It's not marketing fluff — gallium nitride is a semiconductor that lets chargers do more in a smaller, cooler package. Here's the short version of why it's the right upgrade.",
      },
      { _key: key(), _type: "heading", level: "h2", text: "Same power, half the size" },
      {
        _key: key(),
        _type: "paragraph",
        text: "GaN switches at much higher frequencies than silicon, so the components that convert power can be dramatically smaller. The result: a 65W GaN charger that's smaller than the 30W brick that shipped with an old laptop.",
      },
      { _key: key(), _type: "heading", level: "h2", text: "Less heat, more reliability" },
      {
        _key: key(),
        _type: "paragraph",
        text: "Less energy is wasted as heat, which means the charger runs cooler and can sustain its rated output. A hot charger throttles and shortens its own lifespan; a cool GaN charger just keeps going.",
      },
      {
        _key: key(),
        _type: "list",
        type: "number",
        items: [
          "Check for USB-C Power Delivery (PD) support",
          "Pick the wattage your biggest device needs (laptop = 45–100W)",
          "Make sure it has at least 2 ports for phone + buds",
          "Choose foldable pins for travel",
        ],
      },
      {
        _key: key(),
        _type: "callout",
        title: "One charger to rule them all",
        text: "A single 65W GaN charger with two USB-C ports can charge a laptop, a phone and earbuds — that's your whole travel bag solved with one brick.",
      },
      {
        _key: key(),
        _type: "cta",
        label: "See the GaN 65W",
        href: "/product/gan-65w-charger",
      },
    ],
    "2026-07-08T09:00:00Z",
    ["gan", "charger", "usb-c", "travel"]
  ),
  blogPost(
    "true-wireless-earbuds-buying-guide",
    "True Wireless Earbuds: What Actually Matters",
    IMG.blog3,
    "ANC, battery, fit and codecs — separate the specs that matter from the ones that don't when buying earbuds.",
    [
      {
        _key: key(),
        _type: "paragraph",
        text: "Earbuds specs are a minefield. Here's the honest breakdown of what changes your daily experience — and what's just a number on a box.",
      },
      { _key: key(), _type: "heading", level: "h2", text: "Fit beats everything" },
      {
        _key: key(),
        _type: "paragraph",
        text: "No driver or codec matters if the buds fall out or hurt after an hour. Check the bud weight (under 5g is ideal), and whether the tips come in multiple sizes. Sport models with ear hooks are worth it if you train.",
      },
      { _key: key(), _type: "heading", level: "h2", text: "ANC is the biggest 'feel' upgrade" },
      {
        _key: key(),
        _type: "paragraph",
        text: "Active noise cancelling transforms commutes and open-plan offices. Even a modest hybrid ANC (35dB) noticeably silences the rumble around you. If you don't travel or work in noise, it's skippable.",
      },
      {
        _key: key(),
        _type: "list",
        type: "bullet",
        items: [
          "ANC — worth it for commutes and offices",
          "Transparent mode — lets you hear surroundings safely",
          "Battery — aim for 6h+ per charge, 24h+ with case",
          "Wireless charging on the case — genuinely convenient",
          "Low-latency mode — only if you game",
        ],
      },
      {
        _key: key(),
        _type: "quote",
        text: "Buy for fit, then ANC, then battery. Everything else is nice-to-have.",
      },
      {
        _key: key(),
        _type: "cta",
        label: "Shop earbuds",
        href: "/products/earbuds",
      },
    ],
    "2026-06-22T09:00:00Z",
    ["earbuds", "bluetooth", "anc", "buying guide"]
  ),
  blogPost(
    "smartwatch-features-worth-paying-for",
    "5 Smartwatch Features Actually Worth Paying For",
    IMG.blog4,
    "From GPS accuracy to battery life and AMOLED displays — the features that justify a smartwatch upgrade.",
    [
      {
        _key: key(),
        _type: "paragraph",
        text: "Smartwatches now span $50 to $800, and the difference isn't always obvious from the spec sheet. These are the five features that genuinely change how a watch performs day to day.",
      },
      { _key: key(), _type: "heading", level: "h2", text: "1. Real battery life" },
      {
        _key: key(),
        _type: "paragraph",
        text: "A watch you charge every night is a watch you forget to wear. Aim for 7+ days — then it becomes a daily-wear health device instead of another screen to maintain.",
      },
      { _key: key(), _type: "heading", level: "h2", text: "2. Accurate GPS" },
      {
        _key: key(),
        _type: "paragraph",
        text: "If you run or hike, dual-band GPS is the single biggest upgrade from budget watches. Routes stop zig-zagging and pace data becomes trustworthy.",
      },
      { _key: key(), _type: "heading", level: "h2", text: "3. A display you can read outdoors" },
      {
        _key: key(),
        _type: "paragraph",
        text: "Brightness (nits) and always-on mode matter far more than raw resolution. 800 nits + always-on means you stop doing the wrist-flick dance in sunlight.",
      },
      {
        _key: key(),
        _type: "list",
        type: "number",
        items: [
          "Battery: 7+ days real-world",
          "GPS: dual-band if you train outdoors",
          "Display: 800 nits+, always-on option",
          "Health sensors: HR + SpO2 as a baseline",
          "Notifications: reliable call/text mirroring",
        ],
      },
      {
        _key: key(),
        _type: "cta",
        label: "Compare smartwatches",
        href: "/products/smartwatch",
      },
    ],
    "2026-06-05T09:00:00Z",
    ["smartwatch", "wearables", "buying guide"]
  ),
];

/* ── demo orders & email events ───────────────────────────────────── */

const DEMO_ORDERS = [
  {
    _id: "order.demo-1",
    _type: "order",
    orderId: "VG-AB12CD34EF56",
    customer: {
      name: "Hira Malik",
      email: "hira.demo@voltgear.store",
      phone: "+92 300 1234567",
      address: "123 Model Town, Block B",
      city: "Lahore",
      postal: "54000",
    },
    items: [
      { slug: "powercore-20k", name: "VoltGear PowerCore 20K Power Bank", price: 5999, quantity: 1 },
      { slug: "airdots-pro", name: "VoltGear AirDots Pro Earbuds", price: 8499, quantity: 1 },
    ],
    payment: "cod",
    subtotal: 14498,
    shipping: 0,
    total: 14498,
    status: "delivered",
  },
  {
    _id: "order.demo-2",
    _type: "order",
    orderId: "VG-DE78FG90HI12",
    customer: {
      name: "Usman Chaudhry",
      email: "usman.demo@voltgear.store",
      phone: "+92 311 2345678",
      address: "45 Shahrah-e-Faisal",
      city: "Karachi",
      postal: "74400",
    },
    items: [{ slug: "gan-65w-charger", name: "VoltGear GaN 65W Charger", price: 5499, quantity: 2 }],
    payment: "cod",
    subtotal: 10998,
    shipping: 199,
    total: 11197,
    status: "shipped",
  },
  {
    _id: "order.demo-3",
    _type: "order",
    orderId: "VG-JK34LM56NO78",
    customer: {
      name: "Ayesha Siddiqui",
      email: "sophie.demo@voltgear.store",
      phone: "+92 321 4567890",
      address: "9 F-7 Markaz",
      city: "Islamabad",
      postal: "44000",
    },
    items: [
      { slug: "voltgear-pro-s2", name: "VoltGear Pro S2 Smartwatch", price: 14999, quantity: 1 },
      { slug: "slim-10k", name: "VoltGear Slim 10K Power Bank", price: 3999, quantity: 1 },
    ],
    payment: "cod",
    subtotal: 18998,
    shipping: 0,
    total: 18998,
    status: "processing",
  },
  {
    _id: "order.demo-4",
    _type: "order",
    orderId: "VG-PQ90RS12TU34",
    customer: {
      name: "Ahmed Raza",
      email: "ahmed.demo@voltgear.store",
      phone: "+92 333 7891234",
      address: "12 D Ground",
      city: "Faisalabad",
      postal: "38000",
    },
    items: [{ slug: "studio-max", name: "VoltGear Studio Max Headphones", price: 13999, quantity: 1 }],
    payment: "cod",
    subtotal: 13999,
    shipping: 0,
    total: 13999,
    status: "new",
  },
];

const DEMO_EMAIL_EVENTS = [
  {
    _id: "emailEvent.demo-1",
    _type: "emailEvent",
    kind: "order-confirmation",
    email: "hira.demo@voltgear.store",
    data: JSON.stringify({ orderId: "VG-AB12CD34EF56" }),
    dueAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "emailEvent.demo-2",
    _type: "emailEvent",
    kind: "post-purchase",
    email: "hira.demo@voltgear.store",
    data: JSON.stringify({ orderId: "VG-AB12CD34EF56" }),
    dueAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "emailEvent.demo-3",
    _type: "emailEvent",
    kind: "abandoned-cart",
    email: "cart.demo@voltgear.store",
    data: JSON.stringify({
      name: "Faisal Demo",
      items: [{ name: "Ultra X GPS Smartwatch", price: 24999, quantity: 1 }],
      subtotal: 24999,
    }),
    dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "emailEvent.demo-4",
    _type: "emailEvent",
    kind: "win-back",
    email: "lapsed.demo@voltgear.store",
    data: JSON.stringify({ name: "Maria Demo" }),
    dueAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

/* ── run ───────────────────────────────────────────────────────────── */

let created = 0;
let updated = 0;
let skipped = 0;

console.log("Uploading images (first run downloads ~30 photos)…\n");

async function buildImages(list) {
  const out = [];
  for (const url of list) {
    const assetId = await uploadImage(url);
    if (assetId) out.push(img(assetId));
  }
  return out;
}

async function upsertWithCount(doc) {
  const existing = await client
    .fetch(`*[_id == $id][0]{_id}`, { id: doc._id })
    .catch(() => null);
  const ok = await upsert(doc);
  if (!ok) return;
  if (existing) updated++;
  else created++;
}

/* 1. Site settings */
console.log("▶ Site settings");
const settings = {
  _id: "siteSettings",
  _type: "siteSettings",
  brandName: "VoltGear",
  tagline: "Premium electronics accessories, honestly priced.",
  primaryColor: "#2563eb",
  secondaryColor: "#0ea5e9",
  theme: "dark",
  headingFont: "sora",
  bodyFont: "jakarta",
  currency: "PKR",
  email: "support@voltgear.store",
  phone: "+92 300 1112233",
  address: "123 Main Boulevard, Gulberg III, Lahore, Pakistan",
  socialLinks: [
    { _key: key(), platform: "Facebook", url: "https://facebook.com/voltgear" },
    { _key: key(), platform: "Instagram", url: "https://instagram.com/voltgear" },
    { _key: key(), platform: "TikTok", url: "https://tiktok.com/@voltgear" },
    { _key: key(), platform: "YouTube", url: "https://youtube.com/@voltgear" },
  ],
  freeShippingThreshold: 5000,
  shippingFee: 199,
  codEnabled: true,
  returnPolicy: "",
  warrantyInfo: "",
  warrantyMonths: null,
  returnWindowDays: null,
  announcement: {
    enabled: false,
    message: "",
    countdownEnabled: false,
    startsAt: null,
    endsAt: null,
  },
  seo: {
    title: "VoltGear — Premium Electronics Accessories",
    description:
      "Shop smartwatches, power banks, GaN chargers and wireless earbuds. Premium electronics accessories with fast shipping.",
  },
};
await upsertWithCount(settings);

/* 2. Hero section (after products are seeded for the featured ref) — see step 6 */

/* 3. Products */
console.log("\n▶ Products (16)");
const heroProductRef = "voltgear-pro-s2";
for (const p of PRODUCTS) {
  const images = await buildImages(p.images);
  if (!images.length) console.log(`  ⚠ ${p.slug} — no images uploaded (will use placeholder)`);
  const doc = {
    _id: p.slug,
    _type: "product",
    name: p.name,
    slug: { _type: "slug", current: p.slug },
    category: p.category,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images,
    cloudinaryImages: [],
    shortDescription: p.shortDescription,
    description: p.description,
    features: p.features,
    specifications: p.specifications,
    stockStatus: p.stockStatus,
    // Demo products carry no real customer reviews — rating/count are 0 so the
    // storefront never shows fabricated aggregates. The embedded reviews below
    // are marked isDemo and excluded from all production queries.
    rating: 0,
    reviewCount: 0,
    reviews: p.reviews,
    featured: p.featured,
    badge: p.badge,
  };
  await upsertWithCount(doc);
  console.log(`  ✓ ${p.slug} — ${p.name}`);
}

/* 4. Hero */
console.log("\n▶ Hero section");
const heroImageId = await uploadImage(IMG.hero);
await upsertWithCount({
  _id: "heroSection",
  _type: "heroSection",
  headline: "Power Your Everyday",
  subheadline:
    "Smartwatches, power banks, GaN chargers and wireless earbuds — engineered properly, priced honestly.",
  ...(heroImageId ? { backgroundImage: img(heroImageId) } : {}),
  primaryCta: { _key: key(), label: "Shop Best Sellers", href: "/products" },
  secondaryCta: { _key: key(), label: "Browse Smartwatches", href: "/products/smartwatch" },
  featuredProduct: { _type: "reference", _ref: heroProductRef },
});

/* 5. Testimonials */
console.log("\n▶ Testimonials (8)");
for (let i = 0; i < TESTIMONIALS.length; i++) {
  const t = TESTIMONIALS[i];
  const photo = t.customerPhoto ? await uploadImage(t.customerPhoto) : null;
  await upsertWithCount({
    _id: t._id,
    _type: "testimonial",
    customerName: t.customerName,
    ...(photo ? { customerPhoto: img(photo) } : {}),
    reviewText: t.reviewText,
    rating: t.rating,
    product: t.product,
    verified: t.verified,
    sortOrder: i + 1,
    isDemo: true,
  });
  console.log(`  ✓ ${t.customerName}`);
}

/* 6. Blog posts */
console.log("\n▶ Blog posts (4)");
for (const post of BLOG_POSTS) {
  const { coverImage, ...rest } = post;
  const cover = await uploadImage(coverImage);
  const doc = { ...rest, ...(cover ? { coverImage: img(cover) } : {}) };
  await upsertWithCount(doc);
  console.log(`  ✓ /blog/${post.slug.current} — ${post.title}`);
}

/* 7. Trust & legal pages */
console.log("\n▶ Trust & legal pages (6)");
for (const page of TRUST_PAGES) {
  const existing = await client
    .fetch(`*[_id == $id][0]{_id}`, { id: page._id })
    .catch(() => null);
  const ok = await upsert(page);
  if (!ok) continue;
  if (existing) updated++;
  else created++;
  console.log(`  ✓ /${page.slug.current} — ${page.title}`);
}

/* 8. Demo orders + email events (populate the admin panel) */
console.log("\n▶ Demo orders & email events");
for (const doc of DEMO_ORDERS) {
  const existing = await client.fetch(`*[_id == $id][0]{_id}`, { id: doc._id }).catch(() => null);
  const ok = await upsert(doc);
  if (!ok) continue;
  if (existing) updated++;
  else created++;
  console.log(`  ✓ order ${doc.orderId}`);
}
for (const doc of DEMO_EMAIL_EVENTS) {
  const existing = await client.fetch(`*[_id == $id][0]{_id}`, { id: doc._id }).catch(() => null);
  const ok = await upsert(doc);
  if (!ok) continue;
  if (existing) updated++;
  else created++;
  console.log(`  ✓ email event ${doc.kind} → ${doc.email}`);
}

console.log(`\nDone: ${created} created, ${updated} updated.`);
console.log(`
Next steps:
  1. npm run dev  (or deploy) — the storefront is now fully populated
  2. Sanity Studio → Site Settings — tweak brand color, contact info, shipping rules
  3. Sanity Studio → Products — edit any product, review, or price
  4. Sanity Studio → Orders / Review Submissions / Email Flow Queue — demo data included
The site refreshes within ~60s (ISR). Set NEXT_PUBLIC_SITE_URL to your domain for SEO.`);
