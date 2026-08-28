"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye } from "lucide-react";

import { fetchStoreProductBySlug } from "@/lib/store-client";
import { imageUrl } from "@/lib/sanity/image";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";
import type { RecentProduct } from "@/lib/recently-viewed";

const STORAGE_KEY = "voltgear-recently-viewed";

export function RecentlyViewed() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const items: RecentProduct[] = JSON.parse(raw);
        if (items.length > 0) {
          Promise.all(
            items.map((item) =>
              fetchStoreProductBySlug(item.slug).catch(() => null)
            )
          ).then((results) => {
            setProducts(results.filter(Boolean) as Product[]);
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16 lg:px-8">
      <div className="mb-8 flex items-center gap-2">
        <Eye className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">Recently Viewed</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => {
          const img = product.images?.[0];
          return (
            <Link
              key={product.slug}
              href={`/product/${product.slug}`}
              className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                {img && (
                  <Image
                    src={imageUrl(img, { w: 400 })}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-1 text-sm font-medium">
                  {product.name}
                </p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
