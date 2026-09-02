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

export const SMARTWATCHES_DATA = [
  {
    name: "Series 11 Apple Logo Smartwatch",
    slug: "series-11-apple-logo-smartwatch",
    brand: "VoltGear Premier",
    sku: "VG-SW-S11",
    category: "smartwatch",
    price: 18500,
    compareAtPrice: 24999,
    rating: 4.9,
    reviewCount: 38,
    featured: true,
    badge: "New Release",
    stockStatus: "in-stock",
    shortDescription: "Ultra-sleek flagship smartwatch with crisp Always-On Retina Display, advanced S10 sensor suite, hypertension alerts, and 24-hour fast-charge battery.",
    features: [
      "Always-On LTPO3 OLED Retina Display with 2000 nits peak brightness",
      "Advanced S10 Dual-Core Chipset with integrated AI processing",
      "Hypertension & Sleep Apnea Detection with 24/7 Heart Rate monitoring",
      "Aerospace-grade titanium alloy chassis with 2x scratch-resistant front crystal",
      "5G Cellular & High-Precision Dual-Frequency GPS navigation",
      "IP68 Swim-proof water resistance up to 50 meters depth"
    ],
    specifications: [
      { label: "Display", value: "1.92-inch Always-On OLED Retina (480x396)" },
      { label: "Processor", value: "S10 High-Performance Chip" },
      { label: "Battery", value: "Up to 24 hours (Normal), 38 hours (Low Power)" },
      { label: "Connectivity", value: "Bluetooth 5.3, Wi-Fi 802.11n, 5G Cellular" },
      { label: "Sensors", value: "ECG, SpO2, Blood Pressure, Accelerometer, Gyro, Compass" },
      { label: "Water Rating", value: "5 ATM (50m Swimproof)" }
    ],
    compatibility: ["iOS 16.0+", "Android 10.0+"],
    inTheBox: [
      "Series 11 Apple Logo Smartwatch",
      "Premium Black Fluoroelastomer Sport Strap",
      "Fast Magnetic Wireless Charging Cable",
      "User Manual & Warranty Guide"
    ],
    image: "/gadget/products/smartwatch-series11-apple-logo.png"
  },
  {
    name: "Mini ZW DO 10 Smartwatch",
    slug: "mini-zw-do-10-smartwatch",
    brand: "PEJE",
    sku: "VG-SW-ZWDO10",
    category: "smartwatch",
    price: 4999,
    compareAtPrice: 6999,
    rating: 4.6,
    reviewCount: 24,
    featured: false,
    badge: "Compact Design",
    stockStatus: "in-stock",
    shortDescription: "Elegant compact smartwatch featuring a vibrant HD color touch screen, rose-gold alloy casing, DaFit integration, and full Bluetooth call capability.",
    features: [
      "Compact 1.43-inch HD Color Touchscreen Display",
      "Direct Bluetooth HD calling with noise-canceling mic",
      "Real-time Heart Rate, SpO2 Blood Oxygen, and Sleep Tracker",
      "IP68 dust and water resistance for daily active wear",
      "Multi-sports modes with step counter and calorie burn tracking",
      "Multi-day battery performance with magnetic fast pin charger"
    ],
    specifications: [
      { label: "Display", value: "1.43-inch HD TFT Screen (360x360)" },
      { label: "Casing", value: "Zinc Alloy Rose-Gold Bezel" },
      { label: "Battery", value: "220mAh (up to 7 days standby)" },
      { label: "App", value: "DaFit / RdFit Mobile App" },
      { label: "Protection", value: "IP68 Water & Dust Resistant" }
    ],
    compatibility: ["Android 5.0+", "iOS 9.0+"],
    inTheBox: [
      "Mini ZW DO 10 Smartwatch",
      "Pink Comfort Silicone Strap",
      "Magnetic Pin Charger",
      "User Manual"
    ],
    image: "/gadget/products/smartwatch-mini-zw-do10.png"
  },
  {
    name: "Keloobe SK 47 Smartwatch",
    slug: "keloobe-sk-47-smartwatch",
    brand: "Kalobee Tech",
    sku: "VG-SW-SK47",
    category: "smartwatch",
    price: 6499,
    compareAtPrice: 8999,
    rating: 4.7,
    reviewCount: 19,
    featured: true,
    badge: "Rugged Tactical",
    stockStatus: "in-stock",
    shortDescription: "Military-grade tactical smartwatch built with reinforced matte black alloy, tactical ocean silicone band, and all-weather outdoor sensors.",
    features: [
      "Shockproof metallic body engineered for extreme environments",
      "1.52-inch High-Brightness Outdoor Screen readable in direct sunlight",
      "Bluetooth V5.2 hands-free calling and instant app notifications",
      "Dynamic heart rate monitoring, SpO2 tracking, and pressure index",
      "Over 100+ specialized multi-sport tracking algorithms",
      "Long-lasting 380mAh battery providing up to 10 days active usage"
    ],
    specifications: [
      { label: "Display", value: "1.52-inch Full-Touch IPS (360x360)" },
      { label: "Battery", value: "380mAh Cobalt Lithium Polymer" },
      { label: "Bluetooth", value: "Dual-mode BLE 5.2" },
      { label: "Waterproof", value: "IP68 Certified" },
      { label: "Housing", value: "Tactical Matte Alloy + ABS Armor" }
    ],
    compatibility: ["Android 6.0+", "iOS 10.0+"],
    inTheBox: [
      "Keloobe SK 47 Smartwatch",
      "Tactical Black Ocean Silicone Band",
      "Magnetic USB Charging Cable",
      "Quick Start Manual"
    ],
    image: "/gadget/products/smartwatch-keloobe-sk47.png"
  },
  {
    name: "A 58 Plus Smartwatch Luxury Gift Set",
    slug: "a-58-plus-smartwatch",
    brand: "A58 Luxury",
    sku: "VG-SW-A58P",
    category: "smartwatch",
    price: 5499,
    compareAtPrice: 7999,
    rating: 4.8,
    reviewCount: 42,
    featured: true,
    badge: "Gift Set",
    stockStatus: "in-stock",
    shortDescription: "Exclusive 7-in-1 luxury gift set featuring the A 58 Plus HD smartwatch, matching analog accent watch, designer bracelet, and interchangeable premium straps.",
    features: [
      "2.01-inch HD Curved Edge Touchscreen with custom watch faces",
      "All-in-one Luxury Gift Combo with matching accessories and extra straps",
      "Crystal clear Bluetooth calling & smart notification sync",
      "Health monitoring: Heart rate, blood pressure, and sleep analysis",
      "Magnetic quick charging with long-life battery optimization",
      "Stainless steel & gold-accented build with IP67 protection"
    ],
    specifications: [
      { label: "Screen", value: "2.01-inch HD Infinite Display" },
      { label: "Package", value: "7-in-1 Luxury Combo Set" },
      { label: "Charging", value: "Wireless Magnetic Base" },
      { label: "Connectivity", value: "Bluetooth 5.0" },
      { label: "Health", value: "Pulse, HR, BP, Sleep Monitor" }
    ],
    compatibility: ["Android 5.0+", "iOS 9.0+"],
    inTheBox: [
      "A 58 Plus HD Smartwatch",
      "Matching Analog Quartz Watch",
      "Designer Jewelry Bracelet",
      "Interchangeable Leather & Silicone Straps",
      "Magnetic Charging Dock"
    ],
    image: "/gadget/products/smartwatch-a58-plus.png"
  },
  {
    name: "Smart Watch Ultra [Samsung Style]",
    slug: "smart-watch-ultra-samsung",
    brand: "VoltGear Ultra",
    sku: "VG-SW-ULTRA-S",
    category: "smartwatch",
    price: 24999,
    compareAtPrice: 32999,
    rating: 4.9,
    reviewCount: 56,
    featured: true,
    badge: "Ultra Flagship",
    stockStatus: "in-stock",
    shortDescription: "Titanium Grade 4 multi-sport smartwatch with 1.5-inch Super AMOLED 2,000-nit display, dual-frequency GPS, and up to 100 hours power saving battery.",
    features: [
      "Grade 4 Titanium cushion case with sapphire crystal glass",
      "1.5-inch Super AMOLED Display with 2,000 nits peak brightness",
      "Dual-frequency L1+L5 GPS tracking for precise altitude and navigation",
      "10 ATM water resistance + IP68 dust proofing for extreme sports",
      "BioActive multi-sensor array: ECG, BIA body composition, SpO2 & HR",
      "Up to 100 hours battery life in power saver mode"
    ],
    specifications: [
      { label: "Display", value: "1.5-inch Super AMOLED (480x480)" },
      { label: "Body Material", value: "Grade 4 Titanium & Sapphire Glass" },
      { label: "Water Rating", value: "10 ATM / 100m Submersible" },
      { label: "Sensors", value: "BioActive Sensor (ECG, BIA, HR), Barometer" },
      { label: "Battery", value: "590mAh with Super Fast Magnetic Charge" }
    ],
    compatibility: ["Android 11.0+", "Wear OS Ecosystem"],
    inTheBox: [
      "Smart Watch Ultra [Samsung Style]",
      "Orange High-Performance Ocean Band",
      "Titanium Fast Wireless Charger",
      "Manual & Safety Guide"
    ],
    image: "/gadget/products/smartwatch-ultra-samsung.png"
  },
  {
    name: "Howear 5G HW 10 Smartwatch",
    slug: "howear-5g-hw-10-smartwatch",
    brand: "Howear",
    sku: "VG-SW-HW10",
    category: "smartwatch",
    price: 8999,
    compareAtPrice: 11999,
    rating: 4.5,
    reviewCount: 15,
    featured: false,
    badge: "5G Ready",
    stockStatus: "in-stock",
    shortDescription: "Next-gen 5G cellular smartwatch with stainless steel frame, metal link chain bracelet, high-speed cellular data, and full app ecosystem support.",
    features: [
      "Standalone 5G SIM slot for independent phone calls and internet browser",
      "Stainless steel casing with premium metal link bracelet",
      "1.6-inch HD IPS Full Touch Screen with smooth 60Hz scroll rate",
      "Built-in GPS, Wi-Fi hotspot, and multi-media app store",
      "All-day health tracking: Heart rate, blood oxygen, and sleep monitoring"
    ],
    specifications: [
      { label: "Connectivity", value: "5G/4G Nano SIM Slot, Wi-Fi, BT 5.1" },
      { label: "Display", value: "1.6-inch High Resolution IPS Touch" },
      { label: "Material", value: "Stainless Steel Alloy + Metal Mesh" },
      { label: "Storage", value: "2GB RAM + 16GB ROM" },
      { label: "Battery", value: "450mAh Lithium Ion" }
    ],
    compatibility: ["Android 6.0+", "iOS 10.0+"],
    inTheBox: [
      "Howear 5G HW 10 Smartwatch",
      "Silver Metal Link Bracelet",
      "SIM Ejector Pin & Charger",
      "User Manual"
    ],
    image: "/gadget/products/smartwatch-howear-5g-hw10.png"
  },
  {
    name: "Smart Watch Android M99",
    slug: "smart-watch-android-m99",
    brand: "M99 Android",
    sku: "VG-SW-M99",
    category: "smartwatch",
    price: 16999,
    compareAtPrice: 21999,
    rating: 4.8,
    reviewCount: 31,
    featured: true,
    badge: "190° Camera",
    stockStatus: "in-stock",
    shortDescription: "Wrist smartphone running full Android OS, equipped with a 190° rotating 8MP HD camera, 4GB RAM, 64GB storage, and 4G/5G SIM card support.",
    features: [
      "Unique 190° Rotating 8MP Camera for video calls, photos, and facial unlock",
      "Full Android OS: Run YouTube, WhatsApp, Social Apps & Games directly on wrist",
      "Large 2.4-inch HD Touch Display with crisp color accuracy",
      "4G/5G Cellular SIM slot + Wi-Fi & GPS navigation",
      "Massive 1200mAh battery powering all-day full smartphone usage"
    ],
    specifications: [
      { label: "Display", value: "2.4-inch HD Touch Screen (480x480)" },
      { label: "OS", value: "Android 10.0 OS" },
      { label: "Memory", value: "4GB RAM + 64GB Onboard Storage" },
      { label: "Camera", value: "8MP 190-degree Rotating Lens" },
      { label: "Battery", value: "1200mAh High Capacity" }
    ],
    compatibility: ["Standalone Android OS", "Syncs with Android & iOS"],
    inTheBox: [
      "Smart Watch Android M99",
      "Black Heavy-Duty Silicone Strap",
      "Magnetic Charging Cable",
      "SIM Slot Tool & Manual"
    ],
    image: "/gadget/products/smartwatch-android-m99.png"
  },
  {
    name: "Heatz HW 21 Smartwatch",
    slug: "heatz-hw-21-smartwatch",
    brand: "Heatz Premium",
    sku: "VG-SW-HW21",
    category: "smartwatch",
    price: 4499,
    compareAtPrice: 5999,
    rating: 4.6,
    reviewCount: 27,
    featured: false,
    badge: "AMOLED Dial",
    stockStatus: "in-stock",
    shortDescription: "Classic circular smartwatch featuring a rotating zinc alloy bezel, crisp AMOLED display, leather strap, and Wearfit Pro app connectivity.",
    features: [
      "1.43-inch Vivid AMOLED Circular Display with always-on clock options",
      "Functional rotating dial for quick menu navigation",
      "HD Bluetooth call management with clear speaker audio",
      "Comprehensive fitness tracking: Heart rate, blood oxygen, blood pressure",
      "Up to 7 days daily usage battery life with magnetic contact charger"
    ],
    specifications: [
      { label: "Display", value: "1.43-inch AMOLED Circular (466x466)" },
      { label: "Body", value: "Zinc Alloy + Leather Band" },
      { label: "Battery", value: "260mAh (5-7 Days Regular Use)" },
      { label: "Water Rating", value: "IP68 Water Resistant" },
      { label: "App", value: "WearFit Pro" }
    ],
    compatibility: ["Android 5.0+", "iOS 10.0+"],
    inTheBox: [
      "Heatz HW 21 Smartwatch",
      "Black Leather Strap",
      "Magnetic Charging Dock",
      "Warranty Card & Manual"
    ],
    image: "/gadget/products/smartwatch-heatz-hw21.png"
  },
  {
    name: "Howwear HW 17 Pro+ Smartwatch",
    slug: "howwear-hw-17-pro-plus-smartwatch",
    brand: "Howwear Pro",
    sku: "VG-SW-HW17PP",
    category: "smartwatch",
    price: 7999,
    compareAtPrice: 10999,
    rating: 4.7,
    reviewCount: 22,
    featured: false,
    badge: "Curved Display",
    stockStatus: "in-stock",
    shortDescription: "Borderlessly curved AMOLED smartwatch with space gray alloy body, ocean loop band, dynamic watch UI, and WearFit Pro smart engine.",
    features: [
      "1.53-inch Borderless Curved AMOLED Display with 360x360 resolution",
      "High-fidelity Bluetooth calling & messaging quick replies",
      "Full health monitoring suite: Heart rate, SpO2, sleep, and pressure index",
      "IP67 water and dust resistance for active lifestyles",
      "Advanced 300mAh battery providing up to 10 days standby time"
    ],
    specifications: [
      { label: "Display", value: "1.53-inch Curved AMOLED (360x360)" },
      { label: "Bluetooth", value: "Bluetooth 5.3" },
      { label: "Battery", value: "300mAh Magnetic Charging" },
      { label: "Casing", value: "Space Gray Metal Alloy" },
      { label: "App", value: "WearFit Pro" }
    ],
    compatibility: ["Android 5.0+", "iOS 9.0+"],
    inTheBox: [
      "Howwear HW 17 Pro+ Smartwatch",
      "Gray Ocean Loop Band",
      "Fast Magnetic Charger",
      "Instruction Manual"
    ],
    image: "/gadget/products/smartwatch-howwear-hw17-pro-plus.png"
  },
  {
    name: "Langsfit M 10 Pro Smartwatch",
    slug: "langsfit-m-10-pro-smartwatch",
    brand: "Langsfit",
    sku: "VG-SW-M10P",
    category: "smartwatch",
    price: 9499,
    compareAtPrice: 12999,
    rating: 4.8,
    reviewCount: 18,
    featured: true,
    badge: "Titanium Finish",
    stockStatus: "in-stock",
    shortDescription: "Brushed titanium finish smartwatch with dual navigation crowns, ultra-responsive AMOLED display, and professional sports telemetry.",
    features: [
      "Brushed titanium casing with dual tactile crown controllers",
      "Vivid AMOLED Display with vivid color contrast and fast refresh rate",
      "Built-in microphone & speaker for crystal clear Bluetooth calls",
      "Advanced cardiovascular tracking: 24/7 Heart rate, SpO2, and ECG monitor",
      "Multi-day battery longevity with rapid magnetic charging base"
    ],
    specifications: [
      { label: "Display", value: "1.45-inch Ultra AMOLED (454x454)" },
      { label: "Bezel", value: "Brushed Titanium Alloy" },
      { label: "Sensors", value: "Continuous HR, SpO2, Sleep, Pedometer" },
      { label: "Battery", value: "320mAh Polymer Lithium" },
      { label: "Water Resistance", value: "IP68 Rated" }
    ],
    compatibility: ["Android 6.0+", "iOS 10.0+"],
    inTheBox: [
      "Langsfit M 10 Pro Smartwatch",
      "Black Sport Strap",
      "Magnetic Charging Base",
      "User Manual"
    ],
    image: "/gadget/products/smartwatch-langsfit-m10-pro.png"
  },
  {
    name: "Langsfit L500 Pro Smartwatch",
    slug: "langsfit-l500-pro-smartwatch",
    brand: "Langsfit",
    sku: "VG-SW-L500P",
    category: "smartwatch",
    price: 8499,
    compareAtPrice: 11499,
    rating: 4.7,
    reviewCount: 16,
    featured: false,
    badge: "Mesh Edition",
    stockStatus: "in-stock",
    shortDescription: "Sleek metallic smartwatch accompanied by a magnetic mesh band, high-contrast curved OLED display, and comprehensive health monitoring.",
    features: [
      "High-contrast curved OLED display with customizable watch face library",
      "Magnetic stainless steel mesh strap with quick adjustment lock",
      "HD Bluetooth voice calling and instant app notifications",
      "Continuous health tracking: Heart rate, blood oxygen, and sleep stages",
      "Energy-efficient chipset delivering up to 7 days active usage"
    ],
    specifications: [
      { label: "Display", value: "1.4-inch Curved OLED Display" },
      { label: "Strap", value: "Magnetic Stainless Steel Mesh" },
      { label: "Battery", value: "280mAh (up to 7 days usage)" },
      { label: "Connectivity", value: "Bluetooth 5.1" },
      { label: "Water Rating", value: "IP67 Water & Dust Resistant" }
    ],
    compatibility: ["Android 5.0+", "iOS 9.0+"],
    inTheBox: [
      "Langsfit L500 Pro Smartwatch",
      "Black Magnetic Mesh Band",
      "Magnetic USB Charger",
      "Manual"
    ],
    image: "/gadget/products/smartwatch-langsfit-l500-pro.png"
  }
];

async function seed() {
  console.log(`Starting insertion of ${SMARTWATCHES_DATA.length} smartwatch products into Supabase...`);

  for (const prod of SMARTWATCHES_DATA) {
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

    // Clear existing images for this product and insert new local image path
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

  console.log("Seeding process completed!");
}

seed().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
