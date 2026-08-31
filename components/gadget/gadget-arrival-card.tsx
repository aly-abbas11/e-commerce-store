"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight, Check, Star } from "lucide-react";

import { dispatchAddToCartEffect } from "@/components/effects/cart-effects";
import { useCart } from "@/components/cart/cart-provider";
import { gadgetImageSrc } from "@/components/gadget/gadget-image";
import { salePercent } from "@/components/gadget/gadget-sale";
import { trackAddToCart } from "@/lib/analytics";
import { product2Href } from "@/lib/gadget-preview";
import { PRODUCT_IMAGE } from "@/lib/product-image";
import { getStockState } from "@/lib/stock";
import type { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

const SWATCH = ["#1a1a1a", "#c4a574", "#8fa888", "#5c6b7a", "#efeae0", "#6b4f3a"];

function statusLine(product: Product): string {
  const stock = getStockState(product.stockStatus);
  if (stock.soldOut) return "Out of stock";
  if ((stock as { low?: boolean }).low) return "LOW STOCK";
  if (product.featured) return "Most Popular";
  if (product.badge?.trim()) return product.badge.trim();
  if (product.shortDescription) {
    return product.shortDescription.replace(/\s+/g, " ").trim().slice(0, 42);
  }
  return "In stock · Ready to ship";
}

function tagLine(product: Product, off: number | null): string {
  if (product.badge?.trim()) return product.badge.trim().toUpperCase();
  if (product.features?.[0]) return product.features[0].toUpperCase();
  if (off && product.compareAtPrice) {
    return `WAS ${formatPrice(product.compareAtPrice).toUpperCase()}`;
  }
  if (product.featured) return "TRENDING";
  return "NEW ARRIVAL";
}

function swatches(product: Product) {
  const variants = product.variants ?? [];
  if (variants.length < 2) return { shown: [] as { key: string; color: string; label: string }[], extra: 0 };
  const shown = variants.slice(0, 3).map((v, i) => ({
    key: v._key || v.name || String(i),
    color: SWATCH[i % SWATCH.length],
    label: v.name,
  }));
  return { shown, extra: Math.max(0, variants.length - shown.length) };
}

export function GadgetArrivalCard({
  product,
  variant = "rail",
}: {
  product: Product;
  variant?: "rail" | "grid";
}) {
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const image = gadgetImageSrc(product, PRODUCT_IMAGE.card);
  const stock = getStockState(product.stockStatus);
  const href = product2Href(product.slug);
  const off = salePercent(product.price, product.compareAtPrice);
  const priceNow = formatPrice(product.price);
  const priceWas =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? formatPrice(product.compareAtPrice)
      : "";
  const rating = product.rating != null && product.rating > 0 ? product.rating : 4.8;
  const { shown, extra } = swatches(product);
  const tag = tagLine(product, off);
  const isGrid = variant === "grid";

  function handleBuy() {
    if (stock.soldOut) return;
    const defaultVariant =
      product.variants?.find((v) => v.isDefault) ?? product.variants?.[0] ?? null;
    const price = defaultVariant?.price ?? product.price;
    const itemImage = gadgetImageSrc(product, PRODUCT_IMAGE.thumb) || undefined;

    addItem(
      {
        slug: product.slug,
        name: product.name,
        price,
        image: itemImage,
        ...(defaultVariant
          ? {
              variantKey: defaultVariant._key,
              variantName: defaultVariant.name,
              ...(defaultVariant.sku ? { variantSku: defaultVariant.sku } : {}),
            }
          : {}),
      },
      1
    );
    trackAddToCart({
      item_id: product.slug,
      item_name: product.name,
      price,
      quantity: 1,
    });
    const btn = btnRef.current;
    if (btn) {
      const r = btn.getBoundingClientRect();
      dispatchAddToCartEffect(null, r.left + r.width / 2, r.top);
    }
    setAdded(true);
    openCart();
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article
      className={cn(
        "gadget-hover-lift gadget-surface group relative flex flex-col overflow-hidden rounded-[1.35rem]",
        isGrid ? "h-full w-full" : "w-[15.5rem] shrink-0 sm:w-[16.75rem]"
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--g-sage)]/50 to-transparent"
        aria-hidden
      />

      <Link
        href={href}
        prefetch={false}
        className={cn(
          "relative block overflow-hidden bg-[linear-gradient(165deg,var(--g-cream-deep),color-mix(in_srgb,var(--g-cream)_70%,white))]",
          isGrid
            ? "mx-2 mt-2 aspect-[4/5] rounded-[1.05rem] sm:mx-2.5 sm:mt-2.5 sm:aspect-square"
            : "mx-3 mt-3 aspect-square rounded-[1.1rem]"
        )}
      >
        <span className="absolute left-2 top-2 z-10 max-w-[72%] truncate rounded-full border border-[var(--g-forest)]/10 bg-[var(--g-cream)]/92 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--g-forest)] backdrop-blur-sm sm:left-2.5 sm:top-2.5 sm:text-[10px]">
          {tag}
        </span>
        {off ? (
          <span className="absolute right-2 top-2 z-10 rounded-md bg-[var(--g-forest)] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[var(--g-cream)] shadow-[0_6px_14px_rgba(31,54,38,0.25)] sm:right-2.5 sm:top-2.5 sm:text-[10px]">
            −{off}%
          </span>
        ) : null}
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            quality={92}
            sizes={isGrid ? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" : "268px"}
            className="object-contain p-3 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] sm:p-4"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-[var(--g-taupe)]">
            No image
          </span>
        )}
        <span
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100"
          aria-hidden
        />
      </Link>

      <div
        className={cn(
          "flex flex-1 flex-col",
          isGrid ? "px-2.5 pb-2.5 pt-2.5 sm:px-3 sm:pb-3 sm:pt-3" : "px-3.5 pb-3.5 pt-3"
        )}
      >
        <Link href={href} prefetch={false} className="min-w-0">
          <h3
            className={cn(
              "font-semibold tracking-tight text-[var(--g-charcoal)] transition group-hover:text-[var(--g-forest)]",
              isGrid
                ? "line-clamp-2 text-[13px] leading-snug sm:text-[14px]"
                : "truncate text-[15px]"
            )}
          >
            {product.name}
          </h3>
        </Link>

        <p className="mt-0.5 truncate text-[11px] text-[var(--g-taupe)] sm:text-[12px]">
          {statusLine(product)}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex min-h-[1rem] items-center gap-1">
            {shown.map((s) => (
              <span
                key={s.key}
                title={s.label}
                className="h-3 w-3 rounded-full ring-1 ring-black/10 sm:h-3.5 sm:w-3.5"
                style={{ backgroundColor: s.color }}
              />
            ))}
            {extra > 0 ? (
              <span className="pl-0.5 text-[10px] font-medium text-[var(--g-taupe)] sm:text-[11px]">
                +{extra}
              </span>
            ) : null}
          </div>
          <div
            className="inline-flex items-center gap-1 rounded-full bg-[var(--g-cream-deep)] px-2 py-0.5 text-[11px] font-medium text-[var(--g-charcoal)] sm:text-[12px]"
            aria-label={`Rated ${rating.toFixed(1)} out of 5`}
          >
            <Star className="h-3 w-3 fill-amber-400 text-amber-400 sm:h-3.5 sm:w-3.5" aria-hidden />
            {rating.toFixed(1)}
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5 sm:pt-3">
          <p className="min-w-0 leading-tight">
            {priceWas ? (
              <span className="block text-[10px] text-[var(--g-taupe)] line-through sm:text-[11px]">
                {priceWas}
              </span>
            ) : (
              <span className="block h-[13px]" aria-hidden />
            )}
            <span className="gadget-display text-[1.05rem] font-semibold tabular-nums text-[var(--g-charcoal)] sm:text-[1.15rem]">
              {priceNow}
            </span>
          </p>

          {stock.soldOut ? (
            <Link
              href={href}
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-[var(--g-cream-deep)] px-3 text-[11px] font-semibold text-[var(--g-taupe)] sm:px-4 sm:text-[12px]"
            >
              View
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : (
            <button
              ref={btnRef}
              type="button"
              onClick={handleBuy}
              className="gadget-btn-primary gadget-press inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-[11px] font-semibold sm:px-4 sm:text-[12px]"
            >
              {added ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  Added
                </>
              ) : (
                <>
                  Buy
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-90 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
