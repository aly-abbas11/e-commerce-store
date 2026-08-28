"use client";

import { useRef, useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";

import { dispatchAddToCartEffect } from "@/components/effects/cart-effects";
import { ProductGallery } from "@/components/product/product-gallery";
import { useCart } from "@/components/cart/cart-provider";
import { trackAddToCart } from "@/lib/analytics";
import { cloudinaryImageUrl } from "@/lib/cloudinary";
import { imageUrl } from "@/lib/sanity/image";
import { getVariantStockState } from "@/lib/stock";
import type { PublicSiteConfig } from "@/lib/site-config";
import type { Product, ProductVariant } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

function defaultVariant(product: Product): ProductVariant | null {
  const variants = product.variants ?? [];
  if (!variants.length) return null;
  return variants.find((v) => v.isDefault) ?? variants[0];
}

export function GadgetBuyBox({
  product,
  config,
}: {
  product: Product;
  config: PublicSiteConfig;
}) {
  const { addItem } = useCart();
  const [variant, setVariant] = useState<ProductVariant | null>(() => defaultVariant(product));
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const stock = getVariantStockState(product, variant);
  const outOfStock = stock.soldOut;
  const price = variant?.price ?? product.price;
  const compareAtPrice = variant?.compareAtPrice ?? product.compareAtPrice;
  const itemImage = product.images?.[0]
    ? imageUrl(product.images[0], { w: 128 })
    : product.cloudinaryImages?.[0]
      ? cloudinaryImageUrl(product.cloudinaryImages[0], { w: 128 })
      : undefined;

  function handleAdd() {
    if (outOfStock) return;
    addItem(
      {
        slug: product.slug,
        name: product.name,
        price,
        image: itemImage,
        ...(variant && hasVariants
          ? {
              variantKey: variant._key,
              variantName: variant.name,
              ...(variant.sku ? { variantSku: variant.sku } : {}),
            }
          : {}),
      },
      quantity
    );
    trackAddToCart({
      item_id: product.slug,
      item_name: product.name,
      price,
      quantity,
    });
    const btn = btnRef.current;
    if (btn) {
      const r = btn.getBoundingClientRect();
      dispatchAddToCartEffect(null, r.left + r.width / 2, r.top);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <ProductGallery product={product} />
      <div className="space-y-5">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          {product.category.replace("-", " ")}
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">{product.name}</h1>
        {product.shortDescription ? (
          <p className="text-zinc-600">{product.shortDescription}</p>
        ) : null}
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-4xl font-black">{formatPrice(price)}</span>
          {compareAtPrice && compareAtPrice > price ? (
            <span className="text-lg text-zinc-400 line-through">{formatPrice(compareAtPrice)}</span>
          ) : null}
        </div>
        <p className="text-sm font-bold uppercase tracking-wide">{stock.label}</p>
        {hasVariants ? (
          <fieldset>
            <legend className="mb-2 text-sm font-bold">Options</legend>
            <div className="flex flex-wrap gap-2">
              {product.variants!.map((v) => {
                const selected = variant?._key === v._key;
                const sold = getVariantStockState(product, v).soldOut;
                return (
                  <button
                    key={v._key ?? v.name}
                    type="button"
                    disabled={sold}
                    aria-pressed={selected}
                    onClick={() => setVariant(v)}
                    className={cn(
                      "min-h-11 rounded-sm border px-4 text-sm font-bold",
                      selected ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-300",
                      sold && "cursor-not-allowed line-through opacity-40"
                    )}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {!outOfStock ? (
            <div className="flex h-11 w-fit items-center gap-3 border border-zinc-300 px-3">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-bold">{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => Math.min(99, q + 1))} aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : null}
          <button
            ref={btnRef}
            type="button"
            disabled={outOfStock}
            onClick={handleAdd}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 bg-yellow-400 px-6 text-sm font-black uppercase tracking-wide text-zinc-950 hover:bg-yellow-300 disabled:bg-zinc-200 disabled:text-zinc-500"
          >
            {added ? (
              <>
                <Check className="h-4 w-4" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                {outOfStock ? "Sold out" : "Add to cart"}
              </>
            )}
          </button>
        </div>
        {config.codEnabled && !outOfStock ? (
          <p className="border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium">
            Cash on delivery — pay when it arrives.
          </p>
        ) : null}
      </div>
    </div>
  );
}
