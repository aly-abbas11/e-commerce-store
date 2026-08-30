export type ShopType = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  sortOrder: number;
  productCount?: number;
};

export const FALLBACK_SHOP_TYPES: ShopType[] = [
  {
    name: "Smartwatches",
    slug: "smartwatch",
    description: "Track your health and stay connected.",
    sortOrder: 1,
  },
  {
    name: "Power Banks",
    slug: "power-bank",
    description: "Reliable, fast portable power.",
    sortOrder: 2,
  },
  {
    name: "Chargers & Adapters",
    slug: "charger",
    description: "Fast, safe charging for every device.",
    sortOrder: 3,
  },
  {
    name: "Earbuds & Handsfree",
    slug: "earbuds",
    description: "Immersive sound. All-day comfort.",
    sortOrder: 4,
  },
];

export function shopTypeLinks(types: ShopType[]): { label: string; href: string }[] {
  return types.map((t) => ({ label: t.name, href: `/products/${t.slug}` }));
}

export function findShopType(types: ShopType[], slug: string | undefined): ShopType | null {
  if (!slug) return null;
  return types.find((t) => t.slug === slug) ?? null;
}

export function shopTypeTitle(
  types: ShopType[],
  slug: string | undefined
): { title: string; description: string } | null {
  const t = findShopType(types, slug);
  if (!t) return null;
  return { title: t.name, description: t.description };
}

/** @deprecated Prefer fetchShopTypes() — kept so leftover imports still compile. */
export const CATEGORY_LINKS = shopTypeLinks(FALLBACK_SHOP_TYPES);

/** @deprecated Prefer fetchShopTypes() */
export const CATEGORIES = FALLBACK_SHOP_TYPES.map((t) => ({
  slug: t.slug,
  label: t.name,
  href: `/products/${t.slug}`,
}));

export function getCategoryTitle(slug: string | undefined) {
  return shopTypeTitle(FALLBACK_SHOP_TYPES, slug);
}

export function categoryLabel(slug: string | undefined): string | null {
  return findShopType(FALLBACK_SHOP_TYPES, slug)?.name ?? null;
}
