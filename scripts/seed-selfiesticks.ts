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

export const SELFIESTICKS_DATA = [
  {
    name: "Plokama Live K5 Selfie Stick Tripod",
    slug: "plokama-live-k5-selfie-stick",
    brand: "Plokama",
    sku: "VG-SS-PLK5",
    category: "selfie-stick",
    price: 1499,
    compareAtPrice: 2199,
    rating: 4.7,
    reviewCount: 32,
    featured: false,
    badge: "Compact 3-in-1",
    stockStatus: "in-stock",
    shortDescription: "Ultra-portable 3-in-1 wireless Bluetooth selfie stick tripod with 70cm telescoping reach, 360-degree rotating phone clamp, and fold-flat pocket design.",
    features: [
      "3-in-1 multi-functionality: Handheld selfie stick, tripod stand, and desktop phone mount",
      "Detachable Bluetooth 5.0 wireless remote shutter (10m control range)",
      "360-degree horizontal and vertical phone rotation clamp",
      "Extendable stainless steel rod extends up to 70cm (28 inches)",
      "Super compact folded size (19cm) easily fits into pocket or purse"
    ],
    specifications: [
      { label: "Extended Length", value: "70 cm / 28 inches" },
      { label: "Folded Size", value: "19 cm (Lightweight 150g)" },
      { label: "Bluetooth Range", value: "Up to 10 meters" },
      { label: "Material", value: "ABS + Stainless Steel Rod" }
    ],
    compatibility: ["iPhone 12-16", "Samsung Galaxy", "Android Smartphones"],
    inTheBox: [
      "Plokama Live K5 Selfie Stick Tripod",
      "Detachable Bluetooth Remote Control",
      "User Manual"
    ],
    image: "/gadget/products/selfiestick-plokama-k5.webp"
  },
  {
    name: "Plokama Live K5 LED Fill-Light Selfie Stick",
    slug: "plokama-live-k5-led-selfie-stick",
    brand: "Plokama",
    sku: "VG-SS-PLK5LED",
    category: "selfie-stick",
    price: 1899,
    compareAtPrice: 2599,
    rating: 4.8,
    reviewCount: 29,
    featured: true,
    badge: "Dual LED Light",
    stockStatus: "in-stock",
    shortDescription: "Upgraded K5 selfie stick featuring dual rechargeable LED fill lights with 3 brightness modes, wireless Bluetooth remote shutter, and integrated tripod stand.",
    features: [
      "Dual integrated LED fill lights with 3 dimmable brightness levels (Warm, Cool, Natural)",
      "Rechargeable USB LED battery providing up to 2 hours of continuous video light",
      "Detachable Bluetooth remote control for hands-free photo taking",
      "Durable non-slip rubber tripod base feet for stable recording",
      "360-degree rotating clamp for portrait or landscape streaming"
    ],
    specifications: [
      { label: "Light Modes", value: "3 Color Temps (Warm/Cool/Mixed)" },
      { label: "LED Battery", value: "Rechargeable via Micro-USB" },
      { label: "Extended Height", value: "75 cm" }
    ],
    compatibility: ["Vloggers & TikTokers", "iOS & Android Devices"],
    inTheBox: [
      "Plokama Live K5 LED Selfie Stick",
      "Detachable Bluetooth Remote",
      "USB Charging Cable",
      "User Guide"
    ],
    image: "/gadget/products/selfiestick-plokama-k5-led.webp"
  },
  {
    name: "Plokama Live K6 Extendable Bluetooth Selfie Stick",
    slug: "plokama-live-k6-selfie-stick",
    brand: "Plokama",
    sku: "VG-SS-PLK6",
    category: "selfie-stick",
    price: 2199,
    compareAtPrice: 2999,
    rating: 4.8,
    reviewCount: 41,
    featured: true,
    badge: "1.1m Heavy Duty",
    stockStatus: "in-stock",
    shortDescription: "Reinforced 1.1-meter (43-inch) extendable selfie stick tripod with anti-shake handle, detachable Bluetooth remote, and heavy-duty tripod legs.",
    features: [
      "Extended 1.1-meter (110cm) telescoping reach for wide group selfies and landscape shots",
      "Reinforced stainless steel core tube resistant to bending under heavy phones",
      "Anti-shake ergonomic balance handle grip",
      "Detachable wireless remote shutter with long battery life",
      "Universal clamp fits large smartphones up to 6.7 inches"
    ],
    specifications: [
      { label: "Max Length", value: "110 cm / 43 inches (1.1 meters)" },
      { label: "Material", value: "Premium Stainless Steel & ABS" },
      { label: "Wireless", value: "Bluetooth 5.0 (10m Distance)" }
    ],
    compatibility: ["Pro Max Smartphones", "Action Cameras (via 1/4 adapter)"],
    inTheBox: [
      "Plokama Live K6 Selfie Stick",
      "Wireless Bluetooth Remote",
      "Instruction Guide"
    ],
    image: "/gadget/products/selfiestick-plokama-k6.webp"
  },
  {
    name: "Plokama Live K7 Multi-Function Gimbal Selfie Stick",
    slug: "plokama-live-k7-gimbal-selfie-stick",
    brand: "Plokama",
    sku: "VG-SS-PLK7",
    category: "selfie-stick",
    price: 2999,
    compareAtPrice: 3999,
    rating: 4.9,
    reviewCount: 38,
    featured: true,
    badge: "Single-Axis Gimbal",
    stockStatus: "in-stock",
    shortDescription: "Motorized single-axis anti-shake gimbal stabilizer selfie stick with 360-degree automatic pan-tilt, Bluetooth remote, and integrated tripod.",
    features: [
      "Single-axis smart brushless motor stabilizer for smooth, shake-free video recording",
      "360-degree automatic horizontal/vertical switching with one button click",
      "Functions as a gimbal stabilizer, selfie stick, and stationary tripod",
      "Built-in rechargeable 450mAh lithium battery for motorized stabilization",
      "Wireless Bluetooth shutter remote for photo and video control"
    ],
    specifications: [
      { label: "Stabilization", value: "Single-Axis Motorized Gimbal" },
      { label: "Gimbal Battery", value: "450mAh Lithium (2-3 Hours Runtime)" },
      { label: "Extendable Height", value: "86 cm" },
      { label: "Weight", value: "210g" }
    ],
    compatibility: ["Mobile Vlogging", "YouTube/TikTok Shorts", "All Smartphones"],
    inTheBox: [
      "Plokama Live K7 Gimbal Selfie Stick",
      "Wireless Bluetooth Remote",
      "Micro-USB Charging Cable",
      "User Manual"
    ],
    image: "/gadget/products/selfiestick-plokama-k7.webp"
  },
  {
    name: "R1S Large Bluetooth Selfie Stick Tripod",
    slug: "r1s-large-selfie-stick-tripod",
    brand: "R1 Series",
    sku: "VG-SS-R1SL",
    category: "ring-light",
    price: 1699,
    compareAtPrice: 2399,
    rating: 4.7,
    reviewCount: 46,
    featured: false,
    badge: "1.6m Extra Tall",
    stockStatus: "in-stock",
    shortDescription: "Extra tall 1.6-meter (63-inch) Bluetooth selfie stick tripod with built-in mini LED fill light, detachable remote control, and stable tripod base.",
    features: [
      "Impressive 1.6-meter (160cm) maximum height for full-body portraits & studio angles",
      "Built-in mini LED fill light for clear night shots & low-light video calls",
      "Detachable Bluetooth remote shutter button",
      "Strong aluminum alloy extension rod",
      "Foldable tripod legs with rubber grip feet"
    ],
    specifications: [
      { label: "Max Height", value: "160 cm / 63 inches (1.6 Meters)" },
      { label: "Folded Length", value: "30 cm" },
      { label: "Fill Light", value: "Built-in Mini LED" }
    ],
    compatibility: ["All iOS & Android Devices", "Portable Photography"],
    inTheBox: [
      "R1S Large Selfie Stick Tripod",
      "Wireless Bluetooth Shutter Remote",
      "User Manual"
    ],
    image: "/gadget/products/selfiestick-r1s-large.webp"
  },
  {
    name: "JC 18 H Professional Heavy Duty Selfie Stick Tripod",
    slug: "jc-18-h-heavy-duty-selfie-stick",
    brand: "JC Tech",
    sku: "VG-SS-JC18H",
    category: "selfie-stick",
    price: 2499,
    compareAtPrice: 3499,
    rating: 4.8,
    reviewCount: 33,
    featured: true,
    badge: "1.8m Heavy Duty",
    stockStatus: "in-stock",
    shortDescription: "Professional heavy-duty 1.8-meter (70-inch) aluminum selfie stick tripod featuring dual LED fill lights, 1/4-inch screw mount, and wireless remote.",
    features: [
      "Heavy-duty 1.8-meter (180cm) max extension height crafted from aviation aluminum",
      "Dual detachable LED fill lights with 6 brightness and color temp modes",
      "Reinforced heavy tripod structure providing high stability outdoors",
      "1/4-inch universal screw top compatible with smartphones, GoPros & ring lights",
      "Detachable long-range Bluetooth remote controller"
    ],
    specifications: [
      { label: "Max Extension", value: "180 cm / 70 inches (1.8 Meters)" },
      { label: "Lighting", value: "Dual Rechargeable LED Fill Lights" },
      { label: "Material", value: "Aviation Aluminum Alloy" },
      { label: "Top Mount", value: "Universal 1/4-inch Standard Thread" }
    ],
    compatibility: ["Smartphones", "GoPro / Action Cameras", "Mini Ring Lights"],
    inTheBox: [
      "JC 18 H Heavy Duty Selfie Stick Tripod",
      "2x Detachable LED Fill Lights",
      "Wireless Remote Control",
      "USB Charging Cable",
      "User Manual"
    ],
    image: "/gadget/products/selfiestick-jc18h.webp"
  }
];

async function seed() {
  console.log(`Starting insertion of ${SELFIESTICKS_DATA.length} selfie stick products into Supabase...`);

  for (const prod of SELFIESTICKS_DATA) {
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

  console.log("Selfie Sticks seeding process completed!");
}

seed().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
