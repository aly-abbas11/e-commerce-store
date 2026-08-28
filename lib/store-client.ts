import type { Product } from "@/lib/types";

export async function fetchStoreProducts(): Promise<Product[]> {
  const res = await fetch("/api/store/products", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchFeaturedStoreProducts(category: string): Promise<Product[]> {
  const res = await fetch(
    `/api/store/products?category=${encodeURIComponent(category)}&featured=1`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchStoreProductBySlug(slug: string): Promise<Product | null> {
  const res = await fetch(`/api/store/products?slug=${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (Array.isArray(data)) return data[0] ?? null;
  return data;
}
