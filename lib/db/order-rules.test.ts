import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Order } from "../types";
import {
  emailsMatch,
  isAllowedOrderStatus,
  shopperLookupNotFound,
  toAdminListRow,
  toAdminOrderListItem,
  toShopperTrackPayload,
  withStatusNote,
} from "./order-rules";

const sample: Order = {
  _id: "1",
  orderId: "VG-TEST1",
  createdAt: "2026-08-26T10:00:00.000Z",
  customer: {
    name: "Ali Khan",
    email: "ali@example.com",
    phone: "03001234567",
    address: "House 1, Street 2",
    city: "Lahore",
    postal: "54000",
  },
  items: [{ name: "Charger", price: 1999, quantity: 1, variantName: "White" }],
  payment: "cod",
  subtotal: 1999,
  shipping: 0,
  total: 1999,
  status: "new",
  statusHistory: [],
};

describe("toShopperTrackPayload", () => {
  it("never includes phone or address", () => {
    const payload = toShopperTrackPayload(sample);
    const json = JSON.stringify(payload);
    assert.equal(json.includes("03001234567"), false);
    assert.equal(json.includes("House 1"), false);
    assert.equal("customer" in payload, false);
    assert.equal(payload.orderId, "VG-TEST1");
    assert.equal(payload.items[0].name, "Charger");
  });
});

describe("shopperLookupNotFound", () => {
  it("treats a missing order as not found", () => {
    assert.equal(shopperLookupNotFound(null, "ali@example.com"), true);
  });

  it("treats a wrong email as not found (same as missing)", () => {
    assert.equal(shopperLookupNotFound(sample, "other@example.com"), true);
  });

  it("allows the checkout email", () => {
    assert.equal(shopperLookupNotFound(sample, "Ali@example.com"), false);
  });
});

describe("toAdminListRow", () => {
  it("only exposes table fields, not address", () => {
    const row = toAdminListRow(sample);
    assert.deepEqual(Object.keys(row).sort(), [
      "createdAt",
      "customerName",
      "orderId",
      "status",
      "total",
    ]);
    assert.equal(row.customerName, "Ali Khan");
    assert.equal("address" in row, false);
    assert.equal("phone" in row, false);
  });
});

describe("toAdminOrderListItem", () => {
  it("adds isDemo without changing the compact table keys", () => {
    const item = toAdminOrderListItem({ ...sample, isDemo: true });
    assert.equal(item.isDemo, true);
    assert.equal(item.customerEmail, "ali@example.com");
    const row = toAdminListRow({ ...sample, isDemo: true });
    assert.equal("isDemo" in row, false);
  });
});

describe("isAllowedOrderStatus", () => {
  it("accepts any of the five statuses", () => {
    for (const s of ["new", "processing", "shipped", "delivered", "cancelled"]) {
      assert.equal(isAllowedOrderStatus(s), true);
    }
    assert.equal(isAllowedOrderStatus("refunded"), false);
  });
});

describe("withStatusNote", () => {
  it("stores the note on the history entry when provided", () => {
    const entry = withStatusNote("shipped", "Tracking: PKG-1");
    assert.equal(entry.status, "shipped");
    assert.equal(entry.note, "Tracking: PKG-1");
    assert.ok(entry.at);
  });

  it("omits note when empty", () => {
    const entry = withStatusNote("delivered", "  ");
    assert.equal(entry.note, undefined);
  });
});

describe("emailsMatch", () => {
  it("compares emails case-insensitively", () => {
    assert.equal(emailsMatch("Ali@example.com", "ali@example.com"), true);
    assert.equal(emailsMatch("a@b.com", "c@d.com"), false);
  });
});
