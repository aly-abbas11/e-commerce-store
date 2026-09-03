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

export const TRIPODS_DATA = [
  {
    name: "Plokama PK-998 Professional Camera Tripod",
    slug: "plokama-pk-998-professional-tripod",
    brand: "Plokama Pro",
    sku: "VG-TP-PK998",
    category: "selfie-stick",
    price: 3499,
    compareAtPrice: 4799,
    rating: 4.8,
    reviewCount: 39,
    featured: true,
    badge: "1.4m Aluminum",
    stockStatus: "in-stock",
    shortDescription: "Professional 1.4-meter aluminum alloy camera & mobile tripod with 3-way fluid pan head, quick release plate, bubble level meter, and non-slip rubber feet.",
    features: [
      "Heavy-duty aluminum alloy 3-section telescoping legs extending up to 140cm",
      "3-way pan-and-tilt fluid head for smooth 360-degree panoramic panning",
      "Quick release plate with standard 1/4-inch mounting screw",
      "Built-in precise bubble level meter for balanced photography",
      "Center column elevator gear with locking crank handle"
    ],
    specifications: [
      { label: "Max Height", value: "140 cm (1.4 Meters)" },
      { label: "Folded Height", value: "52 cm" },
      { label: "Max Load Capacity", value: "3.5 kg" },
      { label: "Material", value: "High-grade Aluminum Alloy & ABS" }
    ],
    compatibility: ["DSLR & Mirrorless Cameras", "Smartphones (with clamp)", "Ring Lights"],
    inTheBox: [
      "Plokama PK-998 Professional Tripod",
      "Smartphone Mount Adapter",
      "Heavy-Duty Zippered Carry Bag"
    ],
    image: "/gadget/products/tripod-plokama-pk998.webp"
  },
  {
    name: "Plokama PK-8899 Multipurpose Studio Tripod",
    slug: "plokama-pk-8899-multipurpose-tripod",
    brand: "Plokama Pro",
    sku: "VG-TP-PK8899",
    category: "selfie-stick",
    price: 3999,
    compareAtPrice: 5499,
    rating: 4.9,
    reviewCount: 42,
    featured: true,
    badge: "1.7m Heavy Studio",
    stockStatus: "in-stock",
    shortDescription: "Multipurpose 1.7-meter heavy studio tripod stand featuring dual phone/tablet mounts, boom arm adjustment tilt, and high load stability.",
    features: [
      "Extends up to 1.7 meters (170cm) for studio broadcasting & overhead video",
      "Multipurpose mounting bar supports phone clamp and auxiliary light simultaneously",
      "Reinforced flip-lock leg extension clamps",
      "Integrated center stabilizer hook for adding counterweight stability",
      "Includes wireless Bluetooth shutter remote control"
    ],
    specifications: [
      { label: "Max Height", value: "170 cm / 5.5 Feet" },
      { label: "Payload Capacity", value: "4.0 kg" },
      { label: "Leg Sections", value: "4 Telescoping Sections" }
    ],
    compatibility: ["Broadcasting Studios", "DSLR Cameras", "Softboxes & Ring Lights"],
    inTheBox: [
      "Plokama PK-8899 Studio Tripod",
      "Dual Phone Mounting Clamps",
      "Bluetooth Shutter Remote",
      "Travel Shoulder Bag"
    ],
    image: "/gadget/products/tripod-plokama-pk8899.webp"
  },
  {
    name: "VT 170 Aluminum Video Tripod Stand",
    slug: "vt-170-aluminum-video-tripod",
    brand: "VT Series",
    sku: "VG-TP-VT170",
    category: "selfie-stick",
    price: 3199,
    compareAtPrice: 4299,
    rating: 4.7,
    reviewCount: 31,
    featured: false,
    badge: "Fluid Pan Head",
    stockStatus: "in-stock",
    shortDescription: "1.5-meter lightweight video tripod engineered with smooth fluid damping head, flip-lock leg section latches, and rubber swivel feet.",
    features: [
      "Fluid-damped 3D pan head for tilt and swivel video movements",
      "Telescoping height ranges from 55cm to 150cm",
      "Quick release camera shoe plate with safety pin lock",
      "Middle lever brace system providing high leg stability",
      "Lightweight travel construction weighs only 980g"
    ],
    specifications: [
      { label: "Max Height", value: "150 cm" },
      { label: "Weight", value: "980g Ultra Portable" },
      { label: "Head Type", value: "3D Damped Pan Head" }
    ],
    compatibility: ["Camcorders", "Smartphones", "Compact Projectors"],
    inTheBox: [
      "VT 170 Video Tripod",
      "Universal Phone Holder",
      "Carrying Case"
    ],
    image: "/gadget/products/tripod-vt170.webp"
  },
  {
    name: "Plokama PK 9950 Heavy Duty Tripod Stand",
    slug: "plokama-pk-9950-heavy-duty-tripod",
    brand: "Plokama Pro",
    sku: "VG-TP-PK9950",
    category: "selfie-stick",
    price: 4499,
    compareAtPrice: 5999,
    rating: 4.8,
    reviewCount: 27,
    featured: true,
    badge: "Professional 1.8m",
    stockStatus: "in-stock",
    shortDescription: "Professional 1.8-meter heavy-duty studio camera tripod featuring gear-driven center column elevator, dual spirit levels, and anti-slip feet.",
    features: [
      "Heavy-duty 1.8-meter (180cm) maximum height capability",
      "Precision gear-crank center column for exact vertical positioning",
      "Dual spirit bubble levels (horizontal & vertical orientation)",
      "High stability bracing lock arm system",
      "Standard 1/4-inch and 3/8-inch camera thread compatibility"
    ],
    specifications: [
      { label: "Max Height", value: "180 cm (1.8 Meters)" },
      { label: "Max Load", value: "5.0 kg Heavy Duty" },
      { label: "Material", value: "Anodized Heavy Aluminum" }
    ],
    compatibility: ["Heavy DSLRs & Telephoto Lenses", "Studio Fill Lights"],
    inTheBox: [
      "Plokama PK 9950 Professional Tripod",
      "Quick Release Mounting Plate",
      "Heavy Duty Nylon Bag"
    ],
    image: "/gadget/products/tripod-plokama-pk9950.webp"
  },
  {
    name: "VT 200 Professional Camera Tripod (2 Meters)",
    slug: "vt-200-professional-camera-tripod",
    brand: "VT Series",
    sku: "VG-TP-VT200",
    category: "selfie-stick",
    price: 4999,
    compareAtPrice: 6999,
    rating: 4.9,
    reviewCount: 35,
    featured: true,
    badge: "2-Meter Max Reach",
    stockStatus: "in-stock",
    shortDescription: "Extra tall 2.0-meter (6.5 feet) studio video tripod stand with hydraulic fluid drag pan head, pan handle bar, and heavy aluminum build.",
    features: [
      "Reaches full 2.0-meter (200cm) height for high angle video capture",
      "Hydraulic fluid drag head for smooth video pans without jitter",
      "Ergonomic rubberized pan handle control bar",
      "Flip-lock leg extensions with rubber feet",
      "Built-in center column ballast hook"
    ],
    specifications: [
      { label: "Max Height", value: "200 cm (2.0 Meters / 6.5 Feet)" },
      { label: "Fluid Head", value: "Hydraulic Drag Pan & Tilt" },
      { label: "Payload Capacity", value: "4.5 kg" }
    ],
    compatibility: ["Video Cameras", "DSLR Rigs", "Smartphones & Tablets"],
    inTheBox: [
      "VT 200 2-Meter Professional Tripod",
      "Pan Handle Bar",
      "Phone Mount Adapter",
      "Carrying Case"
    ],
    image: "/gadget/products/tripod-vt200.webp"
  },
  {
    name: "Plokama PK 9970 Heavy Duty Studio Tripod",
    slug: "plokama-pk-9970-heavy-duty-tripod",
    brand: "Plokama Pro",
    sku: "VG-TP-PK9970",
    category: "selfie-stick",
    price: 5299,
    compareAtPrice: 7299,
    rating: 4.9,
    reviewCount: 24,
    featured: true,
    badge: "Flagship 2.1m",
    stockStatus: "in-stock",
    shortDescription: "Flagship 2.1-meter heavy studio tripod stand with dual pan handles, 3D pan tilt head, quick release plate, and reinforced leg locks.",
    features: [
      "2.1-meter (210cm) maximum height capability for studio lighting & cameras",
      "Dual pan handles for two-handed control during live video panning",
      "High rigidity aluminum alloy construction supporting up to 6 kg",
      "Bubble level indicator & geared center elevator system",
      "Anti-skid rubber feet with retractable steel spikes for outdoor terrain"
    ],
    specifications: [
      { label: "Max Height", value: "210 cm / 2.1 meters" },
      { label: "Max Payload", value: "6.0 kg" },
      { label: "Feet Type", value: "Swivel Rubber + Outdoor Metal Spikes" }
    ],
    compatibility: ["Heavy Video Cameras", "Commercial Studio Gear"],
    inTheBox: [
      "Plokama PK 9970 Heavy Studio Tripod",
      "Dual Pan Handles",
      "Padded Shoulder Strap Bag"
    ],
    image: "/gadget/products/tripod-plokama-pk9970.webp"
  },
  {
    name: "Stand 380A Portable Tripod Stand",
    slug: "stand-380a-portable-tripod",
    brand: "Stand Tech",
    sku: "VG-TP-ST380A",
    category: "selfie-stick",
    price: 1899,
    compareAtPrice: 2699,
    rating: 4.6,
    reviewCount: 38,
    featured: false,
    badge: "Value Pack",
    stockStatus: "in-stock",
    shortDescription: "Lightweight 1.3-meter portable camera & mobile tripod stand with 360-degree swivel pan head, phone clip, and compact fold size.",
    features: [
      "Compact 130cm extended height with 4-section telescoping legs",
      "3-way head with 90-degree vertical tilt capability for portrait shots",
      "Includes phone clamp mount for smartphones",
      "Super lightweight (650g) designed for travel vlogging",
      "Quick lever lock system"
    ],
    specifications: [
      { label: "Extended Length", value: "130 cm" },
      { label: "Folded Size", value: "45 cm" },
      { label: "Weight", value: "650g" }
    ],
    compatibility: ["Smartphones", "Action Cameras", "Lightweight Compact Cameras"],
    inTheBox: [
      "Stand 380A Portable Tripod",
      "Phone Holder Clip",
      "Carrying Pouch"
    ],
    image: "/gadget/products/tripod-stand-380a.webp"
  },
  {
    name: "Unme PYP-J1004 Universal Tripod Stand",
    slug: "unme-pyp-j1004-universal-tripod",
    brand: "Unme",
    sku: "VG-TP-J1004",
    category: "selfie-stick",
    price: 2299,
    compareAtPrice: 3199,
    rating: 4.7,
    reviewCount: 20,
    featured: false,
    badge: "Universal 1.4m",
    stockStatus: "in-stock",
    shortDescription: "Universal 1.4-meter tripod stand with 360-degree rotatable phone holder, remote shutter, and anti-vibration aluminum alloy legs.",
    features: [
      "1.4-meter extension reach with smooth height adjustment locks",
      "Universal phone clamp bracket compatible with all smartphone sizes",
      "Bluetooth remote shutter for wireless photography up to 10m",
      "Anti-vibration rubber feet pad design",
      "Compact foldable design suitable for indoor/outdoor use"
    ],
    specifications: [
      { label: "Height Range", value: "48 cm - 140 cm" },
      { label: "Bluetooth Range", value: "10 Meters" },
      { label: "Material", value: "Aluminum Alloy & Durable ABS" }
    ],
    compatibility: ["Smartphones", "Microphones", "Mini Projectors"],
    inTheBox: [
      "Unme PYP-J1004 Tripod",
      "Phone Holder Clamp",
      "Bluetooth Remote Shutter",
      "Carry Bag"
    ],
    image: "/gadget/products/tripod-unme-j1004.webp"
  },
  {
    name: "Candac DC 320 Flexible Tripod Stand",
    slug: "candac-dc-320-flexible-tripod",
    brand: "Candac",
    sku: "VG-TP-CDC320",
    category: "selfie-stick",
    price: 1699,
    compareAtPrice: 2399,
    rating: 4.6,
    reviewCount: 18,
    featured: false,
    badge: "Flexible Octopus",
    stockStatus: "in-stock",
    shortDescription: "Flexible octopus style tripod stand with bendable rubber legs, 360-degree ball head, and universal phone mount clip for creative angle mounting.",
    features: [
      "High-elasticity bendable leg joints that wrap around poles, railings, and tree branches",
      "360-degree rotatable metal ball head for multi-angle orientation",
      "Waterproof and crack-resistant rubberized leg coating",
      "Universal 1/4-inch screw mount for cameras and phone holders",
      "Ultra portable compact size fits easily into backpacks"
    ],
    specifications: [
      { label: "Leg Style", value: "Flexible Wrappable Octopus Legs" },
      { label: "Ball Head", value: "360-Degree Swivel Metal Ball Head" },
      { label: "Weight Capacity", value: "1.2 kg" }
    ],
    compatibility: ["Action Cameras (GoPro)", "Smartphones", "Vlogging Microphones"],
    inTheBox: [
      "Candac DC 320 Flexible Tripod",
      "Phone Mount Clip",
      "Action Cam Mount Adapter"
    ],
    image: "/gadget/products/tripod-candac-dc320.webp"
  },
  {
    name: "Candac 6360 Professional Aluminum Tripod",
    slug: "candac-6360-professional-tripod",
    brand: "Candac",
    sku: "VG-TP-CDC6360",
    category: "selfie-stick",
    price: 3899,
    compareAtPrice: 5299,
    rating: 4.8,
    reviewCount: 23,
    featured: false,
    badge: "1.6m Pro Series",
    stockStatus: "in-stock",
    shortDescription: "Professional 1.6-meter aluminum camera tripod featuring 3-way pan tilt head, quick release plate system, and integrated bubble level.",
    features: [
      "1.6-meter (160cm) full height extension capability",
      "Sturdy 3-section aluminum legs with flip locks",
      "Quick release shoe plate with safety catch pin",
      "Cranks-driven elevator center tube",
      "Non-slip rubber feet providing solid floor grip"
    ],
    specifications: [
      { label: "Max Height", value: "160 cm" },
      { label: "Load Capacity", value: "3.8 kg" },
      { label: "Head Type", value: "3-Way Pan & Tilt Head" }
    ],
    compatibility: ["DSLR Cameras", "Mirrorless Cameras", "Smartphones"],
    inTheBox: [
      "Candac 6360 Aluminum Tripod",
      "Phone Holder Adapter",
      "Carrying Case"
    ],
    image: "/gadget/products/tripod-candac-6360.webp"
  },
  {
    name: "Jmary KP 2207 Portable Camera Tripod",
    slug: "jmary-kp-2207-portable-camera-tripod",
    brand: "Jmary",
    sku: "VG-TP-JM2207",
    category: "selfie-stick",
    price: 2999,
    compareAtPrice: 4199,
    rating: 4.8,
    reviewCount: 36,
    featured: true,
    badge: "Jmary Original",
    stockStatus: "in-stock",
    shortDescription: "Authentic Jmary KP-2207 portable camera tripod featuring 1.34-meter aluminum legs, 360-degree pan head, quick release plate, and phone clip.",
    features: [
      "Genuine Jmary KP-2207 build with high quality aluminum finish",
      "Max height of 134cm with 4-section telescoping leg latches",
      "Compact 43cm folded length for effortless travel",
      "Supports 3D pan and vertical 90-degree orientation",
      "Supports maximum load capacity up to 2.5 kg"
    ],
    specifications: [
      { label: "Max Height", value: "134 cm" },
      { label: "Folded Height", value: "43 cm" },
      { label: "Weight", value: "730g" },
      { label: "Load Capacity", value: "2.5 kg" }
    ],
    compatibility: ["Smartphones", "DSLR Cameras", "Compact Projectors"],
    inTheBox: [
      "Jmary KP 2207 Original Tripod",
      "Jmary Phone Clamp Mount",
      "Jmary Branded Travel Bag"
    ],
    image: "/gadget/products/tripod-jmary-kp2207.webp"
  },
  {
    name: "Plokama Auto A20 AI Smart Tracking Gimbal Tripod",
    slug: "plokama-auto-a20-ai-smart-tracking-tripod",
    brand: "Plokama AI",
    sku: "VG-TP-AUTOA20",
    category: "selfie-stick",
    price: 4999,
    compareAtPrice: 6999,
    rating: 4.9,
    reviewCount: 44,
    featured: true,
    badge: "AI Auto-Tracking",
    stockStatus: "in-stock",
    shortDescription: "Smart 360-degree AI auto face & body tracking gimbal tripod with gesture control, no app required, built-in rechargeable battery, and tripod thread.",
    features: [
      "AI face and body auto-tracking optic sensor (rotates 360 degrees to follow movement)",
      "No app required – built-in AI camera vision processes tracking natively",
      "Gesture recognition control (OK gesture to start tracking, Palm gesture to pause)",
      "Built-in 1200mAh rechargeable lithium battery providing 4-6 hours runtime",
      "Bottom 1/4-inch standard thread compatible with floor tripod stands"
    ],
    specifications: [
      { label: "Tracking Tech", value: "AI Optical Face & Body Tracking" },
      { label: "Rotation Angle", value: "360-Degree Infinite Rotation" },
      { label: "Battery", value: "1200mAh Rechargeable (4-6 hrs runtime)" },
      { label: "Gesture Control", value: "Supported (OK / Palm)" }
    ],
    compatibility: ["Content Creators", "Vloggers", "TikTok & Instagram Reels", "All Smartphones"],
    inTheBox: [
      "Plokama Auto A20 AI Tracking Smart Mount",
      "Tripod Base Stand",
      "USB-C Charging Cable",
      "User Manual"
    ],
    image: "/gadget/products/tripod-plokama-a20.webp"
  },
  {
    name: "Bluks BX 391 Heavy Duty Studio Tripod",
    slug: "bluks-bx-391-heavy-duty-tripod",
    brand: "Bluks",
    sku: "VG-TP-BX391",
    category: "selfie-stick",
    price: 3699,
    compareAtPrice: 4999,
    rating: 4.7,
    reviewCount: 21,
    featured: false,
    badge: "Heavy Aluminum",
    stockStatus: "in-stock",
    shortDescription: "Heavy-duty 1.5-meter aluminum camera and camcorder tripod featuring 3D pan tilt head, spirit bubble level, and quick release plate.",
    features: [
      "1.5-meter max height extension with sturdy 3-section legs",
      "High rigidity aluminum frame designed for stable studio recording",
      "3-way fluid pan head with vertical tilt lock knob",
      "Quick release shoe plate for fast camera mounting",
      "Center column crank handle elevator"
    ],
    specifications: [
      { label: "Max Height", value: "150 cm" },
      { label: "Material", value: "Aviation Grade Aluminum Alloy" },
      { label: "Load Capacity", value: "3.5 kg" }
    ],
    compatibility: ["Camcorders", "DSLR Cameras", "Smartphones"],
    inTheBox: [
      "Bluks BX 391 Heavy Duty Tripod",
      "Phone Mount Adapter",
      "Carrying Case"
    ],
    image: "/gadget/products/tripod-bluks-bx391.webp"
  }
];

async function seed() {
  console.log(`Starting insertion of ${TRIPODS_DATA.length} tripod products into Supabase...`);

  for (const prod of TRIPODS_DATA) {
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

  console.log("Tripods seeding process completed!");
}

seed().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
