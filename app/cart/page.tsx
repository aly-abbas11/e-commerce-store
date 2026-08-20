"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart, cartLineKey } from "@/components/cart/cart-provider";
import { useSiteConfig } from "@/lib/use-site-config";
import { formatPrice } from "@/lib/utils";

function FreeShippingBar({ subtotal, threshold }: { subtotal: number; threshold: number }) {
  if (threshold <= 0) return null;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);
  return (
    <div className="rounded-xl bg-muted/60 p-4">
      {remaining > 0 ? (
        <p className="text-xs text-muted-foreground">
          You&rsquo;re <span className="font-semibold text-foreground">{formatPrice(remaining)}</span>{" "}
          away from <span className="font-semibold text-foreground">free shipping</span>
        </p>
      ) : (
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          You&rsquo;ve unlocked free shipping!
        </p>
      )}
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const config = useSiteConfig();

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center lg:px-8">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some products to get started.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Continue Shopping
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
      <p className="mt-1 text-muted-foreground">{items.length} item(s) in your cart</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={cartLineKey(item)}
              className="flex gap-4 rounded-xl border bg-card p-4"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={120}
                  height={120}
                  className="h-24 w-24 rounded-lg border bg-muted object-cover sm:h-28 sm:w-28"
                />
              ) : (
                <div className="h-24 w-24 rounded-lg border bg-muted sm:h-28 sm:w-28" />
              )}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-medium transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  {item.variantName && (
                    <p className="text-sm text-muted-foreground">{item.variantName}</p>
                  )}
                  <p className="mt-0.5 text-sm font-semibold">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 rounded-md border px-2 py-1">
                    <button
                      onClick={() => updateQuantity(cartLineKey(item), Math.max(1, item.quantity - 1))}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(cartLineKey(item), item.quantity + 1)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(cartLineKey(item))}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-semibold">Order Summary</h2>
          <FreeShippingBar subtotal={subtotal} threshold={config.freeShippingThreshold} />
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {subtotal >= config.freeShippingThreshold
                  ? "Free"
                  : formatPrice(config.shippingFee)}
              </span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>
              {formatPrice(
                subtotal >= config.freeShippingThreshold
                  ? subtotal
                  : subtotal + config.shippingFee
              )}
            </span>
          </div>
          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
