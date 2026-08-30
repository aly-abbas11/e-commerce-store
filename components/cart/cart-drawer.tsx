"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, ShoppingBag, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { useCart, cartLineKey } from "@/components/cart/cart-provider";
import { useSiteConfig } from "@/lib/use-site-config";
import { CartUpsell } from "@/components/cart/cart-upsell";

function ConfirmRemoveDialog({
  open,
  itemName,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!open || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-background p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-semibold">Remove item?</p>
            <p className="text-sm text-muted-foreground">
              It will be removed from your cart.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Are you sure you want to remove <span className="font-medium text-foreground">{itemName}</span> from your cart?
        </p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Keep It
          </Button>
          <Button variant="destructive" className="flex-1" onClick={onConfirm}>
            Yes, Remove
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function FreeShippingBar({
  subtotal,
  threshold,
}: {
  subtotal: number;
  threshold: number;
}) {
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
        <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" /> You&rsquo;ve unlocked free shipping!
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

export function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, updateQuantity, removeItem } =
    useCart();
  const config = useSiteConfig();
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const confirmItem = confirmKey ? items.find((i) => cartLineKey(i) === confirmKey) : null;

  function requestRemove(key: string) {
    closeCart();
    setConfirmKey(key);
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => (open ? null : closeCart())}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Your Cart ({items.length})
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-1 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-secondary p-6">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">Your cart is empty.</p>
                  <p className="mt-1 text-sm text-muted-foreground max-w-[250px]">
                    Looks like you haven&apos;t added anything to your cart yet.
                  </p>
                </div>
                <Button className="mt-4 rounded-full px-8" onClick={closeCart}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <>
              <ul className="space-y-6">
                {items.map((item) => (
                  <li key={cartLineKey(item)} className="flex gap-4">
                    {item.image ? (
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 shrink-0 rounded-xl border bg-muted" />
                    )}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={closeCart}
                            className="text-sm font-semibold leading-tight hover:text-primary transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => requestRemove(cartLineKey(item))}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Remove ${item.name}${item.variantName ? ` ${item.variantName}` : ""}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {item.variantName && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.variantName}
                          </p>
                        )}
                        <p className="mt-1.5 text-sm font-semibold text-primary">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-9 items-center rounded-full border bg-background">
                          <button
                            className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              updateQuantity(cartLineKey(item), item.quantity - 1)
                            }
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                            onClick={() =>
                              updateQuantity(cartLineKey(item), item.quantity + 1)
                            }
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <CartUpsell excludeSlugs={items.map((i) => i.slug)} />
              </>
            )}
          </div>

          {items.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="space-y-5 pt-2 pb-6">
                <FreeShippingBar
                  subtotal={subtotal}
                  threshold={config.freeShippingThreshold}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                    <span className="text-xl font-bold tracking-tight">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Taxes and shipping calculated at checkout.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <Button className="w-full h-12 rounded-full text-base font-medium shadow-sm" size="lg" asChild>
                    <Link href="/checkout" onClick={closeCart}>
                      Checkout
                    </Link>
                  </Button>
                  <Button variant="secondary" className="w-full rounded-full" asChild>
                    <Link href="/cart" onClick={closeCart}>
                      View Cart
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <ConfirmRemoveDialog
        open={!!confirmKey}
        itemName={confirmItem?.name ?? ""}
        onConfirm={() => {
          if (confirmKey) removeItem(confirmKey);
          setConfirmKey(null);
        }}
        onCancel={() => setConfirmKey(null)}
      />
    </>
  );
}