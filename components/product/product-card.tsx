"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/product/star-rating";
import { QuickViewButton } from "@/components/product/quick-view";
import { imageUrl } from "@/lib/sanity/image";
import type { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-provider";
import { dispatchAddToCartEffect } from "@/components/effects/cart-effects";

const STOCK_LABEL: Record<string, { label: string; variant: "success" | "warning" | "destructive" }> = {
  "in-stock": { label: "In Stock", variant: "success" },
  "low-stock": { label: "Low Stock", variant: "warning" },
  "out-of-stock": { label: "Out of Stock", variant: "destructive" },
};

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { addItem } = useCart();
  const image = product.images?.[0];
  const outOfStock = product.stockStatus === "out-of-stock";
  const stock = STOCK_LABEL[product.stockStatus] ?? STOCK_LABEL["in-stock"];
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-shadow hover:shadow-lg",
        className
      )}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {image ? (
            <Image
              ref={imgRef}
              src={imageUrl(image, { w: 640 })}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute left-3 top-3 bg-destructive text-white">
              -{discount}%
            </Badge>
          )}
          {product.badge && (
            <Badge className="absolute right-3 top-3">{product.badge}</Badge>
          )}
          <QuickViewButton product={product} />
        </div>
      </Link>

      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.category.replace("-", " ")}
        </p>
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 font-medium leading-snug transition-colors hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/product/${product.slug}#reviews`}
            title="View reviews"
            className="flex items-center gap-2 rounded transition-colors hover:text-primary"
          >
            <StarRating rating={product.rating} size={14} />
            {typeof product.reviewCount === "number" && product.reviewCount > 0 && (
              <span className="text-xs text-muted-foreground underline-offset-2 group-hover:underline">
                ({product.reviewCount})
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex flex-col">
            <span className="font-semibold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <Badge variant={stock.variant}>{stock.label}</Badge>
        </div>

        <Button
          className="w-full"
          disabled={outOfStock}
          onClick={() => {
            addItem({
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: image ? imageUrl(image, { w: 128 }) : undefined,
            });
            dispatchAddToCartEffect(imgRef.current);
          }}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {outOfStock ? "Sold Out" : "Add to Cart"}
        </Button>
      </div>
    </Card>
  );
}
