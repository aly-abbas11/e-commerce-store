import type { Metadata } from "next";
import Link from "next/link";
import { Search, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { SearchSuggestions } from "@/components/search/search-suggestions";
import { fetchFromSanity } from "@/lib/sanity/client";
import { searchProductsQuery } from "@/lib/sanity/queries";
import type { Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Search",
  description: "Search our catalog of electronics accessories.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim().slice(0, 64);

  let products: Product[] = [];
  if (q) {
    try {
      products = await fetchFromSanity<Product[]>(searchProductsQuery, {
        q: `*${q}*`,
      });
    } catch {
      products = [];
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <div className="mb-8">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
          <Search className="h-4 w-4" /> Search
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {q ? (
            <>
              Results for &ldquo;{q}&rdquo;
              <span className="ml-2 text-xl text-muted-foreground">
                ({products.length})
              </span>
            </>
          ) : (
            "What are you looking for?"
          )}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Smartwatches, power banks, chargers, earbuds and more.
        </p>
      </div>

      {!q ? (
        <SearchSuggestions query="" />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <SearchX className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            No products match &ldquo;{q}&rdquo;.
          </p>
          <Button asChild className="mt-4">
            <Link href="/products">Browse all products</Link>
          </Button>
        </div>
      )}
    </div>
  );
}