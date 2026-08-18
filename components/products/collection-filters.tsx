"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, Filter, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/product/product-card";
import { CATEGORY_LINKS } from "@/lib/categories";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type SortOption = "featured" | "price-asc" | "price-desc" | "newest" | "rating" | "name";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "name", label: "Name A-Z" },
];

const PRICE_RANGES = [
  { label: "Under Rs 3,000", min: 0, max: 3000 },
  { label: "Rs 3,000 – Rs 6,000", min: 3000, max: 6000 },
  { label: "Rs 6,000 – Rs 10,000", min: 6000, max: 10000 },
  { label: "Over Rs 10,000", min: 10000, max: Infinity },
];

const STOCK_FILTERS = [
  { label: "In Stock", value: "in-stock" },
  { label: "Low Stock", value: "low-stock" },
  { label: "Out of Stock", value: "out-of-stock" },
];

export function CollectionFilters({ products }: { products: Product[] }) {
  const [sort, setSort] = useState<SortOption>("featured");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePriceRange, setActivePriceRange] = useState<number | null>(null);
  const [activeStock, setActiveStock] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...products];

    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (activePriceRange !== null) {
      const range = PRICE_RANGES[activePriceRange];
      result = result.filter((p) => p.price >= range.min && p.price < range.max);
    }
    if (activeStock) {
      result = result.filter((p) => p.stockStatus === activeStock);
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => (b as unknown as Record<string, string>)?._createdAt?.localeCompare?.((a as unknown as Record<string, string>)?._createdAt) || 0);
        break;
      case "rating":
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [products, sort, activeCategory, activePriceRange, activeStock]);

  const activeFilterCount =
    (activeCategory ? 1 : 0) + (activePriceRange !== null ? 1 : 0) + (activeStock ? 1 : 0);

  function clearFilters() {
    setActiveCategory(null);
    setActivePriceRange(null);
    setActiveStock(null);
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters((v) => !v)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Quick category pills */}
        {CATEGORY_LINKS.map((link) => {
          const slug = link.href.split("/").pop()!;
          const count = products.filter((p) => p.category === slug).length;
          return (
            <button
              key={slug}
              onClick={() => setActiveCategory(activeCategory === slug ? null : slug)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                activeCategory === slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50 hover:bg-accent"
              )}
            >
              {link.label}
              <span className="ml-1.5 text-xs opacity-60">{count}</span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filtered.length} product{filtered.length === 1 ? "" : "s"}
          </span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="appearance-none rounded-lg border bg-background py-2 pl-3 pr-8 text-sm font-medium outline-none focus:border-primary"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Expandable filter panel */}
      {showFilters && (
        <Card className="mb-6 p-4">
          <div className="flex flex-wrap gap-6">
            {/* Price range */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Price Range
              </p>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((range, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePriceRange(activePriceRange === i ? null : i)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      activePriceRange === i
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock status */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Availability
              </p>
              <div className="flex flex-wrap gap-2">
                {STOCK_FILTERS.map((sf) => (
                  <button
                    key={sf.value}
                    onClick={() => setActiveStock(activeStock === sf.value ? null : sf.value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      activeStock === sf.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {sf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-4 flex items-center gap-3 border-t pt-3">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs">
                <X className="h-3 w-3" /> Clear all filters
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Product grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium">No products match your filters</p>
          <p className="mt-2 text-muted-foreground">Try adjusting your filters to see more results.</p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
