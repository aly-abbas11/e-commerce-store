import type { MetadataRoute } from "next";

import { shopTypeLinks } from "@/lib/categories";
import { publicSiteUrl } from "@/lib/deploy-rules";
import { fetchShopTypes, fetchSitemapPages, fetchSitemapProducts } from "@/lib/db/store";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicSiteUrl();
  const now = new Date();

  let products: { slug: string; _updatedAt?: string }[] = [];
  let pages: { slug: string; pageType?: string; _updatedAt?: string }[] = [];
  let shopTypeHrefs: { href: string }[] = [];
  try {
    const [p, pagesRows, types] = await Promise.all([
      fetchSitemapProducts(),
      fetchSitemapPages(),
      fetchShopTypes(),
    ]);
    products = p;
    pages = pagesRows;
    shopTypeHrefs = shopTypeLinks(types);
  } catch {
    products = [];
    pages = [];
  }

  const staticRoutes = [
    "",
    "/products",
    "/blog",
    "/about",
    "/contact",
    "/faq",
    "/privacy-policy",
    "/terms-of-service",
    "/shipping-returns",
  ];

  const entries: MetadataRoute.Sitemap = [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
      priority: path === "" ? 1 : 0.7,
    })),
    ...shopTypeHrefs.map((link) => ({
      url: `${base}${link.href}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p._updatedAt ? new Date(p._updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...pages.map((p) => ({
      url: `${base}${p.pageType === "blog" ? `/blog/${p.slug}` : `/${p.slug}`}`,
      lastModified: p._updatedAt ? new Date(p._updatedAt) : now,
      changeFrequency: p.pageType === "blog" ? ("monthly" as const) : ("monthly" as const),
      priority: p.pageType === "blog" ? 0.6 : 0.7,
    })),
  ];

  return entries;
}
