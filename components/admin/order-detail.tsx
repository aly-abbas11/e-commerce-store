"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { adminFetch, AdminAuthError } from "@/components/admin/admin-fetch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_STATUS_VALUES } from "@/lib/db/order-rules";
import type { Order, OrderStatus } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function OrderDetail({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.status ?? "new");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    setStatus(order.status ?? "new");
  }, [order.status, order.statusUpdatedAt]);

  const customer = order.customer ?? {};
  const history = order.statusHistory ?? [];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setOk(null);
    try {
      await adminFetch(`/api/orders/${encodeURIComponent(order.orderId)}/status`, {
        method: "POST",
        body: JSON.stringify({
          status,
          note: note.trim() || undefined,
        }),
      });
      setNote("");
      setOk("Status updated.");
      router.refresh();
    } catch (err) {
      if (err instanceof AdminAuthError) {
        router.replace("/admin/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Could not update the order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orders" className="text-sm text-muted-foreground hover:underline">
          ← Orders
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">
          Order <span className="tabular-nums">{order.orderId}</span>
          {order.isDemo ? (
            <span className="ml-2 align-middle rounded bg-amber-400 px-1.5 py-0.5 text-xs font-semibold uppercase text-black">
              Demo
            </span>
          ) : null}
        </h1>
        <p className="text-sm text-muted-foreground">
          Placed {formatDate(order.createdAt)}
          {order.statusUpdatedAt ? ` · Updated ${formatDate(order.statusUpdatedAt)}` : ""}
        </p>
      </div>

      <section className="rounded-lg border p-4">
        <h2 className="text-sm font-semibold">Customer</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd>{customer.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd>{customer.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Phone</dt>
            <dd>{customer.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">City</dt>
            <dd>{customer.city || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Address</dt>
            <dd>{customer.address || "—"}</dd>
          </div>
          {customer.postal ? (
            <div>
              <dt className="text-muted-foreground">Postal</dt>
              <dd>{customer.postal}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-sm font-semibold">Items</h2>
        <ul className="mt-3 divide-y">
          {(order.items ?? []).map((item, i) => (
            <li key={`${item.name}-${i}`} className="flex items-center justify-between gap-4 py-2 text-sm">
              <span>
                {item.name}
                {item.variantName ? (
                  <span className="text-muted-foreground"> — {item.variantName}</span>
                ) : null}
                <span className="ml-2 text-muted-foreground">× {item.quantity ?? 1}</span>
              </span>
              <span className="font-medium">
                {formatPrice((item.price ?? 0) * (item.quantity ?? 1))}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <dt>Subtotal</dt>
            <dd>{formatPrice(order.subtotal ?? 0)}</dd>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <dt>Shipping</dt>
            <dd>{(order.shipping ?? 0) > 0 ? formatPrice(order.shipping ?? 0) : "Free"}</dd>
          </div>
          <div className="flex justify-between font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(order.total ?? 0)}</dd>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <dt>Payment</dt>
            <dd>{order.payment === "cod" || !order.payment ? "Cash on delivery" : order.payment}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-sm font-semibold">Timeline</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No status updates yet.</p>
        ) : (
          <ol className="mt-3 space-y-3">
            {history.map((h, i) => (
              <li key={`${h.status}-${h.at}-${i}`} className="text-sm">
                <p className="font-medium">{STATUS_LABEL[h.status] ?? h.status}</p>
                {h.note ? <p className="text-muted-foreground">{h.note}</p> : null}
                {h.at ? <p className="text-xs text-muted-foreground">{formatDate(h.at)}</p> : null}
              </li>
            ))}
          </ol>
        )}
      </section>

      <form onSubmit={submit} className="space-y-3 rounded-lg border p-4">
        <h2 className="text-sm font-semibold">Update status</h2>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
          >
            {ORDER_STATUS_VALUES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tracking number, courier, reason…"
            rows={3}
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {ok ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{ok}</p> : null}
        <Button type="submit" disabled={saving}>
          {saving ? "Updating…" : "Update"}
        </Button>
      </form>
    </div>
  );
}
