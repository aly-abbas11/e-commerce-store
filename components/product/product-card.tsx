"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { StarRating } from "@/components/product/star-rating";
import { QuickViewButton } from "@/components/product/quick-view";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { CompareButton } from "@/components/product/product-comparison";
import { PRODUCT_IMAGE } from "@/lib/product-image";
import { imageUrl } from "@/lib/sanity/image";
import { getStockState, getDefaultVariant } from "@/lib/stock";
import type { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-provider";
import { dispatchAddToCartEffect } from "@/components/effects/cart-effects";
import { triggerCartParticleBurst } from "@/components/effects/anime-burst";

import { getFallbackProductImage } from "@/lib/fallback-images";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { addItem } = useCart();
  const dbImage = product.images?.[0] || (product.cloudinaryImages?.[0] as unknown);
  let resolvedSrc = imageUrl(dbImage, { w: PRODUCT_IMAGE.card });
  if (!resolvedSrc) {
    resolvedSrc = getFallbackProductImage(product);
  }

  const stock = getStockState(product.stockStatus);
  const outOfStock = stock.soldOut;
  const defaultVariant = getDefaultVariant(product);
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const variantPurchasable =
    defaultVariant && getStockState(defaultVariant.stockStatus).purchasable;
  const canDirectAdd = !hasVariants || variantPurchasable;
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;
  const hasRealReviews =
    typeof product.reviewCount === "number" && product.reviewCount > 0 &&
    typeof product.rating === "number" && product.rating > 0;
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <div className={cn("group relative flex h-full flex-col bg-white rounded-[22px] border border-[#13A387]/5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:border-[#13A387]/15", className)}>
      {/* Image area */}
      <div className="relative aspect-[4/5] sm:aspect-square overflow-hidden bg-[#F4F9F8]/60 rounded-t-[22px] border-b border-[#13A387]/5 transition-colors duration-300">
        <Link href={`/product/${product.slug}`} prefetch={false} className="absolute inset-0 z-10 w-full h-full">
          <span className="sr-only">View {product.name}</span>
        </Link>

        {resolvedSrc ? (
          <Image
            ref={imgRef}
            src={resolvedSrc}
            alt={product.name}
            fill
            quality={90}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}

        {/* Figma Style Badges - Top Left */}
        <div className="absolute left-3 top-3 z-20 flex flex-wrap items-center gap-1.5">
          {discount > 0 && (
            <div className="flex items-center justify-center rounded bg-red-500 text-white px-2 py-0.5 text-[10px] font-bold tracking-wider shadow-sm">
              -{discount}%
            </div>
          )}
          {product.badge && (
            <div className="flex items-center justify-center rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              {product.badge}
            </div>
          )}
        </div>

        {/* Hover action icons — Top Right */}
        <div className="absolute right-3 top-3 z-20 flex flex-col gap-1.5">
          <WishlistButton product={product} />
          <div className="opacity-0 transition-all duration-300 translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 focus-within:opacity-100 flex flex-col gap-1.5">
            <QuickViewButton product={product} />
            <CompareButton slug={product.slug} />
          </div>
        </div>
      </div>

      {/* Product info below image */}
      <div className="flex flex-col flex-1 p-5 text-center items-center gap-3">

        {/* Rating above title */}
        {hasRealReviews ? (
          <div className="flex items-center gap-1 opacity-70">
            <StarRating rating={product.rating ?? 0} size={10} />
          </div>
        ) : (
           <div className="h-[10px]" aria-hidden="true" />
        )}

        {/* Product name */}
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-1 truncate px-2 text-[14px] font-semibold text-foreground transition-colors duration-300 hover:text-primary max-w-full"
        >
          {product.name}
        </Link>

        {/* Price row */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-auto">
          <span className="text-[14px] font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-[12px] text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Action Button - Always visible below price */}
        <div className="w-full mt-2">
          {outOfStock ? (
             <span className="text-[13px] font-bold text-destructive">Waitlist Available</span>
          ) : (
            <>
              {canDirectAdd ? (
                <button
                  type="button"
                  className="w-full rounded-md bg-primary py-2.5 text-[13px] font-bold tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm flex items-center justify-center"
                  onClick={(e) => {
                    e.preventDefault();
                    triggerCartParticleBurst(e.clientX, e.clientY);
                    addItem({
                      slug: product.slug,
                      name: product.name,
                      price: defaultVariant?.price ?? product.price,
                      image: resolvedSrc || undefined,
                      productId: product._id,
                      ...(defaultVariant
                        ? {
                            variantKey: defaultVariant._key,
                            variantId: defaultVariant._key,
                            variantName: defaultVariant.name,
                            ...(defaultVariant.sku ? { variantSku: defaultVariant.sku } : {}),
                          }
                        : {}),
                    });
                    dispatchAddToCartEffect(imgRef.current);
                  }}
                >
                  Add to Cart
                </button>
              ) : (
                <Link
                  href={`/product/${product.slug}`}
                  className="w-full flex items-center justify-center rounded-md bg-secondary py-2.5 text-[13px] font-bold tracking-wide text-secondary-foreground transition-colors hover:bg-secondary/80 shadow-sm"
                >
                  View Details
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
