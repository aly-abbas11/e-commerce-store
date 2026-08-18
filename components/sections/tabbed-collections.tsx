"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { CATEGORY_LINKS } from "@/lib/categories";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "All", slug: "all" },
  ...CATEGORY_LINKS.map((l) => ({
    label: l.label,
    slug: l.href.split("/").pop()!,
  })),
];

export function TabbedCollections({ products }: { products: Product[] }) {
  const [active, setActive] = useState("all");

  const filtered =
    active === "all"
      ? products
      : products.filter((p) => p.category === active);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Shop by Category
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Featured Products
          </h2>
        </div>
        <Button asChild variant="outline">
          <Link href="/products">
            View All Products <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.slug}
            onClick={() => setActive(tab.slug)}
            className={cn(
              "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all",
              active === tab.slug
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No products in this category yet.
        </p>
      )}
    </div>
  );
}
