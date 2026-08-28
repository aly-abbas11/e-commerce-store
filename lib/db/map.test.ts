import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mapProduct } from "./map";

describe("mapProduct", () => {
  it("does not expose cost_price on the public product", () => {
    const product = mapProduct({
      id: "1",
      name: "Watch",
      slug: "watch",
      category: "smartwatch",
      price: 5000,
      cost_price: 1200,
      stock_status: "in-stock",
      product_images: [],
      product_variants: [],
      product_reviews: [],
    });
    assert.equal(product?.price, 5000);
    assert.equal("costPrice" in (product ?? {}), false);
    assert.equal(JSON.stringify(product).includes("1200"), false);
    assert.equal(JSON.stringify(product).includes("cost_price"), false);
  });
});
