"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Loader2,
  PackageSearch,
  Search,
  Truck,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OrderStatus =
  | "new"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

interface HistoryEntry {
  status: string;
  note?: string;
  at?: string;
}

interface TrackResponse {
  orderId: string;
  status: OrderStatus;
  statusUpdatedAt: string | null;
  statusHistory: HistoryEntry[];
  createdAt: string | null;
  items: {
    name: string;
    price: number;
    quantity: number;
    variantName?: string;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  payment: string;
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Order placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  new: "bg-muted text-muted-foreground",
  processing: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-destructive/10 text-destructive",
};

const STATUS_ICON = {
  new: Clock,
  processing: Clock,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
} as const;

function formatPrice(n: number): string {
  return `Rs ${n.toLocaleString("en-PK")}`;
}

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackResponse | null>(null);
  const [searchedId, setSearchedId] = useState<string | null>(null);

  async function search(o: string, e: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    setSearchedId(null);
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(o.trim())}?email=${encodeURIComponent(e.trim())}`
      );
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.orderId) {
        setError(
          body?.error ||
            "We couldn't find an order for those details. Check the order ID and email."
        );
        return;
      }
      setResult(body);
      setSearchedId(o.trim());
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const o = params.get("orderId") ?? "";
    const e = params.get("email") ?? "";
    if (o && e) {
      setOrderId(o);
      setEmail(e);
      search(o, e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timeline: { label: string; note?: string; at?: string; status: OrderStatus }[] = [
    { label: STATUS_LABEL.new, at: result?.createdAt ?? undefined, status: "new" },
    ...(result?.statusHistory ?? []).map((h) => ({
      label: STATUS_LABEL[(h.status as OrderStatus) ?? "new"] ?? "Update",
      note: h.note,
      at: h.at,
      status: (h.status as OrderStatus) || ("new" as OrderStatus),
    })),
  ];
  if (result) {
    const hasCurrent =
      result.statusHistory?.some((h) => h.status === result.status) ||
      result.status === "new";
    if (!hasCurrent) {
      timeline.push({
        label: STATUS_LABEL[result.status],
        at: result.statusUpdatedAt ?? undefined,
        status: result.status,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search(orderId, email);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="orderId">Order ID</Label>
            <Input
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
              placeholder="e.g. VG-AB12CD34EF56"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email used at checkout</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Track order
          </Button>
        </form>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Order</p>
                <p className="text-lg font-bold tracking-tight">
                  {result.orderId}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[result.status]}`}
              >
                {(() => {
                  const Icon = STATUS_ICON[result.status];
                  return <Icon className="h-3.5 w-3.5" />;
                })()}
                {STATUS_LABEL[result.status]}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Payment: {result.payment === "cod" ? "Cash on delivery" : result.payment}
            </p>

            <ol className="mt-6 space-y-0">
              {timeline.map((step, i) => {
                const isLast = i === timeline.length - 1;
                return (
                  <li key={`${step.label}-${i}`} className="relative flex gap-3 pb-6 last:pb-0">
                    {!isLast && (
                      <span className="absolute left-[7px] top-5 h-full w-px bg-border" />
                    )}
                    <span
                      className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                        isLast
                          ? "border-primary bg-primary"
                          : "border-border bg-background"
                      }`}
                    />
                    <div>
                      <p className={`text-sm font-semibold ${isLast ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                        {isLast && (
                          <span className="ml-2 text-xs font-normal text-primary">
                            current
                          </span>
                        )}
                      </p>
                      {step.note && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {step.note}
                        </p>
                      )}
                      {step.at && (
                        <p className="text-xs text-muted-foreground/70">
                          {formatDate(step.at)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-bold tracking-tight">Items</h3>
            <ul className="mt-4 divide-y divide-border">
              {result.items.map((item, i) => (
                <li
                  key={`${item.name}-${i}`}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <span>
                    {item.name}
                    {item.variantName && (
                      <span className="text-muted-foreground"> — {item.variantName}</span>
                    )}
                    <span className="ml-2 text-muted-foreground">× {item.quantity}</span>
                  </span>
                  <span className="font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <dt>Subtotal</dt>
                <dd>{formatPrice(result.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <dt>Shipping</dt>
                <dd>{result.shipping > 0 ? formatPrice(result.shipping) : "Free"}</dd>
              </div>
              <div className="flex justify-between text-base font-bold">
                <dt>Total</dt>
                <dd>{formatPrice(result.total)}</dd>
              </div>
            </dl>
          </div>

          {searchedId && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <PackageSearch className="h-4 w-4" />
              Bookmark this page to check again later — it updates whenever your
              order&rsquo;s status changes.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
