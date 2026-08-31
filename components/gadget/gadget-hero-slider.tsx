"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { resolveSlideCta } from "@/lib/db/hero-slide-rules";
import type { GadgetCreativeBanner } from "@/lib/gadget-creatives";
import { product2Href } from "@/lib/gadget-preview";
import type { HeroSlide } from "@/lib/types";

const INTERVAL_MS = 5500;
const FADE_MS = 700;

export type GadgetHeroBanner = {
  id: string;
  title: string;
  imageUrl: string;
  href: string;
  ctaDisabled?: boolean;
};

function fromAdminSlides(slides: HeroSlide[]): GadgetHeroBanner[] {
  return slides.map((slide) => {
    const cta = resolveSlideCta(slide.product.stockStatus);
    return {
      id: slide.id,
      title: slide.title || "Campaign",
      imageUrl: slide.imageUrl,
      href: product2Href(slide.product.slug),
      ctaDisabled: cta.disabled,
    };
  });
}

export function GadgetHeroSlider({
  slides = [],
  fallbackBanners = [],
}: {
  slides?: HeroSlide[];
  fallbackBanners?: GadgetCreativeBanner[];
}) {
  const banners: GadgetHeroBanner[] =
    slides.length > 0
      ? fromAdminSlides(slides)
      : fallbackBanners.map((b) => ({
          id: b.id,
          title: b.title,
          imageUrl: b.imageUrl,
          href: b.href,
        }));

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (banners.length <= 1 || paused || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [banners.length, paused, reduceMotion]);

  if (banners.length === 0) {
    return (
      <div className="bg-[var(--g-cream)] px-4 py-10 lg:px-8">
        <div className="rounded-2xl border border-[var(--g-line)] bg-[var(--g-white)] px-4 py-16 text-center">
          <p className="text-sm text-[var(--g-taupe)]">
            No published hero slides yet. Add a full campaign banner image in Admin → Hero.
          </p>
        </div>
      </div>
    );
  }

  const active = banners[index] ?? banners[0];

  function go(i: number) {
    setIndex(i);
  }

  return (
    <section
      className="bg-[var(--g-cream)] px-3 pt-3 pb-2 sm:px-4 sm:pt-4 lg:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Campaign banners"
    >
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] border border-[var(--g-line)] bg-[var(--g-forest)] shadow-[0_20px_50px_rgba(31,54,38,0.18)]">
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9] lg:aspect-[2.4/1] lg:min-h-[320px]">
          {banners.map((banner, i) => {
            const isActive = i === index;
            return (
              <div
                key={banner.id}
                className="absolute inset-0"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: reduceMotion
                    ? undefined
                    : isActive
                      ? "scale(1)"
                      : "scale(1.03)",
                  transition: reduceMotion
                    ? "opacity 1ms"
                    : `opacity ${FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${FADE_MS + 200}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                  zIndex: isActive ? 1 : 0,
                  pointerEvents: isActive ? "auto" : "none",
                }}
                aria-hidden={!isActive}
              >
                <Image
                  src={banner.imageUrl}
                  alt={banner.title || "Campaign"}
                  fill
                  priority={i === 0}
                  className="object-cover object-center"
                  sizes="100vw"
                />
              </div>
            );
          })}

          <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/45 via-transparent to-transparent" />

          {active.ctaDisabled ? (
            <div className="absolute inset-x-0 bottom-0 z-[3] flex items-end justify-between gap-3 p-4 sm:p-5 lg:p-6">
              <Dots banners={banners} index={index} onSelect={go} />
              <span className="inline-flex min-h-11 items-center rounded-full bg-[var(--g-cream)]/95 px-5 text-sm font-bold uppercase tracking-wide text-[var(--g-taupe)]">
                Out of stock
              </span>
            </div>
          ) : (
            <>
              <Link
                href={active.href}
                className="absolute inset-0 z-[2]"
                aria-label={active.title ? `Shop ${active.title}` : "Shop now"}
              >
                <span className="sr-only">Shop now</span>
              </Link>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] flex items-end justify-between gap-3 p-4 sm:p-5 lg:p-6">
                <div className="pointer-events-auto max-w-[min(100%,28rem)]">
                  {active.title ? (
                    <p className="gadget-display mb-3 hidden text-left text-lg font-semibold leading-tight tracking-[-0.02em] text-[var(--g-white)] drop-shadow-sm sm:block sm:text-xl lg:text-2xl">
                      {active.title}
                    </p>
                  ) : null}
                  <Dots banners={banners} index={index} onSelect={go} />
                </div>
                <Link
                  href={active.href}
                  className="gadget-btn-primary pointer-events-auto inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-bold uppercase tracking-wide sm:px-5 sm:text-sm"
                >
                  <ShoppingCart className="h-4 w-4" aria-hidden />
                  <span className="sm:hidden">Shop</span>
                  <span className="hidden sm:inline">Shop now</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Dots({
  banners,
  index,
  onSelect,
}: {
  banners: GadgetHeroBanner[];
  index: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {banners.map((s, i) => (
        <button
          key={s.id}
          type="button"
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === index}
          className={`flex h-11 items-center justify-center px-1 ${
            i === index ? "" : ""
          }`}
          onClick={() => onSelect(i)}
        >
          <span
            className={`block h-2.5 rounded-full transition-all duration-300 ease-out ${
              i === index
                ? "w-6 bg-[var(--g-cream)]"
                : "w-2.5 bg-white/55 hover:bg-white/90"
            }`}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}
