/**
 * Accuracy check against live orders. Does not print customer emails/phones.
 */
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

import {
  buildExecutiveSnapshot,
  drillOrdersByIds,
  firstReachedAt,
  isoInRange,
  liveOrders,
  resolveAnalyticsRange,
} from "../lib/db/analytics-rules";
import { fetchProductCostRows } from "../lib/db/admin-store";
import { getAllOrders } from "../lib/order-store";
import { mapProduct } from "../lib/db/map";

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

function money(n: number | null | undefined) {
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

async function main() {
  const orders = await getAllOrders();
  const costs = await fetchProductCostRows();
  const range = resolveAnalyticsRange("last30");
  const snap = buildExecutiveSnapshot(orders, range, costs);
  const live = liveOrders(orders);

  const placed = live.filter((o) => isoInRange(o.createdAt, range));
  const delivered = live.filter(
    (o) => o.status !== "cancelled" && isoInRange(firstReachedAt(o, "delivered"), range)
  );
  const independentDeliveredRevenue = delivered.reduce((s, o) => s + money(o.total), 0);
  const demoCount = orders.filter((o) => o.isDemo).length;
  const demoInSnap = snap.placedOrderIds.some((id) => orders.find((o) => o.orderId === id)?.isDemo);

  assert.equal(snap.ordersPlaced, placed.length, `placed ${snap.ordersPlaced} vs ${placed.length} ids snap=${snap.placedOrderIds.join(",")} live=${placed.map((o) => o.orderId).join(",")}`);
  assert.equal(
    snap.ordersDelivered,
    delivered.length,
    `delivered ${snap.ordersDelivered} vs ${delivered.length} ids snap=${snap.deliveredOrderIds.join(",")} live=${delivered.map((o) => o.orderId).join(",")}`
  );
  assert.equal(snap.deliveredRevenue, independentDeliveredRevenue, `revenue ${snap.deliveredRevenue} vs ${independentDeliveredRevenue}`);
  assert.ok(delivered.every((o) => o.status !== "cancelled"));
  assert.equal(demoInSnap, false);
  const blob = JSON.stringify(snap);
  assert.ok(!blob.toLowerCase().includes("\"email\""));
  assert.ok(!JSON.stringify(drillOrdersByIds(orders, snap.deliveredOrderIds.slice(0, 20))).includes("@"));

  const drill = drillOrdersByIds(orders, snap.deliveredOrderIds.slice(0, 20));
  assert.ok(!JSON.stringify(drill).includes("@"));
  for (const row of drill) {
    assert.equal("email" in row, false);
    assert.equal("phone" in row, false);
  }

  const mapped = mapProduct({
    id: "x",
    name: "x",
    slug: "x",
    price: 1,
    cost_price: 999,
    stock_status: "in-stock",
  });
  assert.equal(JSON.stringify(mapped).includes("999"), false);

  const origin = "http://localhost:3000";
  const unauth = await fetch(`${origin}/api/admin/analytics`);
  assert.equal(unauth.status, 401);

  const publicProducts = await fetch(`${origin}/api/store/products`);
  const publicJson = await publicProducts.text();
  assert.equal(publicJson.includes("cost_price"), false);
  assert.equal(publicJson.includes("costPrice"), false);

  const token = process.env.ADMIN_TOKEN || process.env.REVALIDATION_TOKEN || "";
  if (token) {
    const auth = await fetch(`${origin}/api/admin/analytics?preset=last30`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const authText = await auth.text();
    assert.equal(auth.status, 200, authText);
    const body = JSON.parse(authText);
    assert.equal(body.executive.deliveredRevenue, snap.deliveredRevenue, "api delivered revenue");
    if (body.executive.ordersPlaced !== snap.ordersPlaced) {
      const apiIds: string[] = body.executive.placedOrderIds ?? [];
      const extra = snap.placedOrderIds.filter((id) => !apiIds.includes(id));
      const missing = apiIds.filter((id: string) => !snap.placedOrderIds.includes(id));
      const extraMeta = extra.map((id) => {
        const o = orders.find((row) => row.orderId === id);
        return { id, isDemo: Boolean(o?.isDemo), status: o?.status, createdAt: o?.createdAt };
      });
      const allDemo = extraMeta.every((m) => m.isDemo);
      if (!allDemo) {
        throw new Error(
          `placed mismatch range api=${JSON.stringify(body.range)} script=${JSON.stringify(snap.range)} extraInScript=${JSON.stringify(extraMeta)} extraInApi=${missing.join(",")}`
        );
      }
    }
    const payload = JSON.stringify(body);
    assert.equal(payload.includes('"email"'), false);
    assert.equal(payload.includes('"phone"'), false);

    const sql = await fetch(`${origin}/api/admin/analytics/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ metric: "select * from orders", preset: "last30" }),
    });
    assert.equal(sql.status, 422);

    const q = await fetch(`${origin}/api/admin/analytics/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ metric: "deliveredRevenue", dimension: "city", preset: "last30" }),
    });
    assert.equal(q.status, 200);
    const qj = await q.json();
    assert.ok(Array.isArray(qj.rows));
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        range: snap.range,
        liveOrders: live.length,
        demoExcluded: demoCount,
        ordersPlaced: snap.ordersPlaced,
        ordersDelivered: snap.ordersDelivered,
        placedRevenue: snap.placedRevenue,
        deliveredRevenue: snap.deliveredRevenue,
        deliveryRate: snap.deliverySuccessRate,
        profitIncomplete: snap.profitIncomplete,
        products: (await import("../lib/db/analytics-rules")).buildProductPerformance(orders, range, costs).length,
        cities: (await import("../lib/db/analytics-rules")).buildCityPerformance(orders, range).length,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
