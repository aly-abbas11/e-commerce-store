import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { telHref, whatsappHref } from "./contact-links";

describe("whatsappHref", () => {
  it("builds wa.me from Pakistani mobiles", () => {
    assert.equal(whatsappHref("0300 1234567"), "https://wa.me/923001234567");
    assert.equal(whatsappHref("+92 300 1234567"), "https://wa.me/923001234567");
  });

  it("returns null for empty or short values", () => {
    assert.equal(whatsappHref(null), null);
    assert.equal(whatsappHref(""), null);
    assert.equal(whatsappHref("123"), null);
  });
});

describe("telHref", () => {
  it("builds tel links", () => {
    assert.equal(telHref("0300 1234567"), "tel:03001234567");
  });

  it("returns null when missing", () => {
    assert.equal(telHref(null), null);
    assert.equal(telHref("12"), null);
  });
});
