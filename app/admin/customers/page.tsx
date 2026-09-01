import type { Metadata } from "next";
import Link from "next/link";

import { listAdminCustomers } from "@/lib/db/customer-list";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await listAdminCustomers().catch(() => []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Customers</h1>
      <p className="text-sm text-muted-foreground">
        Built from live orders (demo orders hidden). Open the latest order for
        full details.
      </p>
      {customers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No customers yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Phone</th>
                <th className="px-3 py-2 font-medium">Orders</th>
                <th className="px-3 py-2 font-medium">Latest</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.key} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2">
                    {c.email ? (
                      <a className="underline" href={`mailto:${c.email}`}>
                        {c.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2">{c.phone || "—"}</td>
                  <td className="px-3 py-2">{c.orderCount}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/orders/${encodeURIComponent(c.lastOrderId)}`}
                      className="underline"
                    >
                      {c.lastOrderId}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
