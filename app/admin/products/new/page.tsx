import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/product-form";
import { listAdminShopTypes } from "@/lib/db/admin-store";

export const metadata: Metadata = {
  title: "Add product",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const shopTypes = await listAdminShopTypes().catch(() => []);
  return <ProductForm shopTypes={shopTypes} />;
}
