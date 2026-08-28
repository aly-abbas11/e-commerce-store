import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GadgetBuyBox } from "@/components/gadget/gadget-buy-box";
import { GadgetProductCard } from "@/components/gadget/gadget-product-card";
import { GadgetVideo } from "@/components/gadget/gadget-video";
import { fetchAllProducts, fetchProductBySlug } from "@/lib/db/store";
import { isDemoSession } from "@/lib/demo";
import { getSettings } from "@/lib/sanity/settings";
import { normalizeSettings } from "@/lib/site-config";
import type { Product } from "@/lib/types";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await fetchProductBySlug(params.slug, isDemoSession()).catch(() => null);
  if (!product) return { robots: { index: false, follow: false } };
  return {
    title: `${product.name} (preview)`,
    robots: { index: false, follow: false },
  };
}

export default async function Product2Page({ params }: { params: { slug: string } }) {
  const demo = isDemoSession();
  let product: Product | null = null;
  let related: Product[] = [];
  let settings = null;
  try {
    product = await fetchProductBySlug(params.slug, demo);
    if (product) {
      [related, settings] = await Promise.all([
        fetchAllProducts(demo),
        getSettings().catch(() => null),
      ]);
    }
  } catch {
    product = null;
  }

  if (!product) notFound();

  const config = normalizeSettings(settings);
  const relatedProducts = related
    .filter((p) => p._id !== product._id && p.category === product.category)
    .slice(0, 4);
  const specs = (product.specifications ?? []).filter((s) => s?.label?.trim() && s?.value?.trim());
  const features = (product.features ?? []).filter(Boolean);

  return (
    <div className="bg-white text-zinc-950">
      <div className="px-4 py-8 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          <Link href="/home2" className="hover:text-zinc-950">
            Home
          </Link>
          <span className="px-2">/</span>
          <Link href={`/products/${product.category}`} className="hover:text-zinc-950">
            {product.category.replace("-", " ")}
          </Link>
        </nav>

        <div className="mt-6">
          <GadgetBuyBox product={product} config={config} />
        </div>

        <GadgetVideo product={product} />

        {features.length ? (
          <section className="mt-12">
            <h2 className="text-xl font-black uppercase tracking-tight">Features</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {features.map((f) => (
                <li key={f} className="border border-zinc-200 px-4 py-3 text-sm font-medium">
                  {f}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {specs.length ? (
          <section className="mt-12">
            <h2 className="text-xl font-black uppercase tracking-tight">Specs</h2>
            <dl className="mt-4 divide-y border border-zinc-200">
              {specs.map((s) => (
                <div key={s.label} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm">
                  <dt className="font-bold">{s.label}</dt>
                  <dd className="text-zinc-600">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {product.inTheBox?.length ? (
          <section className="mt-12">
            <h2 className="text-xl font-black uppercase tracking-tight">In the box</h2>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
              {product.inTheBox.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {relatedProducts.length ? (
          <section className="mt-12 pb-8">
            <h2 className="text-xl font-black uppercase tracking-tight">Also shop</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <GadgetProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-8 text-xs text-zinc-500">
          <Link href={`/product/${product.slug}`} className="underline">
            View current product page
          </Link>
        </p>
      </div>
    </div>
  );
}
