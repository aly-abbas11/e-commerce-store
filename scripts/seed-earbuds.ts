import { createClient as createSupabase } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

import { readSupabaseEnv } from "../lib/db/migration-rules";

function loadEnvLocal() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const supabaseEnv = readSupabaseEnv({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

const supabase = createSupabase(supabaseEnv.url, supabaseEnv.serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const EARBUDS_DATA = [
  {
    name: "Toocki Airbuds",
    slug: "toocki-airbuds",
    brand: "Toocki",
    sku: "VG-EB-TOOCKI",
    category: "earbuds",
    price: 2999,
    compareAtPrice: 3999,
    rating: 4.8,
    reviewCount: 35,
    featured: true,
    badge: "Transparent Case",
    stockStatus: "in-stock",
    shortDescription: "Sleek transparent TWS earbuds with digital LED power screen, Bluetooth 5.4, 10mm dynamic bass drivers, and 25-hour battery life.",
    features: [
      "Transparent cybernetic charging case with digital LED battery display",
      "Bluetooth 5.4 low-latency wireless transmission",
      "10mm composite diaphragm dynamic drivers for enhanced punchy bass",
      "Environmental Noise Cancellation (ENC) for crystal clear HD voice calls",
      "Smart touch controls & IPX4 splash resistance"
    ],
    specifications: [
      { label: "Bluetooth", value: "V5.4 Dual-Mode" },
      { label: "Playtime", value: "Up to 5 hours (25 hours with case)" },
      { label: "Driver Size", value: "10mm Dynamic Audio Driver" },
      { label: "Charging", value: "USB-C Fast Charging (1 hr full charge)" },
      { label: "Water Resistance", value: "IPX4 Splashproof" }
    ],
    compatibility: ["iOS 10.0+", "Android 5.0+", "Windows & Mac"],
    inTheBox: [
      "Toocki Airbuds Wireless Earphones",
      "Transparent Digital LED Charging Case",
      "Type-C Fast Charging Cable",
      "User Manual"
    ],
    image: "/gadget/products/earbuds-toocki.png"
  },
  {
    name: "Air Buds Pro 2 ANC",
    slug: "air-buds-pro-2-anc",
    brand: "VoltGear Audio",
    sku: "VG-EB-ABP2ANC",
    category: "earbuds",
    price: 4499,
    compareAtPrice: 6499,
    rating: 4.9,
    reviewCount: 48,
    featured: true,
    badge: "Active ANC",
    stockStatus: "in-stock",
    shortDescription: "Premium TWS earbuds equipped with 30dB Active Noise Cancellation, dual mic ENC calling, spatial audio tuning, and wireless charging support.",
    features: [
      "Hybrid 30dB Active Noise Cancellation (ANC) mode",
      "Transparency audio mode to hear surroundings clearly",
      "Dual microphone ENC for disturbance-free phone calls",
      "3D Spatial Audio processing with dynamic head orientation",
      "Up to 30 hours total battery life with USB-C / Wireless charging"
    ],
    specifications: [
      { label: "ANC Depth", value: "Up to -30dB Hybrid Noise Reduction" },
      { label: "Bluetooth", value: "V5.3 High Definition" },
      { label: "Battery", value: "6 Hours per charge (30 Hours Total)" },
      { label: "Water Rating", value: "IPX5 Water & Sweat Resistant" }
    ],
    compatibility: ["Universal Bluetooth Devices"],
    inTheBox: [
      "Air Buds Pro 2 ANC Earbuds",
      "Wireless Charging Case",
      "Silicone Ear Tips (S/M/L)",
      "USB-C Cable & Manual"
    ],
    image: "/gadget/products/earbuds-air-buds-pro-2-anc.png"
  },
  {
    name: "AirPods Pro 3 ANC",
    slug: "airpods-pro-3-anc",
    brand: "VoltGear Premier",
    sku: "VG-EB-APP3ANC",
    category: "earbuds",
    price: 14999,
    compareAtPrice: 18999,
    rating: 5.0,
    reviewCount: 62,
    featured: true,
    badge: "2x ANC Flagship",
    stockStatus: "in-stock",
    shortDescription: "Flagship audio engineering featuring 2x enhanced Active Noise Cancellation, built-in heart rate tracking, live translation mode, and IP57 dust & water rating.",
    features: [
      "Apple H2 Chipset with 2x stronger Active Noise Cancellation",
      "Integrated Heart Rate sensor for tracking workouts across 50+ sports",
      "Clinical-grade Hearing Protection & Conversation Boost",
      "IP57 dust, sweat, and water resistance on earbuds & MagSafe case",
      "Up to 8 hours listening time per charge (30+ hours with MagSafe case)"
    ],
    specifications: [
      { label: "Chipset", value: "Custom H2 Acoustic Chip" },
      { label: "Health Sensor", value: "Optical Heart Rate & Motion Sensor" },
      { label: "Rating", value: "IP57 Certified Dust/Sweatproof" },
      { label: "Case", value: "MagSafe USB-C with Precision Finding Speaker" }
    ],
    compatibility: ["iOS 17.0+", "Apple Watch", "Android & Windows"],
    inTheBox: [
      "AirPods Pro 3 ANC Earbuds",
      "MagSafe USB-C Charging Case",
      "Foam-Infused Ear Tips (5 Sizes)",
      "USB-C Charging Cable"
    ],
    image: "/gadget/products/earbuds-airpods-pro-3-anc.webp"
  },
  {
    name: "AirPods Pro 3",
    slug: "airpods-pro-3",
    brand: "VoltGear Premier",
    sku: "VG-EB-APP3",
    category: "earbuds",
    price: 11999,
    compareAtPrice: 14999,
    rating: 4.8,
    reviewCount: 39,
    featured: false,
    badge: "Spatial Audio",
    stockStatus: "in-stock",
    shortDescription: "Advanced wireless earbuds with personalized Spatial Audio, adaptive transparency mode, touch slider controls, and long-lasting battery power.",
    features: [
      "Personalized Spatial Audio with dynamic head tracking",
      "Adaptive Audio seamlessly blending Transparency & Noise Control",
      "Touch slider stem for volume adjust, track skip, and call management",
      "Sweat and water-resistant acoustic mesh construction",
      "Fast charging: 5 minutes charge provides 1 hour listening"
    ],
    specifications: [
      { label: "Bluetooth", value: "V5.3 Ultra Low Latency" },
      { label: "Playtime", value: "6 Hours single charge (30 Hours total)" },
      { label: "Controls", value: "Capacitive Stem Touch Control" },
      { label: "Microphones", value: "Dual Beamforming Mics" }
    ],
    compatibility: ["iOS, Android, Windows, macOS"],
    inTheBox: [
      "AirPods Pro 3 Earbuds",
      "Smart Charging Case",
      "Silicone Ear Tips (S/M/L)",
      "Charging Cable"
    ],
    image: "/gadget/products/earbuds-airpods-pro-3.webp"
  },
  {
    name: "Airdopes 11 Pro",
    slug: "airdopes-11-pro",
    brand: "boAt Sound",
    sku: "VG-EB-AD11P",
    category: "earbuds",
    price: 3999,
    compareAtPrice: 5499,
    rating: 4.7,
    reviewCount: 29,
    featured: false,
    badge: "50H Playback",
    stockStatus: "in-stock",
    shortDescription: "Heavy-duty wireless earbuds boasting 50 hours of total playback, 13mm deep bass drivers, 4-mic ENx call noise reduction, and BEAST 50ms gaming mode.",
    features: [
      "Massive 50 hours total playtime with ASAP Fast Charge technology",
      "13mm dynamic drivers delivering deep immersive signature audio",
      "Quad-Mic ENx™ tech for crystal clear voice calls without background noise",
      "BEAST™ Mode with 50ms low latency for real-time mobile gaming",
      "IPX4 water and sweat resistance with textured finish case"
    ],
    specifications: [
      { label: "Battery", value: "50 Hours Playback (10 min charge = 2 hrs)" },
      { label: "Drivers", value: "13mm Titanium Drivers" },
      { label: "Latency", value: "50ms Low Latency BEAST Mode" },
      { label: "Microphones", value: "4-Mic ENx Voice Cancellation" }
    ],
    compatibility: ["Android, iOS, PC, Smart TVs"],
    inTheBox: [
      "Airdopes 11 Pro Earbuds",
      "Compact Charging Case",
      "Type-C Cable",
      "User Manual & Warranty Card"
    ],
    image: "/gadget/products/earbuds-airdopes-11-pro.webp"
  },
  {
    name: "Z3 Pro TWS Earbuds",
    slug: "z3-pro-earbuds",
    brand: "Z3 Audio",
    sku: "VG-EB-Z3PRO",
    category: "earbuds",
    price: 3499,
    compareAtPrice: 4999,
    rating: 4.6,
    reviewCount: 21,
    featured: false,
    badge: "HD Sound",
    stockStatus: "in-stock",
    shortDescription: "Ergonomic TWS earbuds featuring Bluetooth 5.3, dual HD micro-drivers, smart touch sensors, and auto-pairing instant connection.",
    features: [
      "Bluetooth 5.3 instant auto-pairing connection",
      "Dual HD drivers providing balanced mids, clear highs, and deep bass",
      "Ergonomic in-ear seal for passive noise isolation",
      "Touch gesture sensor for volume, calls, and voice assistant",
      "24 hours total battery life with LED power bar case"
    ],
    specifications: [
      { label: "Bluetooth", value: "V5.3" },
      { label: "Battery", value: "4 Hours Continuous (24 Hours Total)" },
      { label: "Charging", value: "Type-C Fast Charge" },
      { label: "Weight", value: "Ultra Lightweight 3.8g per earbud" }
    ],
    compatibility: ["Android 5.0+", "iOS 9.0+"],
    inTheBox: [
      "Z3 Pro TWS Earbuds",
      "Charging Case with LED Bar",
      "Type-C Cable",
      "User Guide"
    ],
    image: "/gadget/products/earbuds-z3-pro.webp"
  },
  {
    name: "Firefly Cyberstud Earbuds",
    slug: "firefly-earbuds",
    brand: "Jabees / Nu",
    sku: "VG-EB-FIREFLY",
    category: "earbuds",
    price: 4999,
    compareAtPrice: 6999,
    rating: 4.8,
    reviewCount: 33,
    featured: true,
    badge: "RGB Cyber",
    stockStatus: "in-stock",
    shortDescription: "Cybernetic gaming TWS earbuds with customizable RGB lighting effects, 40ms ultra-low latency mode, 32dB active noise cancellation, and 72H playback.",
    features: [
      "32dB Hybrid ANC + Environmental Noise Cancellation (ENC)",
      "40ms Ultra-Low Latency for competitive esports gaming",
      "Dynamic RGB LED lighting accents on earbuds and charging case",
      "X-Bass 13mm dynamic drivers for impactful gaming sound effects",
      "Up to 72 hours long battery life with quick charging case"
    ],
    specifications: [
      { label: "Latency", value: "40ms Gaming Low Latency" },
      { label: "ANC", value: "-32dB Active Noise Cancellation" },
      { label: "Playtime", value: "72 Hours Total Power" },
      { label: "Lighting", value: "Cyberpunk RGB LED" }
    ],
    compatibility: ["Android, iOS, PC, Steam Deck, PS5"],
    inTheBox: [
      "Firefly Cyberstud TWS Earbuds",
      "RGB Futuristic Charging Case",
      "Type-C Braided Cable",
      "Extra Ear Tips & Manual"
    ],
    image: "/gadget/products/earbuds-firefly.webp"
  },
  {
    name: "NE 12s Wireless Earbuds",
    slug: "ne-12s-earbuds",
    brand: "NE Sound",
    sku: "VG-EB-NE12S",
    category: "earbuds",
    price: 2499,
    compareAtPrice: 3499,
    rating: 4.5,
    reviewCount: 18,
    featured: false,
    badge: "Value Pick",
    stockStatus: "in-stock",
    shortDescription: "Ultra-compact lightweight Bluetooth earphones with high-clarity stereo audio, IPX4 splash resistance, and comfortable semi-in-ear design.",
    features: [
      "Lightweight semi-in-ear ergonomic design for pressure-free wear",
      "Bluetooth 5.2 stable signal transmission up to 10 meters",
      "Clear stereo sound tuned for voice, podcasts, and casual listening",
      "Smart touch controls & voice assistant support (Siri/Google)",
      "Up to 20 hours combined battery life with magnetic pocket case"
    ],
    specifications: [
      { label: "Bluetooth", value: "V5.2" },
      { label: "Battery", value: "4.5 Hours single charge (20 Hours total)" },
      { label: "Protection", value: "IPX4 Sweatproof" },
      { label: "Weight", value: "3.2g per earbud" }
    ],
    compatibility: ["Android 4.4+", "iOS 8.0+"],
    inTheBox: [
      "NE 12s Wireless Earbuds",
      "Pocket Charging Case",
      "Micro-USB / Type-C Charging Cable",
      "Manual"
    ],
    image: "/gadget/products/earbuds-ne-12s.webp"
  },
  {
    name: "Buds Pro 16",
    slug: "buds-pro-16",
    brand: "VoltGear Audio",
    sku: "VG-EB-BP16",
    category: "earbuds",
    price: 3799,
    compareAtPrice: 5199,
    rating: 4.7,
    reviewCount: 26,
    featured: false,
    badge: "Dual Mic ENC",
    stockStatus: "in-stock",
    shortDescription: "Modern stem-style wireless earbuds featuring dual-mic environmental noise cancellation, Bluetooth 5.3, 12mm drivers, and 28-hour playtime.",
    features: [
      "Dual Microphone ENC for background noise filtration during calls",
      "Bluetooth 5.3 for seamless multi-device pairing",
      "12mm composite titanium drivers for crisp sound fidelity",
      "IPX5 sweat and water resistance for gym workouts",
      "Fast charging case supplying 28 hours total playback"
    ],
    specifications: [
      { label: "Bluetooth", value: "V5.3" },
      { label: "Playtime", value: "6 Hours (28 Hours with case)" },
      { label: "Drivers", value: "12mm Titanium Composite" },
      { label: "Rating", value: "IPX5 Water Resistant" }
    ],
    compatibility: ["Android, iOS, Laptops"],
    inTheBox: [
      "Buds Pro 16 Earbuds",
      "Matte Black Charging Case",
      "Type-C Cable",
      "User Guide"
    ],
    image: "/gadget/products/earbuds-buds-pro-16.webp"
  },
  {
    name: "Buds Pro 3",
    slug: "buds-pro-3",
    brand: "VoltGear Audio",
    sku: "VG-EB-BP3",
    category: "earbuds",
    price: 3299,
    compareAtPrice: 4499,
    rating: 4.6,
    reviewCount: 31,
    featured: false,
    badge: "Best Seller",
    stockStatus: "in-stock",
    shortDescription: "Compact in-ear true wireless earbuds with rich bass, touch controls, low-latency audio sync, and 22-hour battery life.",
    features: [
      "Rich deep bass audio profile optimized for music and gaming",
      "Automatic instant pairing upon opening the case lid",
      "Touch control interface for music control and call picking",
      "Compact ergonomic shape fitting comfortably in ear canal",
      "22 hours total battery capacity with Type-C charger"
    ],
    specifications: [
      { label: "Bluetooth", value: "V5.2" },
      { label: "Battery", value: "5 Hours (22 Hours Total)" },
      { label: "Range", value: "10 meters (33 feet)" }
    ],
    compatibility: ["Android, iOS, PC"],
    inTheBox: [
      "Buds Pro 3 Earbuds",
      "Compact Case",
      "Charging Cable",
      "Manual"
    ],
    image: "/gadget/products/earbuds-buds-pro-3.webp"
  },
  {
    name: "O'Lonnie Mecha N20 Earbuds",
    slug: "olonnie-mecha-n20-earbuds",
    brand: "O'Lonnie",
    sku: "VG-EB-OLM20",
    category: "earbuds",
    price: 3899,
    compareAtPrice: 5299,
    rating: 4.8,
    reviewCount: 27,
    featured: true,
    badge: "Mecha Shell",
    stockStatus: "in-stock",
    shortDescription: "Futuristic mecha-armored TWS earbuds featuring zinc alloy sliding case, low-latency gaming audio, Bluetooth 5.3, and heavy bass drivers.",
    features: [
      "Zinc alloy mechanical sliding case with satisfying tactile click",
      "Futuristic cyberpunk aesthetic with LED status lighting",
      "Low-latency audio engine for lag-free gaming and video streaming",
      "HD voice microphones with background noise suppression",
      "Up to 24 hours total battery life with fast pin charger"
    ],
    specifications: [
      { label: "Case Material", value: "Zinc Alloy Mecha Armor" },
      { label: "Bluetooth", value: "V5.3 Cyber Tech" },
      { label: "Battery", value: "5 Hours per charge (24 Hours Total)" },
      { label: "Water Rating", value: "IPX4 Certified" }
    ],
    compatibility: ["Android, iOS, Gaming Consoles"],
    inTheBox: [
      "O'Lonnie Mecha N20 Earbuds",
      "Mecha Alloy Slider Case",
      "Type-C Cable",
      "User Manual"
    ],
    image: "/gadget/products/earbuds-olonnie-mecha-n20.webp"
  },
  {
    name: "O'Lonnie Round N03 Earbuds",
    slug: "olonnie-round-n03-earbuds",
    brand: "O'Lonnie",
    sku: "VG-EB-OLR03",
    category: "earbuds",
    price: 2799,
    compareAtPrice: 3799,
    rating: 4.6,
    reviewCount: 19,
    featured: false,
    badge: "Pebble Round",
    stockStatus: "in-stock",
    shortDescription: "Smooth pebble-round TWS earbuds with mini lightweight build, Hi-Fi stereo acoustics, Bluetooth 5.3, and IPX4 sweat resistance.",
    features: [
      "Ultra-compact pebble round charging case fitting effortlessly in pockets",
      "Hi-Fi stereo sound tuning with warm vocals and detailed treble",
      "Auto-connect technology upon lifting earbuds out of case",
      "Smart touch controls for call handling and music playback",
      "Up to 20 hours of combined battery backup"
    ],
    specifications: [
      { label: "Design", value: "Pebble Round Ergonomic" },
      { label: "Bluetooth", value: "V5.3" },
      { label: "Playtime", value: "4.5 Hours (20 Hours Total)" }
    ],
    compatibility: ["Android 5.0+", "iOS 9.0+"],
    inTheBox: [
      "O'Lonnie Round N03 Earbuds",
      "Pebble Charging Case",
      "USB Cable",
      "User Manual"
    ],
    image: "/gadget/products/earbuds-olonnie-round-n03.webp"
  },
  {
    name: "O'Lonnie Round N05 Earbuds",
    slug: "olonnie-round-n05-earbuds",
    brand: "O'Lonnie",
    sku: "VG-EB-OLR05",
    category: "earbuds",
    price: 2999,
    compareAtPrice: 3999,
    rating: 4.7,
    reviewCount: 22,
    featured: false,
    badge: "Matte Round",
    stockStatus: "in-stock",
    shortDescription: "Refined matte round true wireless earbuds featuring upgraded 10mm drivers, noise-canceling mic, fast USB-C charging, and 24-hour playtime.",
    features: [
      "Matte texture circular charging case with LED battery indicator",
      "Upgraded 10mm dynamic driver for richer sound dynamics",
      "Clear call noise isolation mic algorithm",
      "Soft silicone ear tips for comfortable long listening sessions",
      "Up to 24 hours of extended battery power"
    ],
    specifications: [
      { label: "Bluetooth", value: "V5.3" },
      { label: "Drivers", value: "10mm Dynamic Audio" },
      { label: "Battery", value: "5 Hours (24 Hours Total)" }
    ],
    compatibility: ["Android 5.0+", "iOS 9.0+"],
    inTheBox: [
      "O'Lonnie Round N05 Earbuds",
      "Matte Round Case",
      "Silicone Tips (S/M/L)",
      "Type-C Cable & Manual"
    ],
    image: "/gadget/products/earbuds-olonnie-round-n05.webp"
  }
];

async function seed() {
  console.log(`Starting insertion of ${EARBUDS_DATA.length} earbud products into Supabase...`);

  for (const prod of EARBUDS_DATA) {
    const sanityId = `seed-${prod.slug}`;
    console.log(`Upserting: ${prod.name} (${prod.slug})`);

    const { data, error } = await supabase
      .from("products")
      .upsert(
        {
          sanity_id: sanityId,
          name: prod.name,
          slug: prod.slug,
          brand: prod.brand,
          sku: prod.sku,
          category: prod.category,
          price: prod.price,
          compare_at_price: prod.compareAtPrice,
          short_description: prod.shortDescription,
          description: [{ _type: "paragraph", text: prod.shortDescription }],
          features: prod.features,
          specifications: prod.specifications,
          compatibility: prod.compatibility,
          in_the_box: prod.inTheBox,
          stock_status: prod.stockStatus,
          rating: prod.rating,
          review_count: prod.reviewCount,
          featured: prod.featured,
          badge: prod.badge,
          status: "published",
          cloudinary_images: [],
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (error || !data) {
      console.error(`Error inserting product ${prod.slug}:`, error);
      continue;
    }

    const productId = data.id;

    // Clear existing images for this product and insert new image path
    await supabase.from("product_images").delete().eq("product_id", productId);
    const { error: imgErr } = await supabase.from("product_images").insert({
      product_id: productId,
      url: prod.image,
      sort_order: 0,
      source: "local",
    });

    if (imgErr) {
      console.error(`Error inserting image for ${prod.slug}:`, imgErr);
    } else {
      console.log(`Successfully seeded ${prod.name} with image ${prod.image}`);
    }
  }

  console.log("Earbuds seeding process completed!");
}

seed().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
