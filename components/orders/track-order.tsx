"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SHOPPER_NOT_FOUND_MESSAGE } from "@/lib/db/order-rules";
import type { OrderStatus } from "@/lib/types";

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

const PIPELINE: OrderStatus[] = ["new", "processing", "shipped", "delivered"];

type StepState = "complete" | "current" | "upcoming";

type TimelineStep = {
  key: OrderStatus;
  label: string;
  state: StepState;
  note?: string;
  at?: string | null;
};

function lastHistory(history: HistoryEntry[], status: OrderStatus): HistoryEntry | undefined {
  const matches = history.filter((h) => h.status === status);
  return matches[matches.length - 1];
}

function buildTimeline(result: TrackResponse): TimelineStep[] {
  const history = result.statusHistory ?? [];
  if (result.status === "cancelled") {
    const placed = lastHistory(history, "new");
    const cancelled = lastHistory(history, "cancelled");
    return [
      {
        key: "new",
        label: STATUS_LABEL.new,
        state: "complete",
        note: placed?.note,
        at: placed?.at ?? result.createdAt,
      },
      {
        key: "cancelled",
        label: STATUS_LABEL.cancelled,
        state: "current",
        note: cancelled?.note,
        at: cancelled?.at ?? result.statusUpdatedAt,
      },
    ];
  }

  const currentIdx = Math.max(0, PIPELINE.indexOf(result.status));
  return PIPELINE.map((status, i) => {
    const entry = lastHistory(history, status);
    const reached = i <= currentIdx;
    let at = entry?.at;
    if (status === "new") at = at ?? result.createdAt ?? undefined;
    else if (i === currentIdx) at = at ?? result.statusUpdatedAt ?? undefined;
    return {
      key: status,
      label: STATUS_LABEL[status],
      state: (i < currentIdx ? "complete" : i === currentIdx ? "current" : "upcoming") as StepState,
      note: reached ? entry?.note : undefined,
      at: reached ? at : undefined,
    };
  });
}

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

  async function search(o: string, e: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(o.trim())}?email=${encodeURIComponent(e.trim())}`
      );
      if (res.status === 404) {
        setError(SHOPPER_NOT_FOUND_MESSAGE);
        return;
      }
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.orderId) {
        setError("Something went wrong. Try again.");
        return;
      }
      setResult(body);
    } catch {
      setError("Something went wrong. Try again.");
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

  const steps = result ? buildTimeline(result) : [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-5 sm:p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search(orderId, email);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="orderId">Order number</Label>
            <Input
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
              autoComplete="off"
              placeholder="e.g. VG-1042"
            />
            <p className="text-xs text-muted-foreground">
              Enter the order number from your confirmation email
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email used at checkout</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
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
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-5 sm:p-6">
            <p className="text-sm text-muted-foreground">{result.orderId}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              {STATUS_LABEL[result.status]}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Updated {formatDate(result.statusUpdatedAt ?? result.createdAt)}
            </p>

            <ol className="mt-6">
              {steps.map((step, i) => {
                const isLast = i === steps.length - 1;
                const done = step.state === "complete" || step.state === "current";
                return (
                  <li key={step.key} className="relative flex gap-3 pb-6 last:pb-0">
                    {!isLast && (
                      <span
                        className={`absolute left-[7px] top-5 h-full w-px ${
                          step.state === "complete" ? "bg-primary/40" : "bg-border"
                        }`}
                      />
                    )}
                    <span
                      className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                        step.state === "current"
                          ? "border-primary bg-primary"
                          : step.state === "complete"
                            ? "border-primary bg-primary/30"
                            : "border-border bg-background"
                      }`}
                      aria-hidden
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          step.state === "upcoming" ? "text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {step.label}
                        {step.state === "current" && (
                          <span className="ml-2 text-xs font-normal text-primary">current</span>
                        )}
                      </p>
                      {done && step.note ? (
                        <p className="mt-0.5 text-sm text-muted-foreground">{step.note}</p>
                      ) : null}
                      {done && step.at ? (
                        <p className="text-xs text-muted-foreground/70">{formatDate(step.at)}</p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="rounded-xl border bg-card p-5 sm:p-6">
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
              <div className="flex justify-between text-muted-foreground">
                <dt>Payment</dt>
                <dd>
                  {result.payment === "cod" ? "Cash on delivery" : result.payment}
                </dd>
              </div>
            </dl>
          </div>

          <p className="text-sm text-muted-foreground">
            Questions about your order?{" "}
            <Link href="/contact" className="font-medium text-primary hover:underline">
              Contact us
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
