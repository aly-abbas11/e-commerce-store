import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CollectionFilters } from "@/components/products/collection-filters";
import { fetchFromSanity } from "@/lib/sanity/client";
import {
  categoriesQuery,
  productsByCategoryQuery,
} from "@/lib/sanity/queries";
import type { Product, ProductCategory } from "@/lib/types";

export const revalidate = 60;

const CATEGORY_TITLES: Record<string, { title: string; description: string }> =
  {
    smartwatch: {
      title: "Smartwatches",
      description: "Track your health, stay connected and look good doing it.",
    },
    "power-bank": {
      title: "Power Banks",
      description: "Portable power that keeps up with your busy day.",
    },
    charger: {
      title: "Chargers & Adapters",
      description: "Fast, safe charging for every device you own.",
    },
    earbuds: {
      title: "Earbuds & Handsfree",
      description: "Immersive sound with all-day comfort.",
    },
  };

export async function generateStaticParams() {
  let categories: ProductCategory[] = [];
  try {
    categories = await fetchFromSanity<ProductCategory[]>(categoriesQuery);
  } catch {
    categories = ["smartwatch", "power-bank", "charger", "earbuds"];
  }
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const info = CATEGORY_TITLES[params.category];
  if (!info) return {};
  return {
    title: info.title,
    description: info.description,
    alternates: { canonical: `/products/${params.category}` },
    openGraph: {
      title: info.title,
      description: info.description,
      type: "website",
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = params.category;
  const info = CATEGORY_TITLES[category];
  if (!info) notFound();

  let products: Product[] = [];
  try {
    products = await fetchFromSanity<Product[]>(productsByCategoryQuery, {
      category,
    });
  } catch {
    products = [];
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          ← All Products
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {info.title}
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">{info.description}</p>
      </div>

      {products.length > 0 ? (
        <CollectionFilters products={products} />
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            No products in this category yet.
          </p>
          <Button asChild className="mt-4">
            <Link href="/products">Browse all products</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
