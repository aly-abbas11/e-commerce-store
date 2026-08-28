import { NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin";
import { toAdminOrderListItem } from "@/lib/db/order-rules";
import { getAllOrders } from "@/lib/order-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await getAllOrders();
  return NextResponse.json({ orders: orders.map(toAdminOrderListItem) });
}
