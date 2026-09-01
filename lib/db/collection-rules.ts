export type CollectionMode = "manual" | "auto";
export type CollectionAutoRule = "featured" | "bestsellers";
export type CollectionHomeSlot = "bestsellers" | "featured" | "offers";

export const COLLECTION_HOME_SLOTS: {
  id: CollectionHomeSlot;
  label: string;
}[] = [
  { id: "bestsellers", label: "Home · Best Sellers rail" },
  { id: "featured", label: "Home · Featured product" },
  { id: "offers", label: "Home · Best Offers rail" },
];

export function parseHomeSlot(raw: unknown): CollectionHomeSlot | null {
  if (raw === "bestsellers" || raw === "featured" || raw === "offers") return raw;
  return null;
}

export function slugifyCollectionName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function canSaveCollection(input: {
  name?: string;
  slug?: string;
  mode?: string;
  autoRule?: string | null;
}): { ok: true } | { ok: false; error: string } {
  if (!input.name?.trim()) return { ok: false, error: "Collection name is required." };
  const slug = (input.slug?.trim() || slugifyCollectionName(input.name)).trim();
  if (!slug) return { ok: false, error: "Collection slug is required." };
  if (input.mode !== "manual" && input.mode !== "auto") {
    return { ok: false, error: "Mode must be manual or auto." };
  }
  if (input.mode === "auto") {
    if (input.autoRule !== "featured" && input.autoRule !== "bestsellers") {
      return { ok: false, error: "Auto collections need a rule: featured or bestsellers." };
    }
  }
  return { ok: true };
}
