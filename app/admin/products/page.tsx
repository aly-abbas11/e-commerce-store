import type { Metadata } from "next";

import { ProductList } from "@/components/admin/product-list";
import { listAdminProducts } from "@/lib/db/admin-store";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { stock?: string };
}) {
  const products = await listAdminProducts();
  return <ProductList products={products} stockFilter={searchParams.stock} />;
}
