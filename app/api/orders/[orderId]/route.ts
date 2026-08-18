import { NextResponse } from "next/server";

import { getOrderById } from "@/lib/order-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Customer order lookup. Requires the email used at checkout so only the
 * customer can see the order:
 *
 *   curl "http://localhost:3001/api/orders/VG-XXXXXXXX?email=customer@example.com"
 *
 * Returns a summary (status, timeline, items, totals) — no phone/address.
 */
export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const orderId = params.orderId;
  if (!orderId) {
    return NextResponse.json({ error: "Missing order ID." }, { status: 400 });
  }

  const email = new URL(request.url).searchParams.get("email")?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json(
      { error: "Provide the email used at checkout: ?email=you@example.com" },
      { status: 400 }
    );
  }

  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.customer?.email?.toLowerCase().trim() !== email) {
    return NextResponse.json(
      { error: "Order not found for this email." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    orderId: order.orderId,
    status: order.status ?? "new",
    statusUpdatedAt: order.statusUpdatedAt ?? null,
    statusHistory: (order.statusHistory ?? []).map((h) => ({
      status: h.status,
      note: h.note,
      at: h.at,
    })),
    createdAt: order.createdAt,
    items: (order.items ?? []).map((i) => ({
      name: i.name ?? "",
      price: i.price ?? 0,
      quantity: i.quantity ?? 1,
    })),
    subtotal: order.subtotal ?? 0,
    shipping: order.shipping ?? 0,
    total: order.total ?? 0,
    payment: order.payment ?? "cod",
  });
}
