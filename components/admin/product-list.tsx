"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminProduct } from "@/lib/db/admin-types";
import { productMatchesStockAttention } from "@/lib/db/dashboard-rules";
import { formatPrice } from "@/lib/utils";

export function ProductList({
  products,
  stockFilter,
}: {
  products: AdminProduct[];
  stockFilter?: string;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const byStock =
      stockFilter === "attention"
        ? products.filter((p) => productMatchesStockAttention(p.stockStatus))
        : products;
    const needle = q.trim().toLowerCase();
    if (!needle) return byStock;
    return byStock.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.slug.toLowerCase().includes(needle) ||
        p.status.toLowerCase().includes(needle)
    );
  }, [products, q, stockFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">Add product</Link>
        </Button>
      </div>
      <Input
        placeholder="Search name, slug, or status"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search products"
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products match.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Stock</th>
                <th className="px-3 py-2 font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-b last:border-0">
                  <td className="px-3 py-2">
                    <Link href={`/admin/products/${p._id}`} className="flex items-center gap-3 hover:underline">
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs">—</span>
                      )}
                      <span>
                        <span className="block font-medium">{p.name}</span>
                        <span className="block text-xs text-muted-foreground">{p.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-2 capitalize">{p.draft ? `${p.status} · draft` : p.status}</td>
                  <td className="px-3 py-2">{p.stockStatus}</td>
                  <td className="px-3 py-2">{formatPrice(p.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
