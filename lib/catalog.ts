import { fetchFromSanity } from "@/lib/sanity/client";
import { catalogProductFields } from "@/lib/sanity/queries";
import { CATEGORIES } from "@/lib/categories";
import type { Product, ProductCategory } from "@/lib/types";

export { CATEGORIES } from "@/lib/categories";

/** Page size for server-side pagination of catalog/search results. */
export const PRODUCTS_PAGE_SIZE = 12;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A–Z" },
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "in-stock", label: "In Stock" },
] as const;

export type CatalogSort = (typeof SORT_OPTIONS)[number]["value"];
export type CatalogAvailability = (typeof AVAILABILITY_OPTIONS)[number]["value"];

export interface CatalogFilters {
  category?: ProductCategory;
  query?: string;
  sort: CatalogSort;
  availability: CatalogAvailability;
  minPrice?: number;
  maxPrice?: number;
  page: number;
}

export interface CatalogResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Strict whitelist — raw `sort` is never interpolated into GROQ. */
const ORDER_MAP: Record<CatalogSort, string> = {
  featured: "featured desc, _createdAt desc",
  newest: "_createdAt desc",
  "price-asc": "price asc, _id asc",
  "price-desc": "price desc, _id asc",
  "name-asc": "name asc, _id asc",
};

function toInt(v: unknown, fallback = 1): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function toNum(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function asSort(v: unknown): CatalogSort {
  return SORT_OPTIONS.some((o) => o.value === v) ? (v as CatalogSort) : "featured";
}

function asAvailability(v: unknown): CatalogAvailability {
  return AVAILABILITY_OPTIONS.some((o) => o.value === v)
    ? (v as CatalogAvailability)
    : "all";
}

/** Parse + normalize URL search params into safe catalog filters. */
export function parseCatalogFilters(
  searchParams: { [key: string]: string | string[] | undefined } | Record<string, unknown>,
  category?: ProductCategory
): CatalogFilters {
  const sp = (k: string): string | undefined => {
    const v = (searchParams as Record<string, unknown>)[k];
    if (Array.isArray(v)) return String(v[0]);
    if (typeof v === "string") return v;
    if (v !== null && v !== undefined) return String(v);
    return undefined;
  };

  const query = sp("q");
  const queryClean = query ? query.replace(/\s+/g, " ").trim().slice(0, 80) : undefined;

  let minPrice = toNum(sp("minPrice"));
  let maxPrice = toNum(sp("maxPrice"));
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  return {
    category,
    query: queryClean || undefined,
    sort: asSort(sp("sort")),
    availability: asAvailability(sp("availability")),
    minPrice,
    maxPrice,
    page: toInt(sp("page"), 1),
  };
}

function buildFilterClause(f: CatalogFilters): {
  clause: string;
  params: Record<string, unknown>;
} {
  const parts: string[] = [`_type=="product"`];
  const params: Record<string, unknown> = {};

  if (f.category) {
    parts.push("category == $category");
    params.category = f.category;
  }
  if (f.query) {
    params.q = `*${f.query}*`;
    parts.push(
      "(name match $q || category match $q || badge match $q)"
    );
  }
  if (f.availability === "in-stock") {
    // "In Stock" = purchasable states (in-stock + low-stock), never out-of-stock.
    parts.push("stockStatus != 'out-of-stock'");
  }
  if (f.minPrice != null) {
    parts.push("price >= $minPrice");
    params.minPrice = f.minPrice;
  }
  if (f.maxPrice != null) {
    parts.push("price <= $maxPrice");
    params.maxPrice = f.maxPrice;
  }

  return { clause: parts.join(" && "), params };
}

function orderClause(sort: CatalogSort): string {
  return ORDER_MAP[sort];
}

/** Build a URL query string for the catalog, applying `changes` over `base`. */
export function buildCatalogUrl(
  basePath: string,
  base: Record<string, string | undefined>,
  changes: Record<string, string | undefined>
): string {
  const merged: Record<string, string> = {};
  for (const [k, v] of Object.entries(base)) {
    if (v !== undefined && v !== "") merged[k] = v;
  }
  for (const [k, v] of Object.entries(changes)) {
    if (v === undefined || v === "") delete merged[k];
    else merged[k] = v;
  }
  const sp = new URLSearchParams(merged).toString();
  return sp ? `${basePath}?${sp}` : basePath;
}

/** Run the count + items queries; normalizes an out-of-range page to the last page. */
export async function fetchCatalog(
  f: CatalogFilters,
  opts: { basePath?: string } = {}
): Promise<CatalogResult> {
  const { clause, params } = buildFilterClause(f);
  const total = await fetchFromSanity<number>(`count(*[${clause}])`, params);
  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));
  const page = Math.min(f.page, totalPages);
  const offset = (page - 1) * PRODUCTS_PAGE_SIZE;
  const end = offset + PRODUCTS_PAGE_SIZE;
  const items = await fetchFromSanity<Product[]>(
    `*[${clause}] | order(${orderClause(f.sort)})[${offset}...${end}]{${catalogProductFields}}`,
    params
  );
  void opts; // reserved for future caching hints
  return { items, total, page, pageSize: PRODUCTS_PAGE_SIZE, totalPages };
}

/** Truthful per-category product counts (one aggregate query over the real categories). */
export async function fetchCategoryCounts(): Promise<Record<string, number>> {
  const exprs = CATEGORIES.map((c) => `"${c.slug}":count(*[_type=="product" && category==${JSON.stringify(c.slug)}])`).join(",\n");
  return fetchFromSanity<Record<string, number>>(`{${exprs}}`);
}

/** Distinct real categories that currently have products (truthful nav membership). */
export async function fetchActiveCategories(): Promise<string[]> {
  return fetchFromSanity<string[]>(`*[_type=="product" && defined(category)].category | order(@ asc)`);
}
