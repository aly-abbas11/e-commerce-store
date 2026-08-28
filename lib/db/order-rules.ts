import type {
  Order,
  OrderStatus,
  OrderStatusHistoryEntry,
} from "../types";

export const ORDER_STATUS_VALUES: OrderStatus[] = [
  "new",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const SHOPPER_NOT_FOUND_MESSAGE =
  "We couldn't find an order for those details. Check the order number and email.";

export type ShopperTrackPayload = {
  orderId: string;
  status: OrderStatus;
  statusUpdatedAt: string | null;
  statusHistory: { status: OrderStatus; note?: string; at?: string }[];
  createdAt: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    variantName?: string;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  payment: string;
};

export type AdminListRow = {
  orderId: string;
  createdAt: string;
  customerName: string;
  status: OrderStatus;
  total: number;
};

export type AdminOrderListItem = AdminListRow & {
  customerEmail: string;
  isDemo: boolean;
};

export function emailsMatch(a?: string | null, b?: string | null): boolean {
  return (a ?? "").toLowerCase().trim() === (b ?? "").toLowerCase().trim();
}

export function shopperLookupNotFound(
  order: Order | null,
  email: string
): boolean {
  if (!order) return true;
  return !emailsMatch(order.customer?.email, email);
}

export function toShopperTrackPayload(order: Order): ShopperTrackPayload {
  return {
    orderId: order.orderId,
    status: order.status ?? "new",
    statusUpdatedAt: order.statusUpdatedAt ?? null,
    statusHistory: (order.statusHistory ?? []).map((h) => ({
      status: h.status,
      ...(h.note ? { note: h.note } : {}),
      ...(h.at ? { at: h.at } : {}),
    })),
    createdAt: order.createdAt,
    items: (order.items ?? []).map((i) => ({
      name: i.name ?? "",
      price: i.price ?? 0,
      quantity: i.quantity ?? 1,
      ...(i.variantName ? { variantName: i.variantName } : {}),
    })),
    subtotal: order.subtotal ?? 0,
    shipping: order.shipping ?? 0,
    total: order.total ?? 0,
    payment: order.payment ?? "cod",
  };
}

export function toAdminListRow(order: Order): AdminListRow {
  return {
    orderId: order.orderId,
    createdAt: order.createdAt,
    customerName: order.customer?.name ?? "",
    status: order.status ?? "new",
    total: order.total ?? 0,
  };
}

export function toAdminOrderListItem(order: Order): AdminOrderListItem {
  return {
    ...toAdminListRow(order),
    customerEmail: order.customer?.email ?? "",
    isDemo: Boolean(order.isDemo),
  };
}

export function isAllowedOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    ORDER_STATUS_VALUES.includes(value as OrderStatus)
  );
}

export function withStatusNote(
  status: OrderStatus,
  note?: string
): OrderStatusHistoryEntry {
  const trimmed = note?.trim();
  return {
    status,
    at: new Date().toISOString(),
    ...(trimmed ? { note: trimmed } : {}),
  };
}
