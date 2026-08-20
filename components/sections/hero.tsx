import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Banknote, ShoppingBag, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { imageUrl } from "@/lib/sanity/image";
import { getStockState } from "@/lib/stock";
import type { PublicSiteConfig } from "@/lib/site-config";
import type { HeroSection } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function Hero({
  hero,
  config,
}: {
  hero: HeroSection | null;
  config: PublicSiteConfig;
}) {
  const headline = hero?.headline || "Power Your Everyday.";
  const subheadline =
    hero?.subheadline ||
    "Premium smartwatches, power banks, chargers and earbuds — engineered for people who are always on the move.";
  const featured = hero?.featuredProduct ?? null;
  const primaryLabel =
    hero?.primaryCta?.label ||
    (featured ? "Shop Featured Products" : "Shop Products");
  const primaryHref = hero?.primaryCta?.href || "/products";
  const secondary =
    hero?.secondaryCta?.label && hero.secondaryCta.href
      ? { label: hero.secondaryCta.label, href: hero.secondaryCta.href }
      : null;

  const image = featured?.images?.[0];
  const featuredStock = featured ? getStockState(featured.stockStatus) : null;
  const discount =
    featured && featured.compareAtPrice && featured.compareAtPrice > featured.price
      ? Math.round(
          ((featured.compareAtPrice - featured.price) / featured.compareAtPrice) * 100
        )
      : 0;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.08] via-background to-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-12%] h-[440px] w-[440px] rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-25%] left-[-12%] h-[380px] w-[380px] rounded-full bg-primary/10 blur-3xl"
      />

      <div
        className={`container relative mx-auto grid gap-10 px-4 py-14 sm:py-16 lg:gap-14 lg:px-8 lg:py-20 ${
          featured ? "lg:grid-cols-2 lg:items-center" : ""
        }`}
      >
        <div className={featured ? "" : "lg:max-w-3xl"}>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {headline}
          </h1>

          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            {subheadline}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={primaryHref}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                {primaryLabel}
              </Link>
            </Button>
            {secondary && (
              <Button asChild size="lg" variant="outline">
                <Link href={secondary.href}>
                  {secondary.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-primary" aria-hidden />
              Free Shipping on orders over {formatPrice(config.freeShippingThreshold)}
            </li>
            {config.codEnabled && (
              <li className="flex items-center gap-1.5">
                <Banknote className="h-4 w-4 text-primary" aria-hidden />
                Cash on Delivery
              </li>
            )}
          </ul>
        </div>

        {featured && (
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-primary/15 blur-3xl"
            />
            <Link
              href={`/product/${featured.slug}`}
              className="group block overflow-hidden rounded-2xl border bg-card shadow-xl transition-shadow hover:shadow-2xl"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                {image ? (
                  <Image
                    src={imageUrl(image, { w: 900 })}
                    alt={featured.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 92vw, 44vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : null}
                {discount > 0 && (
                  <Badge className="absolute left-4 top-4 bg-destructive text-white">
                    -{discount}%
                  </Badge>
                )}
                {featured.badge && (
                  <Badge className="absolute right-4 top-4">{featured.badge}</Badge>
                )}
                {featuredStock?.soldOut && (
                  <Badge
                    variant="destructive"
                    className="absolute bottom-4 left-4 bg-destructive text-white"
                  >
                    {featuredStock.label}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="truncate font-semibold transition-colors group-hover:text-primary">
                    {featured.name}
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-bold text-primary">
                      {formatPrice(featured.price)}
                    </span>
                    {featured.compareAtPrice && featured.compareAtPrice > featured.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(featured.compareAtPrice)}
                      </span>
                    )}
                  </div>
                </div>
                {featuredStock?.soldOut ? (
                  <span className="shrink-0 text-sm font-semibold text-muted-foreground">
                    Sold Out
                  </span>
                ) : (
                  <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                    View Product
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}