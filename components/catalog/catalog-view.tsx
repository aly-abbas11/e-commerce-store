import { CatalogBreadcrumbs } from "@/components/catalog/catalog-breadcrumbs";
import { ActiveFilters } from "@/components/catalog/active-filters";
import { AvailabilityPills } from "@/components/catalog/availability-pills";
import { CategoryPills } from "@/components/catalog/category-pills";
import { MobileFilterSheet } from "@/components/catalog/mobile-filter-sheet";
import { PriceFilter } from "@/components/catalog/price-filter";
import { ProductGrid, EmptyState } from "@/components/catalog/product-grid";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { SortSelect } from "@/components/catalog/sort-select";
import type { ShopType } from "@/lib/categories";
import type { CatalogFilters, CatalogResult } from "@/lib/catalog";
import type { BreadcrumbItem } from "@/components/catalog/catalog-breadcrumbs";

export interface CatalogViewProps {
  result: CatalogResult;
  filters: CatalogFilters;
  basePath: string;
  rawParams: Record<string, string>;
  title: string;
  subtitle?: string;
  breadcrumbs: BreadcrumbItem[];
  showCategoryPills: boolean;
  selectedCategory: string | null;
  categoryCounts: Record<string, number>;
  shopTypes?: ShopType[];
  emptyMessage: string;
  emptyActionHref?: string;
  query?: string;
}

export function CatalogView({
  result,
  filters,
  basePath,
  rawParams,
  title,
  subtitle,
  breadcrumbs,
  showCategoryPills,
  selectedCategory,
  categoryCounts,
  shopTypes,
  emptyMessage,
  emptyActionHref,
  query,
}: CatalogViewProps) {
  const { items, total, page, totalPages, pageSize } = result;
  const baseParams: Record<string, string> = { ...rawParams };
  delete baseParams.page;

  return (
    <section>
      <CatalogBreadcrumbs items={breadcrumbs} />
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-muted-foreground">{subtitle}</p>}
        <p className="mt-2 text-sm text-muted-foreground">
          {total} product{total === 1 ? "" : "s"}
        </p>
      </header>

      {showCategoryPills && (
        <CategoryPills
          basePath={basePath}
          selected={selectedCategory}
          counts={categoryCounts}
          shopTypes={shopTypes}
        />
      )}

      <div className="lg:flex lg:gap-8">
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-24 space-y-6">
            <AvailabilityPills basePath={basePath} baseParams={baseParams} value={filters.availability} />
            <PriceFilter
              basePath={basePath}
              baseParams={baseParams}
              availability={filters.availability}
              minPrice={filters.minPrice}
              maxPrice={filters.maxPrice}
            />
          </div>
        </aside>

        <main className="flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {pageSize} per page
            </span>
            <div className="flex items-center gap-3">
              <SortSelect basePath={basePath} baseParams={baseParams} value={filters.sort} />
              <MobileFilterSheet basePath={basePath}>
                <AvailabilityPills basePath={basePath} baseParams={baseParams} value={filters.availability} />
                <PriceFilter
                  basePath={basePath}
                  baseParams={baseParams}
                  availability={filters.availability}
                  minPrice={filters.minPrice}
                  maxPrice={filters.maxPrice}
                />
              </MobileFilterSheet>
            </div>
          </div>

          <ActiveFilters
            basePath={basePath}
            baseParams={baseParams}
            sort={filters.sort}
            availability={filters.availability}
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            query={query}
          />

          {items.length === 0 ? (
            <EmptyState message={emptyMessage} actionLabel={emptyActionHref ? "Browse all products" : undefined} actionHref={emptyActionHref} />
          ) : (
            <>
              <ProductGrid items={items} />
              <CatalogPagination page={page} totalPages={totalPages} basePath={basePath} baseParams={baseParams} />
            </>
          )}
        </main>
      </div>
    </section>
  );
}
