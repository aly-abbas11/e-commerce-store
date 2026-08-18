import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddToCart } from "@/components/product/add-to-cart";
import { FrequentlyBoughtTogether } from "@/components/product/frequently-bought-together";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductViewTracker } from "@/components/product/product-view-tracker";
import { RelatedProducts } from "@/components/product/related-products";
import { StarRating } from "@/components/product/star-rating";
import { fetchFromSanity } from "@/lib/sanity/client";
import { getWriteClient } from "@/lib/sanity/write";
import { getSettings } from "@/lib/sanity/settings";
import { cloudinaryImageUrl } from "@/lib/cloudinary";
import { imageUrl } from "@/lib/sanity/image";
import {
  approvedReviewsQuery,
  productBySlugQuery,
  productSlugsQuery,
  productsQuery,
} from "@/lib/sanity/queries";
import type { Product, ProductReview } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export const revalidate = 60;

const StickyAddToCart = dynamic(
  () =>
    import("@/components/product/sticky-add-to-cart").then(
      (m) => m.StickyAddToCart
    ),
  { ssr: false, loading: () => null }
);

const STOCK_BADGE: Record<
  string,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  "in-stock": { label: "In Stock", variant: "success" },
  "low-stock": { label: "Low Stock — Order Soon", variant: "warning" },
  "out-of-stock": { label: "Out of Stock", variant: "destructive" },
};

export async function generateStaticParams() {
  try {
    const slugs = await fetchFromSanity<{ slug: string }[]>(productSlugsQuery);
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
    product = await fetchFromSanity<Product | null>(productBySlugQuery, {
      slug: params.slug,
    });
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
        ? [imageUrl(product.images[0], { w: 800 })]
        : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  let product: Product | null = null;
  let related: Product[] = [];
  let settings = null;
  let approvedReviews: ProductReview[] = [];
  try {
    product = await fetchFromSanity<Product | null>(productBySlugQuery, {
      slug: params.slug,
    });
    if (product) {
      // reviewSubmission documents use private (dotted) IDs, so approved
      // reviews can only be read through the token client — never the
      // anonymous storefront client.
      const writeClient = getWriteClient();
      const reviewPromise = writeClient
        ? (writeClient.fetch<ProductReview[]>(approvedReviewsQuery, {
            productId: product._id,
          }) as Promise<ProductReview[]>)
        : Promise.resolve<ProductReview[]>([]);
      [related, settings, approvedReviews] = await Promise.all([
        fetchFromSanity<Product[]>(productsQuery),
        getSettings(),
        reviewPromise,
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

  const stock = STOCK_BADGE[product.stockStatus] ?? STOCK_BADGE["in-stock"];
  const returnPolicy =
    settings?.returnPolicy || "Free returns within 7 days — no questions asked.";
  const warrantyInfo = settings?.warrantyInfo || "2-year warranty included.";
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 50;

  const relatedProducts = related
    .filter((p) => p._id !== product._id && p.category === product.category)
    .slice(0, 8);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const availability: Record<string, string> = {
    "in-stock": "https://schema.org/InStock",
    "low-stock": "https://schema.org/LimitedAvailability",
    "out-of-stock": "https://schema.org/OutOfStock",
  };
  const productImages = [
    ...(product.cloudinaryImages ?? []).map((id) => cloudinaryImageUrl(id, { w: 800 })),
    ...(product.images ?? []).map((img) => imageUrl(img, { w: 800 })),
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.name,
    image: productImages,
    sku: product.slug,
    brand: { "@type": "Brand", name: "VoltGear" },
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
    ...((productWithReviews.reviews ?? []).length
      ? {
          review: (productWithReviews.reviews ?? [])
            .filter((r) => r.name && typeof r.rating === "number")
            .map((r) => ({
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
    <div className="container mx-auto px-4 py-10 lg:px-8">
      <ProductViewTracker
        slug={product.slug}
        name={product.name}
        price={product.price}
        image={product.images?.[0] ? imageUrl(product.images[0], { w: 128 }) : undefined}
        category={product.category}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href={`/products/${product.category}`}
        className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        ← {product.category.replace("-", " ")}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery product={product} />

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#reviews"
                className="flex items-center gap-2 rounded transition-colors hover:text-primary"
              >
                <StarRating rating={product.rating} size={18} />
                <span className="text-sm text-muted-foreground">
                  {product.rating ?? 0}/5
                  {typeof productWithReviews.reviewCount === "number" &&
                    productWithReviews.reviewCount > 0 &&
                    ` · ${productWithReviews.reviewCount} reviews`}
                </span>
              </a>
              <Badge variant={stock.variant}>{stock.label}</Badge>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            {product.shortDescription && (
              <p className="mt-3 text-muted-foreground">
                {product.shortDescription}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <Separator />

          <AddToCart product={product} />

          {/* Trust microcopy under the buy button */}
          <p className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
            <RotateCcw className="h-4 w-4 shrink-0 text-primary" />
            {returnPolicy}
          </p>

          <div className="grid gap-3 rounded-lg border bg-muted/40 p-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              Free shipping over {formatPrice(freeShippingThreshold)}
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {warrantyInfo}
            </div>
          </div>

          <ProductTabs product={productWithReviews} />
        </div>
      </div>

      <FrequentlyBoughtTogether current={product} />
      <RelatedProducts products={relatedProducts} />
      <StickyAddToCart product={productWithReviews} />
    </div>
  );
}