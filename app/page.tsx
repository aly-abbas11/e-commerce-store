import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "lucide-react";


import { Hero } from "@/components/sections/hero";

import { TrustBar } from "@/components/sections/trust-bar";

import { NewsletterBlock } from "@/components/sections/newsletter-block";
import { DynamicHomepageSection } from "@/components/sections/dynamic-homepage-section";
import { TestimonialSection } from "@/components/sections/testimonial-section";

import { FigmaPopularCategories, BestSellersSlider, WhyChooseVoltGear } from "@/components/sections/figma-homepage";
import {
  fetchHero,
  fetchShopTypes,
  fetchSiteSettings,
  fetchTestimonials,
  fetchAllProducts,
  fetchBlogPosts,
} from "@/lib/db/store";

import { fetchPublicHomepageSections } from "@/lib/db/homepage-sections-store";
import { FALLBACK_SHOP_TYPES } from "@/lib/categories";
import { isDemoSession } from "@/lib/demo";
import { imageUrl } from "@/lib/sanity/image";
import { normalizeSettings } from "@/lib/site-config";
import type { Page, SiteSettings } from "@/lib/types";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  let settings: SiteSettings | null = null;
  try {
    settings = await fetchSiteSettings();
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
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

async function getHomeData() {
  try {
    const demo = isDemoSession();
    const [hero, products, testimonials, posts, settings, shopTypes] =
      await Promise.all([
        fetchHero(demo),
        fetchAllProducts(demo),
        fetchTestimonials(demo),
        fetchBlogPosts(demo),
        fetchSiteSettings(),
        fetchShopTypes(),
      ]);
    return { hero, products, testimonials, posts, settings, shopTypes };
  } catch {
    return {
      hero: null,
      products: [],
      testimonials: [],
      posts: [],
      settings: null,
      shopTypes: FALLBACK_SHOP_TYPES,
    };
  }
}



/* ─── Blog Section ─────────────────────────────────────────────────────── */
function BlogSection({ posts }: { posts: Page[] }) {
  if (posts.length === 0) return null;
  const shown = posts.slice(0, 3);

  return (
    <section className="border-b bg-background">
      <div className="container mx-auto max-w-screen-xl px-4 py-10 md:px-6 md:py-12 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Guides & News
          </h2>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground group"
          >
            All articles
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {shown.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-background transition-shadow hover:shadow-md"
            >
              {post.coverImage && (
                <div className="relative aspect-[16/9] overflow-hidden bg-[#f5f5f5]">
                  <Image
                    src={imageUrl(post.coverImage, { w: 800 })}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5 gap-2">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Article"}
                </p>
                <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground group-hover:text-foreground/70 transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="line-clamp-2 text-[13px] text-muted-foreground">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Homepage ─────────────────────────────────────────────────────────── */
export default async function HomePage() {
  const { hero, products, testimonials, posts, settings, shopTypes } =
    await getHomeData();
  const customSections = await fetchPublicHomepageSections();
  const config = normalizeSettings(settings);

  return (
    <>
      {/* Hero slider */}
      <Hero hero={hero} products={products} config={config} />

      {/* Trust / service facts */}
      <TrustBar />

      {/* Figma: Popular Categories */}
      <FigmaPopularCategories shopTypes={shopTypes} products={products} />

      {/* Figma: Best Sellers slider */}
      <BestSellersSlider products={products.filter((p) => p.stockStatus !== "out-of-stock")} />

      {/* Why Choose Us Features row */}
      <div className="w-full bg-secondary/20">
        <div className="container mx-auto max-w-screen-xl px-4 md:px-6 lg:px-8 py-16">
          <WhyChooseVoltGear />
        </div>
      </div>

      {/* Testimonials */}
      <TestimonialSection testimonials={testimonials} />

      {/* Admin-curated dynamic sections */}
      {customSections.map((sec) => (
        <DynamicHomepageSection key={sec.id} section={sec} />
      ))}

      {/* Blog / Guides */}
      <BlogSection posts={posts} />

      {/* VIP Newsletter Block */}
      <NewsletterBlock />

    </>
  );
}