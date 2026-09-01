"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AnalyticsFunnelPanel } from "@/components/admin/analytics-funnel";
import { adminFetch, AdminAuthError } from "@/components/admin/admin-fetch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ANALYTICS_DIMENSIONS,
  ANALYTICS_METRICS,
  type AnalyticsDimension,
  type AnalyticsMetric,
  type AnalyticsPreset,
  type CityPerfRow,
  type CustomerAnalytics,
  type DrillOrder,
  type ExecutiveSnapshot,
  type FunnelStep,
  type ProductPerfRow,
  type QueryRow,
} from "@/lib/db/analytics-rules";
import type { InsightCard } from "@/lib/db/analytics-insight-rules";
import type {
  DeliveredBySourceRow,
  LandingPageRow,
  SessionsBySourceRow,
  ShopFunnelStep,
} from "@/lib/db/analytics-traffic-rules";
import { cn, formatPrice } from "@/lib/utils";

type Bundle = {
  range: { start: string; end: string };
  executive: ExecutiveSnapshot;
  products: ProductPerfRow[];
  cities: CityPerfRow[];
  customers: CustomerAnalytics;
  funnel: FunnelStep[];
  traffic: {
    available: boolean;
    visitors: number | null;
    sessions: number | null;
    convertedSessions: number | null;
    bySource: SessionsBySourceRow[] | null;
    landingPages: LandingPageRow[] | null;
    deliveredBySource: DeliveredBySourceRow[];
  };
  shopFunnel: ShopFunnelStep[] | null;
  insights: InsightCard[];
  retentionNotice: boolean;
};

type SavedReport = {
  id: string;
  name: string;
  query: Record<string, unknown>;
};

const PRESETS: { id: AnalyticsPreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7", label: "Last 7 days" },
  { id: "last30", label: "Last 30 days" },
  { id: "thisMonth", label: "This month" },
  { id: "custom", label: "Custom" },
];

const METRIC_LABEL: Record<AnalyticsMetric, string> = {
  deliveredRevenue: "Delivered revenue",
  deliveredProfit: "Delivered profit",
  ordersPlaced: "Orders placed",
  ordersDelivered: "Delivered orders",
  deliveryRate: "Delivery rate",
  cancellationRate: "Cancellation rate",
  averageOrderValue: "Average delivered order",
};

const DIM_LABEL: Record<AnalyticsDimension, string> = {
  product: "Product",
  category: "Category",
  city: "City",
  date: "Date",
  customerCohort: "Customer cohort",
};

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatRate(n: number | null | undefined): string {
  if (n == null) return "Not available";
  return `${Math.round(n * 1000) / 10}%`;
}

function formatCount(n: number | null | undefined): string {
  if (n == null) return "Not available";
  return String(n);
}

function displaySource(source: string): string {
  return source === "unattributed" ? "Unattributed" : source;
}

function formatMoney(n: number | null | undefined): string {
  if (n == null) return "Not available";
  return formatPrice(n);
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function MetricButton({
  label,
  value,
  hint,
  primary,
  onClick,
}: {
  label: string;
  value: string;
  hint?: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <Card
      className={cn(
        "flex min-h-11 flex-col justify-center px-4 py-4",
        primary && "border-foreground/20 bg-muted/40",
        onClick && "transition-colors hover:bg-accent"
      )}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-semibold tabular-nums", primary ? "text-3xl" : "text-2xl")}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
  if (!onClick) return inner;
  return (
    <button type="button" onClick={onClick} className="block w-full text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {inner}
    </button>
  );
}

function RetentionBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p role="status" className="rounded-lg border px-4 py-3 text-sm">
      First-party traffic data is available for the last 90 days only. Order and delivered-revenue analytics remain available for this range.
    </p>
  );
}

export function AnalyticsConsole() {
  const [preset, setPreset] = useState<AnalyticsPreset>("last30");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drillTitle, setDrillTitle] = useState<string | null>(null);
  const [drillOrders, setDrillOrders] = useState<DrillOrder[]>([]);
  const [drillLoading, setDrillLoading] = useState(false);
  const [metric, setMetric] = useState<AnalyticsMetric>("deliveredRevenue");
  const [dimension, setDimension] = useState<"" | AnalyticsDimension>("");
  const [queryRows, setQueryRows] = useState<QueryRow[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [saveName, setSaveName] = useState("");
  const [reports, setReports] = useState<SavedReport[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ preset });
      if (preset === "custom") {
        if (from) params.set("from", from);
        if (to) params.set("to", to);
      }
      const json = await adminFetch(`/api/admin/analytics?${params.toString()}`);
      setBundle(json);
      setDrillTitle(null);
      setDrillOrders([]);
    } catch (err) {
      if (err instanceof AdminAuthError) {
        setError("Sign in again to view analytics.");
      } else {
        setError(err instanceof Error ? err.message : "Could not load analytics.");
      }
    } finally {
      setLoading(false);
    }
  }, [preset, from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void adminFetch("/api/admin/analytics/reports")
      .then((json) => setReports(json.reports ?? []))
      .catch(() => setReports([]));
  }, []);

  async function openDrill(title: string, ids: string[]) {
    setDrillTitle(title);
    setDrillLoading(true);
    try {
      const json = await adminFetch(`/api/admin/analytics/orders?ids=${encodeURIComponent(ids.join(","))}`);
      setDrillOrders(json.orders ?? []);
    } catch {
      setDrillOrders([]);
    } finally {
      setDrillLoading(false);
    }
  }

  async function runQuery(q?: Record<string, unknown>) {
    setQueryError(null);
    const body = q ?? {
      metric,
      dimension: dimension || undefined,
      preset,
      from: preset === "custom" ? from : undefined,
      to: preset === "custom" ? to : undefined,
      sort: "desc",
      limit: 25,
    };
    try {
      const json = await adminFetch("/api/admin/analytics/query", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setQueryRows(json.rows ?? []);
    } catch (err) {
      setQueryRows(null);
      setQueryError(err instanceof Error ? err.message : "Query failed.");
    }
  }

  async function saveReport() {
    setQueryError(null);
    try {
      await adminFetch("/api/admin/analytics/reports", {
        method: "POST",
        body: JSON.stringify({
          name: saveName,
          query: {
            metric,
            dimension: dimension || undefined,
            preset,
            from: preset === "custom" ? from : undefined,
            to: preset === "custom" ? to : undefined,
            sort: "desc",
            limit: 25,
          },
        }),
      });
      setSaveName("");
      const json = await adminFetch("/api/admin/analytics/reports");
      setReports(json.reports ?? []);
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : "Could not save report.");
    }
  }

  async function removeReport(id: string) {
    await adminFetch(`/api/admin/analytics/reports/${id}`, { method: "DELETE" });
    setReports((list) => list.filter((r) => r.id !== id));
  }

  const exec = bundle?.executive;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Delivered orders are realized money. Placed revenue is not cash in hand. Practice orders are excluded.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.id}
            type="button"
            variant={preset === p.id ? "default" : "outline"}
            onClick={() => setPreset(p.id)}
          >
            {p.label}
          </Button>
        ))}
      </div>
      {preset === "custom" ? (
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <Button type="button" onClick={() => void load()}>
            Apply
          </Button>
        </div>
      ) : null}

      {bundle ? (
        <p className="text-sm text-muted-foreground">
          {bundle.range.start} to {bundle.range.end} · Asia/Karachi
        </p>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading && !bundle ? <p className="text-sm text-muted-foreground">Loading…</p> : null}

      {exec ? (
        <Tabs defaultValue="overview">
          <TabsList className="flex h-auto w-full flex-wrap justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="cities">Cities</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="funnel">Funnel</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="query">Query</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <MetricButton
                primary
                label="Delivered revenue"
                value={formatMoney(exec.deliveredRevenue)}
                hint="Primary KPI · money from orders first marked delivered in this range"
                onClick={() => void openDrill("Delivered orders", exec.deliveredOrderIds)}
              />
              <MetricButton
                label="Placed revenue"
                value={formatMoney(exec.placedRevenue)}
                hint="Not realized · includes orders that may still cancel"
                onClick={() => void openDrill("Placed orders", exec.placedOrderIds)}
              />
              <MetricButton
                label="Delivered gross profit"
                value={formatMoney(exec.deliveredGrossProfit)}
                hint={
                  exec.profitIncomplete
                    ? "Not available until every delivered product has a cost"
                    : "Delivered revenue minus product cost"
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              <MetricButton
                label="Orders placed"
                value={String(exec.ordersPlaced)}
                onClick={() => void openDrill("Placed orders", exec.placedOrderIds)}
              />
              <MetricButton label="Processing" value={String(exec.ordersProcessing)} />
              <MetricButton label="Shipped" value={String(exec.ordersShipped)} />
              <MetricButton
                label="Delivered"
                value={String(exec.ordersDelivered)}
                onClick={() => void openDrill("Delivered orders", exec.deliveredOrderIds)}
              />
              <MetricButton
                label="Cancelled"
                value={String(exec.ordersCancelled)}
                onClick={() => void openDrill("Cancelled orders", exec.cancelledOrderIds)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <MetricButton
                label="Delivery success rate"
                value={formatRate(exec.deliverySuccessRate)}
                hint="Of orders placed in this range, currently delivered"
              />
              <MetricButton
                label="Cancellation rate"
                value={formatRate(exec.cancellationRate)}
                hint="Of orders placed in this range, currently cancelled"
              />
              <Card className="px-4 py-4">
                <p className="text-sm text-muted-foreground">Not available</p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>Confirmed orders</li>
                  <li>Out for delivery</li>
                  <li>Returned / refused</li>
                  <li>Marketing / ROAS</li>
                  <li>Contribution profit</li>
                </ul>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            {bundle.products.length === 0 ? (
              <p className="text-sm text-muted-foreground">No product order lines in this range.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="px-3 py-2 font-medium">Product</th>
                      <th className="px-3 py-2 font-medium">Qty ordered</th>
                      <th className="px-3 py-2 font-medium">Qty delivered</th>
                      <th className="px-3 py-2 font-medium">Placed revenue</th>
                      <th className="px-3 py-2 font-medium">Delivered revenue</th>
                      <th className="px-3 py-2 font-medium">Cost of goods</th>
                      <th className="px-3 py-2 font-medium">Delivered profit</th>
                      <th className="px-3 py-2 font-medium">Delivery rate</th>
                      <th className="px-3 py-2 font-medium">Cancel rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bundle.products.map((p) => (
                      <tr key={p.slug} className="border-b last:border-0">
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            className="text-left font-medium hover:underline"
                            onClick={() => void openDrill(p.name, p.orderIds)}
                          >
                            {p.name}
                          </button>
                        </td>
                        <td className="px-3 py-2 tabular-nums">{p.quantityOrdered}</td>
                        <td className="px-3 py-2 tabular-nums">{p.quantityDelivered}</td>
                        <td className="px-3 py-2 tabular-nums">{formatMoney(p.placedRevenue)}</td>
                        <td className="px-3 py-2 tabular-nums">{formatMoney(p.deliveredRevenue)}</td>
                        <td className="px-3 py-2 tabular-nums">{formatMoney(p.costOfGoods)}</td>
                        <td className="px-3 py-2 tabular-nums">{formatMoney(p.deliveredGrossProfit)}</td>
                        <td className="px-3 py-2 tabular-nums">{formatRate(p.deliverySuccessRate)}</td>
                        <td className="px-3 py-2 tabular-nums">{formatRate(p.cancellationRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cities">
            {bundle.cities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No city data in this range.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="px-3 py-2 font-medium">City</th>
                      <th className="px-3 py-2 font-medium">Placed</th>
                      <th className="px-3 py-2 font-medium">Confirmed</th>
                      <th className="px-3 py-2 font-medium">Delivered</th>
                      <th className="px-3 py-2 font-medium">Cancelled</th>
                      <th className="px-3 py-2 font-medium">Delivered revenue</th>
                      <th className="px-3 py-2 font-medium">Delivery rate</th>
                      <th className="px-3 py-2 font-medium">Cancel rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bundle.cities.map((c) => (
                      <tr key={c.city} className="border-b last:border-0">
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            className="font-medium hover:underline"
                            onClick={() => void openDrill(c.city, c.orderIds)}
                          >
                            {c.city}
                          </button>
                        </td>
                        <td className="px-3 py-2 tabular-nums">{c.ordersPlaced}</td>
                        <td className="px-3 py-2 text-muted-foreground">Not available</td>
                        <td className="px-3 py-2 tabular-nums">{c.ordersDelivered}</td>
                        <td className="px-3 py-2 tabular-nums">{c.ordersCancelled}</td>
                        <td className="px-3 py-2 tabular-nums">{formatMoney(c.deliveredRevenue)}</td>
                        <td className="px-3 py-2 tabular-nums">{formatRate(c.deliverySuccessRate)}</td>
                        <td className="px-3 py-2 tabular-nums">{formatRate(c.cancellationRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {([bundle.customers.firstTime, bundle.customers.repeat] as const).map((row) => (
                <Card key={row.cohort} className="px-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    {row.cohort === "first-time" ? "First-time customers" : "Repeat customers"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{row.customers}</p>
                  <p className="mt-2 text-sm">
                    Orders in range: {row.orderCount} · Delivered: {row.deliveredOrderCount}
                  </p>
                  <p className="text-sm">Delivered revenue: {formatMoney(row.deliveredRevenue)}</p>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <MetricButton label="30-day reorder rate" value={formatRate(bundle.customers.reorderRate30)} />
              <MetricButton label="60-day reorder rate" value={formatRate(bundle.customers.reorderRate60)} />
              <MetricButton label="90-day reorder rate" value={formatRate(bundle.customers.reorderRate90)} />
            </div>
            {bundle.customers.skippedNoEmail > 0 ? (
              <p className="text-sm text-muted-foreground">
                {bundle.customers.skippedNoEmail} orders had no email and were not merged into customer stats.
              </p>
            ) : null}
          </TabsContent>

          <TabsContent value="traffic" className="space-y-4">
            <RetentionBanner show={bundle.retentionNotice} />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <MetricButton label="Unique visitors" value={formatCount(bundle.traffic.visitors)} />
              <MetricButton label="Sessions" value={formatCount(bundle.traffic.sessions)} />
              <MetricButton
                label="Converted Sessions"
                value={formatCount(bundle.traffic.convertedSessions)}
                hint="Sessions linked to ≥1 successful order"
              />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold">Sessions by source</h2>
              {bundle.traffic.bySource == null ? (
                <p className="text-sm text-muted-foreground">Not available</p>
              ) : bundle.traffic.bySource.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions in this range.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className="px-3 py-2 font-medium">Source</th>
                        <th className="px-3 py-2 font-medium">Sessions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bundle.traffic.bySource.map((row) => (
                        <tr key={row.source} className="border-b last:border-0">
                          <td className="px-3 py-2">{displaySource(row.source)}</td>
                          <td className="px-3 py-2 tabular-nums">{row.sessions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold">Landing pages</h2>
              {bundle.traffic.landingPages == null ? (
                <p className="text-sm text-muted-foreground">Not available</p>
              ) : bundle.traffic.landingPages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No landing pages in this range.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className="px-3 py-2 font-medium">Path</th>
                        <th className="px-3 py-2 font-medium">Sessions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bundle.traffic.landingPages.map((row) => (
                        <tr key={row.path} className="border-b last:border-0">
                          <td className="px-3 py-2">{row.path}</td>
                          <td className="px-3 py-2 tabular-nums">{row.sessions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold">
                Delivered Orders by Source — delivered during selected period
              </h2>
              {bundle.traffic.deliveredBySource.length === 0 ? (
                <p className="text-sm text-muted-foreground">No delivered orders in this range.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className="px-3 py-2 font-medium">Source</th>
                        <th className="px-3 py-2 font-medium">Orders</th>
                        <th className="px-3 py-2 font-medium">Delivered revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bundle.traffic.deliveredBySource.map((row) => (
                        <tr key={row.source} className="border-b last:border-0">
                          <td className="px-3 py-2">{displaySource(row.source)}</td>
                          <td className="px-3 py-2 tabular-nums">{row.orders}</td>
                          <td className="px-3 py-2 tabular-nums">{formatMoney(row.deliveredRevenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="funnel" className="space-y-8">
            <RetentionBanner show={bundle.retentionNotice} />
            <AnalyticsFunnelPanel
              title="Shop conversion"
              description="Sessions that started in this date range — how many reached each shopping step."
              steps={bundle.shopFunnel}
              empty={
                <p>
                  Shop funnel not available for this range (traffic retention or
                  no session data).
                </p>
              }
            />
            <AnalyticsFunnelPanel
              title="COD / fulfillment"
              description="Orders placed in this range — how many ever reached each status. Click a step to list those orders."
              steps={bundle.funnel}
              onStepClick={(step) => {
                const full = bundle.funnel.find((s) => s.key === step.key);
                if (full) void openDrill(full.label, full.orderIds);
              }}
            />
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <RetentionBanner show={bundle.retentionNotice} />
            {bundle.insights.length === 0 ? (
              <p className="text-sm text-muted-foreground">No insights for this range.</p>
            ) : (
              <ul className="space-y-3">
                {bundle.insights.map((card) => (
                  <li key={card.id}>
                    <Card className="space-y-3 px-4 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 className="text-lg font-semibold">{card.title}</h2>
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {card.confidence}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Evidence</h3>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          {card.evidence.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Possible causes</h3>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          {card.possibleCauses.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Recommended checks</h3>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          {card.recommendedChecks.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="query" className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="metric">Metric</Label>
                <select
                  id="metric"
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value as AnalyticsMetric)}
                >
                  {ANALYTICS_METRICS.map((m) => (
                    <option key={m} value={m}>
                      {METRIC_LABEL[m]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dimension">Group by</Label>
                <select
                  id="dimension"
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={dimension}
                  onChange={(e) => setDimension(e.target.value as "" | AnalyticsDimension)}
                >
                  <option value="">None</option>
                  {ANALYTICS_DIMENSIONS.map((d) => (
                    <option key={d} value={d}>
                      {DIM_LABEL[d]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void runQuery()}>
                Run
              </Button>
              <Input
                placeholder="Save as… e.g. Lahore 30-Day Delivery"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="max-w-sm"
                aria-label="Saved report name"
              />
              <Button type="button" variant="outline" onClick={() => void saveReport()} disabled={!saveName.trim()}>
                Save report
              </Button>
            </div>
            {queryError ? <p className="text-sm text-destructive">{queryError}</p> : null}
            {queryRows ? (
              queryRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rows.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className="px-3 py-2 font-medium">Group</th>
                        <th className="px-3 py-2 font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queryRows.map((row) => (
                        <tr key={row.label} className="border-b last:border-0">
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              className="hover:underline"
                              onClick={() => void openDrill(row.label, row.orderIds)}
                            >
                              {row.label}
                            </button>
                          </td>
                          <td className="px-3 py-2 tabular-nums">
                            {metric === "deliveryRate" || metric === "cancellationRate"
                              ? formatRate(row.value)
                              : metric === "ordersPlaced" || metric === "ordersDelivered"
                                ? row.value == null
                                  ? "Not available"
                                  : String(row.value)
                                : formatMoney(row.value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : null}
            {reports.length > 0 ? (
              <div>
                <h2 className="mb-2 text-lg font-semibold">Saved reports</h2>
                <ul className="divide-y rounded-lg border">
                  {reports.map((r) => (
                    <li key={r.id} className="flex min-h-11 items-center justify-between gap-3 px-3 py-2">
                      <button
                        type="button"
                        className="text-left text-sm font-medium hover:underline"
                        onClick={() => {
                          const q = r.query;
                          if (typeof q.metric === "string") setMetric(q.metric as AnalyticsMetric);
                          setDimension((q.dimension as AnalyticsDimension) || "");
                          void runQuery(q);
                        }}
                      >
                        {r.name}
                      </button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => void removeReport(r.id)}>
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      ) : null}

      {drillTitle ? (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{drillTitle}</h2>
          {drillLoading ? (
            <p className="text-sm text-muted-foreground">Loading orders…</p>
          ) : drillOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders in this total.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 font-medium">Order</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">City</th>
                    <th className="px-3 py-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {drillOrders.map((o) => (
                    <tr key={o.orderId} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">
                        <Link href={`/admin/orders/${encodeURIComponent(o.orderId)}`} className="hover:underline">
                          {o.orderId}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{formatWhen(o.createdAt)}</td>
                      <td className="px-3 py-2">{STATUS_LABEL[o.status] ?? o.status}</td>
                      <td className="px-3 py-2">{o.city}</td>
                      <td className="px-3 py-2 tabular-nums">{formatPrice(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
