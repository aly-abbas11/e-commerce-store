import { NextResponse } from "next/server";

import { sendOrderConfirmationEmail } from "@/lib/email";
import {
  createOrder,
  enqueueEmailEvent,
} from "@/lib/order-store";
import type { OrderItem } from "@/lib/types";

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
  items?: OrderItem[];
  customer?: CheckoutCustomer;
  payment?: { method?: string };
  subtotal?: number;
  shipping?: number;
  total?: number;
}

/**
 * Order endpoint. Cash on Delivery is the only supported payment method;
 * add a gateway by extending the `payment.method` switch — the checkout UI
 * and order persistence need no changes.
 *
 * On success the order is persisted and the customer's email is captured for
 * retention automations (order confirmation now, post-purchase / win-back
 * via the flow runner).
 */
export async function POST(request: Request) {
  try {
    const body: CheckoutBody = await request.json();
    const { items = [], customer, payment, subtotal, shipping, total } = body;

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

    const orderId = `VG-${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 10000
    )}`;

    // Guard: never persist a silent 0-total order if totals are missing.
    const computedSubtotal = items.reduce(
      (sum, i) => sum + Number(i.price ?? 0) * Number(i.quantity ?? 1),
      0
    );
    const orderSubtotal =
      subtotal !== undefined ? Number(subtotal) : computedSubtotal;
    const orderShipping = shipping !== undefined ? Number(shipping) : 0;
    const orderTotal =
      total !== undefined
        ? Number(total)
        : orderSubtotal + orderShipping;

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
      items,
      payment: "cod",
      subtotal: orderSubtotal,
      shipping: orderShipping,
      total: orderTotal,
    };

    const persisted = await createOrder(order);

    // Retention: order confirmation immediately, review request after 5 days.
    const emailPayload = {
      orderId,
      name: order.customer.name ?? "there",
      items: items.map((i) => ({
        name: i.name ?? "",
        price: Number(i.price ?? 0),
        quantity: Number(i.quantity ?? 1),
        ...(i.slug ? { slug: i.slug } : {}),
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
      return NextResponse.json({ ok: true, orderId });
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
