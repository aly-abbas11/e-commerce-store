import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { PurchaseSection } from "@/components/product/purchase-section";
import { FrequentlyBoughtTogether } from "@/components/product/frequently-bought-together";
import { RelatedProducts } from "@/components/product/related-products";
import { ProductViewTracker } from "@/components/product/product-view-tracker";
import {
  CompatibilitySection,
  DescriptionSection,
  InTheBoxSection,
  KeyFeaturesSection,
  ProductFaqSection,
  ProductVideoSection,
  ReviewsSection,
  SpecificationsSection,
} from "@/components/product/product-info-sections";
import { fetchApprovedReviews, fetchAllProducts, fetchProductBySlug, fetchProductSlugs } from "@/lib/db/store";
import { isDemoSession } from "@/lib/demo";
import { publicSiteUrl } from "@/lib/deploy-rules";
import { getSettings } from "@/lib/sanity/settings";
import { cloudinaryImageUrl } from "@/lib/cloudinary";
import { imageUrl } from "@/lib/sanity/image";
import { PRODUCT_IMAGE } from "@/lib/product-image";
import { normalizeSettings } from "@/lib/site-config";
import type { Product, ProductReview } from "@/lib/types";

export const revalidate = 60;

const StickyAddToCart = dynamic(
  () =>
    import("@/components/product/sticky-add-to-cart").then(
      (m) => m.StickyAddToCart
    ),
  { ssr: false, loading: () => null }
);

export async function generateStaticParams() {
  try {
    const slugs = await fetchProductSlugs();
    return slugs.map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  let product: Product | null = null;
  try {
    product = await fetchProductBySlug(params.slug, isDemoSession());
  } catch {
    product = null;
  }
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription || product.name,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      type: "website",
      images: product.images?.[0]
        ? [imageUrl(product.images[0], { w: PRODUCT_IMAGE.gallery })]
        : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const demo = isDemoSession();
  let product: Product | null = null;
  let related: Product[] = [];
  let settings = null;
  let approvedReviews: ProductReview[] = [];
  try {
    product = await fetchProductBySlug(params.slug, demo);
    if (product) {
      [related, settings, approvedReviews] = await Promise.all([
        fetchAllProducts(demo),
        getSettings().catch(() => null),
        fetchApprovedReviews(product._id, demo),
      ]);
    }
  } catch {
    product = null;
  }

  if (!product) notFound();

  // Approved customer reviews (moderated submissions) surface on top of the
  // seeded reviews embedded in the product document.
  const mergedReviews = [...approvedReviews, ...(product.reviews ?? [])];
  const productWithReviews: Product = mergedReviews.length
    ? {
        ...product,
        reviews: mergedReviews,
        reviewCount:
          (product.reviewCount ?? 0) +
          (approvedReviews.length ? approvedReviews.length : 0),
      }
    : product;

  const config = normalizeSettings(settings);

  const relatedProducts = related
    .filter((p) => p._id !== product._id && p.category === product.category)
    .sort((a, b) => {
      const rank = (s: string) => (s === "out-of-stock" ? 1 : s === "low-stock" ? 1 : 0);
      return rank(a.stockStatus) - rank(b.stockStatus);
    })
    .slice(0, 8);

  const siteUrl = publicSiteUrl();
  const availability: Record<string, string> = {
    "in-stock": "https://schema.org/InStock",
    "low-stock": "https://schema.org/LimitedAvailability",
    "out-of-stock": "https://schema.org/OutOfStock",
  };
  const productImages = [
    ...(product.cloudinaryImages ?? []).map((id) =>
      cloudinaryImageUrl(id, { w: PRODUCT_IMAGE.gallery })
    ),
    ...(product.images ?? []).map((img) => imageUrl(img, { w: PRODUCT_IMAGE.gallery })),
  ];
  const realReviews = (productWithReviews.reviews ?? []).filter(
    (r) => !r.isDemo && r.name && typeof r.rating === "number"
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.name,
    image: productImages,
    sku: product.sku || product.slug,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category: product.category,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${product.slug}`,
      priceCurrency: "PKR",
      price: product.price,
      availability: availability[product.stockStatus] ?? availability["in-stock"],
      priceValidUntil: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000
      ).toISOString().slice(0, 10),
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(typeof product.rating === "number" &&
    typeof productWithReviews.reviewCount === "number" &&
    productWithReviews.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: productWithReviews.reviewCount,
          },
        }
      : {}),
    ...(realReviews.length
      ? {
          review: realReviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.name },
            datePublished: r.date,
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
            },
            reviewBody: r.comment,
          })),
        }
      : {}),
  };

  return (
    <div className="container mx-auto px-4 py-6 lg:px-8">
      <ProductViewTracker
        slug={product.slug}
        name={product.name}
        price={product.price}
        image={product.images?.[0] ? imageUrl(product.images[0], { w: 128 }) : undefined}
        category={product.category}
        productId={product._id}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="flex items-center gap-1 transition-colors hover:text-primary">
          <Home className="h-3.5 w-3.5" />
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/products/${product.category}`}
          className="transition-colors hover:text-primary"
        >
          {product.category.replace("-", " ")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span aria-current="page" className="truncate font-medium text-foreground">
          {product.name}
        </span>
      </nav>

      <div className="mt-4">
        <PurchaseSection product={productWithReviews} config={config} />
      </div>

      <KeyFeaturesSection product={productWithReviews} />
      <CompatibilitySection product={productWithReviews} />
      <InTheBoxSection product={productWithReviews} />
      <SpecificationsSection product={productWithReviews} />
      <DescriptionSection product={productWithReviews} />
      <ProductVideoSection product={productWithReviews} />
      <ReviewsSection
        product={productWithReviews}
        reviews={productWithReviews.reviews ?? []}
        rating={product.rating}
        includeDemo={demo}
      />
      <ProductFaqSection product={productWithReviews} />

      <FrequentlyBoughtTogether current={productWithReviews} />
      <RelatedProducts products={relatedProducts} />
      <StickyAddToCart product={productWithReviews} />
    </div>
  );
}