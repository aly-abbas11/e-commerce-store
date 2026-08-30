import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { GadgetHero } from "@/components/gadget/gadget-hero";
import { gadgetImageSrc } from "@/components/gadget/gadget-image";
import { GadgetProductCard } from "@/components/gadget/gadget-product-card";
import { FALLBACK_SHOP_TYPES, shopTypeLinks } from "@/lib/categories";
import { fetchAllProducts, fetchHero, fetchShopTypes, fetchSiteSettings, fetchTestimonials } from "@/lib/db/store";
import { isDemoSession } from "@/lib/demo";
import { PRODUCT_IMAGE } from "@/lib/product-image";
import { normalizeSettings } from "@/lib/site-config";
import type { Product, Testimonial } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gadget shop preview",
  robots: { index: false, follow: false },
};

function hasUsableImage(product: Product) {
  return Boolean(product.images?.[0] || product.cloudinaryImages?.[0]);
}

export default async function Home2Page() {
  const demo = isDemoSession();
  let products: Product[] = [];
  let testimonials: Testimonial[] = [];
  let hero = null;
  let settings = null;
  let shopTypes = shopTypeLinks(FALLBACK_SHOP_TYPES);
  try {
    const [h, p, t, s, types] = await Promise.all([
      fetchHero(demo),
      fetchAllProducts(demo),
      fetchTestimonials(demo),
      fetchSiteSettings(),
      fetchShopTypes(),
    ]);
    hero = h;
    products = p;
    testimonials = t;
    settings = s;
    shopTypes = shopTypeLinks(types);
  } catch {
    products = [];
  }

  const config = normalizeSettings(settings);

  const featured = products.filter((p) => p.featured);
  const merchandise = (featured.length ? featured : products.filter((p) => p.stockStatus !== "out-of-stock")).slice(
    0,
    8
  );
  const heroProduct =
    hero?.featuredProduct ??
    merchandise.find((p) => hasUsableImage(p) && p.stockStatus !== "out-of-stock") ??
    merchandise.find((p) => hasUsableImage(p)) ??
    null;

  const categoryCards = shopTypes.map((cat) => {
    const slug = cat.href.split("/").pop() as string;
    const candidates = products.filter((p) => p.category === slug);
    const rep =
      candidates.find((p) => p.featured && hasUsableImage(p)) ??
      candidates.find((p) => hasUsableImage(p)) ??
      candidates[0];
    return rep ? { ...cat, product: rep } : null;
  }).filter((c): c is { label: string; href: string; product: Product } => Boolean(c));

  return (
    <div className="bg-white text-zinc-950">
      <GadgetHero
        headline={hero?.headline || heroProduct?.name || "Power your everyday."}
        subheadline={hero?.subheadline}
        product={heroProduct}
        codEnabled={config.codEnabled}
        freeShippingThreshold={config.freeShippingThreshold}
      />

      {categoryCards.length ? (
        <section className="px-4 py-16 lg:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Catalog</p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">Shop by type</h2>
          <div className="mt-8 grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
            {categoryCards.map((card) => {
              const image = gadgetImageSrc(card.product, PRODUCT_IMAGE.card);
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group relative block aspect-[3/4] overflow-hidden bg-zinc-100"
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={card.label}
                      fill
                      quality={90}
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover"
                    />
                  ) : null}
                  <span className="absolute inset-x-0 bottom-0 bg-zinc-950/85 px-3 py-3 text-sm font-black uppercase text-white">
                    {card.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {merchandise.length ? (
        <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16 lg:px-8 lg:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Picks</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">Featured</h2>
            </div>
            <Link
              href="/products"
              className="min-h-11 inline-flex items-center text-sm font-bold uppercase underline-offset-4 hover:underline"
            >
              All products
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
            {merchandise.map((product) => (
              <GadgetProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {testimonials.length ? (
        <section className="bg-zinc-950 px-4 py-16 text-white lg:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-golden-400">Proof</p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">What buyers say</h2>
          <div className="mt-8 grid gap-px bg-zinc-800 md:grid-cols-3">
            {testimonials.slice(0, 3).map((item, i) => (
              <blockquote key={`${item.customerName}-${i}`} className="bg-zinc-950 p-6">
                <p className="text-sm leading-relaxed text-zinc-200">“{item.reviewText}”</p>
                <footer className="mt-4 text-xs font-bold uppercase tracking-widest text-golden-400">
                  {item.customerName}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
