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
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { CompareButton } from "@/components/product/product-comparison";
import { PRODUCT_IMAGE } from "@/lib/product-image";
import { imageUrl } from "@/lib/sanity/image";
import { getStockState, getDefaultVariant } from "@/lib/stock";
import type { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-provider";
import { dispatchAddToCartEffect } from "@/components/effects/cart-effects";
import { useGadgetPreview } from "@/components/gadget/use-gadget-preview";
import { product2Href } from "@/lib/gadget-preview";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { addItem } = useCart();
  const gadget = useGadgetPreview();
  const href = gadget ? product2Href(product.slug) : `/product/${product.slug}`;
  const image = product.images?.[0];
  const stock = getStockState(product.stockStatus);
  const outOfStock = stock.soldOut;
  const defaultVariant = getDefaultVariant(product);
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const variantPurchasable =
    defaultVariant && getStockState(defaultVariant.stockStatus).purchasable;
  const canDirectAdd = !hasVariants || variantPurchasable;
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
      <Link href={href} prefetch={false} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {image ? (
            <Image
              ref={imgRef}
              src={imageUrl(image, { w: PRODUCT_IMAGE.card })}
              alt={product.name}
              fill
              quality={90}
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
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
          <WishlistButton product={product} />
          <CompareButton slug={product.slug} />
        </div>
      </Link>

      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.category.replace("-", " ")}
        </p>
        <Link
          href={href}
          className="line-clamp-2 font-medium leading-snug transition-colors hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-2">
          {typeof product.reviewCount === "number" &&
            product.reviewCount > 0 && (
              <Link
                href={`${href}#reviews`}
                title="View reviews"
                className="flex items-center gap-2 rounded transition-colors hover:text-primary"
              >
                <StarRating rating={product.rating} size={14} />
                <span className="text-xs text-muted-foreground underline-offset-2 group-hover:underline">
                  ({product.reviewCount})
                </span>
              </Link>
            )}
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
          <Badge variant={stock.badgeVariant}>{stock.label}</Badge>
        </div>

        {outOfStock || !canDirectAdd ? (
          <Button asChild className="w-full" variant={outOfStock ? "default" : "outline"}>
            <Link href={href}>
              {outOfStock ? "Sold Out" : "View Options"}
            </Link>
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => {
              addItem({
                slug: product.slug,
                name: product.name,
                price: defaultVariant?.price ?? product.price,
                image: image ? imageUrl(image, { w: 128 }) : undefined,
                productId: product._id,
                ...(defaultVariant
                  ? {
                      variantKey: defaultVariant._key,
                      variantId: defaultVariant._key,
                      variantName: defaultVariant.name,
                      ...(defaultVariant.sku
                        ? { variantSku: defaultVariant.sku }
                        : {}),
                    }
                  : {}),
              });
              dispatchAddToCartEffect(imgRef.current);
            }}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        )}
      </div>
    </Card>
  );
}
