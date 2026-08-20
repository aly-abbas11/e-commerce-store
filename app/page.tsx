import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { Hero } from "@/components/sections/hero";
import { TestimonialSection } from "@/components/sections/testimonial-section";
import { CATEGORY_LINKS } from "@/lib/categories";
import { fetchFromSanity } from "@/lib/sanity/client";
import { imageUrl } from "@/lib/sanity/image";
import { normalizeSettings } from "@/lib/site-config";
import {
  blogPostsQuery,
  heroQuery,
  productsQuery,
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

function hasUsableImage(product: Product) {
  return Boolean(product.images?.[0] || product.cloudinaryImages?.[0]);
}

async function getHomeData() {
  try {
    const [hero, products, testimonials, posts, settings] = await Promise.all([
      fetchFromSanity<HeroSection | null>(heroQuery),
      fetchFromSanity<Product[]>(productsQuery),
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

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-2 text-3xl font-bold tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16 lg:px-8">
      <SectionHeading
        eyebrow="Curated Picks"
        title="Featured Products"
        action={
          <Button asChild variant="outline">
            <Link href="/products">
              View All Products <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}

function ShopByCategory({
  cards,
}: {
  cards: { label: string; href: string; product: Product }[];
}) {
  if (cards.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16 lg:px-8">
      <SectionHeading eyebrow="Shop by Category" title="Find Your Perfect Accessory" />
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {cards.map((card) => {
          const image = card.product.images?.[0] || card.product.cloudinaryImages?.[0];
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group relative block overflow-hidden rounded-2xl border bg-card"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                {image && (
                  <Image
                    src={imageUrl(image, { w: 600 })}
                    alt={`${card.label} products`}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                )}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-semibold text-white">{card.label}</p>
                  <span className="mt-1 flex items-center text-sm text-white/80 transition-colors group-hover:text-white">
                    Shop now <ArrowRight className="ml-1 h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function BlogSection({ posts }: { posts: Page[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="container mx-auto px-4 pb-16 lg:px-8">
      <SectionHeading
        eyebrow="Guides & News"
        title="Latest Guides & News"
        action={
          <Button asChild variant="outline">
            <Link href="/blog">
              All Posts <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      />
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
  );
}

export default async function HomePage() {
  const { hero, products, testimonials, posts, settings } =
    await getHomeData();
  const config = normalizeSettings(settings);

  const featured = products.filter((p) => p.featured);
  const hasFeatured = featured.length > 0;
  const merchandise = hasFeatured
    ? featured
    : products.filter((p) => p.stockStatus !== "out-of-stock");

  const categoryCards = CATEGORY_LINKS.map((cat) => {
    const slug = cat.href.split("/").pop() as string;
    const candidates = products.filter((p) => p.category === slug);
    const rep =
      candidates.find(
        (p) => p.featured && p.stockStatus !== "out-of-stock" && hasUsableImage(p)
      ) ??
      candidates.find((p) => p.stockStatus !== "out-of-stock" && hasUsableImage(p)) ??
      candidates.find((p) => p.stockStatus !== "out-of-stock") ??
      candidates[0];
    return rep ? { ...cat, product: rep } : null;
  }).filter((c): c is { label: string; href: string; product: Product } => Boolean(c));

  return (
    <>
      <Hero hero={hero} config={config} />

      <FeaturedProducts products={merchandise} />

      <ShopByCategory cards={categoryCards} />

      <TestimonialSection testimonials={testimonials} />

      <BlogSection posts={posts} />

      <RecentlyViewed />
    </>
  );
}