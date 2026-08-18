"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/product/star-rating";
import { imageUrl } from "@/lib/sanity/image";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-provider";

const STOCK_LABEL: Record<string, { label: string; variant: "success" | "warning" | "destructive" }> = {
  "in-stock": { label: "In Stock", variant: "success" },
  "low-stock": { label: "Low Stock", variant: "warning" },
  "out-of-stock": { label: "Out of Stock", variant: "destructive" },
};

export function QuickViewButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const image = product.images?.[0];
  const outOfStock = product.stockStatus === "out-of-stock";
  const stock = STOCK_LABEL[product.stockStatus] ?? STOCK_LABEL["in-stock"];
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="absolute bottom-3 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md backdrop-blur transition-all hover:bg-background hover:shadow-lg opacity-0 group-hover:opacity-100"
          aria-label={`Quick view ${product.name}`}
        >
          <Eye className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0">
        <div className="grid sm:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-muted">
            {image ? (
              <Image
                src={imageUrl(image, { w: 600 })}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
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
          </div>

          {/* Details */}
          <div className="flex flex-col p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {product.category.replace("-", " ")}
            </p>
            <h3 className="mt-1 text-lg font-bold leading-snug">{product.name}</h3>

            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={product.rating} size={14} />
              {typeof product.reviewCount === "number" && product.reviewCount > 0 && (
                <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
              )}
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            <Badge variant={stock.variant} className="mt-2 w-fit">
              {stock.label}
            </Badge>

            {product.shortDescription && (
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                {product.shortDescription}
              </p>
            )}

            <div className="mt-auto flex flex-col gap-2 pt-4">
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
                }}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                {outOfStock ? "Sold Out" : "Add to Cart"}
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/product/${product.slug}`}>View Full Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
