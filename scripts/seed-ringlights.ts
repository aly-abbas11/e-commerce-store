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

export const RINGLIGHTS_DATA = [
  {
    name: "RGB LED 36 Ring Light (36cm / 14-inch)",
    slug: "rgb-led-36-ring-light",
    brand: "RGB Studio",
    sku: "VG-RL-RGB36",
    category: "ring-light",
    price: 3299,
    compareAtPrice: 4499,
    rating: 4.8,
    reviewCount: 37,
    featured: true,
    badge: "14-Inch RGB",
    stockStatus: "in-stock",
    shortDescription: "14-inch (36cm) RGB multi-color LED ring light with 16 dynamic color modes, 3200K-5600K dimmable bi-color control, smartphone holder, and wireless remote.",
    features: [
      "36cm / 14-inch diameter ring light with high CRI 95+ LED beads",
      "16 RGB color modes + 3 standard white/warm light temperature modes",
      "Wireless remote control for brightness and color transition effects",
      "360-degree rotating phone clamp mount included",
      "USB-powered continuous studio illumination"
    ],
    specifications: [
      { label: "Diameter", value: "36 cm / 14 inches" },
      { label: "Color Temp", value: "3200K - 5600K + Full RGB spectrum" },
      { label: "Dimming", value: "1% - 100% Stepless Dimmer" },
      { label: "Power Source", value: "5V USB / DC Adapter" },
      { label: "CRI", value: "Ra > 95" }
    ],
    compatibility: ["All Smartphones (iPhone/Android)", "2.1m Light Tripods"],
    inTheBox: [
      "RGB LED 36 Ring Light Ring",
      "Flexible Smartphone Clamp",
      "Wireless IR Remote Control",
      "USB Power Cable & Ball Head Adapter"
    ],
    image: "/gadget/products/ringlight-rgb-led-36.webp"
  },
  {
    name: "RGB LED 33 Ring Light (33cm / 13-inch)",
    slug: "rgb-led-33-ring-light",
    brand: "RGB Studio",
    sku: "VG-RL-RGB33",
    category: "ring-light",
    price: 2899,
    compareAtPrice: 3999,
    rating: 4.7,
    reviewCount: 29,
    featured: false,
    badge: "Blogger Kit",
    stockStatus: "in-stock",
    shortDescription: "13-inch (33cm) versatile RGB softlight ring light featuring rainbow lighting effects, inline controller, phone holder, and soft shadow diffusion filter.",
    features: [
      "33cm / 13-inch ring light for streaming, makeup, and vlogging",
      "10 brightness levels per color mode (Rainbow, Strobing, Static RGB)",
      "Included 360-degree swiveling ball head mount",
      "Universal USB plug compatible with power banks and wall adapters",
      "High color rendering index for natural skin tone rendering"
    ],
    specifications: [
      { label: "Diameter", value: "33 cm / 13 inches" },
      { label: "Lighting Modes", value: "3 Warm/White + 12 RGB Effects" },
      { label: "Power", value: "15W USB Powered" }
    ],
    compatibility: ["Smartphones", "Compact Cameras", "Light Stands"],
    inTheBox: [
      "RGB LED 33 Ring Light",
      "Phone Mount",
      "Inline USB Controller",
      "User Manual"
    ],
    image: "/gadget/products/ringlight-rgb-led-33.webp"
  },
  {
    name: "RGB LED 3D-56 Giant Studio Ring Light (56cm / 22-inch)",
    slug: "rgb-led-3d-56-ring-light",
    brand: "Studio Master",
    sku: "VG-RL-3D56",
    category: "ring-light",
    price: 11499,
    compareAtPrice: 15499,
    rating: 4.9,
    reviewCount: 54,
    featured: true,
    badge: "22-Inch Giant",
    stockStatus: "in-stock",
    shortDescription: "Professional 22-inch (56cm) giant 3D studio ring light with 3 phone mounts, 80W power, 3D soft light diffuser, RGB color FX, and remote control.",
    features: [
      "Massive 56cm / 22-inch ring diameter providing shadowless studio fill",
      "80W high output power with 3D frosted softlight diffuser casing",
      "Supports 3 phone clamps simultaneously for multi-platform broadcasting",
      "Wireless remote control + rear rotary dial control knobs",
      "Dual USB output ports on back to charge phones while live streaming"
    ],
    specifications: [
      { label: "Diameter", value: "56 cm / 22 inches" },
      { label: "Power Output", value: "80W AC 110V-240V" },
      { label: "Color Temp", value: "2700K - 6500K + Full RGB FX" },
      { label: "Phone Clamps", value: "3 Flexible Gooseneck Mounts Included" },
      { label: "Charging Ports", value: "2x USB 5V/2A Output Ports" }
    ],
    compatibility: ["Multi-Phone Live Streamers", "Professional Studios", "Salons & Makeup Artists"],
    inTheBox: [
      "RGB LED 3D-56 22-Inch Ring Light",
      "3x Flexible Gooseneck Phone Holders",
      "Wireless Remote Control",
      "AC Power Cord & Heavy Ball Head"
    ],
    image: "/gadget/products/ringlight-rgb-led-3d-56.webp"
  },
  {
    name: "Plokama Live P24 Pro Studio LED Panel Light",
    slug: "plokama-live-p24-pro-ring-light",
    brand: "Plokama Pro",
    sku: "VG-RL-P24P",
    category: "ring-light",
    price: 8999,
    compareAtPrice: 11999,
    rating: 4.9,
    reviewCount: 43,
    featured: true,
    badge: "24-Inch Panel",
    stockStatus: "in-stock",
    shortDescription: "Broadcast-grade 24-inch flat panel studio light delivering Ra95+ color fidelity, 60W power, stepless bi-color 2900K-6500K dimming, and remote control.",
    features: [
      "Ultra-wide 24-inch flat panel light design for soft directional studio fill",
      "60W high illumination power with ultra-high CRI Ra95+ color accuracy",
      "Stepless color temperature adjustment from warm 2900K to cool 6500K",
      "Long-range wireless remote control for instant scene adjustments",
      "Heavy-duty angle-adjustment tilt bracket for overhead product shots"
    ],
    specifications: [
      { label: "Panel Size", value: "24 inches (Flat Soft Panel)" },
      { label: "Power", value: "60W AC Powered" },
      { label: "Color Rendering Index", value: "CRI Ra > 95" },
      { label: "Color Temp", value: "2900K - 6500K Stepless" }
    ],
    compatibility: ["YouTube / TikTok Studios", "Product Photography", "Podcast Setups"],
    inTheBox: [
      "Plokama Live P24 Pro 24-Inch LED Panel",
      "Wireless Remote Control",
      "Heavy Angle Adjustment Bracket",
      "Power Adapter Cable"
    ],
    image: "/gadget/products/ringlight-plokama-p24-pro.webp"
  },
  {
    name: "FW 261 Softlight Studio Ring Light (26cm / 10-inch)",
    slug: "fw-261-ring-light",
    brand: "FW Lighting",
    sku: "VG-RL-FW261",
    category: "ring-light",
    price: 2499,
    compareAtPrice: 3499,
    rating: 4.6,
    reviewCount: 25,
    featured: false,
    badge: "Essential 10-Inch",
    stockStatus: "in-stock",
    shortDescription: "Compact 10-inch (26cm) bi-color softlight ring light with 3 color temperatures, inline control switch, and 360-degree phone holder mount.",
    features: [
      "26cm / 10-inch ring light optimal for desktop setups and video calls",
      "3 color modes (White, Warm White, Warm Yellow) with 10 dimming steps",
      "Anti-glare frosted diffuser cover for eye comfort during long calls",
      "Universal USB connector suitable for PC, power bank, or USB plug",
      "Includes 360-degree rotatable smartphone mount"
    ],
    specifications: [
      { label: "Diameter", value: "26 cm / 10 inches" },
      { label: "Color Temp", value: "3000K - 6000K" },
      { label: "Power", value: "12W USB Powered" }
    ],
    compatibility: ["Zoom / Teams Calls", "Desktop Vlogging", "Smartphones"],
    inTheBox: [
      "FW 261 10-Inch Ring Light",
      "Flexible Phone Mount",
      "Inline Cable Controller",
      "Ball Joint Adapter"
    ],
    image: "/gadget/products/ringlight-fw-261.webp"
  },
  {
    name: "MJ 171 Rainbow RGB Studio Ring Light (45cm / 17-inch)",
    slug: "mj-171-ring-light",
    brand: "MJ Studio",
    sku: "VG-RL-MJ171",
    category: "ring-light",
    price: 3699,
    compareAtPrice: 4999,
    rating: 4.7,
    reviewCount: 31,
    featured: false,
    badge: "Rainbow RGB",
    stockStatus: "in-stock",
    shortDescription: "17-inch (45cm) full spectrum RGB ring light with multi-color dynamic rainbow modes, dimmable white light, and phone holder bracket.",
    features: [
      "17-inch (45cm) RGB color spectrum ring light for creative video effects",
      "Over 18 dynamic animated lighting patterns (pulsing, cycling, flash)",
      "High-brightness bi-color LEDs for standard beauty & portrait shots",
      "Adjustable phone clamp with 360-degree positioning",
      "Intuitive remote & rear touch panel control"
    ],
    specifications: [
      { label: "Diameter", value: "45 cm / 17 inches" },
      { label: "Lighting", value: "Bi-Color + 18 Dynamic RGB FX" },
      { label: "Power", value: "35W AC/USB Powered" }
    ],
    compatibility: ["Content Creators", "Twitch Streamers", "Smartphones"],
    inTheBox: [
      "MJ 171 17-Inch RGB Ring Light",
      "Smart Phone Holder",
      "Wireless Remote",
      "Power Cable"
    ],
    image: "/gadget/products/ringlight-mj-171.webp"
  },
  {
    name: "FW 171 Professional Studio Ring Light (45cm / 17-inch)",
    slug: "fw-171-ring-light",
    brand: "FW Lighting",
    sku: "VG-RL-FW171",
    category: "ring-light",
    price: 3999,
    compareAtPrice: 5499,
    rating: 4.8,
    reviewCount: 28,
    featured: false,
    badge: "17-Inch Pro",
    stockStatus: "in-stock",
    shortDescription: "Professional 17-inch (45cm) bi-color studio ring light with stepless 3200K-5600K temperature dials, dual phone mounts, and high-lumen output.",
    features: [
      "45cm / 17-inch high-output ring light with ultra-soft light distribution",
      "Dual stepless rotary dials for independent color temperature & brightness",
      "CRI > 92 ensuring accurate skin tone reproduction",
      "Dual phone mounting slots for multi-angle shooting",
      "Includes wireless remote control & padded travel carry bag"
    ],
    specifications: [
      { label: "Diameter", value: "45 cm / 17 inches" },
      { label: "Color Temp", value: "3200K - 5600K Stepless" },
      { label: "Power", value: "48W AC Powered" }
    ],
    compatibility: ["Professional Photography", "Makeup Artists", "Salons"],
    inTheBox: [
      "FW 171 17-Inch Ring Light",
      "2x Phone Clamp Mounts",
      "Wireless Remote",
      "AC Power Supply"
    ],
    image: "/gadget/products/ringlight-fw-171.webp"
  },
  {
    name: "MJ 261 RGB Multi-Color Ring Light (26cm / 10-inch)",
    slug: "mj-261-ring-light",
    brand: "MJ Studio",
    sku: "VG-RL-MJ261",
    category: "ring-light",
    price: 2799,
    compareAtPrice: 3799,
    rating: 4.7,
    reviewCount: 36,
    featured: false,
    badge: "Popular 10-Inch",
    stockStatus: "in-stock",
    shortDescription: "Best-selling 10-inch (26cm) RGB ring light featuring 15 color animation modes, 3 standard white light tones, phone bracket, and USB power.",
    features: [
      "10-inch (26cm) compact RGB ring light with vibrant color presets",
      "15 dynamic RGB lighting modes (Chasing, Strobe, Fade, Solid Colors)",
      "Standard White, Neutral, and Warm Light modes with 10 brightness levels",
      "Flexible gooseneck phone clamp for vertical and horizontal video",
      "USB powered with convenient cable remote control"
    ],
    specifications: [
      { label: "Diameter", value: "26 cm / 10 inches" },
      { label: "Modes", value: "15 RGB Modes + 3 White Tones" },
      { label: "Power", value: "10W USB" }
    ],
    compatibility: ["TikTok Creators", "Video Calls", "Smartphones"],
    inTheBox: [
      "MJ 261 10-Inch RGB Ring Light",
      "Gooseneck Phone Holder",
      "USB Cable Controller",
      "Ball Head Mount"
    ],
    image: "/gadget/products/ringlight-mj-261.webp"
  },
  {
    name: "FW 321 Bi-Color Studio Ring Light (32cm / 12.6-inch)",
    slug: "fw-321-ring-light",
    brand: "FW Lighting",
    sku: "VG-RL-FW321",
    category: "ring-light",
    price: 3499,
    compareAtPrice: 4799,
    rating: 4.7,
    reviewCount: 22,
    featured: false,
    badge: "12.6-Inch Bi-Color",
    stockStatus: "in-stock",
    shortDescription: "Medium 12.6-inch (32cm) professional bi-color studio ring light with 3000K-6500K stepless dimming, touch panel, and wireless remote control.",
    features: [
      "32cm / 12.6-inch optimal studio size providing generous fill light",
      "Stepless bi-color temp control from 3000K warm to 6500K cool white",
      "Touch-sensitive rear adjustment buttons + wireless IR remote",
      "Central phone mount bracket with ball-head tilt",
      "Energy-efficient LED layout with low heat emission"
    ],
    specifications: [
      { label: "Diameter", value: "32 cm / 12.6 inches" },
      { label: "Power Output", value: "24W" },
      { label: "Color Temp", value: "3000K - 6500K" }
    ],
    compatibility: ["Vlogging", "Online Teaching", "Beauty Shots"],
    inTheBox: [
      "FW 321 12.6-Inch Ring Light",
      "Phone Mount Bracket",
      "Wireless Remote",
      "Power Adapter"
    ],
    image: "/gadget/products/ringlight-fw-321.webp"
  },
  {
    name: "RGB LED PM 60 Ultra Large Ring Light (60cm / 24-inch)",
    slug: "rgb-led-pm-60-ring-light",
    brand: "Studio Master",
    sku: "VG-RL-PM60",
    category: "ring-light",
    price: 14999,
    compareAtPrice: 19999,
    rating: 5.0,
    reviewCount: 48,
    featured: true,
    badge: "24-Inch Monster",
    stockStatus: "in-stock",
    shortDescription: "Ultra large 24-inch (60cm) master studio RGB ring light with 100W power output, 3 phone holders, wireless remote, and full color FX engine.",
    features: [
      "Monster 60cm / 24-inch ring light – maximum illumination coverage",
      "100W massive power output for high-end photography & videography",
      "Full spectrum RGB color engine with speed & saturation control",
      "3 Phone clamps + cold shoe mounts for microphone/accessories",
      "Dual LCD digital display on back panel for exact Kelvin & power reading"
    ],
    specifications: [
      { label: "Diameter", value: "60 cm / 24 inches" },
      { label: "Power", value: "100W AC 110-240V" },
      { label: "Display", value: "Dual Digital LCD Backlight Panel" },
      { label: "Mounts", value: "3x Phone Clamps + 2x Cold Shoe" }
    ],
    compatibility: ["Film & Video Studios", "Fashion Photography", "Professional Salons"],
    inTheBox: [
      "RGB LED PM 60 24-Inch Ring Light",
      "3x Phone Mounts",
      "Master Wireless Remote Control",
      "AC Power Cord & Heavy Bracket"
    ],
    image: "/gadget/products/ringlight-rgb-led-pm60.webp"
  },
  {
    name: "Plokama R P45 Pro Studio Ring Light (45cm / 18-inch)",
    slug: "plokama-r-p45-pro-ring-light",
    brand: "Plokama Pro",
    sku: "VG-RL-RP45P",
    category: "ring-light",
    price: 7999,
    compareAtPrice: 10999,
    rating: 4.9,
    reviewCount: 39,
    featured: true,
    badge: "18-Inch Pro Ring",
    stockStatus: "in-stock",
    shortDescription: "High-performance 18-inch (45cm) studio LED ring light with 65W power, stepless bi-color control, 3 phone holders, and wireless remote control.",
    features: [
      "45cm / 18-inch ring light built with premium optical diffuser shell",
      "65W high brightness LEDs delivering crisp 5500K daylight & warm light",
      "3 Gooseneck phone holders for recording multiple angles simultaneously",
      "Rear dual rotary knobs for instant brightness & tone adjustment",
      "Built-in USB power port to charge phones while recording"
    ],
    specifications: [
      { label: "Diameter", value: "45 cm / 18 inches" },
      { label: "Power", value: "65W AC Powered" },
      { label: "Color Temp", value: "3000K - 6500K Stepless" },
      { label: "USB Output", value: "5V / 2A Phone Charging Port" }
    ],
    compatibility: ["Content Creators", "Makeup Artists", "Live Commerce"],
    inTheBox: [
      "Plokama R P45 Pro 18-Inch Ring Light",
      "3x Gooseneck Phone Holders",
      "Wireless Remote",
      "AC Adapter Cable"
    ],
    image: "/gadget/products/ringlight-plokama-r-p45-pro.webp"
  },
  {
    name: "R 45 Studio Ring Light (45cm / 18-inch)",
    slug: "r-45-ring-light",
    brand: "R Series",
    sku: "VG-RL-R45",
    category: "ring-light",
    price: 6499,
    compareAtPrice: 8999,
    rating: 4.7,
    reviewCount: 26,
    featured: false,
    badge: "18-Inch Studio",
    stockStatus: "in-stock",
    shortDescription: "Classic 18-inch (45cm) studio ring light featuring 55W power, bi-color temperature control, wireless remote, and dual phone mount brackets.",
    features: [
      "45cm / 18-inch full size studio ring light",
      "55W dimmable LED arrangement producing soft shadowless lighting",
      "Bi-color temperature control (3200K warm white to 5600K cool white)",
      "Wireless remote control for convenient adjustments from distance",
      "Universal light stand mount bracket"
    ],
    specifications: [
      { label: "Diameter", value: "45 cm / 18 inches" },
      { label: "Power", value: "55W AC" },
      { label: "Color Temp", value: "3200K - 5600K" }
    ],
    compatibility: ["Vloggers", "Photographers", "Beauty Salons"],
    inTheBox: [
      "R 45 18-Inch Studio Ring Light",
      "Phone Holder Bracket",
      "Wireless Remote",
      "Power Cable"
    ],
    image: "/gadget/products/ringlight-r-45.webp"
  },
  {
    name: "Studio Heavy Duty 2.1m Adjustable Light Tripod Stand",
    slug: "studio-heavy-duty-2-1m-tripod-stand",
    brand: "Studio Master",
    sku: "VG-RL-ST21M",
    category: "ring-light",
    price: 1899,
    compareAtPrice: 2799,
    rating: 4.8,
    reviewCount: 45,
    featured: false,
    badge: "2.1 Meter Metal",
    stockStatus: "in-stock",
    shortDescription: "Heavy-duty 2.1-meter (7 feet) aluminum alloy studio light tripod stand with 1/4-inch screw mount, spring cushioning, and fold-flat portable design.",
    features: [
      "Extends from 70cm up to 210cm (2.1 meters / 7 feet) height",
      "Constructed from high-grade anodized aluminum alloy",
      "Universal 1/4-inch standard screw top for ring lights, softboxes & cameras",
      "Reinforced 3-leg base with non-slip rubber feet for maximum stability",
      "Quick flip-lock telescoping height adjustment clamps"
    ],
    specifications: [
      { label: "Max Height", value: "210 cm / 2.1 meters (7 Feet)" },
      { label: "Min Height", value: "70 cm (Folded)" },
      { label: "Payload Capacity", value: "Up to 5 kg" },
      { label: "Mounting Screw", value: "Universal 1/4-inch Thread" }
    ],
    compatibility: ["All Ring Lights", "Studio Panels", "Softboxes", "Cameras & DSLRs"],
    inTheBox: [
      "Heavy Duty 2.1m Light Tripod Stand",
      "Protective Thread Cap"
    ],
    image: "/gadget/products/ringlight-heavy-tripod-stand.webp"
  }
];

async function seed() {
  console.log(`Starting insertion of ${RINGLIGHTS_DATA.length} ring light products into Supabase...`);

  for (const prod of RINGLIGHTS_DATA) {
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

  console.log("Ring Lights seeding process completed!");
}

seed().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
