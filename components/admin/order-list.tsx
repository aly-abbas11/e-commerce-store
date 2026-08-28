"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import type { AdminOrderListItem } from "@/lib/db/order-rules";
import { orderMatchesStatusFilter } from "@/lib/db/dashboard-rules";
import { formatPrice } from "@/lib/utils";
import { RemoveDemoData } from "@/components/admin/remove-demo-data";

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function OrderList({
  orders,
  statusFilter,
}: {
  orders: AdminOrderListItem[];
  statusFilter?: string;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const byStatus = orders.filter((o) => orderMatchesStatusFilter(o.status, statusFilter));
    const needle = q.trim().toLowerCase();
    if (!needle) return byStatus;
    return byStatus.filter(
      (o) =>
        o.orderId.toLowerCase().includes(needle) ||
        o.customerName.toLowerCase().includes(needle) ||
        o.customerEmail.toLowerCase().includes(needle)
    );
  }, [orders, q, statusFilter]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Orders</h1>
      <Input
        placeholder="Search order number, name, or email"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search orders"
      />
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders match.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-3 py-2 font-medium">Order number</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.orderId} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">
                    <Link
                      href={`/admin/orders/${encodeURIComponent(o.orderId)}`}
                      className="tabular-nums hover:underline"
                    >
                      {o.orderId}
                    </Link>
                    {o.isDemo ? (
                      <span className="ml-2 rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-black">
                        Demo
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    <Link
                      href={`/admin/orders/${encodeURIComponent(o.orderId)}`}
                      className="block"
                    >
                      {formatDate(o.createdAt)}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/orders/${encodeURIComponent(o.orderId)}`}
                      className="block"
                    >
                      {o.customerName || "—"}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/orders/${encodeURIComponent(o.orderId)}`}
                      className="block"
                    >
                      {STATUS_LABEL[o.status] ?? o.status}
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-medium">
                    <Link
                      href={`/admin/orders/${encodeURIComponent(o.orderId)}`}
                      className="block"
                    >
                      {formatPrice(o.total)}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <RemoveDemoData />
    </div>
  );
}
