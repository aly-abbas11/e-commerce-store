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
  `*[_type=="siteSettings"][0]{brandName,freeShippingThreshold,shippingFee,email}`
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
  check("Featured Products section", h.includes("Featured Products") || h.includes("featured"), "");
  for (const [slug, label] of [
    ["smartwatch", "Smartwatches"],
    ["power-bank", "Power Banks"],
    ["charger", "Chargers & Adapters"],
    ["earbuds", "Earbuds & Handsfree"],
  ]) {
    check(`category card "${label}"`, h.includes(label), "");
  }
  for (const p of featured) {
    check(`featured product "${p.name}"`, h.includes(p.name), "");
  }
  for (const perk of [
    "Fast Shipping",
    "2-Year Warranty",
    "Same-Day Dispatch",
    "Best Price Promise",
  ]) {
    check(`perk "${perk}"`, h.includes(perk), "");
  }
  const freeMsg = `Free on orders over ${formatPrice(
    settings?.freeShippingThreshold ?? 5000
  )}`;
  check("free shipping threshold copy", h.includes(freeMsg), `want ${freeMsg}`);
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
  check(
    `product count "${products.length} products available"`,
    h.includes(`${products.length} products available`),
    ""
  );
  for (const p of products) {
    check(`product card "${p.name}"`, h.includes(p.name), "");
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
}

// ─────────────────────────────────────────────────────────────────────────
section("C. Product pages")
{
  for (const p of products) {
    const r = await get(`/product/${p.slug}`);
    const h = norm(r.html);
    const ctx = `[${p.slug}]`;
    check(`GET /product/${p.slug} -> 200`, r.status === 200, `${ctx} status=${r.status}`);
    check(`${ctx} h1 product name`, h.includes(`>${p.name}<`), "");
    check(`${ctx} price "${formatPrice(p.price)}"`, h.includes(formatPrice(p.price)), "");
    const stockLabel =
      p.stockStatus === "out-of-stock"
        ? "Sold Out"
        : p.stockStatus === "low-stock"
          ? "Low Stock"
          : "In Stock";
    check(`${ctx} stock badge`, h.includes(stockLabel), `want ${stockLabel}`);
    check(`${ctx} AddToCart/SoldOut cta`, p.stockStatus === "out-of-stock" ? h.includes("Sold Out") : h.includes("Add to Cart"), "");
    check(`${ctx} tabs render`, h.includes("Description") && h.includes("Reviews"), "");
    check(`${ctx} review count badge`, h.includes(`>${p.reviewCount}<`) || h.includes(`>${p.reviewCount}`), `rc=${p.reviewCount}`);
    check(`${ctx} breadcrumb category`, h.includes(`/products/${p.category}`), "");
    check(`${ctx} trust microcopy`, h.includes("Free shipping over") && h.includes("2-year warranty"), "");
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
        if (typeof p.rating === "number" && p.reviewCount > 0) {
          check(`${ctx} aggregateRating`, Number(ld.aggregateRating?.ratingValue) === Number(p.rating) && Number(ld.aggregateRating?.reviewCount) === Number(p.reviewCount), JSON.stringify(ld.aggregateRating));
        }
        const seedReviews = (p.reviews ?? []).filter((rev) => rev.name && typeof rev.rating === "number");
        if (seedReviews.length) {
          check(`${ctx} JSON-LD reviews included`, Array.isArray(ld.review) && ld.review.length >= seedReviews.length, `json=${ld.review?.length} seed=${seedReviews.length}`);
        }
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
  check(`search count (${expectedHits.length})`, hh.includes(`(${expectedHits.length})`), `want (${expectedHits.length})`);

  const miss = await get("/search?q=zzqqxxw");
  check("search no-results -> 200", miss.status === 200, `status=${miss.status}`);
  check("search no-results message", norm(miss.html).includes("No products match"), "");

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
  const seedReviews = (p.reviews ?? []).filter((rev) => rev.name && typeof rev.rating === "number");
  if (seedReviews.length) {
    for (const rev of seedReviews) {
      check(`product page shows seeded review "${rev.name}"`, h.includes(rev.name) && h.includes(rev.comment?.slice(0, 20) ?? ""), "");
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
console.log("\n────────────────────────────────────────────────────────────");
console.log(`TOTAL: ${passed} passed, ${failed} failed`);
if (failed) {
  console.log("Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
console.log("ALL FRONTEND SSR TESTS PASSED ✅");
