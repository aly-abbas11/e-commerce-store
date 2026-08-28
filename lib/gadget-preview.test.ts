import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isGadgetPreviewPath,
  product2Href,
  videoEmbedSrc,
  videoKind,
} from "./gadget-preview";

describe("isGadgetPreviewPath", () => {
  it("treats home2 and product2 as preview, not the live shop", () => {
    assert.equal(isGadgetPreviewPath("/home2"), true);
    assert.equal(isGadgetPreviewPath("/product2/pad"), true);
    assert.equal(isGadgetPreviewPath("/"), false);
    assert.equal(isGadgetPreviewPath("/product/pad"), false);
    assert.equal(isGadgetPreviewPath("/products"), false);
  });
});

describe("product2Href", () => {
  it("builds the preview product URL", () => {
    assert.equal(product2Href("wireless-15w-pad"), "/product2/wireless-15w-pad");
  });
});

describe("videoKind", () => {
  it("classifies Cloudinary/mp4, Instagram, TikTok, and empty", () => {
    assert.equal(videoKind(undefined, "products/clip"), "file");
    assert.equal(videoKind("https://res.cloudinary.com/demo/video/upload/x.mp4"), "file");
    assert.equal(videoKind("https://cdn.example.com/demo.mp4"), "file");
    assert.equal(videoKind("https://www.instagram.com/reel/abc123/"), "instagram");
    assert.equal(videoKind("https://www.tiktok.com/@shop/video/123"), "tiktok");
    assert.equal(videoKind(""), "none");
    assert.equal(videoKind(undefined, undefined), "none");
  });
});

describe("videoEmbedSrc", () => {
  it("builds Instagram and TikTok embed URLs", () => {
    assert.equal(
      videoEmbedSrc("instagram", "https://www.instagram.com/reel/abc123/"),
      "https://www.instagram.com/reel/abc123/embed"
    );
    assert.equal(
      videoEmbedSrc("tiktok", "https://www.tiktok.com/@shop/video/123"),
      "https://www.tiktok.com/embed/@shop/video/123"
    );
    assert.equal(videoEmbedSrc("file", "https://cdn.example.com/x.mp4"), null);
    assert.equal(videoEmbedSrc("none", ""), null);
  });
});
