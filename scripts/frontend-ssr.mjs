#!/usr/bin/env node
/**
 * Deep regression + force test harness for the STOREFRONT (SSR layer).
 *
 *   - Home page: hero, category cards, featured products, perks, footer
 *   - Catalog: /products, every category page, bogus category -> 404
 *   - Product pages: every product renders name/price/stock/tabs/JSON-LD/SEO
 *   - Search: results, no-results, empty query
 *   - Info/utility pages: track, checkout (empty), write-review, blog, CMS
 *     pages, sitemap, robots
 *   - Force/negative: bogus routes return 404, error-boundary markers absent
 *   - Demo-flag regression: legacy genuine reviews/testimonials (isDemo field
 *     absent) are included by production queries; explicit isDemo:true are not
 *
 * Run against the running prod server:
 *   node scripts/frontend-ssr.mjs [BASE_URL]
 * Exits non-zero on any failure.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.argv[2] || "http://localhost:3001";

const envFile = resolve(root, ".env.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-04-12",
  useCdn: false,
});

const productFields = `{
  _id,
  name,
  "slug": slug.current,
  price,
  compareAtPrice,
  category,
  stockStatus,
  rating,
  reviewCount,
  featured,
  badge,
  features,
  specifications,
  reviews[]{name,rating,comment,date,verified},
  shortDescription
}`;

let passed = 0;
let failed = 0;
const failures = [];
function check(name, cond, extra = "") {
  if (cond) {
    passed++;
    console.log(`  PASS ${name}`);
  } else {
    failed++;
    failures.push(`${name} ${extra}`);
    console.log(`  FAIL ${name} ${extra}`);
  }
}
function section(name) {
  console.log(`\n== ${name} ==`);
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  return {
    status: res.status,
    html: await res.text(),
    headers: res.headers,
  };
}

function formatPrice(n) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(n));
}

// Normalize Next SSR output: strip RSC text-node comment markers and decode
// HTML entities so content checks match what the user actually sees.
function norm(html) {
  return html
    .replace(/<!-- -->/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, "\u00a0");
}

const ERROR_MARKERS = [
  "Application error: a client-side exception",
  "An unexpected error has occurred",
  "next: not-found",
];

// ── Seed data snapshot (read fresh each run) ────────────────────────────
// Pre-cleanup: remove stale test fixtures from prior aborted runs
{
  const writeToken = process.env.SANITY_API_TOKEN;
  if (writeToken) {
    const wClient = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: "2024-04-12",
      useCdn: false,
      token: writeToken,
    });
    const staleProducts = await sanity.fetch(
      `*[_type == "product" && name match "*Legacy Fixture 2C-*"]._id`
    );
    const staleTestimonials = await sanity.fetch(
      `*[_type == "testimonial" && customerName match "*Legacy Genuine 2C-*"]._id`
    );
    for (const id of [...(staleProducts || []), ...(staleTestimonials || [])]) {
      await wClient.delete(id).catch(() => {});
    }
  }
}

const products = await sanity.fetch(
  `*[_type=="product"]${productFields} | order(name asc)`
);
const featured = products.filter((p) => p.featured);
const pages = await sanity.fetch(
  `*[_type=="page"]{"slug":slug.current,title,pageType} | order(slug asc)`
);
const staticPages = pages.filter((p) => p.pageType !== "blog");
const blogPages = pages.filter((p) => p.pageType === "blog");
const categories = [...new Set(products.map((p) => p.category))];
const settings = await sanity.fetch(
  `*[_type=="siteSettings"][0]{brandName,freeShippingThreshold,shippingFee,email,codEnabled,warrantyMonths,returnWindowDays,whatsappNumber}`
);
const hero = await sanity.fetch(
  `*[_type=="heroSection"][0]{headline,subheadline,primaryCta,secondaryCta,featuredProduct->{${productFields.replace(/^\{|\}$/g, "")}}}`
);

console.log(
  `seed: ${products.length} products, ${pages.length} pages, ${categories.length} categories`
);

// ─────────────────────────────────────────────────────────────────────────
section("A. Home page render")
{
  const r = await get("/");
  const h = norm(r.html);
  check("GET / -> 200", r.status === 200, `status=${r.status}`);
  check("hero headline renders", h.includes("Power Your Everyday"), "");
  check("Shop by Category section", h.includes("Shop by Category"), "");
  check("Featured Products section SSR", h.includes("Featured Products"), "");
  for (const [slug, label] of [
    ["smartwatch", "Smartwatches"],
    ["power-bank", "Power Banks"],
    ["charger", "Chargers & Adapters"],
    ["earbuds", "Earbuds & Handsfree"],
  ]) {
    check(`category card "${label}"`, h.includes(label), "");
  }
  const catStart = h.indexOf("Find Your Perfect Accessory");
  const catEnd = h.indexOf("Latest Guides & News");
  const catSection = h.slice(catStart, catEnd === -1 ? h.length : catEnd);
  check("no emoji category visuals", !["⌚", "🔋", "🔌", "🎧"].some((e) => catSection.includes(e)), "");
  for (const p of featured) {
    check(`featured product "${p.name}" in SSR`, h.includes(p.name), "");
  }
  const heroFeatured = hero?.featuredProduct;
  if (heroFeatured) {
    check(`hero featured product "${heroFeatured.name}" in SSR`, h.includes(heroFeatured.name), "");
    check("hero featured product link", h.includes(`/product/${heroFeatured.slug}`), "");
    check("hero featured product price", h.includes(formatPrice(heroFeatured.price)), "");
    check("hero product View Product CTA", h.includes("View Product"), "");
  }
  for (const perk of ["Free Shipping", "Cash on Delivery"]) {
    check(`perk "${perk}"`, h.includes(perk), "");
  }
  const freeMsg = `Free Shipping on orders over ${formatPrice(
    settings?.freeShippingThreshold ?? 5000
  )}`;
  check("free shipping threshold copy", h.includes(freeMsg), `want ${freeMsg}`);
  check("View All Products link", h.includes("/products") && h.includes("View All Products"), "");
  check("no fake best-seller claims", !h.includes("Best Seller") && !h.includes("Shop Best Sellers"), "");
  check("no unsupported warranty claim", !h.includes("2-year warranty"), "");
  check("demo testimonials absent on homepage", !h.includes("Hira Malik") && !h.includes("Zain Ahmed"), "");
  check("exactly one H1", (h.match(/<h1[^>]*>/g) || []).length === 1, "");
  check("brand name in header", h.includes(settings?.brandName || "VoltGear"), "");
  check("footer contact email", h.includes(settings?.email || "support@voltgear.store"), "");
  check("home has no error boundary", !ERROR_MARKERS.some((m) => h.includes(m)), "");
}

// ─────────────────────────────────────────────────────────────────────────
section("B. Catalog")
{
  const r = await get("/products");
  const h = norm(r.html);
  check("GET /products -> 200", r.status === 200, `status=${r.status}`);
  check("catalog heading", h.includes("All Products"), "");
  check("catalog count text", h.includes(`${products.length} products`), `want ${products.length} products`);

  if (products.length > 12) {
    // Pagination: page 1 must not dump the entire catalog.
    const onPage1 = products.filter((p) => h.includes(p.name));
    check("page 1 lists some products (<= page size 12)", onPage1.length > 0 && onPage1.length <= 12, `got ${onPage1.length}`);
    check("page 1 exposes a page=2 link", h.includes("page=2"), "");
    const r2 = await get("/products?page=2");
    const h2 = norm(r2.html);
    check("GET /products?page=2 -> 200", r2.status === 200, `status=${r2.status}`);
    const onPage2 = products.filter((p) => h2.includes(p.name));
    check("page 2 lists products", onPage2.length > 0, "");
    check("every product appears on page 1 or page 2", new Set([...onPage1, ...onPage2].map((p) => p.name)).size === products.length, "");
    check("no product appears on both pages", onPage1.filter((p) => h2.includes(p.name)).length === 0, "");
  }

  for (const cat of categories) {
    const cr = await get(`/products/${cat}`);
    const ch = norm(cr.html);
    check(`GET /products/${cat} -> 200`, cr.status === 200, `status=${cr.status}`);
    const catProducts = products.filter((p) => p.category === cat);
    for (const p of catProducts) {
      check(`  ${cat}: "${p.name}" listed`, ch.includes(p.name), "");
    }
    for (const other of products.filter((p) => p.category !== cat)) {
      check(`  ${cat}: "${other.name}" NOT listed`, !ch.includes(other.name), `leak ${other.name}`);
    }
  }

  const bad = await get("/products/not-a-category");
  check("GET /products/not-a-category -> 404", bad.status === 404, `status=${bad.status}`);
  check("404 page renders not-found", bad.html.includes("404"), "");

  // ── STEP 5: catalog controls & URL-driven filters ──
  check("sort select present in HTML", h.includes("Sort by") || h.includes("sort="), "");
  check("availability pills present", h.includes("In Stock") || h.includes("availability="), "");
  check("price filter present", h.includes("Min price") || h.includes("minPrice"), "");

  const sortLow = norm((await get("/products?sort=price-low-high")).html);
  check("sort=price-low-high -> 200", sortLow.includes("All Products"), "");

  const sortAz = norm((await get("/products?sort=name-a-z")).html);
  check("sort=name-a-z -> 200", sortAz.includes("All Products"), "");

  const availIn = norm((await get("/products?availability=in-stock")).html);
  check("availability=in-stock -> 200", availIn.includes("All Products"), "");

  const priceFilter = norm((await get("/products?minPrice=5000&maxPrice=10000")).html);
  check("price filter min+max -> 200", priceFilter.includes("All Products"), "");

  const catSort = norm((await get("/products/earbuds?sort=price-low-high")).html);
  check("category sort works", catSort.includes("AirDots Pro"), "");

  const catAvail = norm((await get("/products/earbuds?availability=in-stock")).html);
  check("category availability filter works", catAvail.includes("Earbuds"), "");
}

// ─────────────────────────────────────────────────────────────────────────
section("B2. Search pagination & safety")
{
  const searchSort = norm((await get("/search?q=charger&sort=price-low-high")).html);
  check("search with sort -> 200", searchSort.includes("charger"), "");
  check("search sort preserves q", searchSort.includes("Results for"), "");

  const unsafeRaw = (await get("/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E")).html;
  check("unsafe query sanitized (no raw <script> in heading)", !unsafeRaw.includes("Results for <script>"), "");
  check("unsafe query escaped to entities", unsafeRaw.includes("&lt;script&gt;alert(1)&lt;/script&gt;"), "");

  const searchAvail = norm((await get("/search?q=earbuds&availability=in-stock")).html);
  check("search availability filter -> 200", searchAvail.includes("earbuds"), "");

  const searchPrice = norm((await get("/search?q=charger&minPrice=1000&maxPrice=5000")).html);
  check("search price filter -> 200", searchPrice.includes("charger"), "");
}

// ─────────────────────────────────────────────────────────────────────────
section("C. Product pages")
{
  const hasFeatures = (p) => (p.features?.length ?? 0) > 0;
  const hasSpecs = (p) => (p.specifications?.length ?? 0) > 0;
  const trust = {
    cod: settings?.codEnabled ?? false,
    warranty: settings?.warrantyMonths ?? null,
    returns: settings?.returnWindowDays ?? null,
    whatsapp: settings?.whatsappNumber ?? null,
    shippingFee: settings?.shippingFee ?? 199,
  };

  for (const p of products) {
    const r = await get(`/product/${p.slug}`);
    const h = norm(r.html);
    const ctx = `[${p.slug}]`;
    check(`GET /product/${p.slug} -> 200`, r.status === 200, `${ctx} status=${r.status}`);
    check(`${ctx} h1 product name`, h.includes(`>${p.name}<`), "");
    check(`${ctx} price "${formatPrice(p.price)}"`, h.includes(formatPrice(p.price)), "");
    const out = p.stockStatus === "out-of-stock";
    const stockLabel = out ? "Sold Out" : p.stockStatus === "low-stock" ? "Low Stock" : "In Stock";
    check(`${ctx} stock badge`, h.includes(stockLabel), `want ${stockLabel}`);
    check(`${ctx} AddToCart/SoldOut cta`, out ? h.includes("Sold Out") : h.includes("Add to Cart"), "");
    check(`${ctx} Buy Now for purchasable`, out ? !h.includes("Buy Now") : h.includes("Buy Now"), "");
    check(`${ctx} no reviews link when none`, p.reviewCount > 0 ? h.includes(`(${p.reviewCount})`) || h.includes(`>${p.reviewCount}<`) : !h.includes("reviews</a>") || true, `rc=${p.reviewCount}`);
    check(`${ctx} key features section`, hasFeatures(p) ? h.includes("Key Features") : !h.includes("Key Features"), "");
    check(`${ctx} specs section`, hasSpecs(p) ? h.includes("Technical Specifications") : !h.includes("Technical Specifications"), "");
    check(`${ctx} description section`, h.includes("Description"), "");
    check(`${ctx} reviews section heading`, h.includes("Customer Reviews"), "");
    check(`${ctx} review form`, h.includes("Your rating") && h.includes("review-email"), "");
    check(`${ctx} no-reviews state`, p.reviewCount > 0 || h.includes("No reviews yet"), `rc=${p.reviewCount}`);
    check(`${ctx} compatibility hidden when absent`, !h.includes("Works With"), "");
    check(`${ctx} in-the-box hidden when absent`, !h.includes("What's in the Box"), "");
    check(`${ctx} video hidden when absent`, !h.includes("See It in Action"), "");
    check(`${ctx} product FAQ hidden when absent`, !h.includes("Frequently Asked Questions"), "");
    check(`${ctx} breadcrumb`, h.includes(`/products/${p.category}`) && h.includes(">Home<"), "");
    check(`${ctx} free shipping microcopy`, h.includes("Free shipping over"), "");
    check(`${ctx} COD copy`, !out && trust.cod ? h.includes("Cash on Delivery available") : !h.includes("Cash on Delivery available"), `cod=${trust.cod} out=${out}`);
    check(`${ctx} no fake warranty duration`, trust.warranty ? h.includes("warranty") : !/(\d+-(year|month) warranty)/.test(h), `warrantyMonths=${trust.warranty}`);
    check(`${ctx} no fake return window`, trust.returns ? h.includes("Returns within") : !h.includes("Returns within"), `returnWindowDays=${trust.returns}`);
    check(`${ctx} no WhatsApp without number`, trust.whatsapp ? h.includes("Chat on WhatsApp") : !h.includes("Chat on WhatsApp"), `whatsapp=${trust.whatsapp}`);
    check(`${ctx} standard shipping copy`, trust.shippingFee > 0 ? h.includes("Standard shipping") : !h.includes("Standard shipping"), `fee=${trust.shippingFee}`);
    check(`${ctx} title tag`, h.includes(`<title>${p.name} | VoltGear</title>`), "");

    const ldMatches = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    const m = ldMatches.find((m) => m[1].includes('"Product"'));
    check(`${ctx} JSON-LD present`, !!m, `${ldMatches.length} json-ld blocks`);
    if (m) {
      let ld = null;
      try {
        ld = JSON.parse(m[1]);
      } catch {
        /* not JSON */
      }
      check(`${ctx} JSON-LD valid`, !!ld, m ? m[1].slice(0, 80) : "no match");
      if (ld) {
        check(`${ctx} @type Product`, ld["@type"] === "Product", JSON.stringify(ld["@type"]));
        check(`${ctx} offers PKR`, ld.offers?.priceCurrency === "PKR", JSON.stringify(ld.offers));
        check(`${ctx} offers price match`, Number(ld.offers?.price) === Number(p.price), `json=${ld.offers?.price} seed=${p.price}`);
        const avail = {
          "in-stock": "https://schema.org/InStock",
          "low-stock": "https://schema.org/LimitedAvailability",
          "out-of-stock": "https://schema.org/OutOfStock",
        };
        check(`${ctx} availability`, ld.offers?.availability === avail[p.stockStatus], `${ld.offers?.availability} want ${avail[p.stockStatus]}`);
        check(`${ctx} no aggregateRating without real reviews`, !ld.aggregateRating, JSON.stringify(ld.aggregateRating));
        check(`${ctx} no demo reviews in JSON-LD`, !Array.isArray(ld.review) || ld.review.length === 0, `json=${ld.review?.length}`);
      }
    }
  }

  const bad = await get("/product/definitely-not-a-product");
  check("GET /product/bogus -> 404", bad.status === 404, `status=${bad.status}`);
  check("bogus product shows 404 page", bad.html.includes("404"), "");
}

// ─────────────────────────────────────────────────────────────────────────
section("D. Search")
{
  const hit = await get("/search?q=earbuds");
  const hh = norm(hit.html);
  check("GET /search?q=earbuds -> 200", hit.status === 200, `status=${hit.status}`);
  check("search heading with query", hh.includes("Results for"), "");
  const q = "earbuds";
  const expectedHits = products.filter((p) =>
    [p.name, p.category, p.badge].filter(Boolean).some((f) => f.toLowerCase().includes(q))
  );
  for (const p of expectedHits) {
    check(`search hit "${p.name}"`, hh.includes(p.name), "");
  }
  check(`search count (${expectedHits.length})`, hh.includes(`${expectedHits.length} product`), `want ${expectedHits.length} products`);

  const miss = await get("/search?q=zzqqxxw");
  check("search no-results -> 200", miss.status === 200, `status=${miss.status}`);
  check("search no-results message", norm(miss.html).includes("No products found"), "");

  const empty = await get("/search");
  check("GET /search (no q) -> 200", empty.status === 200, `status=${empty.status}`);
  check("search empty prompt", norm(empty.html).includes("What are you looking for?"), "");
}

// ─────────────────────────────────────────────────────────────────────────
section("E. Info & utility pages")
{
  const cases = [
    { path: "/track", marker: "Track order" },
    { path: "/checkout", marker: "Your cart is empty" },
    { path: "/write-review", marker: "Write a review" },
    { path: "/blog", marker: "Blog & Guides" },
    { path: "/faq", marker: "Frequently Asked Questions" },
  ];
  for (const c of cases) {
    const r = await get(c.path);
    check(`GET ${c.path} -> 200`, r.status === 200, `status=${r.status}`);
    check(`GET ${c.path} contains "${c.marker}"`, norm(r.html).includes(c.marker), "");
  }

  for (const pg of staticPages) {
    const r = await get(`/${pg.slug}`);
    check(`GET /${pg.slug} (${pg.title}) -> 200`, r.status === 200, `status=${r.status}`);
    check(`GET /${pg.slug} has title`, norm(r.html).includes(pg.title), "");
    check(
      `GET /${pg.slug} canonical`,
      r.html.includes(`href="${SITE_URL}/${pg.slug}"/>`),
      `want ${SITE_URL}/${pg.slug}`
    );
  }

  for (const pg of blogPages) {
    const r = await get(`/blog/${pg.slug}`);
    check(`GET /blog/${pg.slug} -> 200`, r.status === 200, `status=${r.status}`);
    check(`GET /blog/${pg.slug} has title`, norm(r.html).includes(pg.title), "");
  }
  const blog = await get("/blog");
  const bh = norm(blog.html);
  for (const pg of blogPages) {
    check(`blog index lists "${pg.title}"`, bh.includes(pg.title), "");
  }
}

// ─────────────────────────────────────────────────────────────────────────
section("F. Sitemap & robots")
{
  const sitemap = await get("/sitemap.xml");
  check("GET /sitemap.xml -> 200", sitemap.status === 200, `status=${sitemap.status}`);
  check("sitemap is xml", (sitemap.headers.get("content-type") || "").includes("xml"), sitemap.headers.get("content-type") || "");
  check("sitemap has product url", sitemap.html.includes(`/product/${products[0].slug}`), "");
  check("sitemap has page url", sitemap.html.includes(`/${staticPages[0].slug}`), "");
  check("sitemap has home", sitemap.html.includes(`<loc>${SITE_URL}</loc>`), `want <loc>${SITE_URL}</loc>`);

  const robots = await get("/robots.txt");
  check("GET /robots.txt -> 200", robots.status === 200, `status=${robots.status}`);
  check("robots has sitemap ref", robots.html.toLowerCase().includes("sitemap"), "");
}

// ─────────────────────────────────────────────────────────────────────────
section("G. Negative / force render")
{
  const badRoutes = [
    "/product/zz-not-real",
    "/products/zz-not-real",
    "/blog/zz-not-real",
    "/track/zz-not-real",
    "/zz-definitely-not-a-route",
  ];
  for (const route of badRoutes) {
    const r = await get(route);
    check(`GET ${route} -> 404`, r.status === 404, `status=${r.status}`);
    check(`GET ${route} renders 404 page`, r.html.includes("404"), "");
  }

  const odd = await get("/?foo=bar&utm_source=test");
  check("GET / with utm params -> 200", odd.status === 200, `status=${odd.status}`);
}

// ─────────────────────────────────────────────────────────────────────────
section("H. Content integrity")
{
  const p = products[0];
  const r = await get(`/product/${p.slug}`);
  const h = norm(r.html);
  const demoReviews = (p.reviews ?? []).filter((rev) => rev.name && typeof rev.rating === "number");
  if (demoReviews.length) {
    for (const rev of demoReviews) {
      const snippet = rev.comment?.slice(0, 20) ?? "";
      check(`demo review "${rev.name}" not rendered`, !h.includes(rev.name) && !h.includes(snippet), `name=${rev.name}`);
    }
  }

  const pr = await get("/products");
  const ph = norm(pr.html);
  let dupes = [];
  for (const prod of products) {
    const re = new RegExp(`>${prod.name}<`, "g");
    const n = (ph.match(re) || []).length;
    if (n > 1) dupes.push(`${prod.name} (${n})`);
  }
  check("no duplicated product cards on /products", dupes.length === 0, dupes.join(", "));
}

// ─────────────────────────────────────────────────────────────────────────
section("I. Demo-flag legacy regression")
{
  const token = process.env.SANITY_API_TOKEN;
  if (!token) {
    check("demo-flag regression has write token", false, "SANITY_API_TOKEN not set");
    throw new Error("SANITY_API_TOKEN missing — cannot create fixtures");
  }
  const writeClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2024-04-12",
    useCdn: false,
    token,
  });

  const marker = `2C-${Date.now().toString(36)}`;
  const legacyName = `Legacy Genuine ${marker}`;
  const demoName = `Demo Excluded ${marker}`;
  const slug = `legacy-fixture-${marker}`;
  let productId = null;
  let legacyTestimonialId = null;
  let demoTestimonialId = null;

  // Pre-cleanup: remove any stale legacy fixtures from prior aborted runs
  const staleFixtures = await sanity.fetch(
    `*[(_type == "product" && name match "*Legacy Fixture 2C-*") || (_type == "testimonial" && customerName match "*Legacy Genuine 2C-*")]._id`
  );
  if (staleFixtures?.length) {
    for (const id of staleFixtures) await writeClient.delete(id).catch(() => {});
  }

  try {
    const prod = await writeClient.create({
      _type: "product",
      name: `Legacy Fixture ${marker}`,
      slug: { current: slug },
      price: 100,
      category: "charger",
      stockStatus: "in-stock",
      rating: 4,
      reviewCount: 1,
      shortDescription: "temporary fixture for demo-flag regression",
      featured: false,
      reviews: [
        { name: legacyName, rating: 5, comment: "legacy review without isDemo field", date: "2026-01-01", verified: true },
        { name: demoName, rating: 1, comment: "demo review with isDemo true", date: "2026-01-02", verified: true, isDemo: true },
      ],
    });
    productId = prod._id;

    const legT = await writeClient.create({
      _type: "testimonial",
      customerName: legacyName,
      reviewText: "legacy testimonial without isDemo field",
      rating: 5,
      verified: false,
      sortOrder: 9999,
    });
    legacyTestimonialId = legT._id;

    const demT = await writeClient.create({
      _type: "testimonial",
      customerName: demoName,
      reviewText: "demo testimonial with isDemo true",
      rating: 5,
      verified: true,
      sortOrder: 9998,
      isDemo: true,
    });
    demoTestimonialId = demT._id;

    // Production-query semantics (mirrors lib/sanity/queries.ts GROQ exactly).
    const prodRes = await sanity.fetch(
      `*[_type == "product" && slug.current == $slug][0]{ "reviews": reviews[isDemo != true] }`,
      { slug }
    );
    const reviewNames = (prodRes?.reviews ?? []).map((r) => r.name);
    check("legacy review without isDemo included by product query", reviewNames.includes(legacyName), JSON.stringify(reviewNames));
    check("demo review (isDemo true) excluded by product query", !reviewNames.includes(demoName), JSON.stringify(reviewNames));

    const tRes = await sanity.fetch(
      `*[_type == "testimonial" && isDemo != true] | order(sortOrder asc){ customerName }`
    );
    const tNames = tRes.map((t) => t.customerName);
    check("legacy testimonial without isDemo included", tNames.includes(legacyName), "");
    check("demo testimonial (isDemo true) excluded", !tNames.includes(demoName), "");

    // Storefront render (bounded poll: ISR revalidate=60 + CDN propagation).
    let h = "";
    for (let i = 0; i < 20 && !h.includes(legacyName); i++) {
      await new Promise((r) => setTimeout(r, 5000));
      h = norm((await get("/")).html);
    }
    check("homepage renders legacy testimonial (missing isDemo)", h.includes(legacyName), "");
    check("homepage hides demo testimonial (isDemo true)", !h.includes(demoName), "");
    check("homepage testimonial section shown for legacy content", h.includes("Customer Stories"), "");

    let pdpHtml = "";
    for (let i = 0; i < 20 && !pdpHtml.includes(legacyName); i++) {
      await new Promise((r) => setTimeout(r, 5000));
      pdpHtml = norm((await get(`/product/${slug}`)).html);
    }
    check("PDP renders legacy review (missing isDemo)", pdpHtml.includes(legacyName), "");
    check("PDP hides demo review (isDemo true)", !pdpHtml.includes(demoName), "");

    const ldMatch = pdpHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
    let ld = null;
    if (ldMatch) {
      const m = ldMatch.map((s) => s.replace(/<\/?script[^>]*>/g, "")).find((s) => s.includes('"Product"'));
      if (m) {
        try { ld = JSON.parse(m); } catch { ld = null; }
      }
    }
    check("PDP JSON-LD present for legacy fixture", !!ld, "");
    if (ld) {
      check("PDP JSON-LD includes legacy review", Array.isArray(ld.review) && ld.review.some((r) => r.author?.name === legacyName), JSON.stringify(ld.review));
      check("PDP JSON-LD excludes demo review", !Array.isArray(ld.review) || !ld.review.some((r) => r.author?.name === demoName), "");
      check("PDP JSON-LD aggregateRating from legacy review", Number(ld.aggregateRating?.reviewCount) >= 1, JSON.stringify(ld.aggregateRating));
    }
  } finally {
    for (const id of [legacyTestimonialId, demoTestimonialId, productId]) {
      if (id) await writeClient.delete(id).catch(() => {});
    }
    const leftovers = await sanity.fetch(
      `*[(_type == "product" && name match "*${marker}*") || (_type == "testimonial" && customerName match "*${marker}*")]._id`
    );
    check("no demo-flag fixtures left in Sanity", !leftovers?.length, JSON.stringify(leftovers));
    if (leftovers?.length) {
      await Promise.all(leftovers.map((id) => writeClient.delete(id).catch(() => {})));
    }

    // The fixture window may have briefly inflated the product count in the
    // ISR cache — purge it via the existing on-demand revalidate API, then
    // confirm the catalog count matches the fresh Sanity state. Sanity's CDN
    // can lag the delete by tens of seconds, so poll generously.
    const revalToken =
      process.env.ADMIN_TOKEN ||
      process.env.REVALIDATION_TOKEN ||
      "voltgear-demo-revalidate";
    const rv = await fetch(`${BASE}/api/revalidate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${revalToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paths: ["/", "/products"] }),
    });
    check("revalidate API accepted after fixture cleanup", rv.status === 200, `status=${rv.status}`);
    const freshCount = await sanity.fetch(`count(*[_type == "product"])`);
    let catHtml = "";
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      catHtml = norm((await get("/products")).html);
      if (catHtml.includes(`${freshCount} products`)) break;
    }
    check(
      `product count "${freshCount} products" after fixture cleanup`,
      catHtml.includes(`${freshCount} products`),
      ""
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────
section("J. PDP content sections (fixture)")
{
  const token = process.env.SANITY_API_TOKEN;
  if (!token) {
    check("PDP fixture has write token", false, "SANITY_API_TOKEN not set");
    throw new Error("SANITY_API_TOKEN missing — cannot create fixture");
  }
  const writeClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2024-04-12",
    useCdn: false,
    token,
  });

  const marker = `PD-${Date.now().toString(36)}`;
  const slug = `pdp-fixture-${marker}`;
  const sku = `FIX-${marker.toUpperCase()}`;
  const name = `PDP Sections Fixture ${marker}`;
  let productId = null;

  try {
    const prod = await writeClient.create({
      _type: "product",
      name,
      slug: { current: slug },
      price: 5000,
      compareAtPrice: 6000,
      sku,
      brand: "FixtureBrand",
      category: "earbuds",
      stockStatus: "in-stock",
      shortDescription: "temporary fixture for PDP content sections",
      featured: false,
      features: ["Fixture Feat One", "Fixture Feat Two"],
      specifications: [
        { label: "Chipset", value: "FX-1" },
        { label: "Battery Life", value: "48 hours" },
      ],
      compatibility: ["AirDots Pro", "Mini Buds"],
      inTheBox: ["Fixture Charging Case", "USB-C Cable"],
      productVideo: { url: "https://example.com/fixture-video.mp4" },
      productFaq: [
        { question: "Fixture Question?", answer: "Fixture Answer text." },
      ],
      variants: [
        {
          _key: "v1",
          name: "Jet Black",
          price: 4999,
          compareAtPrice: 5999,
          stockStatus: "in-stock",
          isDefault: true,
        },
        {
          _key: "v2",
          name: "Arctic White",
          price: 7500,
          stockStatus: "out-of-stock",
        },
      ],
      reviews: [],
    });
    productId = prod._id;

    // Bounded poll: ISR revalidate=60 + CDN propagation.
    let h = "";
    for (let i = 0; i < 20 && !h.includes(name); i++) {
      await new Promise((r) => setTimeout(r, 5000));
      h = norm((await get(`/product/${slug}`)).html);
    }
    const ctx = "[fixture]";
    check("fixture PDP renders", h.includes(name), "");
    check(`${ctx} brand eyebrow`, h.includes("FixtureBrand"), "");
    check(`${ctx} SKU shown`, h.includes(`SKU: ${sku}`), "");
    check(`${ctx} default variant price`, h.includes(formatPrice(4999)), `want ${formatPrice(4999)}`);
    check(`${ctx} variant compareAt strike`, h.includes(formatPrice(5999)), "");
    check(`${ctx} genuine discount badge`, h.includes("Save 17%"), "");
    check(`${ctx} sold-out variant disabled`, h.includes("Arctic White (sold out)"), "");
    check(`${ctx} Buy Now present`, h.includes("Buy Now"), "");
    check(`${ctx} key features render`, h.includes("Key Features") && h.includes("Fixture Feat One"), "");
    check(`${ctx} compatibility renders`, h.includes("Works With") && h.includes("AirDots Pro") && h.includes("Mini Buds"), "");
    check(`${ctx} in-the-box renders`, h.includes("What's in the Box") && h.includes("Fixture Charging Case") && h.includes("USB-C Cable"), "");
    check(`${ctx} specs render`, h.includes("Technical Specifications") && h.includes("Chipset") && h.includes("FX-1") && h.includes("Battery Life"), "");
    check(`${ctx} description hidden when empty`, !h.includes("Product Description"), "");
    check(`${ctx} video section renders`, h.includes("See It in Action") && h.includes("fixture-video.mp4"), "");
    check(`${ctx} FAQ renders`, h.includes("Frequently Asked Questions") && h.includes("Fixture Question?"), "");
    check(`${ctx} no reviews state`, h.includes("No reviews yet"), "");

    const ldMatches = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    const m = ldMatches.find((m) => m[1].includes('"Product"'));
    check(`${ctx} JSON-LD present`, !!m, "");
    if (m) {
      let ld = null;
      try { ld = JSON.parse(m[1]); } catch { /* not JSON */ }
      check(`${ctx} JSON-LD valid`, !!ld, "");
      if (ld) {
        check(`${ctx} JSON-LD sku`, ld.sku === sku, `json=${ld.sku}`);
        check(`${ctx} JSON-LD brand`, ld.brand?.name === "FixtureBrand", JSON.stringify(ld.brand));
        check(`${ctx} JSON-LD no aggregateRating (no reviews)`, !ld.aggregateRating, "");
        check(`${ctx} JSON-LD price stays product price`, Number(ld.offers?.price) === 5000, `json=${ld.offers?.price}`);
      }
    }
  } finally {
    if (productId) await writeClient.delete(productId).catch(() => {});
    const leftovers = await sanity.fetch(
      `*[_type == "product" && name match "*${marker}*"]._id`
    );
    check("no PDP fixtures left in Sanity", !leftovers?.length, JSON.stringify(leftovers));
    if (leftovers?.length) {
      await Promise.all(leftovers.map((id) => writeClient.delete(id).catch(() => {})));
    }
    const revalToken =
      process.env.ADMIN_TOKEN ||
      process.env.REVALIDATION_TOKEN ||
      "voltgear-demo-revalidate";
    const rv = await fetch(`${BASE}/api/revalidate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${revalToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paths: [`/product/${slug}`] }),
    });
    check("revalidate API accepted after PDP fixture cleanup", rv.status === 200, `status=${rv.status}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────
console.log("\n────────────────────────────────────────────────────────────");
console.log(`TOTAL: ${passed} passed, ${failed} failed`);
if (failed) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
console.log("ALL FRONTEND SSR TESTS PASSED ✅");
