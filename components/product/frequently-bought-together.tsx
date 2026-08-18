"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { ShoppingCart, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchFromSanity } from "@/lib/sanity/client";
import { imageUrl } from "@/lib/sanity/image";
import { productsQuery } from "@/lib/sanity/queries";
import type { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-provider";

interface BundleItem {
  product: Product;
  selected: boolean;
}

export function FrequentlyBoughtTogether({ current }: { current: Product }) {
  const [items, setItems] = useState<BundleItem[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    fetchFromSanity<Product[]>(productsQuery)
      .then((products) => {
        const sameCategory = products
          .filter((p) => p._id !== current._id && p.category === current.category && p.stockStatus !== "out-of-stock")
          .slice(0, 2);
        const crossCategory = products
          .filter((p) => p._id !== current._id && p.category !== current.category && p.stockStatus !== "out-of-stock")
          .slice(0, 2);
        const suggestions = [...sameCategory, ...crossCategory].slice(0, 3);
        setItems(suggestions.map((p) => ({ product: p, selected: true })));
      })
      .catch(() => {});
  }, [current._id]);

  const bundlePrice = useMemo(() => {
    const base = current.price;
    const extras = items
      .filter((i) => i.selected)
      .reduce((sum, i) => sum + i.product.price, 0);
    return base + extras;
  }, [current.price, items]);

  const originalPrice = useMemo(() => {
    const base = current.price;
    const extras = items
      .filter((i) => i.selected)
      .reduce((sum, i) => sum + (i.product.compareAtPrice || i.product.price), 0);
    return base + extras;
  }, [current.price, items]);

  const savings = originalPrice - bundlePrice;

  if (items.length === 0) return null;

  function toggleItem(index: number) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  }

  function addBundleToCart() {
    addItem({
      slug: current.slug,
      name: current.name,
      price: current.price,
      image: current.images?.[0] ? imageUrl(current.images[0], { w: 128 }) : undefined,
    });
    items
      .filter((i) => i.selected)
      .forEach((i) =>
        addItem({
          slug: i.product.slug,
          name: i.product.name,
          price: i.product.price,
          image: i.product.images?.[0] ? imageUrl(i.product.images[0], { w: 128 }) : undefined,
        })
      );
  }

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold tracking-tight">Frequently Bought Together</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Bundle and save on products that go perfectly together.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
        {/* Current product */}
        <Card className="flex items-center gap-4 p-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
            {current.images?.[0] && (
              <Image
                src={imageUrl(current.images[0], { w: 160 })}
                alt={current.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium">{current.name}</p>
            <p className="mt-1 font-semibold">{formatPrice(current.price)}</p>
          </div>
          <Check className="h-5 w-5 shrink-0 text-primary" />
        </Card>

        {/* Suggested items */}
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <Card
              key={item.product._id}
              className={cn(
                "flex items-center gap-3 p-3 transition-all",
                item.selected ? "border-primary/50 bg-primary/5" : "opacity-50"
              )}
            >
              <button
                onClick={() => toggleItem(index)}
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                  item.selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border"
                )}
                aria-label={`Toggle ${item.product.name}`}
              >
                {item.selected && <Check className="h-3 w-3" />}
              </button>
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.product.images?.[0] && (
                  <Image
                    src={imageUrl(item.product.images[0], { w: 120 })}
                    alt={item.product.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-xs font-medium">{item.product.name}</p>
                <p className="text-xs font-semibold">{formatPrice(item.product.price)}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="flex flex-col items-center justify-center gap-3 p-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Bundle Price</p>
            <p className="mt-1 text-2xl font-bold">{formatPrice(bundlePrice)}</p>
            {savings > 0 && (
              <>
                <p className="text-sm text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Save {formatPrice(savings)}
                </p>
              </>
            )}
          </div>
          <Button className="w-full gap-2" onClick={addBundleToCart}>
            <ShoppingCart className="h-4 w-4" />
            Add Bundle to Cart
          </Button>
        </Card>
      </div>
    </section>
  );
}
