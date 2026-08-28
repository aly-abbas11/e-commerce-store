import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  bccList,
  buildOrderConfirmationEmail,
  buildOrderStatusEmail,
} from "./email-rules";

const confirm = {
  orderId: "VG-TEST1",
  name: "Ali Khan",
  email: "ali@example.com",
  items: [{ name: "Charger", price: 1999, quantity: 1, variantName: "White" }],
  total: 1999,
  phone: "03001234567",
  address: "House 1, Street 2",
  city: "Lahore",
  postal: "54000",
};

describe("buildOrderConfirmationEmail", () => {
  it("uses a light shell, COD, items, address, and a track link", () => {
    const msg = buildOrderConfirmationEmail(confirm);
    assert.equal(msg.html.includes("#0b0f19"), false);
    assert.equal(msg.html.includes("VG-TEST1"), true);
    assert.equal(msg.html.includes("Charger"), true);
    assert.match(msg.html, /cash on delivery/i);
    assert.equal(msg.html.includes("House 1, Street 2"), true);
    assert.equal(
      msg.html.includes("/track?orderId=VG-TEST1&email=ali%40example.com"),
      true
    );
  });
});

describe("buildOrderStatusEmail", () => {
  it("shows the note and never includes phone or address", () => {
    const msg = buildOrderStatusEmail({
      orderId: "VG-TEST1",
      name: "Ali Khan",
      status: "shipped",
      note: "Tracking: PKG-1",
      email: "ali@example.com",
      phone: "03001234567",
      address: "House 1, Street 2",
    });
    assert.equal(msg.html.includes("#0b0f19"), false);
    assert.equal(msg.html.includes("Tracking: PKG-1"), true);
    assert.equal(msg.html.includes("03001234567"), false);
    assert.equal(msg.html.includes("House 1"), false);
    assert.equal(
      msg.html.includes("/track?orderId=VG-TEST1&email=ali%40example.com"),
      true
    );
  });
});

describe("bccList", () => {
  it("returns the notify address on confirmation when it differs from the customer", () => {
    assert.deepEqual(bccList("ali@example.com", "shop@voltgear.store"), [
      "shop@voltgear.store",
    ]);
  });

  it("returns empty when notify is missing or the same as the customer", () => {
    assert.deepEqual(bccList("ali@example.com", undefined), []);
    assert.deepEqual(bccList("ali@example.com", "  "), []);
    assert.deepEqual(bccList("ali@example.com", "Ali@example.com"), []);
  });
});
