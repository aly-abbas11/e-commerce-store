import { notFound } from "next/navigation";

import { CatalogView } from "@/components/catalog/catalog-view";
import { CATEGORIES, getCategoryTitle } from "@/lib/categories";
import {
  fetchCatalog,
  fetchCategoryCounts,
  parseCatalogFilters,
} from "@/lib/catalog";
import type { ProductCategory } from "@/lib/types";
import type { BreadcrumbItem } from "@/components/catalog/catalog-breadcrumbs";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}) {
  const info = getCategoryTitle(params.category);
  if (!info) return {};
  return {
    title: info.title,
    description: info.description,
    alternates: { canonical: `/products/${params.category}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const info = getCategoryTitle(params.category);
  const cat = CATEGORIES.find((c) => c.slug === params.category);
  // Invalid category slug that is neither a real category nor has a title -> 404.
  if (!cat || !info) notFound();

  const filters = parseCatalogFilters(searchParams, cat.slug as ProductCategory);
  const [result, categoryCounts] = await Promise.all([
    fetchCatalog(filters),
    fetchCategoryCounts(),
  ]);

  const rawParams: Record<string, string> = {};
  if (filters.sort) rawParams.sort = filters.sort;
  if (filters.availability && filters.availability !== "all")
    rawParams.availability = filters.availability;
  if (filters.minPrice != null) rawParams.minPrice = String(filters.minPrice);
  if (filters.maxPrice != null) rawParams.maxPrice = String(filters.maxPrice);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: info.title, current: true },
  ];

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <CatalogView
        result={result}
        filters={filters}
        basePath={`/products/${params.category}`}
        rawParams={rawParams}
        title={info.title}
        subtitle={info.description}
        breadcrumbs={breadcrumbs}
        showCategoryPills
        selectedCategory={params.category}
        categoryCounts={categoryCounts}
        emptyMessage="No products in this category yet."
        emptyActionHref="/products"
      />
    </div>
  );
}
