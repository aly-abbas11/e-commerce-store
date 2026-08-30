# Task 1 review package
Uncommitted working tree (no commits for this task; user forbade commits).
New untracked files plus package.json test script change.

## package.json diff

diff --git a/package.json b/package.json index 19b7d1a..79bfae7 100644 --- a/package.json +++ b/package.json @@ -1,35 +1,38 @@  {    "name": "e-commerce-store",    "version": "0.1.0",    "private": true,    "scripts": {      "dev": "next dev",      "build": "next build",      "start": "next start", -    "lint": "next lint" +    "lint": "next lint", +    "test": "tsx --test lib/db/migration-rules.test.ts lib/db/publish.test.ts lib/db/order-rules.test.ts lib/email-rules.test.ts lib/db/demo-rules.test.ts lib/gadget-preview.test.ts lib/deploy-rules.test.ts lib/db/category-rules.test.ts lib/product-image.test.ts lib/cloudinary.test.ts lib/db/dashboard-rules.test.ts lib/db/order-id.test.ts lib/db/analytics-rules.test.ts lib/db/analytics-ingest-rules.test.ts lib/db/map.test.ts", +    "migrate:sanity": "tsx scripts/migrate-sanity-to-supabase.ts"    },    "dependencies": {      "@portabletext/react": "^3.2.4",      "@radix-ui/react-accordion": "^1.2.20",      "@radix-ui/react-avatar": "^1.2.6",      "@radix-ui/react-dialog": "^1.1.23",      "@radix-ui/react-dropdown-menu": "^2.1.24",      "@radix-ui/react-label": "^2.1.15",      "@radix-ui/react-select": "^2.3.7",      "@radix-ui/react-separator": "^1.1.15",      "@radix-ui/react-slot": "^1.3.3",      "@radix-ui/react-tabs": "^1.1.21",      "@radix-ui/react-tooltip": "^1.2.16",      "@sanity/client": "^7.26.2",      "@sanity/image-url": "^2.1.1",      "@sanity/vision": "^3.99.0", +    "@supabase/supabase-js": "^2.112.4",      "class-variance-authority": "^0.7.1",      "cloudinary": "^2.10.0",      "clsx": "^2.1.1",      "lucide-react": "^1.31.0",      "next": "14.2.35",      "next-sanity": "^9.12.3",      "react": "^18",      "react-dom": "^18",      "sanity": "^3.99.0",      "tailwind-merge": "^3.6.0", @@ -37,13 +40,14 @@    },    "devDependencies": {      "@types/node": "^20",      "@types/react": "^18",      "@types/react-dom": "^18",      "eslint": "^8",      "eslint-config-next": "14.2.35",      "playwright": "^1.62.1",      "postcss": "^8",      "tailwindcss": "^3.4.1", +    "tsx": "^4.23.12",      "typescript": "^5"    }  }

## NEW FILE lib/db/analytics-ingest-rules.ts

```ts
export const ANALYTICS_EVENT_NAMES = [
  "page_view",
  "product_view",
  "add_to_cart",
  "remove_from_cart",
  "checkout_started",
  "checkout_step",
  "checkout_validation_error",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export const MAX_ANALYTICS_PATH_LENGTH = 200;
export const MAX_ANALYTICS_SLUG_LENGTH = 180;
export const MAX_ANALYTICS_UTM_LENGTH = 80;
export const MAX_ANALYTICS_CAMPAIGN_LENGTH = 80;
export const MAX_ANALYTICS_CLICK_ID_LENGTH = 128;
export const MAX_ANALYTICS_REFERRER_LENGTH = 200;

const PAGE_TYPES = new Set([
  "home",
  "catalog",
  "product",
  "cart",
  "checkout",
  "search",
  "content",
  "other",
]);

const VALIDATION_CATEGORIES = new Set([
  "name",
  "email",
  "phone",
  "address",
  "city",
  "empty_cart",
  "price_changed",
  "stock",
  "other",
]);

const UTM_SOURCE_MAP: Record<string, string> = {
  tiktok: "tiktok",
  meta: "meta",
  facebook: "meta",
  google: "google",
  instagram: "meta",
};

const SEARCH_HOST_PATTERNS = ["google.", "bing.", "yahoo.", "duckduckgo."];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ParsedAnalyticsEvent = {
  event_id: string;
  name: AnalyticsEventName;
  path: string;
  page_type: string;
  properties: Record<string, unknown>;
  product_id?: string;
  product_slug?: string;
};

export type ParseIngestBodyResult =
  | { ok: true; event: ParsedAnalyticsEvent }
  | { ok: false };

function truncate(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max);
}

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizePathname(path: string): string {
  try {
    const url = new URL(path, "https://local.invalid");
    const pathname = url.pathname || "/";
    return truncate(pathname, MAX_ANALYTICS_PATH_LENGTH);
  } catch {
    return "/";
  }
}

export function sanitizeReferrer(referrer: string): string {
  try {
    const url = new URL(referrer);
    return truncate(`${url.origin}${url.pathname}`, MAX_ANALYTICS_REFERRER_LENGTH);
  } catch {
    return "";
  }
}

function mapUtmSource(raw: string): string {
  const normalized = raw.trim().toLowerCase();
  return UTM_SOURCE_MAP[normalized] ?? "other";
}

function isSearchReferrer(referrer: string): boolean {
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    return SEARCH_HOST_PATTERNS.some((pattern) => host.includes(pattern));
  } catch {
    return false;
  }
}

function isExternalReferrer(referrer: string): boolean {
  try {
    const url = new URL(referrer);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeSource(input: {
  utm_source?: string;
  utm_campaign?: string;
  ttclid?: string;
  fbclid?: string;
  gclid?: string;
  referrer?: string;
}): { source: string } {
  const utmSource = asNonEmptyString(input.utm_source);
  if (utmSource) {
    return { source: mapUtmSource(truncate(utmSource, MAX_ANALYTICS_UTM_LENGTH)) };
  }

  const ttclid = asNonEmptyString(input.ttclid);
  if (ttclid) {
    return { source: "tiktok" };
  }

  const fbclid = asNonEmptyString(input.fbclid);
  if (fbclid) {
    return { source: "meta" };
  }

  const gclid = asNonEmptyString(input.gclid);
  if (gclid) {
    return { source: "google" };
  }

  const referrer = asNonEmptyString(input.referrer);
  if (referrer) {
    const sanitized = sanitizeReferrer(referrer);
    if (sanitized && isSearchReferrer(sanitized)) {
      return { source: "organic" };
    }
    if (sanitized && isExternalReferrer(sanitized)) {
      return { source: "referral" };
    }
  }

  return { source: "direct" };
}

export function isAllowedAnalyticsOrigin(origin: string | null | undefined, host: string): boolean {
  if (!origin) {
    return true;
  }

  try {
    const originHost = new URL(origin).hostname.toLowerCase();
    const expectedHost = host.split(":")[0]?.toLowerCase() ?? "";
    return originHost === expectedHost;
  } catch {
    return false;
  }
}

type RateLimiterInput = {
  ip?: string;
  sid?: string;
};

type RateLimiterConfig = {
  limit: number;
  windowMs: number;
  maxKeys: number;
};

export function createMemoryRateLimiter(config: RateLimiterConfig) {
  const buckets = new Map<string, number[]>();
  const keyOrder: string[] = [];

  function resolveKey(input: RateLimiterInput): string | null {
    const ip = asNonEmptyString(input.ip);
    if (ip) return `ip:${ip}`;
    const sid = asNonEmptyString(input.sid);
    if (sid) return `sid:${sid}`;
    return null;
  }

  function evictOldestIfNeeded() {
    while (buckets.size >= config.maxKeys && keyOrder.length > 0) {
      const oldestKey = keyOrder.shift();
      if (oldestKey) {
        buckets.delete(oldestKey);
      }
    }
  }

  function prune(timestamps: number[], now: number): number[] {
    const cutoff = now - config.windowMs;
    return timestamps.filter((timestamp) => timestamp > cutoff);
  }

  return {
    take(input: RateLimiterInput): boolean {
      const key = resolveKey(input);
      if (!key) {
        return true;
      }

      const now = Date.now();
      let timestamps = buckets.get(key);

      if (!timestamps) {
        evictOldestIfNeeded();
        timestamps = [];
        buckets.set(key, timestamps);
        keyOrder.push(key);
      }

      timestamps = prune(timestamps, now);

      if (timestamps.length >= config.limit) {
        buckets.set(key, timestamps);
        return false;
      }

      timestamps.push(now);
      buckets.set(key, timestamps);
      return true;
    },
  };
}

function parseEventProperties(
  name: AnalyticsEventName,
  properties: unknown
): Record<string, unknown> | null {
  const raw =
    properties && typeof properties === "object" && !Array.isArray(properties)
      ? (properties as Record<string, unknown>)
      : {};

  switch (name) {
    case "page_view":
    case "product_view":
    case "checkout_started":
      return {};
    case "add_to_cart":
    case "remove_from_cart": {
      if (!("quantity" in raw)) {
        return null;
      }
      const quantity = raw.quantity;
      if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
        return null;
      }
      return { quantity };
    }
    case "checkout_step": {
      const step = raw.step;
      if (step !== "details" && step !== "confirm") {
        return null;
      }
      return { step };
    }
    case "checkout_validation_error": {
      const category = raw.category;
      if (typeof category !== "string" || !VALIDATION_CATEGORIES.has(category)) {
        return null;
      }
      return { category };
    }
    default:
      return null;
  }
}

export function parseIngestBody(body: unknown): ParseIngestBodyResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false };
  }

  const input = body as Record<string, unknown>;
  const eventId = asNonEmptyString(input.event_id);
  if (!eventId || !isUuid(eventId)) {
    return { ok: false };
  }

  const name = asNonEmptyString(input.name);
  if (!name || !ANALYTICS_EVENT_NAMES.includes(name as AnalyticsEventName)) {
    return { ok: false };
  }
  const eventName = name as AnalyticsEventName;

  const pageType = asNonEmptyString(input.page_type);
  if (!pageType || !PAGE_TYPES.has(pageType)) {
    return { ok: false };
  }

  const pathValue = typeof input.path === "string" ? input.path : "/";
  const path = normalizePathname(pathValue);

  const properties = parseEventProperties(eventName, input.properties);
  if (properties === null) {
    return { ok: false };
  }

  const event: ParsedAnalyticsEvent = {
    event_id: eventId,
    name: eventName,
    path,
    page_type: pageType,
    properties,
  };

  const productId = asNonEmptyString(input.product_id);
  if (productId && isUuid(productId)) {
    event.product_id = productId;
  }

  const productSlug = asNonEmptyString(input.product_slug);
  if (productSlug) {
    event.product_slug = truncate(productSlug, MAX_ANALYTICS_SLUG_LENGTH);
  }

  return { ok: true, event };
}

```

## NEW FILE lib/db/analytics-ingest-rules.test.ts

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createMemoryRateLimiter,
  isAllowedAnalyticsOrigin,
  normalizePathname,
  normalizeSource,
  parseIngestBody,
  sanitizeReferrer,
} from "./analytics-ingest-rules";

describe("parseIngestBody", () => {
  it("accepts a whitelisted page_view and drops extra properties", () => {
    const parsed = parseIngestBody({
      event_id: "11111111-1111-4111-8111-111111111111",
      name: "page_view",
      path: "/products?x=1",
      page_type: "catalog",
      properties: { page_type: "nope", extra: true },
      is_demo: true,
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.event.name, "page_view");
    assert.equal(parsed.event.path, "/products");
    assert.deepEqual(parsed.event.properties, {});
    assert.equal("is_demo" in parsed.event, false);
  });

  it("rejects unknown event names", () => {
    const parsed = parseIngestBody({
      event_id: "11111111-1111-4111-8111-111111111111",
      name: "purchase",
      path: "/",
      page_type: "home",
      properties: {},
    });
    assert.equal(parsed.ok, false);
  });

  it("rejects invalid event_id that is not a UUID", () => {
    const parsed = parseIngestBody({
      event_id: "not-a-uuid",
      name: "page_view",
      path: "/",
      page_type: "home",
      properties: {},
    });
    assert.equal(parsed.ok, false);
  });

  it("rejects add_to_cart when quantity is missing", () => {
    const parsed = parseIngestBody({
      event_id: "11111111-1111-4111-8111-111111111111",
      name: "add_to_cart",
      path: "/",
      page_type: "product",
      properties: {},
    });
    assert.equal(parsed.ok, false);
  });

  it("rejects add_to_cart when quantity is not an integer", () => {
    const parsed = parseIngestBody({
      event_id: "11111111-1111-4111-8111-111111111111",
      name: "add_to_cart",
      path: "/",
      page_type: "product",
      properties: { quantity: 1.5 },
    });
    assert.equal(parsed.ok, false);
  });

  it("copies product_slug and ignores is_demo", () => {
    const parsed = parseIngestBody({
      event_id: "11111111-1111-4111-8111-111111111111",
      name: "product_view",
      path: "/products/widget",
      page_type: "product",
      properties: {},
      product_slug: "widget",
      is_demo: true,
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.event.product_slug, "widget");
    assert.equal("is_demo" in parsed.event, false);
  });

  it("rejects checkout_step without a valid step", () => {
    const parsed = parseIngestBody({
      event_id: "11111111-1111-4111-8111-111111111111",
      name: "checkout_step",
      path: "/checkout",
      page_type: "checkout",
      properties: { step: "payment" },
    });
    assert.equal(parsed.ok, false);
  });

  it("accepts checkout_validation_error with phone category", () => {
    const parsed = parseIngestBody({
      event_id: "11111111-1111-4111-8111-111111111111",
      name: "checkout_validation_error",
      path: "/checkout",
      page_type: "checkout",
      properties: { category: "phone" },
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.deepEqual(parsed.event.properties, { category: "phone" });
  });

  it("rejects checkout_validation_error with unknown category", () => {
    const parsed = parseIngestBody({
      event_id: "11111111-1111-4111-8111-111111111111",
      name: "checkout_validation_error",
      path: "/checkout",
      page_type: "checkout",
      properties: { category: "unknown_field" },
    });
    assert.equal(parsed.ok, false);
  });
});

describe("sanitizeReferrer", () => {
  it("strips query and fragment", () => {
    assert.equal(
      sanitizeReferrer("https://tiktok.com/v/1?click=abc#x"),
      "https://tiktok.com/v/1"
    );
  });
});

describe("normalizeSource", () => {
  it("follows UTM then click id then organic then referral then direct", () => {
    assert.equal(normalizeSource({ utm_source: "tiktok" }).source, "tiktok");
    assert.equal(normalizeSource({ ttclid: "tt" }).source, "tiktok");
    assert.equal(normalizeSource({ fbclid: "fb" }).source, "meta");
    assert.equal(normalizeSource({ gclid: "g" }).source, "google");
    assert.equal(normalizeSource({ referrer: "https://www.google.com/search" }).source, "organic");
    assert.equal(normalizeSource({ referrer: "https://news.example/a" }).source, "referral");
    assert.equal(normalizeSource({}).source, "direct");
    assert.equal(normalizeSource({ utm_source: "???" }).source, "other");
  });
});

describe("isAllowedAnalyticsOrigin", () => {
  it("rejects a different origin host", () => {
    assert.equal(isAllowedAnalyticsOrigin("https://evil.example", "voltgear-coral.vercel.app"), false);
    assert.equal(isAllowedAnalyticsOrigin("https://voltgear-coral.vercel.app", "voltgear-coral.vercel.app"), true);
  });

  it("allows missing origin", () => {
    assert.equal(isAllowedAnalyticsOrigin(null, "voltgear-coral.vercel.app"), true);
  });
});

describe("createMemoryRateLimiter", () => {
  it("limits per ip and does not use a global unknown bucket", () => {
    const lim = createMemoryRateLimiter({ limit: 2, windowMs: 60_000, maxKeys: 10 });
    assert.equal(lim.take({ ip: "1.1.1.1" }), true);
    assert.equal(lim.take({ ip: "1.1.1.1" }), true);
    assert.equal(lim.take({ ip: "1.1.1.1" }), false);
    assert.equal(lim.take({ ip: "2.2.2.2" }), true);
    assert.equal(lim.take({}), true);
    assert.equal(lim.take({}), true);
  });
});

describe("normalizePathname", () => {
  it("never keeps a query string", () => {
    assert.equal(normalizePathname("/product/a?utm_source=x"), "/product/a");
  });
});

```
