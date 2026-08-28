export const DASHBOARD_TIMEZONE = "Asia/Karachi";

type SnapshotOrder = {
  orderId: string;
  createdAt: string;
  status?: string | null;
  statusUpdatedAt?: string | null;
  total?: number | null;
  isDemo?: boolean;
  customer?: { name?: string };
};

type SnapshotProduct = {
  _id: string;
  name: string;
  stockStatus?: string;
  status?: string;
  isDemo?: boolean;
};

type SnapshotReview = { status?: string | null };

export type DashboardPendingOrder = {
  orderId: string;
  customerName: string;
  status: string;
  total: number;
};

export type DashboardStockProduct = {
  id: string;
  name: string;
  stockStatus: string;
};

export type DashboardSnapshot = {
  todayOrderCount: number;
  todayRevenue: number;
  pendingCount: number;
  deliveredTodayCount: number;
  cancelledTodayCount: number;
  lowStockCount: number;
  pendingOrders: DashboardPendingOrder[];
  shippedWaitingCount: number;
  lowStockProducts: DashboardStockProduct[];
  pendingReviewCount: number;
  draftProductCount: number;
  firstDraftProductId: string | null;
  practiceOrderCount: number;
};

function karachiYmd(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DASHBOARD_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function isOnKarachiDay(iso: string | undefined | null, now: Date): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  return karachiYmd(new Date(t)) === karachiYmd(now);
}

export function orderMatchesStatusFilter(
  status: string,
  filter: string | null | undefined
): boolean {
  if (!filter) return true;
  if (filter === "pending") return status === "new" || status === "processing";
  if (filter === "shipped" || filter === "delivered" || filter === "cancelled") {
    return status === filter;
  }
  return true;
}

export function productMatchesStockAttention(stockStatus: string): boolean {
  return stockStatus === "low-stock" || stockStatus === "out-of-stock";
}

export function buildDashboardSnapshot(
  input: {
    orders: SnapshotOrder[];
    products: SnapshotProduct[];
    reviews: SnapshotReview[];
  },
  now = new Date()
): DashboardSnapshot {
  const live = input.orders.filter((o) => !o.isDemo);
  const practiceOrderCount = input.orders.filter((o) => o.isDemo).length;
  const todayLive = live.filter((o) => isOnKarachiDay(o.createdAt, now));
  const todayRevenue = todayLive
    .filter((o) => (o.status ?? "new") !== "cancelled")
    .reduce((sum, o) => sum + (typeof o.total === "number" ? o.total : 0), 0);

  const pending = live
    .filter((o) => {
      const s = o.status ?? "new";
      return s === "new" || s === "processing";
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const livePublished = input.products.filter((p) => !p.isDemo && p.status === "published");
  const attention = livePublished.filter((p) =>
    productMatchesStockAttention(p.stockStatus ?? "in-stock")
  );
  const drafts = input.products.filter((p) => p.status !== "published");

  return {
    todayOrderCount: todayLive.length,
    todayRevenue,
    pendingCount: pending.length,
    deliveredTodayCount: live.filter(
      (o) => (o.status ?? "new") === "delivered" && isOnKarachiDay(o.statusUpdatedAt, now)
    ).length,
    cancelledTodayCount: live.filter(
      (o) => o.status === "cancelled" && isOnKarachiDay(o.statusUpdatedAt, now)
    ).length,
    lowStockCount: attention.length,
    pendingOrders: pending.slice(0, 8).map((o) => ({
      orderId: o.orderId,
      customerName: o.customer?.name ?? "",
      status: o.status ?? "new",
      total: typeof o.total === "number" ? o.total : 0,
    })),
    shippedWaitingCount: live.filter((o) => o.status === "shipped").length,
    lowStockProducts: attention.slice(0, 8).map((p) => ({
      id: p._id,
      name: p.name,
      stockStatus: p.stockStatus ?? "in-stock",
    })),
    pendingReviewCount: input.reviews.filter((r) => r.status === "pending").length,
    draftProductCount: drafts.length,
    firstDraftProductId: drafts[0]?._id ?? null,
    practiceOrderCount,
  };
}
