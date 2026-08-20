"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, AlertTriangle } from "lucide-react";

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
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          🎉 You&rsquo;ve unlocked free shipping!
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
  const { items, isOpen, closeCart, subtotal, updateQuantity, removeItem, clearCart } =
    useCart();
  const config = useSiteConfig();
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [orderNote, setOrderNote] = useState("");
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

          <div className="flex-1 overflow-y-auto py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Your cart is empty.</p>
              </div>
            ) : (
              <>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={cartLineKey(item)} className="flex gap-4">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-md border bg-muted object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-md border bg-muted" />
                    )}
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">
                          {item.name}
                          {item.variantName && (
                            <span className="block text-xs text-muted-foreground">
                              {item.variantName}
                            </span>
                          )}
                        </p>
                        <button
                          onClick={() => requestRemove(cartLineKey(item))}
                          className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`Remove ${item.name}${item.variantName ? ` ${item.variantName}` : ""}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatPrice(item.price)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-11 w-11"
                          onClick={() =>
                            updateQuantity(cartLineKey(item), item.quantity - 1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-6 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-11 w-11"
                          onClick={() =>
                            updateQuantity(cartLineKey(item), item.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
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
              <Separator />
              <div className="space-y-4 pt-4">
                <FreeShippingBar
                  subtotal={subtotal}
                  threshold={config.freeShippingThreshold}
                />
                <div>
                  <label htmlFor="order-note" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Order notes (optional)
                  </label>
                  <textarea
                    id="order-note"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Special instructions for your order..."
                    rows={2}
                    className="w-full rounded-lg border bg-muted/50 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:bg-background"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-semibold">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout" onClick={closeCart}>
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/cart" onClick={closeCart}>
                    View Cart
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
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