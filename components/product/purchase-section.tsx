"use client";

import { useMemo, useRef, useState } from "react";
import {
  Banknote,
  Check,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BuyNow } from "@/components/product/buy-now";
import { ProductGallery } from "@/components/product/product-gallery";
import { StarRating } from "@/components/product/star-rating";
import { useCart } from "@/components/cart/cart-provider";
import { trackAddToCart } from "@/lib/analytics";
import { cloudinaryImageUrl } from "@/lib/cloudinary";
import { imageUrl } from "@/lib/sanity/image";
import { PRODUCT_IMAGE } from "@/lib/product-image";
import { getVariantStockState } from "@/lib/stock";
import type { PublicSiteConfig } from "@/lib/site-config";
import type { Product, ProductVariant } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { dispatchAddToCartEffect } from "@/components/effects/cart-effects";

function defaultVariant(product: Product): ProductVariant | null {
  const variants = product.variants ?? [];
  if (!variants.length) return null;
  return variants.find((v) => v.isDefault) ?? variants[0];
}

export function PurchaseSection({
  product,
  config,
}: {
  product: Product;
  config: PublicSiteConfig;
}) {
  const { addItem } = useCart();
  const [variant, setVariant] = useState<ProductVariant | null>(() =>
    defaultVariant(product)
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const hasVariants = (product.variants?.length ?? 0) > 0;
  const stock = getVariantStockState(product, variant);
  const outOfStock = stock.soldOut;

  const price = variant?.price ?? product.price;
  const compareAtPrice =
    variant?.compareAtPrice ?? product.compareAtPrice;
  const discount =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

  const selectedVariantImage = useMemo(() => {
    const v = variant;
    if (!v?.image) return null;
    return {
      src: imageUrl(v.image, { w: PRODUCT_IMAGE.gallery }),
      thumb: imageUrl(v.image, { w: PRODUCT_IMAGE.thumb }),
      alt: `${product.name} — ${v.name}`,
    };
  }, [variant, product.name]);

  const itemImage =
    product.images?.[0]
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
        productId: product._id,
        ...(variant && hasVariants
          ? {
              variantKey: variant._key,
              variantId: variant._key,
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
    <div className="grid gap-10 lg:grid-cols-2">
      <ProductGallery product={product} variantImage={selectedVariantImage} />

      <div className="space-y-5">
        {/* Title / identity */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.brand && (
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                {product.brand}
              </span>
            )}
            {typeof product.reviewCount === "number" &&
              product.reviewCount > 0 && (
                <a
                  href="#reviews"
                  className="flex items-center gap-2 rounded transition-colors hover:text-primary"
                >
                  <StarRating rating={product.rating} size={18} />
                  <span className="text-sm text-muted-foreground">
                    {product.rating ?? 0}/5 · {product.reviewCount}{" "}
                    {product.reviewCount === 1 ? "review" : "reviews"}
                  </span>
                </a>
              )}
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          {product.shortDescription && (
            <p className="mt-3 text-muted-foreground">
              {product.shortDescription}
            </p>
          )}
          {product.sku && (
            <p className="mt-1 text-xs text-muted-foreground">
              SKU: {product.sku}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-3xl font-bold">{formatPrice(price)}</span>
          {discount > 0 && compareAtPrice ? (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(compareAtPrice)}
              </span>
              <Badge variant="destructive" className="bg-destructive text-white">
                Save {discount}%
              </Badge>
            </>
          ) : null}
        </div>

        {/* Stock */}
        <div className="flex items-center gap-2">
          <Badge variant={stock.badgeVariant}>{stock.label}</Badge>
          {product.badge && <Badge>{product.badge}</Badge>}
        </div>

        {/* Variants */}
        {hasVariants && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Options</legend>
            <div className="flex flex-wrap gap-2">
              {product.variants!.map((v) => {
                const vStock = getVariantStockState(product, v);
                const selected = variant?._key === v._key;
                return (
                  <button
                    key={v._key ?? v.name}
                    type="button"
                    disabled={vStock.soldOut}
                    aria-pressed={selected}
                    aria-label={`${v.name}${vStock.soldOut ? " (sold out)" : ""}`}
                    onClick={() => setVariant(v)}
                    className={cn(
                      "min-h-11 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:border-primary/50",
                      vStock.soldOut &&
                        "cursor-not-allowed border-dashed text-muted-foreground/50 line-through"
                    )}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {/* Quantity + Add to Cart + Buy Now */}
        <div className="flex flex-col gap-3">
          {!outOfStock && (
            <div className="flex items-center gap-3 rounded-md border px-3 py-2 w-fit">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              ref={btnRef}
              size="lg"
              className="flex-1 sm:px-10"
              disabled={outOfStock}
              onClick={handleAdd}
            >
              {added ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {outOfStock ? "Sold Out" : "Add to Cart"}
                </>
              )}
            </Button>
            {!outOfStock && (
              <BuyNow
                product={product}
                variant={variant}
                quantity={quantity}
                image={itemImage}
              />
            )}
          </div>
        </div>

        {/* COD reassurance */}
        {config.codEnabled && !outOfStock && (
          <p className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3 text-sm">
            <Banknote className="h-4 w-4 shrink-0 text-primary" />
            <span>
              <span className="font-semibold">Cash on Delivery available</span>{" "}
              — pay when your order arrives.
            </span>
          </p>
        )}

        {/* Shipping / warranty / returns */}
        <div className="grid gap-3 rounded-lg border bg-muted/40 p-4 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 shrink-0 text-primary" />
            <span>
              {config.freeShippingThreshold > 0
                ? `Free shipping over ${formatPrice(config.freeShippingThreshold)}`
                : "Shipping calculated at checkout"}
            </span>
          </div>
          {config.warrantyMonths ? (
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              <span>
                {config.warrantyMonths >= 12 &&
                config.warrantyMonths % 12 === 0
                  ? `${config.warrantyMonths / 12}-year warranty`
                  : `${config.warrantyMonths}-month warranty`}
              </span>
            </div>
          ) : null}
          {config.returnWindowDays ? (
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 shrink-0 text-primary" />
              <span>Returns within {config.returnWindowDays} days</span>
            </div>
          ) : null}
          {config.shippingFee > 0 && (
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 shrink-0 text-primary" />
              <span>Standard shipping {formatPrice(config.shippingFee)}</span>
            </div>
          )}
        </div>

        {/* WhatsApp compatibility help */}
        {config.whatsappNumber && (
          <a
            href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:underline"
          >
            <MessageCircle className="h-4 w-4" />
            Need help with compatibility? Chat on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}