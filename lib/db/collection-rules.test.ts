import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { canSaveCollection, slugifyCollectionName } from "./collection-rules";

describe("collection-rules", () => {
  it("slugifies names", () => {
    assert.equal(slugifyCollectionName("New Arrivals!"), "new-arrivals");
  });

  it("requires name and valid auto rule", () => {
    assert.equal(canSaveCollection({ name: "", mode: "manual" }).ok, false);
    assert.equal(
      canSaveCollection({ name: "Best", mode: "auto", autoRule: null }).ok,
      false
    );
    assert.equal(
      canSaveCollection({
        name: "Best",
        mode: "auto",
        autoRule: "bestsellers",
      }).ok,
      true
    );
  });
});
