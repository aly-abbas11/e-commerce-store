"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cloudinaryImageUrl } from "@/lib/cloudinary";
import { imageUrl } from "@/lib/sanity/image";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type GallerySource = { src: string; thumb: string; alt: string };

export function ProductGallery({ product }: { product: Product }) {
  const sources: GallerySource[] = [
    ...(product.cloudinaryImages ?? []).map((id) => ({
      src: cloudinaryImageUrl(id, { w: 1200 }),
      thumb: cloudinaryImageUrl(id, { w: 200 }),
      alt: `${product.name} (Cloudinary)`,
    })),
    ...(product.images ?? []).map((img) => ({
      src: imageUrl(img, { w: 1200 }),
      thumb: imageUrl(img, { w: 200 }),
      alt: product.name,
    })),
  ];

  const [active, setActive] = useState(0);
  const current = sources[Math.min(active, sources.length - 1)];

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
        )
      : 0;

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
        {current ? (
          <Image
            src={current.src}
            alt={current.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="h-8 w-8" />
            <span className="text-sm">No image uploaded</span>
          </div>
        )}
        {discount > 0 && (
          <Badge className="absolute left-4 top-4 bg-destructive text-white">
            Save {discount}%
          </Badge>
        )}
      </div>

      {sources.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {sources.map((source, i) => (
            <button
              key={`${source.thumb}-${i}`}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border bg-muted transition-all",
                i === active
                  ? "border-primary ring-2 ring-primary/40"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={source.thumb}
                alt=""
                fill
                sizes="15vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
