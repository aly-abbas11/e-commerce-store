"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { resolveSlideCta } from "@/lib/db/hero-slide-rules";
import { product2Href } from "@/lib/gadget-preview";
import type { HeroSlide } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const INTERVAL_MS = 5000;

export function GadgetHeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slides.length, paused]);

  if (slides.length === 0) {
    return (
      <div className="border-b border-[#eaeaea] bg-white px-4 py-16 text-center lg:px-8">
        <p className="text-sm text-[#666666]">
          No published hero slides yet. Add slides in Admin → Hero.
        </p>
      </div>
    );
  }

  const slide = slides[index] ?? slides[0];
  const cta = resolveSlideCta(slide.product.stockStatus);
  const href = product2Href(slide.product.slug);
  const priceNow = formatPrice(slide.product.price);
  const priceWas = slide.product.compareAtPrice
    ? formatPrice(slide.product.compareAtPrice)
    : null;

  function go(delta: number) {
    setIndex((i) => (i + delta + slides.length) % slides.length);
  }

  const copy = (
    <div className="flex flex-col justify-center gap-3 px-6 py-10 lg:px-10 lg:py-14">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0f766e]">Featured</p>
      <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#171717] lg:text-4xl">{slide.title}</h1>
      {slide.subtitle ? <p className="max-w-md text-sm text-[#666666]">{slide.subtitle}</p> : null}
      <p className="flex flex-wrap items-baseline gap-2 text-lg font-bold text-[#171717]">
        <span>{priceNow}</span>
        {priceWas ? <span className="text-sm font-medium text-[#999] line-through">{priceWas}</span> : null}
      </p>
      {cta.disabled ? (
        <span className="inline-flex min-h-11 w-fit items-center rounded-lg bg-[#eaeaea] px-5 text-sm font-semibold text-[#666666]">
          {cta.label}
        </span>
      ) : (
        <Link
          href={href}
          className="inline-flex min-h-11 w-fit items-center rounded-lg bg-[#171717] px-5 text-sm font-semibold text-white hover:bg-black"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );

  const art = (
    <div className="relative flex min-h-[220px] items-center justify-center bg-[#fafafa] lg:min-h-full">
      <div className="relative h-48 w-48 lg:h-64 lg:w-64">
        <Image
          src={slide.imageUrl}
          alt={slide.title}
          fill
          priority
          className="object-contain"
          sizes="(max-width: 768px) 50vw, 30vw"
        />
      </div>
    </div>
  );

  return (
    <section
      className="border-b border-[#eaeaea] bg-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured products"
    >
      <div className="grid md:hidden">
        {art}
        {copy}
      </div>
      <div className="hidden md:grid md:grid-cols-2 md:min-h-[380px]">
        {copy}
        <div className="border-l border-[#eaeaea]">{art}</div>
      </div>

      <div className="flex items-center justify-center gap-3 border-t border-[#eaeaea] px-4 py-3">
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#eaeaea] text-[#171717]"
          aria-label="Previous slide"
          onClick={() => go(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-2 w-2 rounded-full ${i === index ? "bg-[#171717]" : "bg-[#ddd]"}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#eaeaea] text-[#171717]"
          aria-label="Next slide"
          aria-controls={undefined}
          onClick={() => go(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
