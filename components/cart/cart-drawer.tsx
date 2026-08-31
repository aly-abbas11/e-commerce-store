"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Banknote,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { formatPrice, cn } from "@/lib/utils";
import { useCart, cartLineKey } from "@/components/cart/cart-provider";
import { useSiteConfig } from "@/lib/use-site-config";
import { CartUpsell } from "@/components/cart/cart-upsell";
import {
  isGadgetPreviewPath,
  products2Href,
  checkoutHref,
  readGadgetPreviewSession,
  shouldUseGadgetChrome,
} from "@/lib/gadget-preview";

function ConfirmRemoveDialog({
  open,
  itemName,
  gadget,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  itemName: string;
  gadget: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!open || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
      <div
        className={cn(
          "w-full max-w-sm rounded-2xl border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150",
          gadget
            ? "gadget-theme border-[var(--g-line)] bg-[var(--g-white)] text-[var(--g-charcoal)]"
            : "border bg-background"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              gadget ? "bg-[var(--g-cream-deep)]" : "bg-amber-100 dark:bg-amber-900/30"
            )}
          >
            <AlertTriangle
              className={cn(
                "h-5 w-5",
                gadget ? "text-[var(--g-forest)]" : "text-amber-600 dark:text-amber-400"
              )}
            />
          </div>
          <div>
            <p className="font-semibold">Remove item?</p>
            <p className={cn("text-sm", gadget ? "text-[var(--g-taupe)]" : "text-muted-foreground")}>
              It will be removed from your cart.
            </p>
          </div>
        </div>
        <p className={cn("mt-4 text-sm", gadget ? "text-[var(--g-taupe)]" : "text-muted-foreground")}>
          Are you sure you want to remove{" "}
          <span className={cn("font-medium", gadget ? "text-[var(--g-charcoal)]" : "text-foreground")}>
            {itemName}
          </span>{" "}
          from your cart?
        </p>
        <div className="mt-5 flex gap-3">
          {gadget ? (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="flex h-11 flex-1 items-center justify-center rounded-full border border-[var(--g-line)] text-sm font-semibold"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex h-11 flex-1 items-center justify-center rounded-full bg-[var(--g-forest)] text-sm font-semibold text-[var(--g-white)]"
              >
                Yes, remove
              </button>
            </>
          ) : (
            <>
              <Button variant="outline" className="flex-1" onClick={onCancel}>
                Keep It
              </Button>
              <Button variant="destructive" className="flex-1" onClick={onConfirm}>
                Yes, Remove
              </Button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function FreeShippingBar({
  subtotal,
  threshold,
  gadget,
}: {
  subtotal: number;
  threshold: number;
  gadget: boolean;
}) {
  if (threshold <= 0) return null;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);

  if (gadget) {
    return (
      <div className="rounded-xl bg-[var(--g-cream-deep)] p-4">
        {remaining > 0 ? (
          <p className="text-xs text-[var(--g-taupe)]">
            You&rsquo;re{" "}
            <span className="font-semibold text-[var(--g-charcoal)]">{formatPrice(remaining)}</span> away
            from <span className="font-semibold text-[var(--g-forest)]">free shipping</span>
          </p>
        ) : (
          <p className="text-xs font-semibold text-[var(--g-forest)]">
            Free shipping unlocked
          </p>
        )}
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--g-line)]">
          <div
            className="h-full rounded-full bg-[var(--g-forest)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

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

export function CartDrawer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sessionActive, setSessionActive] = useState(false);
  useEffect(() => {
    setSessionActive(readGadgetPreviewSession());
  }, [pathname, searchParams]);
  const gadget = shouldUseGadgetChrome(pathname || "", {
    search: searchParams?.toString() ?? "",
    sessionActive: sessionActive || isGadgetPreviewPath(pathname || ""),
  });
  const shopHref = gadget ? products2Href() : "/products";
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
        <SheetContent
          className={cn(
            "flex h-dvh max-h-dvh w-full flex-col overflow-hidden p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:max-w-md sm:p-6",
            gadget &&
              "gadget-theme border-l border-[var(--g-line)] bg-[var(--g-cream)] text-[var(--g-charcoal)]"
          )}
        >
          <SheetHeader>
            <SheetTitle
              className={cn(
                "flex items-center gap-2",
                gadget && "font-semibold text-[var(--g-charcoal)]"
              )}
            >
              <ShoppingBag className="h-5 w-5" />
              Your Cart ({items.length})
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-2 text-center">
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full",
                    gadget ? "bg-[var(--g-cream-deep)] text-[var(--g-forest)]" : "text-muted-foreground"
                  )}
                >
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <div>
                  <p className={cn("font-semibold", gadget ? "text-[var(--g-charcoal)]" : "")}>
                    Your cart is empty
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-sm",
                      gadget ? "text-[var(--g-taupe)]" : "text-muted-foreground"
                    )}
                  >
                    Add something you love — COD available at checkout.
                  </p>
                </div>
                <Link
                  href={shopHref}
                  onClick={closeCart}
                  className={cn(
                    "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold",
                    gadget
                      ? "bg-[var(--g-forest)] text-[var(--g-white)]"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  Start shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
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
                          className={cn(
                            "h-16 w-16 rounded-xl border object-cover",
                            gadget
                              ? "border-[var(--g-line)] bg-[var(--g-white)]"
                              : "border bg-muted"
                          )}
                        />
                      ) : (
                        <div
                          className={cn(
                            "h-16 w-16 rounded-xl border",
                            gadget ? "border-[var(--g-line)] bg-[var(--g-white)]" : "bg-muted"
                          )}
                        />
                      )}
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-tight">
                            {item.name}
                            {item.variantName ? (
                              <span
                                className={cn(
                                  "block text-xs font-normal",
                                  gadget ? "text-[var(--g-taupe)]" : "text-muted-foreground"
                                )}
                              >
                                {item.variantName}
                              </span>
                            ) : null}
                          </p>
                          <button
                            type="button"
                            onClick={() => requestRemove(cartLineKey(item))}
                            className={cn(
                              "flex h-11 w-11 items-center justify-center transition-colors",
                              gadget
                                ? "text-[var(--g-taupe)] hover:text-[var(--g-forest)]"
                                : "text-muted-foreground hover:text-destructive"
                            )}
                            aria-label={`Remove ${item.name}${item.variantName ? ` ${item.variantName}` : ""}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p
                          className={cn(
                            "mt-1 text-sm font-medium",
                            gadget ? "text-[var(--g-charcoal)]" : "text-muted-foreground"
                          )}
                        >
                          {formatPrice(item.price)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          {gadget ? (
                            <>
                              <button
                                type="button"
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--g-line)] bg-[var(--g-white)]"
                                onClick={() =>
                                  updateQuantity(cartLineKey(item), item.quantity - 1)
                                }
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--g-line)] bg-[var(--g-white)]"
                                onClick={() =>
                                  updateQuantity(cartLineKey(item), item.quantity + 1)
                                }
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
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
                              <span className="w-6 text-center text-sm">{item.quantity}</span>
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
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <CartUpsell excludeSlugs={items.map((i) => i.slug)} />
              </>
            )}
          </div>

          {items.length > 0 ? (
            <>
              <Separator className={gadget ? "bg-[var(--g-line)]" : undefined} />
              <div className="space-y-4 pt-4">
                <FreeShippingBar
                  subtotal={subtotal}
                  threshold={config.freeShippingThreshold}
                  gadget={gadget}
                />
                {gadget && config.codEnabled ? (
                  <p className="flex items-center gap-2 text-xs text-[var(--g-taupe)]">
                    <Banknote className="h-3.5 w-3.5 text-[var(--g-forest)]" aria-hidden />
                    Cash on delivery available at checkout
                  </p>
                ) : null}
                <div>
                  <label
                    htmlFor="order-note"
                    className={cn(
                      "mb-1 block text-xs font-medium",
                      gadget ? "text-[var(--g-taupe)]" : "text-muted-foreground"
                    )}
                  >
                    Order notes (optional)
                  </label>
                  <textarea
                    id="order-note"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Special instructions for your order..."
                    rows={2}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2 text-sm outline-none",
                      gadget
                        ? "border-[var(--g-line)] bg-[var(--g-white)] placeholder:text-[var(--g-taupe)] focus:border-[var(--g-forest)]"
                        : "bg-muted/50 placeholder:text-muted-foreground focus:border-primary focus:bg-background"
                    )}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-sm",
                      gadget ? "text-[var(--g-taupe)]" : "text-muted-foreground"
                    )}
                  >
                    Subtotal
                  </span>
                  <span className="text-lg font-bold tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                {gadget ? (
                  <>
                    <Link
                      href={checkoutHref(gadget)}
                      onClick={closeCart}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--g-forest)] text-sm font-bold text-[var(--g-white)] shadow-[0_8px_20px_rgba(31,54,38,0.22)] transition hover:bg-[var(--g-forest-mid)]"
                    >
                      Proceed to checkout
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href={shopHref}
                      onClick={closeCart}
                      className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--g-line)] bg-[var(--g-white)] text-sm font-semibold text-[var(--g-charcoal)]"
                    >
                      Continue shopping
                    </Link>
                    <button
                      type="button"
                      className="w-full py-2 text-sm text-[var(--g-taupe)] hover:text-[var(--g-charcoal)]"
                      onClick={clearCart}
                    >
                      Clear cart
                    </button>
                  </>
                ) : (
                  <>
                    <Button className="w-full" size="lg" asChild>
                      <Link href={checkoutHref(false)} onClick={closeCart}>
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/cart" onClick={closeCart}>
                        View Cart
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={clearCart}>
                      Clear Cart
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
      <ConfirmRemoveDialog
        open={!!confirmKey}
        itemName={confirmItem?.name ?? ""}
        gadget={gadget}
        onConfirm={() => {
          if (confirmKey) removeItem(confirmKey);
          setConfirmKey(null);
        }}
        onCancel={() => setConfirmKey(null)}
      />
    </>
  );
}
