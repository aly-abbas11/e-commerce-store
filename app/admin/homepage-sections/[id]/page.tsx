import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomepageSectionForm } from "@/components/admin/homepage-section-form";
import { listAdminShopTypes, listAdminProducts } from "@/lib/db/admin-store";
import { getAdminHomepageSection } from "@/lib/db/homepage-sections-store";

export const metadata: Metadata = {
  title: "Edit Homepage Section",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditHomepageSectionPage({
  params,
}: {
  params: { id: string };
}) {
  const section = await getAdminHomepageSection(params.id);
  if (!section) notFound();

  const shopTypes = await listAdminShopTypes();
  const products = await listAdminProducts();

  const simpleProducts = products.map((p) => ({
    id: p._id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    price: p.price,
  }));

  return (
    <HomepageSectionForm
      section={section}
      shopTypes={shopTypes}
      availableProducts={simpleProducts}
    />
  );
}
