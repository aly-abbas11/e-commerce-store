import { NextResponse } from "next/server";

import { getWriteClient } from "@/lib/sanity/write";
import { getOrdersByEmail } from "@/lib/order-store";
import { fetchFromSanity } from "@/lib/sanity/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ReviewBody {
  slug?: string;
  rating?: number;
  name?: string;
  email?: string;
  comment?: string;
  image?: string;
  category?: string;
  productName?: string;
}

const productRefQuery = `*[_type == "product" && slug.current == $slug][0]{_id}`;

/**
 * Review submission. Persists a `reviewSubmission` document for admin
 * moderation in Sanity Studio. If the submitter's email matches a paid order
 * containing this product, the review is auto-marked `verified` (the order is
 * Cash on Delivery, so "paid" is assumed at creation time).
 */
export async function POST(request: Request) {
  try {
    const body: ReviewBody = await request.json();
    const { slug, rating, name, email, comment, image, category, productName } =
      body;

    if (!slug) {
      return NextResponse.json({ error: "Missing product." }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Please choose a rating between 1 and 5." },
        { status: 400 }
      );
    }
    if (!name?.trim() || !email?.trim() || !comment?.trim()) {
      return NextResponse.json(
        { error: "Name, email and review are required." },
        { status: 400 }
      );
    }

    const client = getWriteClient();
    if (!client) {
      console.info(
        "[reviews][dev] would persist submission for",
        slug,
        JSON.stringify({ rating, name, email, comment, image, category, productName })
      );
      return NextResponse.json({ ok: true });
    }

    const product = await fetchFromSanity<{ _id: string } | null>(
      productRefQuery,
      { slug }
    );
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const orders = await getOrdersByEmail(email.toLowerCase().trim());
    const verified = orders.some((o) =>
      (o.items ?? []).some((i) => i.slug === slug)
    );

    // Basic duplicate guard: one pending submission per email + product.
    // reviewSubmission docs use private (dotted) IDs, so read through the
    // token client — anonymous requests can never see them.
    const existing = await client.fetch<{ _id: string }[]>(
      `*[_type == "reviewSubmission" && email == $email && product._ref == $productId && status == "pending"][0..4]`,
      { email: email.toLowerCase().trim(), productId: product._id }
    );
    if (existing.length) {
      return NextResponse.json(
        { ok: true, duplicate: true },
        { status: 200 }
      );
    }

    await client.create({
      _id: `reviewSubmission.${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      _type: "reviewSubmission",
      product: { _type: "reference", _ref: product._id },
      name: name.trim(),
      email: email.toLowerCase().trim(),
      rating,
      comment: comment.trim(),
      ...(image ? { image: image.trim() } : {}),
      ...(category ? { category: category.trim() } : {}),
      ...(productName ? { productName: productName.trim() } : {}),
      verified,
      status: "pending",
    });

    return NextResponse.json({ ok: true, verified });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json(
      { error: "Something went wrong submitting your review." },
      { status: 500 }
    );
  }
}
