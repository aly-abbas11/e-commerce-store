"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Loader2,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart, cartLineKey } from "@/components/cart/cart-provider";
import { saveLastOrder } from "@/lib/review-reminder";
import { formatPrice } from "@/lib/utils";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics";
import {
  checkoutValidationCategoryFromHttp,
  trackFirstParty,
  validationCategoryFromFieldName,
} from "@/lib/first-party-analytics";
import { useSiteConfig } from "@/lib/use-site-config";
import type { PriceMismatch } from "@/lib/checkout-server";

const STEPS = [
  { label: "Cart", icon: ShoppingBag },
  { label: "Details", icon: ClipboardList },
  { label: "Confirm", icon: Check },
] as const;

type PaymentMethod = "cod";

/**
 * Payment method registry — the single place to enable gateways.
 * Each entry maps to a component; only the id/label/description/icon are
 * listed here and the UI renders from this list, so adding a gateway is a
 * one-file change (plus the API-side switch in app/api/checkout/route.ts).
 */
const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof Banknote;
  available: boolean;
  badge?: string;
}[] = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay in cash when your order arrives at your door.",
    icon: Banknote,
    available: true,
    badge: "Default",
  },
];

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    updateQuantity,
    updateItemPrice,
    removeItem,
    clearCart,
  } = useCart();
  const config = useSiteConfig();

  const [step, setStep] = useState(0);
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<string | null>(null);
  const [placedTotal, setPlacedTotal] = useState<number | null>(null);
  const [customer, setCustomer] = useState<Record<string, string>>({});
  const [giftWrap, setGiftWrap] = useState(false);
  const [priceChanged, setPriceChanged] = useState<
    | {
        items: PriceMismatch[];
        subtotal: number;
        shipping: number;
        total: number;
      }
    | null
  >(null);

  const GIFT_WRAP_FEE = 199;

  const shipping =
    subtotal === 0 || subtotal >= config.freeShippingThreshold ? 0 : config.shippingFee;
  const total = subtotal + shipping + (giftWrap ? GIFT_WRAP_FEE : 0);

  const shippingLabel = useMemo(() => {
    if (subtotal === 0) return null;
    if (shipping === 0) return "Free";
    const remaining = config.freeShippingThreshold - subtotal;
    return remaining > 0
      ? `${formatPrice(shipping)} (add ${formatPrice(remaining)} more for free shipping)`
      : "Free";
  }, [subtotal, shipping, config.freeShippingThreshold]);

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (placing || placedOrder) return;
    setPlacing(true);
    setPriceChanged(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            slug: i.slug,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            ...(i.variantKey ? { variantKey: i.variantKey } : {}),
            ...(i.variantName ? { variantName: i.variantName } : {}),
            ...(i.variantSku ? { variantSku: i.variantSku } : {}),
          })),
          customer,
          payment: { method: payment },
          subtotal,
          shipping,
          total,
          giftWrap,
          giftWrapFee: giftWrap ? GIFT_WRAP_FEE : 0,
        }),
      });
      const data = await res.json();

      // 409: one or more prices changed server-side. Refresh the cart with the
      // authoritative prices (by line identity, never by slug alone), clear the
      // confirmation, and ask the customer to review — no automatic resubmit.
      if (res.status === 409 && data.code === "PRICE_CHANGED") {
        trackFirstParty({
          name: "checkout_validation_error",
          path: "/checkout",
          page_type: "checkout",
          properties: { category: "price_changed" },
        });
        for (const line of data.lines ?? []) {
          updateItemPrice(
            line.variantKey ? `${line.slug}::${line.variantKey}` : line.slug,
            line.price
          );
        }
        setPriceChanged({
          items: data.items ?? [],
          subtotal: Number(data.subtotal) || 0,
          shipping: Number(data.shipping) || 0,
          total: Number(data.total) || 0,
        });
        return;
      }

      if (!res.ok) {
        const category = checkoutValidationCategoryFromHttp(
          res.status,
          typeof data.error === "string" ? data.error : undefined
        );
        if (category) {
          trackFirstParty({
            name: "checkout_validation_error",
            path: "/checkout",
            page_type: "checkout",
            properties: { category },
          });
        }
        throw new Error(data.error ?? "Failed");
      }
      setPlacedOrder(data.orderId);
      setPlacedTotal(typeof data.total === "number" ? data.total : total);
      setPriceChanged(null);
      trackPurchase(data.orderId, analyticsItems(), total);
      clearCart();
      const first = items[0];
      if (first) {
        saveLastOrder({
          at: Date.now(),
          orderId: data.orderId,
          email: customer.email?.trim().toLowerCase() ?? "",
          name: customer.fullName?.trim() ?? "",
          product: { slug: first.slug, name: first.name },
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong placing your order. Please try again.";
      alert(message);
    } finally {
      setPlacing(false);
    }
  }

  function analyticsItems() {
    return items.map((i) => ({
      item_id: i.slug,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    }));
  }

  /* Abandoned cart: if the visitor entered an email but leaves without
     completing, queue a 3h reminder (deduped server-side by the event
     runner). Silently best-effort. */
  function notifyAbandonedCart() {
    if (placedOrder || step < 1) return;
    const emailEl = document.querySelector("#email") as HTMLInputElement | null;
    const email = emailEl?.value || customer.email;
    if (!email) return;
    const nameEl = document.querySelector("#name") as HTMLInputElement | null;
    const data = {
      email,
      name: nameEl?.value || customer.name,
      items: items.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal,
    };
    navigator.sendBeacon("/api/abandoned-cart", JSON.stringify(data));
  }

  const onLeave = () => notifyAbandonedCart();

  function nextStep(next: number) {
    if (next === 2 && step === 1) {
      trackBeginCheckout(analyticsItems(), total);
    }
    setStep(next);
  }

  // A price update notice is stale once the customer edits the cart or
  // navigates between steps; clear it so the message never misleads.
  useEffect(() => {
    if (priceChanged) setPriceChanged(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, step, giftWrap]);

  useEffect(() => {
    trackFirstParty({
      name: "checkout_started",
      path: "/checkout",
      page_type: "checkout",
    });
  }, []);

  useEffect(() => {
    if (step === 1) {
      trackFirstParty({
        name: "checkout_step",
        path: "/checkout",
        page_type: "checkout",
        properties: { step: "details" },
      });
    } else if (step === 2) {
      trackFirstParty({
        name: "checkout_step",
        path: "/checkout",
        page_type: "checkout",
        properties: { step: "confirm" },
      });
    }
  }, [step]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") onLeave();
    };
    window.addEventListener("beforeunload", onLeave);
    window.addEventListener("pagehide", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", onLeave);
      window.removeEventListener("pagehide", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, items, placedOrder, subtotal]);

  /* ── Success screen ─────────────────────────────────────────────── */
  if (placedOrder) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-16 lg:px-8">
        <div className="rounded-2xl border bg-card p-8 text-center sm:p-12">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Thanks for your order. A confirmation is on its way to your inbox —
            we&rsquo;ll email tracking updates as soon as it ships.
          </p>
          <div className="mt-6 rounded-xl bg-muted/60 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Order number
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums">{placedOrder}</p>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Pay {formatPrice(placedTotal ?? total)} cash on delivery
          </div>
          <Button asChild size="lg" className="mt-8">
            <Link href="/products">
              Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  /* ── Empty cart ─────────────────────────────────────────────────── */
  if (items.length === 0 && step === 0) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-16 lg:px-8">
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Your cart is empty
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add some products and come back to check out.
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 lg:px-8">
      {/* Progress indicator: Cart → Details → Confirm */}
      <ol className="flex items-center gap-2 sm:gap-4">
        {STEPS.map((s, i) => {
          const isCurrent = i === step;
          const isDone = i < step;
          return (
            <li key={s.label} className="flex flex-1 items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => isDone && nextStep(i)}
                disabled={!isDone}
                className={`flex items-center gap-2 ${isDone ? "cursor-pointer" : "cursor-default"}`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors sm:h-8 sm:w-8 ${
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={`hidden text-sm font-medium sm:block ${
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span
                  className={`h-px flex-1 ${
                    isDone ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        {/* ── Step content ─────────────────────────────────────────── */}
        <div>
          {step === 0 && (
            <section>
              <h1 className="text-2xl font-bold tracking-tight">
                Your Cart
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review your items before moving to delivery details.
              </p>

              <ul className="mt-6 space-y-4">
                {items.map((item) => (
                  <li
                    key={cartLineKey(item)}
                    className="flex gap-4 rounded-xl border bg-card p-4"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="h-20 w-20 shrink-0 rounded-lg border bg-muted object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 shrink-0 rounded-lg border bg-muted" />
                    )}
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          className="font-medium leading-snug hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(cartLineKey(item))}
                          aria-label={`Remove ${item.name}${item.variantName ? ` ${item.variantName}` : ""}`}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {item.variantName && (
                        <p className="text-sm text-muted-foreground">
                          {item.variantName}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-lg border px-2 py-1">
                          <button
                            onClick={() =>
                              updateQuantity(cartLineKey(item), item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(cartLineKey(item), item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-center justify-between">
                <Link
                  href="/products"
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <ChevronLeft className="h-4 w-4" /> Continue shopping
                </Link>
                <Button size="lg" onClick={() => nextStep(1)}>
                  Continue to Details <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </section>
          )}

          {step === 1 && (
            <section>
              <h1 className="text-2xl font-bold tracking-tight">
                Delivery Details
              </h1>

              {/* Guest checkout — no account required */}
              <div className="mt-4 flex items-start gap-3 rounded-xl border bg-muted/40 p-4">
                <Badge variant="outline" className="mt-0.5 shrink-0">
                  Guest checkout
                </Badge>
                <p className="text-sm text-muted-foreground">
                  No account needed. We&rsquo;ll use these details for your
                  order updates — nothing else. Check your inbox for your order
                  confirmation email.
                </p>
              </div>

              <form
                id="details-form"
                className="mt-6 grid gap-4 sm:grid-cols-2"
                onInvalidCapture={(e) => {
                  const target = e.target;
                  if (
                    !(target instanceof HTMLInputElement) &&
                    !(target instanceof HTMLSelectElement) &&
                    !(target instanceof HTMLTextAreaElement)
                  ) {
                    return;
                  }
                  trackFirstParty({
                    name: "checkout_validation_error",
                    path: "/checkout",
                    page_type: "checkout",
                    properties: {
                      category: validationCategoryFromFieldName(target.name),
                    },
                  });
                }}
                onSubmit={(e) => {
                  e.preventDefault();
                  setCustomer(
                    Object.fromEntries(
                      new FormData(e.currentTarget)
                    ) as Record<string, string>
                  );
                  nextStep(2);
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Full name *</Label>
                  <Input id="name" name="name" required autoComplete="name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="+1 555 000 0000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for delivery &amp; COD confirmation.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Street address *</Label>
                  <Input
                    id="address"
                    name="address"
                    required
                    autoComplete="street-address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" required autoComplete="address-level2" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal">Postal code</Label>
                  <Input
                    id="postal"
                    name="postal"
                    autoComplete="postal-code"
                  />
                </div>
              </form>

              <div className="mt-8 flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back to cart
                </Button>
                <Button size="lg" form="details-form" type="submit">
                  Review Order <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h1 className="text-2xl font-bold tracking-tight">
                Review &amp; Confirm
              </h1>

              {/* Payment method */}
              <h2 className="mb-3 mt-6 text-sm font-semibold">
                Payment method
              </h2>
              <div className="space-y-3" role="radiogroup" aria-label="Payment method">
                {PAYMENT_METHODS.map((method) => {
                  const selected = payment === method.id;
                  return (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/40"
                      } ${!method.available ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selected}
                        disabled={!method.available}
                        onChange={() => setPayment(method.id)}
                        className="mt-1 h-4 w-4 accent-primary"
                      />
                      <method.icon className="mt-0.5 h-5 w-5 text-primary" />
                      <span className="flex-1">
                        <span className="flex flex-wrap items-center gap-2 font-medium">
                          {method.label}
                          {method.badge && (
                            <Badge
                              variant={method.available ? "default" : "outline"}
                              className="text-[10px]"
                            >
                              {method.badge}
                            </Badge>
                          )}
                        </span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">
                          {method.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Gift wrap option */}
              <div className="mt-6 rounded-xl border p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span className="flex-1">
                    <span className="font-medium">🎁 Gift Wrapping</span>
                    <span className="block text-sm text-muted-foreground">
                      Premium gift box with ribbon — {formatPrice(GIFT_WRAP_FEE)}
                    </span>
                  </span>
                </label>
              </div>

               {/* Price-change notice (only after a 409, cleared on cart/step change) */}
              {priceChanged && (
                <div
                  role="alert"
                  className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-50/60 p-4 text-sm text-amber-800 dark:text-amber-200"
                >
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="flex-1">
                    <p className="font-semibold">Prices changed while you were checking out.</p>
                    <ul className="mt-1 list-none space-y-0.5 pl-0 text-sm">
                      {priceChanged.items.map((i, idx) => (
                        <li key={idx}>
                          {i.variantName
                            ? `${i.variantName}: `
                            : ""}{formatPrice(i.oldPrice)} → {formatPrice(i.newPrice)}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2">
                      Your order summary has been updated. Please review it before placing your
                      order again.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={placeOrder} className="mt-8">
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back to details
                  </Button>
                  <Button type="submit" size="lg" disabled={placing || Boolean(placedOrder)}>
                    {placing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing order…
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Place Order · {formatPrice(total)}
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Banknote className="h-3.5 w-3.5 text-primary" />
                  Pay cash at your door
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Secure checkout
                </span>
              </div>
            </section>
          )}
        </div>

        {/* ── Order summary sidebar ─────────────────────────────────── */}
        <aside className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-semibold">Order Summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={cartLineKey(item)} className="flex items-center gap-3">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-lg border bg-muted object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg border bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  {item.variantName && (
                    <p className="truncate text-xs text-muted-foreground">
                      {item.variantName}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Qty {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shippingLabel ?? "—"}</span>
            </div>
            {step === 2 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span>Cash on delivery</span>
              </div>
            )}
            {giftWrap && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">🎁 Gift Wrap</span>
                <span>{formatPrice(GIFT_WRAP_FEE)}</span>
              </div>
            )}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Secure checkout · SSL encrypted
          </p>
        </aside>
      </div>
    </div>
  );
}
