import { CatalogView } from "@/components/catalog/catalog-view";
import {
  fetchCatalog,
  fetchCategoryCounts,
  parseCatalogFilters,
} from "@/lib/catalog";
import type { BreadcrumbItem } from "@/components/catalog/catalog-breadcrumbs";

export const revalidate = 60;

export const metadata = {
  title: "All Products",
  description:
    "Browse our full range of electronics accessories — power banks, chargers, earbuds, smartwatches and more.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const filters = parseCatalogFilters(searchParams);
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
  if (filters.query) rawParams.q = filters.query;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Products", current: true },
  ];

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <CatalogView
        result={result}
        filters={filters}
        basePath="/products"
        rawParams={rawParams}
        title="All Products"
        breadcrumbs={breadcrumbs}
        showCategoryPills
        selectedCategory={null}
        categoryCounts={categoryCounts}
        emptyMessage="No products match these filters."
        emptyActionHref="/products"
      />
    </div>
  );
}
