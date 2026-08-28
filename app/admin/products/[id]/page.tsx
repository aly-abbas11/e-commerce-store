import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { getAdminProduct, listAdminShopTypes } from "@/lib/db/admin-store";

export const metadata: Metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, shopTypes] = await Promise.all([
    getAdminProduct(params.id),
    listAdminShopTypes().catch(() => []),
  ]);
  if (!product) notFound();
  return <ProductForm product={product} shopTypes={shopTypes} />;
}
