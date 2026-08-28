import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cloudinaryImageUrl } from "./cloudinary";

describe("cloudinaryImageUrl", () => {
  it("limits width without stretching a small original", () => {
    const src =
      "https://res.cloudinary.com/demo/image/upload/v1/folder/watch.jpg";
    const url = cloudinaryImageUrl(src, { w: 2000 });
    assert.match(url, /c_limit,w_2000/);
    assert.match(url, /f_auto,q_auto/);
  });
});
