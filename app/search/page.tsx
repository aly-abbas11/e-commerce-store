import { SearchX } from "lucide-react";

import { CatalogBreadcrumbs } from "@/components/catalog/catalog-breadcrumbs";
import { CatalogView } from "@/components/catalog/catalog-view";
import { Button } from "@/components/ui/button";
import {
  fetchCatalog,
  parseCatalogFilters,
} from "@/lib/catalog";
import type { BreadcrumbItem } from "@/components/catalog/catalog-breadcrumbs";
import { isDemoSession } from "@/lib/demo";

export const revalidate = 60;

export const metadata = {
  title: "Search",
  description: "Search our catalog of electronics accessories.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const filters = parseCatalogFilters(searchParams);
  const q = filters.query;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Search", current: true },
  ];

  if (!q) {
    return (
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <CatalogBreadcrumbs items={breadcrumbs} />
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What are you looking for?
          </h1>
          <p className="mt-2 text-muted-foreground">
            Search our catalog of electronics accessories.
          </p>
        </header>
        <div className="rounded-lg border border-dashed p-10 text-center">
          <SearchX className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">Search VoltGear</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a product name or keyword (e.g. “power bank”, “charger”).
          </p>
          <form action="/search" method="GET" className="mt-4">
            <input
              type="search"
              name="q"
              placeholder="Search…"
              className="mx-auto max-w-md rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <Button type="submit" size="sm" className="ml-2">
              Search
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const result = await fetchCatalog(filters, { includeDemo: isDemoSession() });

  const rawParams: Record<string, string> = {};
  if (filters.query) rawParams.q = filters.query;
  if (filters.sort) rawParams.sort = filters.sort;
  if (filters.availability && filters.availability !== "all")
    rawParams.availability = filters.availability;
  if (filters.minPrice != null) rawParams.minPrice = String(filters.minPrice);
  if (filters.maxPrice != null) rawParams.maxPrice = String(filters.maxPrice);

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <CatalogView
        result={result}
        filters={filters}
        basePath="/search"
        rawParams={rawParams}
        title={`Results for “${q}”`}
        breadcrumbs={breadcrumbs}
        showCategoryPills={false}
        selectedCategory={null}
        categoryCounts={{}}
        emptyMessage={`No products found for “${q}”.`}
        emptyActionHref="/products"
      />
    </div>
  );
}
