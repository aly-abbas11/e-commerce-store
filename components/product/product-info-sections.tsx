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
      <SectionHeading title="Why you'll like it" />
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
          <div className="h-fit rounded-2xl border border-border/40 bg-card p-8 text-center shadow-lg shadow-black/5 ring-1 ring-black/5">
            <p className="text-5xl font-black tracking-tighter">
              {(avg ?? rating ?? 0).toFixed(1)}
            </p>
            <StarRating rating={avg ?? rating ?? 0} className="mt-3 justify-center text-amber-500" size={20} />
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Based on {real.length} review{real.length === 1 ? "" : "s"}
            </p>
            <div className="mt-6 space-y-2">
              {distribution.map((count, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium">
                  <span className="w-4 text-right text-muted-foreground">{5 - i}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted/60 shadow-inner">
                    <div
                      className="h-full rounded-full bg-amber-500 shadow-sm"
                      style={{ width: `${(count / real.length) * 100}%` }}
                    />
                  </div>
                  <span className="w-4 text-left text-muted-foreground/70">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-6">
            {real.map((review, i) => (
              <li key={`${review.name}-${i}`} className="rounded-2xl border border-border/40 bg-card p-6 md:p-8 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/30 pb-4">
                  <div className="flex flex-col gap-1.5 leading-none">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-base tracking-tight">{review.name}</span>
                      {review.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                          <BadgeCheck className="h-3 w-3" />
                          Verified
                        </span>
                      ) : null}
                    </div>
                    {review.date && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {new Date(review.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-full">
                    <StarRating rating={review.rating} size={14} className="text-amber-500" />
                  </div>
                </div>
                <p className="mt-5 text-[15px] leading-relaxed text-foreground/80 font-medium">
                  {review.comment}
                </p>
                {review.image && (
                  <div className="mt-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={review.image}
                      alt={`Photo from ${review.name ?? "customer"}`}
                      className="max-h-64 rounded-xl border border-border/50 object-cover shadow-sm bg-muted/20"
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