import Link from "next/link";
import { ShieldCheck, Truck, Wallet } from "lucide-react";

import { GadgetArrivalCard } from "@/components/gadget/gadget-arrival-card";
import { GadgetShopFindBar } from "@/components/gadget/gadget-shop-find-bar";
import type { ShopType } from "@/lib/categories";
import { products2Href } from "@/lib/gadget-preview";
import { cn, formatPrice } from "@/lib/utils";
import { warrantyLabel, type PublicSiteConfig } from "@/lib/site-config";
import type { Product } from "@/lib/types";

export function GadgetShopCatalog({
  title,
  description,
  products,
  shopTypes,
  activeCategory,
  query,
  sort,
  config,
  breadcrumbs,
}: {
  title: string;
  description: string;
  products: Product[];
  shopTypes: ShopType[];
  activeCategory?: string | null;
  query: string;
  sort: string;
  config: PublicSiteConfig;
  breadcrumbs: { label: string; href?: string }[];
}) {
  const trust: { icon: typeof Wallet; label: string; detail: string }[] = [];
  if (config.codEnabled) {
    trust.push({
      icon: Wallet,
      label: "Cash on delivery",
      detail: "Pay when it arrives",
    });
  }
  if (config.warrantyMonths) {
    trust.push({
      icon: ShieldCheck,
      label: warrantyLabel(config.warrantyMonths),
      detail: "On covered products",
    });
  }
  if (config.freeShippingThreshold > 0) {
    trust.push({
      icon: Truck,
      label: `Free shipping over ${formatPrice(config.freeShippingThreshold)}`,
      detail: "On qualifying orders",
    });
  }

  const basePath = activeCategory ? products2Href(activeCategory) : products2Href();

  function categoryHref(slug?: string) {
    const href = slug ? products2Href(slug) : products2Href();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (sort && sort !== "featured") params.set("sort", sort);
    const qs = params.toString();
    return qs ? `${href}?${qs}` : href;
  }

  return (
    <div className="bg-[var(--g-cream)] text-[var(--g-charcoal)]">
      <div className="relative overflow-hidden border-b border-[var(--g-line)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--g-sage)_22%,transparent),transparent_55%),linear-gradient(180deg,var(--g-cream-deep),var(--g-cream))]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:py-7 lg:px-8 lg:py-8">
          <nav aria-label="Breadcrumb" className="text-[11px] font-medium tracking-wide text-[var(--g-taupe)] sm:text-xs">
            {breadcrumbs.map((crumb, i) => (
              <span key={`${crumb.label}-${i}`}>
                {i > 0 ? <span className="px-1.5 text-[var(--g-line)]">/</span> : null}
                {crumb.href ? (
                  <Link href={crumb.href} className="transition hover:text-[var(--g-forest)]">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[var(--g-charcoal)]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="gadget-display mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--g-charcoal)] sm:text-3xl lg:text-[2.15rem]">
            {title}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[var(--g-taupe)] sm:text-[15px]">
            {description}
          </p>

          {trust.length > 0 ? (
            <ul className="mt-5 grid gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-3">
              {trust.map((item) => (
                <li
                  key={item.label}
                  className="gadget-glass-deep gadget-hover-lift group flex items-center gap-3 rounded-2xl px-3.5 py-3 sm:px-4 sm:py-3.5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--g-forest)] text-[var(--g-cream)] shadow-[0_8px_18px_rgba(31,54,38,0.18)] transition duration-300 group-hover:scale-105">
                    <item.icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[var(--g-charcoal)] sm:text-sm">
                      {item.label}
                    </p>
                    <p className="truncate text-[11px] text-[var(--g-taupe)] sm:text-[12px]">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-3 pb-10 pt-3 sm:px-4 sm:pb-12 sm:pt-4 lg:px-8">
        <GadgetShopFindBar
          basePath={basePath}
          query={query}
          sort={sort}
          resultCount={products.length}
          categorySlug={activeCategory || undefined}
        />

        {/* Category filter chips */}
        <div className="mt-3 sm:mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--g-sage)]">
            Browse by type
          </p>
          <div
            className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="navigation"
            aria-label="Product categories"
          >
            <Link
              href={categoryHref()}
              className={cn(
                "gadget-chip inline-flex h-10 shrink-0 items-center rounded-full px-4 text-[13px] font-semibold sm:h-11 sm:px-5 sm:text-sm",
                !activeCategory ? "gadget-chip-active" : "gadget-chip-idle"
              )}
            >
              All products
            </Link>
            {shopTypes.map((t) => {
              const active = t.slug === activeCategory;
              return (
                <Link
                  key={t.slug}
                  href={categoryHref(t.slug)}
                  className={cn(
                    "gadget-chip inline-flex h-10 shrink-0 items-center rounded-full px-4 text-[13px] font-semibold sm:h-11 sm:text-sm",
                    active ? "gadget-chip-active" : "gadget-chip-idle"
                  )}
                >
                  {t.name}
                </Link>
              );
            })}
          </div>
        </div>

        {products.length ? (
          <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3 md:grid-cols-3 lg:mt-6 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
            {products.map((p) => (
              <li key={p._id} className="min-w-0">
                <GadgetArrivalCard product={p} variant="grid" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="gadget-glass mt-8 rounded-2xl px-6 py-14 text-center">
            <p className="text-[var(--g-taupe)]">
              {query ? `No products match “${query}”.` : "No products match right now."}
            </p>
            <Link
              href={products2Href()}
              className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--g-forest)]"
            >
              {query ? "Clear search" : "Browse all products"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
