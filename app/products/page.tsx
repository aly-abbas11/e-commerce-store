import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { fetchFromSanity } from "@/lib/sanity/client";
import { productsQuery } from "@/lib/sanity/queries";
import type { Product } from "@/lib/types";

const CollectionFilters = dynamic(
  () =>
    import("@/components/products/collection-filters").then(
      (m) => m.CollectionFilters
    ),
  { ssr: false, loading: () => <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{Array.from({length:8}).map((_,i)=><div key={i} className="h-[360px] animate-pulse rounded-lg bg-muted" />)}</div> }
);

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse our full range of electronics accessories.",
};

export const revalidate = 60;

export default async function ProductsPage() {
  let products: Product[] = [];
  try {
    products = await fetchFromSanity<Product[]>(productsQuery);
  } catch {
    // offline during build — render empty state
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Catalog
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          All Products
        </h1>
        <p className="mt-2 text-muted-foreground">
          {products.length} product{products.length === 1 ? "" : "s"} available
        </p>
      </div>

      {products.length > 0 ? (
        <CollectionFilters products={products} />
      ) : (
        <p className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No products yet. Publish products in Sanity Studio to see them here.
        </p>
      )}
    </div>
  );
}
