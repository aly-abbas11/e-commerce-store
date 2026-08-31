"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import {
  CategoryGlyph,
  EXTRA_CATEGORY_TILES,
} from "@/components/gadget/gadget-category-glyphs";
import { gadgetImageSrc } from "@/components/gadget/gadget-image";
import { PRODUCT_IMAGE } from "@/lib/product-image";
import type { Product } from "@/lib/types";

export type CategoryIconTile = {
  label: string;
  href: string;
  product: Product;
};

type SlideTile = {
  key: string;
  label: string;
  href: string;
  image?: string;
  glyph?: string;
};

function buildSlides(tiles: CategoryIconTile[]): SlideTile[] {
  const fromProducts: SlideTile[] = tiles.map((t) => ({
    key: `p-${t.href}`,
    label: t.label,
    href: t.href,
    image: gadgetImageSrc(t.product, PRODUCT_IMAGE.card) || undefined,
  }));

  const used = new Set(
    fromProducts.flatMap((t) => [
      t.href.toLowerCase(),
      t.label.toLowerCase().replace(/\s+/g, ""),
    ])
  );

  const extras: SlideTile[] = EXTRA_CATEGORY_TILES.filter((e) => {
    const hrefKey = e.href.toLowerCase();
    const labelKey = e.label.toLowerCase().replace(/\s+/g, "");
    if (used.has(hrefKey) || used.has(labelKey)) return false;
    // also skip if a product tile already covers same category path
    if (fromProducts.some((p) => p.href === e.href)) return false;
    return true;
  }).map((e) => ({
    key: `g-${e.glyph}-${e.href}`,
    label: e.label,
    href: e.href,
    glyph: e.glyph,
  }));

  return [...fromProducts, ...extras];
}

export function GadgetShopCategories({ tiles }: { tiles: CategoryIconTile[] }) {
  const slides = useMemo(() => buildSlides(tiles), [tiles]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 6);
    setCanNext(max > 6 && el.scrollLeft < max - 6);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows, slides.length]);

  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-cat-slide]");
    const step = card ? card.offsetWidth * 3 + 48 : el.clientWidth * 0.7;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  if (!slides.length) return null;

  return (
    <section
      className="bg-[var(--g-cream)] px-4 py-8 sm:py-10 lg:px-8"
      aria-labelledby="shop-categories-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-3 sm:mb-8">
          <h2
            id="shop-categories-heading"
            className="text-xl font-bold tracking-tight text-[var(--g-charcoal)] sm:text-2xl"
          >
            Shop by{" "}
            <span className="relative inline-block">
              Categories
              <span
                className="absolute -bottom-1 left-0 h-[3px] w-[55%] rounded-full bg-[var(--g-forest)]"
                aria-hidden
              />
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous categories"
              disabled={!canPrev}
              onClick={() => scrollByDir(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--g-line)] bg-[var(--g-white)] text-[var(--g-charcoal)] transition hover:border-[var(--g-forest)] hover:text-[var(--g-forest)] disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next categories"
              disabled={!canNext}
              onClick={() => scrollByDir(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--g-line)] bg-[var(--g-white)] text-[var(--g-charcoal)] transition hover:border-[var(--g-forest)] hover:text-[var(--g-forest)] disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <Link
              href="/products2"
              className="ml-1 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--g-sage)] transition hover:text-[var(--g-forest)]"
            >
              View All
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current">
                <ArrowRight className="h-3 w-3" aria-hidden />
              </span>
            </Link>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="overflow-x-auto overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "x proximity" }}
        >
          <ul className="flex w-max gap-5 pb-1 sm:gap-6">
            {slides.map((tile) => (
              <li key={tile.key} data-cat-slide className="w-[6.5rem] shrink-0 snap-start sm:w-[7rem]">
                <Link
                  href={tile.href}
                  className="group flex flex-col items-center gap-2.5 text-center"
                >
                  <span className="relative flex h-[6rem] w-[6rem] items-center justify-center overflow-hidden rounded-full bg-[var(--g-cream-deep)] text-[var(--g-forest)] ring-1 ring-[var(--g-line)] transition duration-300 group-hover:-translate-y-0.5 group-hover:ring-[var(--g-sage)] group-hover:shadow-[0_10px_24px_rgba(31,54,38,0.12)] sm:h-[6.5rem] sm:w-[6.5rem]">
                    {tile.image ? (
                      <Image
                        src={tile.image}
                        alt=""
                        fill
                        quality={90}
                        sizes="104px"
                        className="object-contain p-3.5 transition duration-500 group-hover:scale-105"
                      />
                    ) : tile.glyph ? (
                      <CategoryGlyph name={tile.glyph} className="h-12 w-12 sm:h-14 sm:w-14" />
                    ) : null}
                  </span>
                  <span className="line-clamp-2 min-h-[2.4em] text-[12px] font-semibold leading-snug text-[var(--g-charcoal)] sm:text-[13px]">
                    {tile.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
