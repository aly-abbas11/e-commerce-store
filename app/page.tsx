import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, BadgePercent, ShieldCheck, Truck, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Hero } from "@/components/sections/hero";
import { TestimonialSection } from "@/components/sections/testimonial-section";
import { UgcStrip } from "@/components/sections/ugc-strip";
import { fetchFromSanity } from "@/lib/sanity/client";
import { imageUrl } from "@/lib/sanity/image";
import { formatPrice } from "@/lib/utils";
import {
  blogPostsQuery,
  featuredProductsQuery,
  heroQuery,
  siteSettingsQuery,
  testimonialsQuery,
} from "@/lib/sanity/queries";
import type {
  HeroSection,
  Page,
  Product,
  SiteSettings,
  Testimonial,
} from "@/lib/types";

const TabbedCollections = dynamic(
  () =>
    import("@/components/sections/tabbed-collections").then(
      (m) => m.TabbedCollections
    ),
  { ssr: false, loading: () => null }
);

const RecentlyViewed = dynamic(
  () =>
    import("@/components/sections/recently-viewed").then(
      (m) => m.RecentlyViewed
    ),
  { ssr: false, loading: () => null }
);

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  let settings: SiteSettings | null = null;
  try {
    settings = await fetchFromSanity<SiteSettings | null>(siteSettingsQuery);
  } catch {
    settings = null;
  }
  const title = settings?.seo?.title || "VoltGear — Premium Electronics Accessories";
  const description =
    settings?.seo?.description ||
    "Shop smartwatches, power banks, chargers and earbuds. Premium electronics accessories with fast shipping.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const PERKS = [
  {
    icon: Truck,
    title: "Fast Shipping",
    text: "Free on orders over {threshold}, delivered in 2-4 days.",
  },
  {
    icon: ShieldCheck,
    title: "2-Year Warranty",
    text: "Every product is covered by our no-hassle warranty.",
  },
  {
    icon: Zap,
    title: "Same-Day Dispatch",
    text: "Orders placed before 2 PM ship out the same day.",
  },
  {
    icon: BadgePercent,
    title: "Best Price Promise",
    text: "Found it cheaper? We'll match the difference.",
  },
];

const FEATURED_SLUGS = ["smartwatch", "power-bank", "charger", "earbuds"];

const CATEGORY_CARDS: Record<string, { label: string; emoji: string }> = {
  smartwatch: { label: "Smartwatches", emoji: "⌚" },
  "power-bank": { label: "Power Banks", emoji: "🔋" },
  charger: { label: "Chargers & Adapters", emoji: "🔌" },
  earbuds: { label: "Earbuds & Handsfree", emoji: "🎧" },
};

async function getHomeData() {
  try {
    const [hero, products, testimonials, posts, settings] = await Promise.all([
      fetchFromSanity<HeroSection | null>(heroQuery),
      fetchFromSanity<Product[]>(featuredProductsQuery),
      fetchFromSanity<Testimonial[]>(testimonialsQuery),
      fetchFromSanity<Page[]>(blogPostsQuery),
      fetchFromSanity<SiteSettings | null>(siteSettingsQuery),
    ]);
    return { hero, products, testimonials, posts, settings };
  } catch {
    return {
      hero: null,
      products: [],
      testimonials: [],
      posts: [],
      settings: null,
    };
  }
}

export default async function HomePage() {
  const { hero, products, testimonials, posts, settings } =
    await getHomeData();

  return (
    <>
      <Hero
        hero={hero}
        freeShippingThreshold={settings?.freeShippingThreshold}
      />

      <TestimonialSection testimonials={testimonials} />

      <UgcStrip />

      <section className="container mx-auto px-4 py-16 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Shop by Category
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Find Your Perfect Accessory
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {FEATURED_SLUGS.map((slug) => (
            <Link
              key={slug}
              href={`/products/${slug}`}
              className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <span className="text-4xl transition-transform group-hover:scale-110">
                {CATEGORY_CARDS[slug]?.emoji}
              </span>
              <span className="font-semibold">
                {CATEGORY_CARDS[slug]?.label}
              </span>
              <span className="flex items-center text-sm text-muted-foreground transition-colors group-hover:text-primary">
                Shop now <ArrowRight className="ml-1 h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16 lg:px-8">
        <TabbedCollections products={products} />
      </section>

      <section className="border-y bg-muted/40">
        <div className="container mx-auto grid gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {PERKS.map((perk) => (
            <div key={perk.title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <perk.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{perk.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {perk.text.replace(
                    "{threshold}",
                    formatPrice(settings?.freeShippingThreshold ?? 5000)
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {posts.length > 0 && (
        <section className="container mx-auto px-4 pb-16 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                From the Blog
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Latest Guides &amp; News
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/blog">
                All Posts <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
              >
                <div className="aspect-[16/9] overflow-hidden bg-muted">
                  {post.coverImage ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={imageUrl(post.coverImage, { w: 800 })}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : null}
                </div>
                <div className="space-y-2 p-5">
                  <p className="text-xs text-muted-foreground">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : ""}
                  </p>
                  <h3 className="font-semibold leading-snug group-hover:text-primary">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed />
    </>
  );
}
