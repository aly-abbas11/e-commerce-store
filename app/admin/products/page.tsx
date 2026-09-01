import type { Metadata } from "next";

import { ProductList } from "@/components/admin/product-list";
import { listAdminProducts, listAdminShopTypes } from "@/lib/db/admin-store";

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
  const [products, shopTypes] = await Promise.all([
    listAdminProducts(),
    listAdminShopTypes().catch(() => []),
  ]);
  return (
    <ProductList
      products={products}
      shopTypes={shopTypes}
      stockFilter={searchParams.stock}
    />
  );
}
