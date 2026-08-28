"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { fetchFeaturedStoreProducts } from "@/lib/store-client";
import { imageUrl } from "@/lib/sanity/image";
import { FALLBACK_SHOP_TYPES, shopTypeLinks, type ShopType } from "@/lib/categories";
import { formatPrice } from "@/lib/utils";
import type { StoreImage } from "@/lib/types";

interface MegaProduct {
  slug: string;
  name: string;
  price: number;
  images: StoreImage[];
  category: string;
  featured?: boolean;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  smartwatch: "⌚",
  "power-bank": "🔋",
  charger: "🔌",
  earbuds: "🎧",
};

export function MegaMenu({
  open,
  shopTypes = FALLBACK_SHOP_TYPES,
}: {
  open: boolean;
  shopTypes?: ShopType[];
}) {
  const [products, setProducts] = useState<Record<string, MegaProduct[]>>({});
  const [loaded, setLoaded] = useState(false);
  const links = shopTypeLinks(shopTypes);

  useEffect(() => {
    if (loaded || !open) return;
    Promise.all(
      links.map(async (link) => {
        const cat = link.href.split("/").pop()!;
        const featured = await fetchFeaturedStoreProducts(cat);
        return [
          cat,
          featured.slice(0, 4).map((p) => ({
            slug: p.slug,
            name: p.name,
            price: p.price,
            images: p.images,
            category: p.category,
            featured: p.featured,
          })),
        ] as const;
      })
    )
      .then((entries) => {
        setProducts(Object.fromEntries(entries));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [loaded, open]);

  return (
    <div className={`absolute left-0 top-full z-50 w-[700px] rounded-xl border bg-popover p-4 shadow-xl transition-all duration-150 ${open ? "visible opacity-100" : "invisible opacity-0"}`}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes mega-fade-in { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
            .mega-menu-panel { animation: mega-fade-in 0.15s ease-out; }
          `,
        }}
      />
      <div className="mega-menu-panel grid grid-cols-5 gap-4">
        <div className="col-span-2 space-y-1">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categories
          </p>
          {links.map((link) => {
            const cat = link.href.split("/").pop()!;
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                <span className="text-lg">{CATEGORY_EMOJIS[cat] ?? "📦"}</span>
                {link.label}
              </Link>
            );
          })}
          <div className="my-2 h-px bg-border" />
          <Link
            href="/products"
            prefetch={false}
            className="flex items-center justify-between rounded-lg px-2 py-2 text-sm font-semibold text-primary transition-colors hover:bg-accent"
          >
            View all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="col-span-3 grid grid-cols-3 gap-3">
          {links.map((link) => {
            const cat = link.href.split("/").pop()!;
            const items = products[cat] ?? [];
            if (items.length === 0) return null;
            return items.slice(0, 3).map((p) => (
              <Link
                key={p.slug}
                href={`/product/${p.slug}`}
                prefetch={false}
                className="group/card flex flex-col overflow-hidden rounded-lg border bg-background transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {p.images?.[0] && (
                    <Image
                      src={imageUrl(p.images[0], { w: 240 })}
                      alt={p.name}
                      fill
                      sizes="120px"
                      className="object-cover transition-transform duration-200 group-hover/card:scale-105"
                    />
                  )}
                </div>
                <div className="p-2">
                  <p className="line-clamp-1 text-xs font-medium leading-tight">
                    {p.name}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-primary">
                    {formatPrice(p.price)}
                  </p>
                </div>
              </Link>
            ));
          })}
        </div>
      </div>
    </div>
  );
}
