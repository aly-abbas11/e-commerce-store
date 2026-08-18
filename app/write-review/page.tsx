import type { Metadata } from "next";

import { WriteReviewForm } from "@/components/reviews/write-review-form";
import { fetchFromSanity } from "@/lib/sanity/client";
import { reviewProductsQuery } from "@/lib/sanity/queries";
import type { Product } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Write a Review",
  description:
    "Tell us what you think about your VoltGear purchase — attach a photo and it will appear on the product's review section.",
};

interface ReviewProduct {
  _id: string;
  slug: string;
  name: string;
  category: string;
  image?: string | null;
}

export default async function WriteReviewPage() {
  let products: ReviewProduct[] = [];
  try {
    products = await fetchFromSanity<ReviewProduct[]>(reviewProductsQuery);
  } catch {
    products = [];
  }

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Write a review
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Picked up your order recently? Choose the product you bought, rate it
          and (if you like) attach a photo — your review appears right under
          that product.
        </p>
      </div>

      <WriteReviewForm
        products={products as Product[]}
        categories={categories}
      />
    </div>
  );
}
