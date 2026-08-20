export const CATEGORY_LINKS: { label: string; href: string }[] = [
  { label: "Smartwatches", href: "/products/smartwatch" },
  { label: "Power Banks", href: "/products/power-bank" },
  { label: "Chargers & Adapters", href: "/products/charger" },
  { label: "Earbuds & Handsfree", href: "/products/earbuds" },
];

export const CATEGORY_TITLES: Record<
  (typeof CATEGORY_LINKS)[number]["href"],
  { title: string; description: string }
> = {
  "/products/smartwatch": {
    title: "Smartwatches",
    description: "Track your health, stay connected and look good doing it.",
  },
  "/products/power-bank": {
    title: "Power Banks",
    description: "Portable power that keeps up with your busy day.",
  },
  "/products/charger": {
    title: "Chargers & Adapters",
    description: "Fast, safe charging for every device you own.",
  },
  "/products/earbuds": {
    title: "Earbuds & Handsfree",
    description: "Immersive sound with all-day comfort.",
  },
};

/** Canonical category slugs actually in use by the product data. */
export const CATEGORIES = [
  { slug: "smartwatch", label: "Smartwatches", href: "/products/smartwatch" },
  { slug: "power-bank", label: "Power Banks", href: "/products/power-bank" },
  { slug: "charger", label: "Chargers & Adapters", href: "/products/charger" },
  { slug: "earbuds", label: "Earbuds & Handsfree", href: "/products/earbuds" },
] as const;

/** Slug -> [title, description] for category pages, sourced from real data. */
export function getCategoryTitle(slug: string | undefined): {
  title: string;
  description: string;
} | null {
  if (!slug) return null;
  return CATEGORY_TITLES[`/products/${slug}`] ?? null;
}

/** Human-readable label for a category slug (or null if unknown). */
export function categoryLabel(slug: string | undefined): string | null {
  if (!slug) return null;
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? null;
}