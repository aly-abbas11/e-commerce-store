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

export const CHARGERS_DATA = [
  {
    name: "iPhone 20W Original Power Adapter (Lifetime Warranty)",
    slug: "iphone-20w-original-lifetime-warranty-adapter",
    brand: "Apple Original",
    sku: "VG-CH-IP20W-LTD",
    category: "charger",
    price: 6499,
    compareAtPrice: 8499,
    rating: 4.9,
    reviewCount: 68,
    featured: true,
    badge: "Lifetime Warranty",
    stockStatus: "in-stock",
    shortDescription: "100% Genuine Apple 20W USB-C Power Adapter backed by VoltGear Lifetime Replacement Warranty. Delivers fast 50% charging in 30 minutes for iPhone 12 through 16 series.",
    features: [
      "100% Guaranteed Genuine Apple hardware components with verified serial number",
      "Backed by VoltGear Lifetime Guarantee against manufacturing defect & battery drain",
      "USB Power Delivery 3.0 protocol charges iPhone 15/16 from 0 to 50% in 30 mins",
      "Integrated smart chip prevents overheating, overcurrent, and voltage spikes",
      "Flame-retardant polycarbonate housing with precision metal contacts"
    ],
    specifications: [
      { label: "Power Output", value: "20W Max (5V/3A, 9V/2.22A)" },
      { label: "Port Type", value: "USB-C Port" },
      { label: "Warranty", value: "Lifetime Replacement Guarantee" },
      { label: "Fast Charging Standard", value: "USB Power Delivery (PD 3.0)" }
    ],
    compatibility: ["iPhone 12 to 16 Pro Max", "iPad Air / Mini / Pro", "AirPods Pro Case"],
    inTheBox: [
      "iPhone 20W Original USB-C Power Adapter",
      "Warranty Registration Certificate",
      "Safety Instructions"
    ],
    image: "/gadget/products/adapter-iphone-original-20w.webp"
  },
  {
    name: "iPhone 20W A+ Grade Fast USB-C Power Adapter",
    slug: "iphone-20w-aplus-grade-adapter",
    brand: "VoltGear Power",
    sku: "VG-CH-IP20W-APLUS",
    category: "charger",
    price: 2499,
    compareAtPrice: 3499,
    rating: 4.7,
    reviewCount: 51,
    featured: false,
    badge: "A+ High Grade",
    stockStatus: "in-stock",
    shortDescription: "High grade A+ 20W USB-C fast charging adapter providing rapid Power Delivery speed for all iPhones at an accessible budget price.",
    features: [
      "A+ grade precision-built circuitry matching original speed output",
      "20W USB Power Delivery for rapid iPhone battery charging",
      "Compact travel-friendly wall block enclosure",
      "Multi-protect safety system guards against short circuits",
      "High thermal dissipation casing stays cool under heavy load"
    ],
    specifications: [
      { label: "Power Output", value: "20W (9V 2.22A / 5V 3A)" },
      { label: "Build Grade", value: "A+ Premium Replica Circuitry" },
      { label: "Output Connector", value: "USB-C Female" }
    ],
    compatibility: ["iPhone 8 through 16 Pro Max", "iPad Mini", "Wireless Charging Pads"],
    inTheBox: [
      "iPhone 20W A+ Fast Power Adapter",
      "User Manual"
    ],
    image: "/gadget/products/adapter-iphone-aplus-20w.webp"
  },
  {
    name: "Google Pixel A+ Grade 30W USB-C Charger",
    slug: "google-pixel-30w-aplus-charger",
    brand: "VoltGear Power",
    sku: "VG-CH-GGL30W-APLUS",
    category: "charger",
    price: 3499,
    compareAtPrice: 4799,
    rating: 4.7,
    reviewCount: 39,
    featured: false,
    badge: "30W PPS Fast",
    stockStatus: "in-stock",
    shortDescription: "A+ grade 30W USB-C fast wall charger engineered with Programmable Power Supply (PPS) protocol for high speed charging of Google Pixel 6, 7, 8, and 9 series.",
    features: [
      "30W USB-C PPS fast charging protocol optimized for Google Pixel phones",
      "Charges Google Pixel 8 Pro up to 50% in under 30 minutes",
      "A+ high performance internal circuit board with over-voltage safety IC",
      "Universal support for USB Power Delivery (PD 3.0)",
      "Minimalist sleek white finish"
    ],
    specifications: [
      { label: "Max Wattage", value: "30W Max Output" },
      { label: "Protocol", value: "USB PD 3.0 & PPS Dynamic Voltage" },
      { label: "Port", value: "USB-C Port" }
    ],
    compatibility: ["Google Pixel 6/7/8/9 Pro & Fold", "Pixel Tablet", "Chromebooks"],
    inTheBox: [
      "Google Pixel 30W A+ Power Adapter",
      "Instruction Manual"
    ],
    image: "/gadget/products/adapter-google-30w-aplus.webp"
  },
  {
    name: "Google Original 30W USB-C Power Adapter",
    slug: "google-pixel-30w-original-charger",
    brand: "Google Original",
    sku: "VG-CH-GGL30W-ORG",
    category: "charger",
    price: 5999,
    compareAtPrice: 7999,
    rating: 4.9,
    reviewCount: 43,
    featured: true,
    badge: "Google Genuine",
    stockStatus: "in-stock",
    shortDescription: "Authentic Google 30W USB-C Power Adapter engineered specifically for Pixel phones, Pixel Tablet, and USB-C devices with peak PPS efficiency.",
    features: [
      "Official 100% Authentic Google manufactured 30W USB-C fast charger",
      "Dynamic PPS adaptive voltage control for maximum Pixel battery health",
      "Compact matte white casing crafted with 50% post-consumer recycled plastic",
      "Advanced thermal protection and auto-shutoff safety controls",
      "Supports fast charging for Pixel 6 through 9 Pro Fold"
    ],
    specifications: [
      { label: "Output Power", value: "30W (5V/3A, 9V/3A, 15V/2A, 20V/1.5A)" },
      { label: "PPS Voltage", value: "3.3V-11V/3A, 3.3V-16V/2A" },
      { label: "Material", value: "50% Recycled PC Polycarbonate" }
    ],
    compatibility: ["Google Pixel 6, 6a, 7, 7 Pro, 8, 8 Pro, 9 Pro", "Pixel Buds Pro"],
    inTheBox: [
      "Google Original 30W USB-C Power Adapter",
      "Official Google Product Documentation"
    ],
    image: "/gadget/products/adapter-google-30w-original.webp"
  },
  {
    name: "Samsung Original 25W Super Fast Wall Charger (EP-TA800)",
    slug: "samsung-25w-original-fast-charger",
    brand: "Samsung Original",
    sku: "VG-CH-SAM25W-TA800",
    category: "charger",
    price: 2899,
    compareAtPrice: 3999,
    rating: 4.9,
    reviewCount: 82,
    featured: true,
    badge: "Official EP-TA800",
    stockStatus: "in-stock",
    shortDescription: "Official Samsung 25W Super Fast Charging wall adapter (EP-TA800) featuring USB Type-C Power Delivery 3.0 PPS for Galaxy S20 to S24 series and A-series.",
    features: [
      "Official Samsung Model EP-TA800 25W Super Fast Wall Adapter",
      "Super Fast Charging (SFC) protocol powered by USB-C PD 3.0 PPS",
      "Charges Galaxy S23/S24 to 65% in just 30 minutes",
      "Zero standby power mode saves energy when unplugged",
      "Built-in protection against overcurrent, short circuit, and high temperatures"
    ],
    specifications: [
      { label: "Model Number", value: "EP-TA800" },
      { label: "Max Wattage", value: "25W (PDO: 9V/2.77A, PPS: 3.3-11.0V/2.25A)" },
      { label: "Charging Speed", value: "Super Fast Charge 1.0" }
    ],
    compatibility: ["Samsung Galaxy S20/S21/S22/S23/S24", "Galaxy Z Flip/Fold", "Galaxy A-Series"],
    inTheBox: [
      "Samsung 25W Original EP-TA800 Power Adapter",
      "Quick Start Guide"
    ],
    image: "/gadget/products/adapter-samsung-25w-original.webp"
  },
  {
    name: "Samsung A+ Grade 25W Fast Wall Charger",
    slug: "samsung-25w-aplus-fast-charger",
    brand: "VoltGear Power",
    sku: "VG-CH-SAM25W-APLUS",
    category: "charger",
    price: 1499,
    compareAtPrice: 2299,
    rating: 4.6,
    reviewCount: 48,
    featured: false,
    badge: "A+ Super Fast",
    stockStatus: "in-stock",
    shortDescription: "A+ grade 25W Super Fast Charging wall adapter built for Samsung Galaxy devices, providing rapid charging performance at a budget price.",
    features: [
      "25W Super Fast Charge output matching original EP-TA800 speed",
      "Type-C PD 3.0 PPS technology compatibility",
      "High grade copper transformers preventing voltage drops",
      "Compact matte black/white body style",
      "Universal USB-C device charging"
    ],
    specifications: [
      { label: "Power Output", value: "25W Super Fast Charging" },
      { label: "Interface", value: "USB Type-C Female Port" },
      { label: "Build Grade", value: "A+ High Spec Circuit" }
    ],
    compatibility: ["All Samsung Galaxy Smartphones", "Xiaomi & Redmi Phones"],
    inTheBox: [
      "Samsung 25W A+ Fast Wall Adapter",
      "User Manual"
    ],
    image: "/gadget/products/adapter-samsung-25w-aplus.webp"
  },
  {
    name: "Romoss 45W Dual Port Fast Wall Charger",
    slug: "romoss-45w-dual-port-fast-charger",
    brand: "Romoss",
    sku: "VG-CH-RMS45W",
    category: "charger",
    price: 3999,
    compareAtPrice: 5499,
    rating: 4.8,
    reviewCount: 36,
    featured: true,
    badge: "45W Dual Port",
    stockStatus: "in-stock",
    shortDescription: "Powerful 45W dual-port (USB-C + USB-A) fast wall charger with GaN technology, capable of fast charging laptops, MacBooks, iPhones, and Android devices simultaneously.",
    features: [
      "45W maximum total power output supporting GaN fast charging",
      "Dual port layout: 1x 45W USB-C PD 3.0 + 1x 18W USB-A QC 3.0",
      "Charges MacBook Air / iPad Pro at full speed from a compact wall adapter",
      "Intelligent power allocation dynamically splits wattage when charging 2 devices",
      "Foldable plug design perfect for business trips and daily carry"
    ],
    specifications: [
      { label: "Total Power", value: "45W Max (GaN Fast Tech)" },
      { label: "Ports", value: "1x USB-C PD 45W + 1x USB-A QC 18W" },
      { label: "Protection", value: "10-Layer Smart Security Shield" }
    ],
    compatibility: ["MacBook Air M1/M2/M3", "iPhones & Samsung", "Laptops & Tablets"],
    inTheBox: [
      "Romoss 45W Dual Port Fast Wall Charger",
      "User Guide"
    ],
    image: "/gadget/products/adapter-romoss-45w.webp"
  },
  {
    name: "Samsung Galaxy Watch Wireless Magnetic Charger Dock",
    slug: "samsung-galaxy-watch-wireless-charger",
    brand: "VoltGear Power",
    sku: "VG-CH-SGW-MAG",
    category: "charger",
    price: 2499,
    compareAtPrice: 3499,
    rating: 4.8,
    reviewCount: 29,
    featured: false,
    badge: "Strong Magnet",
    stockStatus: "in-stock",
    shortDescription: "Magnetic wireless charging puck dock cable designed specifically for Samsung Galaxy Watch 3, 4, 5, 6, and Ultra series with USB-C input.",
    features: [
      "Strong magnetic alignment holds Galaxy Watch securely on the charging pad",
      "USB Type-C connector plug compatible with fast wall adapters",
      "Built-in smart chip prevents overheating and overcharging",
      "Flexible 1-meter durable braided cable cord",
      "Sleek aluminum base disc structure"
    ],
    specifications: [
      { label: "Charging Type", value: "Magnetic Wireless Inductive Puck" },
      { label: "Cable Length", value: "1.0 Meter" },
      { label: "Connector", value: "USB-C Plug" }
    ],
    compatibility: ["Samsung Galaxy Watch 3/4/5/6/7 & Watch Ultra", "Galaxy Watch Active 1/2"],
    inTheBox: [
      "Samsung Galaxy Watch Magnetic Charger Puck Cable",
      "User Manual"
    ],
    image: "/gadget/products/charger-samsung-watch.webp"
  },
  {
    name: "Apple Watch Type-C Plastic Magnetic Fast Charger Dongle",
    slug: "apple-watch-type-c-magnetic-charger",
    brand: "VoltGear Power",
    sku: "VG-CH-APW-TC",
    category: "charger",
    price: 1999,
    compareAtPrice: 2799,
    rating: 4.7,
    reviewCount: 31,
    featured: false,
    badge: "Magnetic Fast",
    stockStatus: "in-stock",
    shortDescription: "Compact Type-C plastic magnetic fast charging pad cable for Apple Watch Series 4 through 10, SE, and Apple Watch Ultra.",
    features: [
      "Supports fast magnetic charging module for Apple Watch Series 7/8/9/10 & Ultra",
      "Direct Type-C plug interface plugs into power banks, MacBooks, and wall blocks",
      "Durable lightweight plastic housing shell",
      "Strong N52 neodymium magnetic suction snap lock",
      "Over-temperature safety protection IC"
    ],
    specifications: [
      { label: "Interface", value: "USB-C Male Connector" },
      { label: "Charger Type", value: "Apple Watch Magnetic Fast Charger Module" },
      { label: "Material", value: "Flame-Retardant ABS Plastic" }
    ],
    compatibility: ["Apple Watch Series 4/5/6/7/8/9/10", "Apple Watch SE", "Apple Watch Ultra 1/2"],
    inTheBox: [
      "Apple Watch Type-C Magnetic Charging Cable",
      "User Guide"
    ],
    image: "/gadget/products/charger-apple-watch-tc.webp"
  },
  {
    name: "C6 4-in-1 Retractable Cable Car Charger Adapter",
    slug: "c6-4in1-retractable-car-charger",
    brand: "C6 Auto",
    sku: "VG-CH-C6CAR4IN1",
    category: "charger",
    price: 2299,
    compareAtPrice: 3299,
    rating: 4.8,
    reviewCount: 44,
    featured: true,
    badge: "4-in-1 Retractable",
    stockStatus: "in-stock",
    shortDescription: "Multi-functional 4-in-1 car cigarette lighter charger featuring 2 built-in 80cm retractable cables (Type-C & Lightning) plus dual extra USB ports.",
    features: [
      "2 built-in retractable cables (Type-C + Lightning) extend up to 80cm and recoil smoothly",
      "Additional 1x USB-C port + 1x USB-A port to charge 4 devices at once",
      "180-degree adjustable swivel head fits any vehicle cigarette lighter socket",
      "Real-time digital LED car battery voltage monitor display",
      "Supported 66W Super Fast Charging protocol"
    ],
    specifications: [
      { label: "Retractable Cable Length", value: "80 cm Dual Cables (Type-C + Lightning)" },
      { label: "Total Outputs", value: "4 Devices Simultaneous (2 Cables + 2 Ports)" },
      { label: "Input Voltage", value: "DC 12V - 24V Vehicles" },
      { label: "Max Wattage", value: "66W Peak Fast Output" }
    ],
    compatibility: ["Cars, SUVs & Trucks (12V-24V)", "iPhones, Samsung, Type-C Devices"],
    inTheBox: [
      "C6 4-in-1 Retractable Car Charger Adapter",
      "User Manual"
    ],
    image: "/gadget/products/charger-c6-car-4in1.webp"
  }
];

async function seed() {
  console.log(`Starting insertion of ${CHARGERS_DATA.length} charger products into Supabase...`);

  for (const prod of CHARGERS_DATA) {
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

  console.log("Chargers seeding process completed!");
}

seed().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
