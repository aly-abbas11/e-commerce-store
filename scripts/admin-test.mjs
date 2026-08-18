#!/usr/bin/env node
/**
 * Deep regression + force (negative) + CRUD test harness for the admin side.
 *
 *   - Auth: missing / wrong / correct tokens on every admin route
 *   - Contacts CRUD: add (all +92 formats), duplicate, order-derived, invalid,
 *     delete manual, suppress order number, restore
 *   - Send: empty text, no recipients, invalid phones, overlong text, single
 *     and bulk, dedupe
 *   - Campaigns: list, detail, 404s
 *   - Retry: all-sent, bogus id, missing id
 *   - Order status admin: valid transition, invalid status, missing order,
 *     missing status, history append
 *   - Revalidate auth
 *   - Flows + public smoke (settings, reviews, checkout, upload)
 *
 * Cleans up every document it creates. Prints PASS/FAIL and exits non-zero on
 * any failure. Run against a running prod server:
 *   node scripts/admin-test.mjs [BASE_URL]
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import cloudinaryPkg from "cloudinary";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

let adminUploadedUrl = "";
const BASE = process.argv[2] || "http://localhost:3001";

const envFile = resolve(root, ".env.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

const cloudinary = cloudinaryPkg.v2;
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const TOKEN =
  process.env.ADMIN_TOKEN ||
  process.env.REVALIDATION_TOKEN ||
  "voltgear-demo-revalidate";
const BAD = "wrong-token-xyz";

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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function req(path, { method = "GET", token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON */
  }
  return { status: res.status, json };
}

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-04-12",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// ─────────────────────────────────────────────────────────────────────────
section("A. Auth — every admin surface")
{
  const authCases = [
    ["GET /api/messaging/contacts", "/api/messaging/contacts"],
    ["POST /api/messaging/contacts", "/api/messaging/contacts"],
    ["DELETE /api/messaging/contacts", "/api/messaging/contacts?phone=%2B923009998877"],
    ["POST /api/messaging/send", "/api/messaging/send"],
    ["GET /api/messaging/campaigns", "/api/messaging/campaigns"],
    ["POST /api/messaging/retry", "/api/messaging/retry"],
  ];
  for (const [label, path] of authCases) {
    const method = path.includes("?") ? "DELETE" : path.endsWith("campaigns") ? "GET" : "POST";
    const r0 = await req(path, { method });
    check(`${label} without token -> 401`, r0.status === 401, `(got ${r0.status})`);
    const r1 = await req(path, { method, token: BAD, body: method === "GET" ? undefined : { phone: "0300 999 8877" } });
    check(`${label} wrong token -> 401`, r1.status === 401, `(got ${r1.status})`);
  }

  const campaignIdCase = "messageCampaign.does-not-exist";
  const r404 = await req(`/api/messaging/campaigns/${campaignIdCase}`, { token: TOKEN });
  check("campaign detail bogus id -> 404", r404.status === 404, `(got ${r404.status})`);

  const loginBad = await req("/api/admin/login", { method: "POST", body: { password: "nope" } });
  check("admin login wrong password -> 401", loginBad.status === 401, `(got ${loginBad.status})`);
  const loginGood = await req("/api/admin/login", { method: "POST", body: { password: TOKEN } });
  check("admin login correct password -> 200 + token", loginGood.status === 200 && loginGood.json?.token === TOKEN, JSON.stringify(loginGood.json));

  const revBad = await req("/api/revalidate", { method: "POST", token: BAD, body: {} });
  check("revalidate wrong token -> 401", revBad.status === 401, `(got ${revBad.status})`);
  const revGood = await req("/api/revalidate", { method: "POST", token: TOKEN, body: { path: "/" } });
  check("revalidate correct token -> revalidated", revGood.status === 200 && revGood.json?.revalidated === true, JSON.stringify(revGood.json));

  const orderStatusNoAuth = await req("/api/orders/VG-NOPE/status", { method: "POST", body: { status: "shipped" } });
  check("order status without token -> 401", orderStatusNoAuth.status === 401, `(got ${orderStatusNoAuth.status})`);
}

// ─────────────────────────────────────────────────────────────────────────
section("B. Contacts CRUD")
let contactsList = [];
let campaignIds = [];

{
  const r = await req("/api/messaging/contacts", { token: TOKEN });
  check("GET contacts -> 200 + array", r.status === 200 && Array.isArray(r.json?.contacts), JSON.stringify(r.json));
  const hiraBefore = (r.json?.contacts ?? []).some((c) => c.phone === "+923001234567");
  contactsList = r.json?.contacts ?? [];

  // add manual (11-digit 03 format)
  const a1 = await req("/api/messaging/contacts", { method: "POST", token: TOKEN, body: { phone: "0300 999 8877", name: "Test Manual", city: "Lahore" } });
  check("add manual 03x format -> ok", a1.status === 200 && a1.json?.ok === true, JSON.stringify(a1.json));

  // duplicate via different formatting -> 400
  const a2 = await req("/api/messaging/contacts", { method: "POST", token: TOKEN, body: { phone: "+92 300 999 8877" } });
  check("duplicate manual (reformatted) -> 400", a2.status === 400, JSON.stringify(a2.json));

  // order-derived duplicate -> 400 (only if Hira exists from orders)
  if (hiraBefore) {
    const a3 = await req("/api/messaging/contacts", { method: "POST", token: TOKEN, body: { phone: "+92 300 1234567", name: "Hira Again" } });
    check("add order-derived duplicate -> 400", a3.status === 400, JSON.stringify(a3.json));
  }

  // invalid phone numbers
  for (const bad of ["abc", "12345", "030012345678", "+12345"]) {
    const a = await req("/api/messaging/contacts", { method: "POST", token: TOKEN, body: { phone: bad } });
    check(`add invalid phone '${bad}' -> 400`, a.status === 400, JSON.stringify(a.json));
  }

  // normalization variants map to one +92 number
  const variants = ["923009998877", "92 300 9998877", "3009998877"];
  let dedupedOk = true;
  for (const v of variants) {
    const a = await req("/api/messaging/contacts", { method: "POST", token: TOKEN, body: { phone: v } });
    if (a.status !== 400) dedupedOk = false;
  }
  check("normalization variants all dedupe to same number -> 400", dedupedOk);

  // GET contains normalized manual
  const g1 = await req("/api/messaging/contacts", { token: TOKEN });
  const manualEntry = (g1.json?.contacts ?? []).find((c) => c.phone === "+923009998877");
  check("GET shows manual contact normalized +92", Boolean(manualEntry) && manualEntry.source === "manual" && manualEntry.name === "Test Manual", JSON.stringify(manualEntry));

  // parallel reads don't crash
  const parallel = await Promise.all(
    Array.from({ length: 5 }, () => req("/api/messaging/contacts", { token: TOKEN }))
  );
  check("5 parallel GET contacts all 200", parallel.every((r) => r.status === 200));

  // delete manual
  const d1 = await req("/api/messaging/contacts?phone=%2B923009998877", { method: "DELETE", token: TOKEN });
  check("delete manual -> ok", d1.status === 200 && d1.json?.ok === true, JSON.stringify(d1.json));
  const g2 = await req("/api/messaging/contacts", { token: TOKEN });
  check("manual contact removed after delete", !(g2.json?.contacts ?? []).some((c) => c.phone === "+923009998877"));

  // suppress order-derived number
  if (hiraBefore) {
    const d2 = await req("/api/messaging/contacts?phone=%2B923001234567", { method: "DELETE", token: TOKEN });
    check("suppress order number -> ok", d2.status === 200, JSON.stringify(d2.json));
    const g3 = await req("/api/messaging/contacts", { token: TOKEN });
    check("suppressed order number hidden from contacts", !(g3.json?.contacts ?? []).some((c) => c.phone === "+923001234567"));
    check("suppressed number listed in suppressed", (g3.json?.suppressed ?? []).includes("+923001234567"), JSON.stringify(g3.json?.suppressed));

    // restore by re-adding
    const a4 = await req("/api/messaging/contacts", { method: "POST", token: TOKEN, body: { phone: "+92 300 1234567" } });
    check("re-add suppressed number -> ok", a4.status === 200, JSON.stringify(a4.json));
    const g4 = await req("/api/messaging/contacts", { token: TOKEN });
    check("restored number back in contacts, suppression cleared", (g4.json?.contacts ?? []).some((c) => c.phone === "+923001234567") && !(g4.json?.suppressed ?? []).includes("+923001234567"), JSON.stringify(g4.json?.suppressed));
  }
}

// ─────────────────────────────────────────────────────────────────────────
section("C. Send — positive & force")
{
  // empty text
  const c1 = await req("/api/messaging/send", { method: "POST", token: TOKEN, body: { text: "   ", recipients: [{ phone: "+923001234567" }] } });
  check("send empty text -> 400", c1.status === 400, JSON.stringify(c1.json));

  // no recipients
  const c2 = await req("/api/messaging/send", { method: "POST", token: TOKEN, body: { text: "hi" } });
  check("send no recipients -> 400", c2.status === 400, JSON.stringify(c2.json));

  // all invalid phones
  const c3 = await req("/api/messaging/send", { method: "POST", token: TOKEN, body: { text: "hi", recipients: [{ phone: "abc" }, { phone: "1" }] } });
  check("send all-invalid phones -> 400", c3.status === 400, JSON.stringify(c3.json));

  // overlong text
  const c4 = await req("/api/messaging/send", { method: "POST", token: TOKEN, body: { text: "x".repeat(5000), recipients: [{ phone: "+923001234567" }] } });
  check("send text > 4096 -> 400", c4.status === 400, JSON.stringify(c4.json));

  // single send
  const c5 = await req("/api/messaging/send", { method: "POST", token: TOKEN, body: { name: "Single Test", text: "Hi {name}, this is a test.", recipients: [{ phone: "0300 999 8877", name: "Single Buyer" }] } });
  check("send single -> ok + campaignId", c5.status === 200 && c5.json?.ok === true && !!c5.json?.campaignId, JSON.stringify(c5.json));
  check("send single totals (1/1)", c5.json?.totals?.total === 1 && c5.json?.totals?.sent === 1 && c5.json?.totals?.failed === 0, JSON.stringify(c5.json?.totals));
  check("send single recipient status sent", c5.json?.results?.[0]?.status === "sent", JSON.stringify(c5.json?.results?.[0]));
  campaignIds.push(c5.json?.campaignId);

  // bulk with dedupe
  const c6 = await req("/api/messaging/send", { method: "POST", token: TOKEN, body: { name: "Bulk Test", text: "Salam {name}, offer!", recipients: [
    { phone: "+92 300 1234567", name: "Hira" },
    { phone: "03001234567", name: "Hira Dupe" },
    { phone: "0300 999 8877", name: "Manual" },
    { phone: "+923112345678", name: "Usman" },
  ] } });
  check("send bulk dedupes duplicate phone -> total 3", c6.status === 200 && c6.json?.totals?.total === 3, JSON.stringify(c6.json?.totals));
  check("send bulk all sent", c6.json?.totals?.sent === 3 && c6.json?.totals?.failed === 0, JSON.stringify(c6.json?.totals));
  campaignIds.push(c6.json?.campaignId);
}

// ─────────────────────────────────────────────────────────────────────────
section("D. Campaigns CRUD (read)")
{
  const r = await req("/api/messaging/campaigns", { token: TOKEN });
  check("campaigns list -> 200 + array", r.status === 200 && Array.isArray(r.json?.campaigns), JSON.stringify(r.json));
  const names = (r.json?.campaigns ?? []).map((c) => c.name);
  let fresh = names.includes("Single Test") && names.includes("Bulk Test");
  if (!fresh) {
    for (let i = 0; i < 8 && !fresh; i++) {
      await sleep(2000);
      const rr = await req("/api/messaging/campaigns", { token: TOKEN });
      const nn = (rr.json?.campaigns ?? []).map((c) => c.name);
      fresh = nn.includes("Single Test") && nn.includes("Bulk Test");
    }
  }
  check("campaigns list contains created campaigns", fresh, JSON.stringify(names));

  if (campaignIds[0]) {
    const d = await req(`/api/messaging/campaigns/${campaignIds[0]}`, { token: TOKEN });
    check("campaign detail -> 200 with recipient statuses", d.status === 200 && Array.isArray(d.json?.campaign?.recipients), JSON.stringify(d.json));
    check("campaign detail recipient sent", d.json?.campaign?.recipients?.[0]?.status === "sent", JSON.stringify(d.json?.campaign?.recipients?.[0]));
    check("campaign totals consistent", d.json?.campaign?.sent === 1, JSON.stringify({ sent: d.json?.campaign?.sent, failed: d.json?.campaign?.failed }));
  }
}

// ─────────────────────────────────────────────────────────────────────────
section("E. Retry")
{
  const r1 = await req("/api/messaging/retry", { method: "POST", token: TOKEN, body: {} });
  check("retry missing campaignId -> 400", r1.status === 400, JSON.stringify(r1.json));

  const r2 = await req("/api/messaging/retry", { method: "POST", token: TOKEN, body: { campaignId: "messageCampaign.nope" } });
  check("retry bogus campaign -> 404", r2.status === 404, JSON.stringify(r2.json));

  if (campaignIds[0]) {
    const r3 = await req("/api/messaging/retry", { method: "POST", token: TOKEN, body: { campaignId: campaignIds[0] } });
    check("retry all-sent campaign -> resent 0", r3.status === 200 && r3.json?.resent === 0, JSON.stringify(r3.json));
  }
}

// ─────────────────────────────────────────────────────────────────────────
section("F. Order status admin")
const ORDER = "VG-PQ90RS12TU34";
const ORDER_EMAIL = "ahmed.demo@voltgear.store";
{
  const raw = await sanity.fetch(`*[_type=="order" && orderId==$oid][0]{status,statusUpdatedAt,statusHistory}`, { oid: ORDER });
  check("order exists in Sanity", Boolean(raw), JSON.stringify(raw));
  const originalStatus = raw?.status ?? "new";
  const originalHistory = raw?.statusHistory ?? [];
  const originalUpdatedAt = raw?.statusUpdatedAt ?? null;
  const historyLen = originalHistory.length;

  const track = await req(`/api/orders/${ORDER}?email=${encodeURIComponent(ORDER_EMAIL)}`);
  check("track order (correct email) -> 200 + matching id", track.status === 200 && track.json?.orderId === ORDER, JSON.stringify(track.json));

  const r = await req(`/api/orders/${ORDER}/status`, { method: "POST", token: TOKEN, body: { status: "processing", note: "admin-regression" } });
  check("status -> processing -> 200 + order.status", r.status === 200 && r.json?.order?.status === "processing", JSON.stringify(r.json));
  check("history appended", (r.json?.order?.statusHistory ?? []).length === historyLen + 1, JSON.stringify((r.json?.order?.statusHistory ?? []).map((h) => h.status)));
  check("history entry has note + at", (() => { const h = r.json?.order?.statusHistory?.[historyLen]; return h && h.note === "admin-regression" && !!h.at && h.status === "processing"; })(), JSON.stringify(r.json?.order?.statusHistory?.[historyLen]));

  const bad = await req(`/api/orders/${ORDER}/status`, { method: "POST", token: TOKEN, body: { status: "bogus" } });
  check("invalid status -> 400", bad.status === 400, JSON.stringify(bad.json));

  const noStatus = await req(`/api/orders/${ORDER}/status`, { method: "POST", token: TOKEN, body: {} });
  check("missing status -> 400", noStatus.status === 400, JSON.stringify(noStatus.json));

  const missing = await req("/api/orders/VG-DOES-NOT-EXIST/status", { method: "POST", token: TOKEN, body: { status: "shipped" } });
  check("unknown order -> 404", missing.status === 404, JSON.stringify(missing.json));

  // restore exactly (status + statusUpdatedAt + original history)
  await sanity
    .patch((await sanity.fetch(`*[_type=="order" && orderId==$oid][0]._id`, { oid: ORDER })))
    .set({ status: originalStatus, statusUpdatedAt: originalUpdatedAt, statusHistory: originalHistory })
    .commit();
  const after = await sanity.fetch(`*[_type=="order" && orderId==$oid][0]{status,statusUpdatedAt,statusHistory}`, { oid: ORDER });
  check("order restored exactly", after?.status === originalStatus && JSON.stringify(after?.statusHistory) === JSON.stringify(originalHistory), JSON.stringify(after));
}

// ─────────────────────────────────────────────────────────────────────────
section("G. Flows + public smoke / regression")
{
  const f = await req("/api/flows");
  check("GET /api/flows -> ok", f.status === 200 && f.json?.ok === true, JSON.stringify(f.json));

  const s = await req("/api/settings");
  check("GET /api/settings -> PKR config", s.status === 200 && s.json?.currency === "PKR" && s.json?.freeShippingThreshold === 5000, JSON.stringify(s.json));

  // reviews API negative + positive
  const rv1 = await req("/api/reviews", { method: "POST", body: { slug: "voltgear-pro-s2", rating: 5, name: "T", email: "x@y.z", comment: "" } });
  check("review empty comment -> 400", rv1.status === 400, JSON.stringify(rv1.json));
  const rv2 = await req("/api/reviews", { method: "POST", body: { slug: "voltgear-pro-s2", rating: 0, name: "T", email: "x@y.z", comment: "ok" } });
  check("review rating 0 -> 400", rv2.status === 400, JSON.stringify(rv2.json));
  const rv3 = await req("/api/reviews", { method: "POST", body: { slug: "voltgear-pro-s2", rating: 6, name: "T", email: "x@y.z", comment: "ok" } });
  check("review rating 6 -> 400", rv3.status === 400, JSON.stringify(rv3.json));
  const rv4 = await req("/api/reviews", { method: "POST", body: { rating: 5, name: "T", email: "x@y.z", comment: "ok" } });
  check("review missing slug -> 400", rv4.status === 400, JSON.stringify(rv4.json));
  const rv5 = await req("/api/reviews", { method: "POST", body: { slug: "voltgear-pro-s2", rating: 4, name: "Admin Test", email: "admin.test@voltsuite.local", comment: "regression review", image: "https://example.com/photo.jpg", category: "smartwatch", productName: "VoltGear Pro S2" } });
  check("review valid submit (with image/category/productName) -> ok", rv5.status === 200 && rv5.json?.ok === true, JSON.stringify(rv5.json));

  // checkout: invalid payment -> 400
  const co1 = await req("/api/checkout", { method: "POST", body: { items: [{ slug: "voltgear-pro-s2", name: "Pro S2", price: 14999, quantity: 1 }], customer: { name: "X", email: "x@y.z", phone: "0300 000 0001", address: "1 Test St", city: "Lahore" }, payment: { method: "card" } } });
  check("checkout non-COD payment -> 400", co1.status === 400, JSON.stringify(co1.json));

  // checkout valid -> creates order
  const co2 = await req("/api/checkout", { method: "POST", body: { items: [{ slug: "voltgear-pro-s2", name: "VoltGear Pro S2", price: 14999, quantity: 1 }], customer: { name: "Admin Test", email: "admin.test@voltsuite.local", phone: "0300 000 0002", address: "2 Test St", city: "Karachi", postal: "74000" }, payment: { method: "cod" }, subtotal: 14999, shipping: 0, total: 14999 } });
  check("checkout valid COD -> ok + orderId", co2.status === 200 && !!co2.json?.orderId, JSON.stringify(co2.json));

  // upload with cloudinary creds -> 200 + image url
  const form = new FormData();
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
  form.append("file", new Blob([png], { type: "image/png" }), "x.png");
  const up = await fetch(`${BASE}/api/upload`, { method: "POST", body: form });
  const upJson = await up.json().catch(() => null);
  check("upload with cloudinary -> 200 + image url", up.status === 200 && typeof upJson?.secureUrl === "string" && /res\.cloudinary\.com/.test(upJson.secureUrl), `${up.status} ${JSON.stringify(upJson)}`);
  if (up.status === 200) adminUploadedUrl = upJson?.secureUrl ?? "";
}

// ─────────────────────────────────────────────────────────────────────────
section("H. Admin UI pages")
{
  for (const p of ["/admin/login", "/admin/broadcast"]) {
    const res = await fetch(`${BASE}${p}`);
    check(`page ${p} -> 200`, res.status === 200, `(got ${res.status})`);
  }
  const loginHtml = await (await fetch(`${BASE}/admin/login`)).text();
  check("login page renders form", loginHtml.includes("Admin sign in") && loginHtml.includes("admin-password"));
  const bcHtml = await (await fetch(`${BASE}/admin/broadcast`)).text();
  check("broadcast page renders manager shell", bcHtml.includes("Customer Messaging"));
}

// ─────────────────────────────────────────────────────────────────────────
section("I. Cleanup")
{
  // delete the uploaded cloudinary test image
  if (adminUploadedUrl) {
    const part = adminUploadedUrl.split("/image/upload/")[1] ?? "";
    const publicId = part.split("?")[0].replace(/^v\d+\//, "").replace(/\.\w+$/, "");
    try {
      await cloudinary.uploader.destroy(publicId, { invalidate: true });
      check("cloudinary test image deleted", true);
    } catch (e) {
      check("cloudinary test image deleted", false, `${publicId} :: ${e?.message}`);
    }
  }

  // campaigns
  const all = await sanity.fetch(`*[_type=="messageCampaign"]._id`);
  for (const id of all) await sanity.delete(id);
  check(`deleted ${all.length} messageCampaign`, true);

  // broadcast doc
  const bc = await sanity.fetch(`*[_type=="broadcastSettings"]._id`);
  for (const id of bc) await sanity.delete(id);
  check(`deleted ${bc.length} broadcastSettings`, true);

  // reviews from this test
  const subs = await sanity.fetch(`*[_type=="reviewSubmission" && email=="admin.test@voltsuite.local"]._id`);
  for (const id of subs) await sanity.delete(id);
  check(`deleted ${subs.length} reviewSubmission`, true);

  // orders from this test + their email events
  const orders = await sanity.fetch(`*[_type=="order" && customer.email=="admin.test@voltsuite.local"]{_id,"oid":orderId}`);
  for (const o of orders) {
    const events = await sanity.fetch(`*[_type=="emailEvent" && email=="admin.test@voltsuite.local"]._id`);
    for (const id of events) await sanity.delete(id);
    await sanity.delete(o._id);
  }
  check(`deleted ${orders.length} test orders (+email events)`, true);

  // verify dataset back to 4 orders / 4 email events
  const orderCount = await sanity.fetch(`count(*[_type=="order"])`);
  const eventCount = await sanity.fetch(`count(*[_type=="emailEvent"])`);
  check(`dataset pristine: orders=${orderCount} emailEvents=${eventCount}`, orderCount === 4 && eventCount === 4, `got ${orderCount}/${eventCount}`);
}

// ─────────────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`);
console.log(`TOTAL: ${passed} passed, ${failed} failed`);
if (failed) {
  console.log("Failures:");
  for (const f of failures) console.log("  - " + f);
  process.exit(1);
}
console.log("ALL ADMIN TESTS PASSED ✅");
