import { notFound } from "next/navigation";

import { CatalogView } from "@/components/catalog/catalog-view";
import { findShopType, shopTypeTitle, type ShopType } from "@/lib/categories";
import {
  fetchCatalog,
  fetchCategoryCounts,
  parseCatalogFilters,
} from "@/lib/catalog";
import type { BreadcrumbItem } from "@/components/catalog/catalog-breadcrumbs";
import { fetchShopTypes } from "@/lib/db/store";
import { isDemoSession } from "@/lib/demo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}) {
  const types = await fetchShopTypes().catch(() => [] as ShopType[]);
  const info = shopTypeTitle(types, params.category);
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
  const types = await fetchShopTypes().catch(() => [] as ShopType[]);
  const info = shopTypeTitle(types, params.category);
  const cat = findShopType(types, params.category);
  if (!cat || !info) notFound();

  const filters = parseCatalogFilters(searchParams, cat.slug);
  const demo = isDemoSession();
  const [result, categoryCounts] = await Promise.all([
    fetchCatalog(filters, { includeDemo: demo }),
    fetchCategoryCounts(demo),
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
        shopTypes={types}
        emptyMessage="No products in this category yet."
        emptyActionHref="/products"
      />
    </div>
  );
}
