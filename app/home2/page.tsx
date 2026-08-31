import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { GadgetHeroSlider } from "@/components/gadget/gadget-hero-slider";
import { gadgetImageSrc } from "@/components/gadget/gadget-image";
import { GadgetProductCard } from "@/components/gadget/gadget-product-card";
import { FALLBACK_SHOP_TYPES, shopTypeLinks } from "@/lib/categories";
import {
  fetchHeroSlides,
  fetchHomeBestsellers,
  fetchAllProducts,
  fetchShopTypes,
  fetchSiteSettings,
  fetchTestimonials,
} from "@/lib/db/store";
import { isDemoSession } from "@/lib/demo";
import { PRODUCT_IMAGE } from "@/lib/product-image";
import { normalizeSettings } from "@/lib/site-config";
import { getStockState } from "@/lib/stock";
import type { Product, Testimonial } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

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
  let slides: Awaited<ReturnType<typeof fetchHeroSlides>> = [];
  let bestsellers: Product[] = [];
  let settings = null;
  let shopTypes = shopTypeLinks(FALLBACK_SHOP_TYPES);
  try {
    const [s, p, t, set, types, best] = await Promise.all([
      fetchHeroSlides(demo),
      fetchAllProducts(demo),
      fetchTestimonials(demo),
      fetchSiteSettings(),
      fetchShopTypes(),
      fetchHomeBestsellers(demo),
    ]);
    slides = s;
    products = p;
    testimonials = t;
    settings = set;
    shopTypes = shopTypeLinks(types);
    bestsellers = best;
  } catch {
    products = [];
  }

  const config = normalizeSettings(settings);
  const threshold = Number(config.freeShippingThreshold ?? 0);

  const categoryCards = shopTypes
    .map((cat) => {
      const slug = cat.href.split("/").pop() as string;
      const candidates = products.filter((p) => p.category === slug);
      const rep =
        candidates.find((p) => !getStockState(p.stockStatus).soldOut && hasUsableImage(p)) ??
        null;
      return rep ? { ...cat, product: rep } : null;
    })
    .filter((c): c is { label: string; href: string; product: Product } => Boolean(c));

  const trust = [
    { label: "Cash on delivery", show: Boolean(config.codEnabled) },
    {
      label: threshold > 0 ? `Free shipping over ${formatPrice(threshold)}` : "Fast shipping",
      show: true,
    },
    { label: "Easy returns / warranty", show: true },
    { label: "Authentic, curated products", show: true },
  ].filter((t) => t.show);

  return (
    <div className="bg-[#fafafa] text-[#171717]">
      <GadgetHeroSlider slides={slides} />

      <section className="grid grid-cols-2 gap-3 px-4 py-6 lg:grid-cols-4 lg:gap-4 lg:px-8">
        {trust.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[#eaeaea] bg-white px-3 py-4 text-center text-xs text-[#666666] sm:text-sm"
          >
            {item.label}
          </div>
        ))}
      </section>

      {categoryCards.length ? (
        <section className="border-t border-[#eaeaea] bg-white px-4 py-16 lg:px-8 lg:py-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0f766e]">
            Shop by type
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Find your accessory</h2>
          <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {categoryCards.map((card) => {
              const image = gadgetImageSrc(card.product, PRODUCT_IMAGE.card);
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-xl border border-[#eaeaea] bg-[#fafafa]"
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={card.label}
                      fill
                      quality={90}
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : null}
                  <span className="absolute inset-x-0 bottom-0 bg-white/95 px-3 py-3 text-sm font-semibold text-[#171717]">
                    {card.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {bestsellers.length ? (
        <section className="border-t border-[#eaeaea] bg-[#fafafa] px-4 py-16 lg:px-8 lg:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0f766e]">
                Bestsellers
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Picked for you</h2>
            </div>
            <Link
              href="/products"
              className="min-h-11 inline-flex items-center text-sm text-[#666666] underline-offset-4 hover:underline"
            >
              All products
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {bestsellers.map((product) => (
              <GadgetProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {testimonials.length ? (
        <section className="border-t border-[#eaeaea] bg-white px-4 py-16 lg:px-8 lg:py-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0f766e]">Proof</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em]">What buyers say</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.slice(0, 3).map((item, i) => (
              <blockquote
                key={`${item.customerName}-${i}`}
                className="rounded-xl border border-[#eaeaea] bg-[#fafafa] p-5"
              >
                <p className="text-sm leading-relaxed text-[#666666]">“{item.reviewText}”</p>
                <footer className="mt-4 text-xs font-semibold text-[#171717]">
                  — {item.customerName}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
