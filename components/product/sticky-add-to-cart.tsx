"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { dispatchAddToCartEffect } from "@/components/effects/cart-effects";
import { imageUrl } from "@/lib/sanity/image";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function StickyAddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  if (product.stockStatus === "out-of-stock") return null;

  const img = product.images?.[0];

  function handleAdd() {
    addItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: img ? imageUrl(img, { w: 128 }) : undefined,
    });
    const bar = document.getElementById("sticky-add-bar");
    if (bar) {
      const r = bar.getBoundingClientRect();
      dispatchAddToCartEffect(null, r.left + r.width / 2, r.top);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-0" />
      <div
        id="sticky-add-bar"
        className={`fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-transform duration-300 ${
          visible
            ? "translate-y-0"
            : "translate-y-full"
        }`}
      >
        <div className="container mx-auto flex items-center gap-4 px-4 py-3 lg:px-8">
          {img && (
            <img
              src={imageUrl(img, { w: 96 })}
              alt=""
              className="hidden h-12 w-12 rounded-md object-cover sm:block"
              loading="lazy"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{product.name}</p>
            <p className="text-lg font-bold">{formatPrice(product.price)}</p>
          </div>
          <Button size="lg" className="shrink-0 px-8" onClick={handleAdd}>
            {added ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
