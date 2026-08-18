import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroVideo } from "@/components/sections/hero-video";
import { imageUrl } from "@/lib/sanity/image";
import { formatPrice } from "@/lib/utils";
import type { HeroSection } from "@/lib/types";

const FALLBACK_STATS = [
  { value: "12,000+", label: "Happy Customers" },
  { value: "4.8★", label: "Average Rating" },
  { value: "50,000+", label: "Orders Delivered" },
];

export function Hero({
  hero,
  freeShippingThreshold = 5000,
}: {
  hero: HeroSection | null;
  freeShippingThreshold?: number;
}) {
  const headline = hero?.headline || "Power Your Everyday.";
  const subheadline =
    hero?.subheadline ||
    "Premium smartwatches, power banks, chargers and earbuds — engineered for people who are always on the move.";
  const backgroundImage = hero?.backgroundImage;
  const video = hero?.backgroundVideo;
  const stats = (hero?.stats?.length ? hero.stats : FALLBACK_STATS).slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
      {video ? (
        <HeroVideo
          src={video}
          poster={
            backgroundImage ? imageUrl(backgroundImage, { w: 1920 }) : undefined
          }
        />
      ) : backgroundImage ? (
        <Image
          src={imageUrl(backgroundImage, { w: 1920 })}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />

      <div className="container relative mx-auto flex min-h-[560px] flex-col justify-center px-4 py-24 lg:px-8">
        <Badge className="mb-6 w-fit gap-1.5 border-primary/30 bg-primary/10 text-primary">
          <Truck className="h-3 w-3" />
          Free shipping on orders over {formatPrice(freeShippingThreshold)}
        </Badge>

        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          {headline}
        </h1>

        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          {subheadline}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/products">
              <ShoppingBag className="mr-2 h-4 w-4" />
              {hero?.primaryCta?.label || "Shop Now"}
            </Link>
          </Button>
          {hero?.secondaryCta?.label && (
            <Button asChild size="lg" variant="outline">
              <Link href={hero.secondaryCta.href || "/about"}>
                {hero.secondaryCta.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Trust stat bar — values editable in Sanity → Hero Section → Stats */}
        <dl className="mt-12 grid max-w-2xl grid-cols-1 overflow-hidden rounded-2xl border bg-background/80 shadow-glow backdrop-blur sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border">
          {stats.map((stat) => (
            <div
              key={`${stat.value}-${stat.label}`}
              className="px-6 py-4 text-center sm:py-6 sm:text-left sm:first:pl-8 sm:last:pr-8"
            >
              <dt className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                {stat.value}
              </dt>
              <dd className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}