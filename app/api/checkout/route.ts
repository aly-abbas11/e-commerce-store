import { NextResponse } from "next/server";

import { sendOrderConfirmationEmail } from "@/lib/email";
import { createOrder, enqueueEmailEvent } from "@/lib/order-store";
import { resolveCheckout, CHECKOUT_PRICE_CHANGED_ERROR } from "@/lib/checkout-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CheckoutCustomer {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal?: string;
}

interface CheckoutBody {
  items?: { slug?: string; quantity?: number; variantKey?: string }[];
  customer?: CheckoutCustomer;
  payment?: { method?: string };
  giftWrap?: boolean;
  // Present only for backwards-compatible clients; never trusted.
  subtotal?: number;
  shipping?: number;
  total?: number;
}

/**
 * Order endpoint. Cash on Delivery is the only supported payment method;
 * add a gateway by extending the `payment.method` switch — the checkout UI
 * and order persistence need no changes.
 *
 * The browser is never authoritative: every line is resolved against current
 * Sanity data (product ownership, selected variant, unit price, stock) and
 * subtotal / shipping / total are computed server-side. Client-supplied
 * prices and totals are ignored.
 *
 * On success the order is persisted and the customer's email is captured for
 * retention automations (order confirmation now, post-purchase / win-back
 * via the flow runner).
 */
export async function POST(request: Request) {
  try {
    const body: CheckoutBody = await request.json();
    const { items = [], customer, payment, giftWrap } = body;

    if (!items.length) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }
    if (!customer?.name || !customer.email || !customer.phone || !customer.address) {
      return NextResponse.json(
        { error: "Name, email, phone and address are required." },
        { status: 400 }
      );
    }
    if (payment?.method && payment.method !== "cod") {
      return NextResponse.json(
        { error: "Only Cash on Delivery is available right now." },
        { status: 400 }
      );
    }

    const resolution = await resolveCheckout(items, giftWrap === true);

    // Stock / availability errors and invalid quantities are blocking 400s.
    // A price change is a 409: no order is created and no email is sent.
    if (resolution.ok === "price_changed") {
      return NextResponse.json(
        {
          code: "PRICE_CHANGED" as const,
          error: CHECKOUT_PRICE_CHANGED_ERROR,
          items: resolution.items,
          lines: resolution.checkout.lines,
          subtotal: resolution.checkout.subtotal,
          shipping: resolution.checkout.shipping,
          total: resolution.checkout.total,
        },
        { status: 409 }
      );
    }
    if (!resolution.ok) {
      return NextResponse.json({ error: resolution.error }, { status: 400 });
    }

    const { lines, subtotal, shipping, total } = resolution.checkout;

    const orderId = `VG-${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 10000
    )}`;

    const order = {
      orderId,
      customer: {
        name: customer.name,
        email: customer.email.toLowerCase().trim(),
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        postal: customer.postal,
      },
      items: lines,
      payment: "cod",
      subtotal,
      shipping,
      total,
    };

    const persisted = await createOrder(order);

    // Retention: order confirmation immediately, review request after 5 days.
    const emailPayload = {
      orderId,
      name: order.customer.name ?? "there",
      items: lines.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        ...(i.slug ? { slug: i.slug } : {}),
        ...(i.variantName ? { variantName: i.variantName } : {}),
      })),
      total: order.total,
    };
    await sendOrderConfirmationEmail(order.customer.email, emailPayload);
    await enqueueEmailEvent(
      "post-purchase",
      order.customer.email,
      emailPayload,
      5 * 24 * 60 * 60 * 1000
    );

    if (persisted) {
      return NextResponse.json({ ok: true, orderId, subtotal, shipping, total, lines });
    }
    return NextResponse.json(
      { error: "We couldn't store your order. Please try again." },
      { status: 500 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Something went wrong placing your order." },
      { status: 500 }
    );
  }
}