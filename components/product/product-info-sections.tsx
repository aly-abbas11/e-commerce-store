import { BadgeCheck, Box, Check } from "lucide-react";

import { FAQAccordion } from "@/components/sections/faq-accordion";
import { RichText } from "@/components/product/rich-text";
import { StarRating } from "@/components/product/star-rating";
import { ReviewForm } from "@/components/product/review-form";
import { CLOUDINARY_CLOUD_NAME } from "@/lib/cloudinary";
import { imageUrl } from "@/lib/sanity/image";
import type { Product, ProductReview } from "@/lib/types";

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-1 text-2xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}

/** Key Features — only renders structured feature bullets. */
export function KeyFeaturesSection({ product }: { product: Product }) {
  const features = product.features?.filter((f) => f.trim()) ?? [];
  if (!features.length) return null;
  return (
    <section className="mt-14" aria-labelledby="key-features">
      <SectionHeading eyebrow="Key Features" title="Key Features" />
      <ul className="grid gap-2 sm:grid-cols-2">
        {features.map((feature, i) => (
          <li
            key={i}
            className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Compatibility — only renders real, configured compatibility notes. */
export function CompatibilitySection({ product }: { product: Product }) {
  const items = product.compatibility?.filter((c) => c.trim()) ?? [];
  if (!items.length) return null;
  return (
    <section className="mt-14" aria-labelledby="compatibility">
      <SectionHeading eyebrow="Compatibility" title="Works With" />
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 rounded-lg border bg-card p-3 text-sm"
          >
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** What's in the Box — only renders genuinely configured inclusions. */
export function InTheBoxSection({ product }: { product: Product }) {
  const items = product.inTheBox?.filter((i) => i.trim()) ?? [];
  if (!items.length) return null;
  return (
    <section className="mt-14" aria-labelledby="in-the-box">
      <SectionHeading eyebrow="Included" title="What's in the Box" />
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 rounded-lg border bg-card p-3 text-sm"
          >
            <Box className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Technical Specifications — only renders configured rows. */
export function SpecificationsSection({ product }: { product: Product }) {
  const specs =
    product.specifications?.filter(
      (s) => s?.label?.trim() && s?.value?.trim()
    ) ?? [];
  if (!specs.length) return null;
  return (
    <section className="mt-14" aria-labelledby="specifications">
      <SectionHeading eyebrow="Details" title="Technical Specifications" />
      <div className="overflow-hidden rounded-lg border">
        {specs.map((spec, i) => (
          <div
            key={`${spec.label}-${i}`}
            className={`grid grid-cols-2 gap-2 px-4 py-3 text-sm ${
              i % 2 === 0 ? "bg-muted/40" : ""
            }`}
          >
            <span className="font-medium">{spec.label}</span>
            <span className="text-muted-foreground">{spec.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Product Description — rich text, preserved as-is. */
export function DescriptionSection({ product }: { product: Product }) {
  if (!product.description?.length) return null;
  return (
    <section className="mt-14" aria-labelledby="description">
      <SectionHeading title="Product Description" />
      <RichText blocks={product.description} />
    </section>
  );
}

function videoSource(product: Product): string | null {
  const v = product.productVideo;
  if (!v) return null;
  if (v.cloudinaryPublicId?.trim() && CLOUDINARY_CLOUD_NAME) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${v.cloudinaryPublicId
      .trim()
      .replace(/^\/+/, "")}`;
  }
  if (v.url?.trim() && /^https?:\/\//i.test(v.url.trim())) {
    return v.url.trim();
  }
  return null;
}

/** See It in Action — only renders when a genuine product video exists. */
export function ProductVideoSection({ product }: { product: Product }) {
  const src = videoSource(product);
  if (!src) return null;
  const poster = product.productVideo?.poster;
  return (
    <section className="mt-14" aria-labelledby="product-video">
      <SectionHeading eyebrow="Demo" title="See It in Action" />
      <div className="overflow-hidden rounded-xl border bg-muted">
        <video
          controls
          preload="none"
          playsInline
          poster={poster ? imageUrl(poster, { w: 1200 }) : undefined}
          className="aspect-video w-full"
        >
          <source src={src} />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
}

/** Reviews — guests never see demo rows; a demo session can. */
export function ReviewsSection({
  product,
  reviews,
  rating,
  includeDemo = false,
}: {
  product: Product;
  reviews: ProductReview[];
  rating?: number;
  includeDemo?: boolean;
}) {
  const real = (reviews ?? []).filter(
    (r) => (includeDemo || !r.isDemo) && r.name && typeof r.rating === "number"
  );

  const distribution = [0, 0, 0, 0, 0];
  real.forEach((r) => {
    const bucket = Math.round(r.rating ?? 0);
    if (bucket >= 1 && bucket <= 5) distribution[bucket - 1] += 1;
  });
  distribution.reverse();

  const avg = real.length
    ? real.reduce((sum, r) => sum + (r.rating ?? 0), 0) / real.length
    : null;

  return (
    <section id="reviews" className="mt-16 scroll-mt-24" aria-labelledby="reviews">
      <SectionHeading eyebrow="Reviews" title="Customer Reviews" />

      {real.length ? (
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="h-fit rounded-xl border bg-card p-6 text-center">
            <p className="text-4xl font-bold">
              {(avg ?? rating ?? 0).toFixed(1)}
            </p>
            <StarRating rating={avg ?? rating ?? 0} className="mt-2 justify-center" size={18} />
            <p className="mt-2 text-sm text-muted-foreground">
              Based on {real.length} review{real.length === 1 ? "" : "s"}
            </p>
            <div className="mt-4 space-y-1.5">
              {distribution.map((count, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-right">{5 - i}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${(count / real.length) * 100}%` }}
                    />
                  </div>
                  <span className="w-4 text-right text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-4">
            {real.map((review, i) => (
              <li key={`${review.name}-${i}`} className="rounded-xl border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{review.name}</span>
                    {review.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        <BadgeCheck className="h-3 w-3" />
                        Verified purchase
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <StarRating rating={review.rating} size={14} />
                    {review.date && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {review.comment}
                </p>
                {review.image && (
                  <div className="mt-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={review.image}
                      alt={`Photo from ${review.name ?? "customer"}`}
                      className="max-h-56 rounded-lg border object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground">
            No reviews yet — be the first to review this product.
          </p>
        </div>
      )}

      <div className="mt-8">
        <ReviewForm slug={product.slug} />
      </div>
    </section>
  );
}

/** Product FAQ — only renders real, configured Q&A. */
export function ProductFaqSection({ product }: { product: Product }) {
  const items =
    product.productFaq?.filter(
      (f) => f?.question?.trim() && f?.answer?.trim()
    ) ?? [];
  if (!items.length) return null;
  return (
    <section className="mt-14" aria-labelledby="product-faq">
      <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" />
      <FAQAccordion
        items={items.map((f) => ({ question: f.question, answer: f.answer }))}
      />
    </section>
  );
}