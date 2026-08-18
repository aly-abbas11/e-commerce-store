"use client";

import { useEffect } from "react";

import { trackViewItem } from "@/lib/analytics";
import type { RecentProduct } from "@/lib/recently-viewed";

const STORAGE_KEY = "voltgear-recently-viewed";
const MAX_ITEMS = 8;

export function ProductViewTracker({
  slug,
  name,
  price,
  image,
  category,
}: {
  slug: string;
  name: string;
  price: number;
  image?: string;
  category: string;
}) {
  useEffect(() => {
    trackViewItem({ item_id: slug, item_name: name, price, quantity: 1 });

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing: RecentProduct[] = raw ? JSON.parse(raw) : [];
      const next = [
        { slug, name, price, image, category },
        ...existing.filter((p) => p.slug !== slug),
      ].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [slug, name, price, image, category]);

  return null;
}
