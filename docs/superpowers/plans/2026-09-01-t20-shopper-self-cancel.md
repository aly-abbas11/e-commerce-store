# T-20 Shopper Self-Cancel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let shoppers cancel COD orders from `/track` within 24 hours while status is `new` or `processing`, with the same cancelled email as admin cancel.

**Architecture:** Pure cancel rules in `lib/db/order-rules.ts` drive `cancellable` / `cancelUntil` on the Track payload and a new shopper-only `POST /api/orders/[orderId]/cancel`. Track UI shows Cancel → inline confirm → POST → refresh payload. Reuse `updateOrderStatus` + `sendOrderStatusUpdateEmail`.

**Tech Stack:** Next.js 14 App Router, existing `order-store`, T-04 email helpers, node:test via `tsx --test`.

**Spec:** `docs/superpowers/specs/2026-09-01-t20-shopper-self-cancel-design.md`

## Global Constraints

- Eligible statuses: `new` or `processing` only
- Window: ≤ 24 hours from `createdAt` (server clock)
- Note: exactly `Cancelled by customer`
- Wrong email: same 404 + `SHOPPER_NOT_FOUND_MESSAGE` as Track GET
- No cancel reason; no inventory restock; admin status route unchanged
- Email: existing cancelled template via `sendOrderStatusUpdateEmail`

## File map

| File | Responsibility |
|---|---|
| `lib/db/order-rules.ts` | `SHOPPER_CANCEL_*`, `canShopperCancel`, `shopperCancelUntil`, `shopperCancelBlockReason`, extend payload |
| `lib/db/order-rules.test.ts` | Unit tests for rules + payload fields |
| `app/api/orders/[orderId]/cancel/route.ts` | Shopper POST cancel |
| `components/orders/track-order.tsx` | Cancel UI + confirm + POST |
| `docs/modules/orders/RELEASE_NOTES.md` | Short release note (closeout) |
| `docs/dev-priorities.md` | Mark T-20 done (closeout) |

---

### Task 1: Cancel rules + track payload fields

**Files:**
- Modify: `lib/db/order-rules.ts`
- Modify: `lib/db/order-rules.test.ts`

**Interfaces:**
- Consumes: `Order`, `OrderStatus` from `lib/types`
- Produces:
  - `SHOPPER_CANCEL_WINDOW_MS: number` (= `24 * 60 * 60 * 1000`)
  - `SHOPPER_CANCEL_NOTE: "Cancelled by customer"`
  - `canShopperCancel(order: Order, now?: Date): boolean`
  - `shopperCancelUntil(order: Order): string | null`
  - `shopperCancelBlockReason(order: Order, now?: Date): string | null` — null if cancellable; else shopper-safe message
  - `ShopperTrackPayload` gains `cancellable: boolean` and `cancelUntil: string | null`

- [ ] **Step 1: Write the failing tests**

Append to `lib/db/order-rules.test.ts`:

```ts
import {
  // ...existing
  canShopperCancel,
  shopperCancelUntil,
  shopperCancelBlockReason,
  SHOPPER_CANCEL_NOTE,
  SHOPPER_CANCEL_WINDOW_MS,
} from "./order-rules";

describe("canShopperCancel", () => {
  const now = new Date("2026-09-01T12:00:00.000Z");

  it("allows new orders within 24 hours", () => {
    const order = {
      ...sample,
      status: "new" as const,
      createdAt: "2026-09-01T11:00:00.000Z",
    };
    assert.equal(canShopperCancel(order, now), true);
  });

  it("allows processing orders within 24 hours", () => {
    const order = {
      ...sample,
      status: "processing" as const,
      createdAt: "2026-08-31T13:00:00.000Z", // 23h before now
    };
    assert.equal(canShopperCancel(order, now), true);
  });

  it("denies processing orders older than 24 hours", () => {
    const order = {
      ...sample,
      status: "processing" as const,
      createdAt: "2026-08-31T11:00:00.000Z", // 25h before now
    };
    assert.equal(canShopperCancel(order, now), false);
  });

  it("denies shipped even when fresh", () => {
    const order = {
      ...sample,
      status: "shipped" as const,
      createdAt: "2026-09-01T11:30:00.000Z",
    };
    assert.equal(canShopperCancel(order, now), false);
  });

  it("denies delivered and cancelled", () => {
    assert.equal(
      canShopperCancel({ ...sample, status: "delivered", createdAt: "2026-09-01T11:00:00.000Z" }, now),
      false
    );
    assert.equal(
      canShopperCancel({ ...sample, status: "cancelled", createdAt: "2026-09-01T11:00:00.000Z" }, now),
      false
    );
  });

  it("denies missing createdAt", () => {
    const order = { ...sample, createdAt: undefined as unknown as string };
    assert.equal(canShopperCancel(order, now), false);
  });
});

describe("shopperCancelUntil", () => {
  it("returns createdAt + 24h for new/processing", () => {
    const order = { ...sample, status: "new" as const, createdAt: "2026-09-01T10:00:00.000Z" };
    assert.equal(
      shopperCancelUntil(order),
      new Date(Date.parse(order.createdAt) + SHOPPER_CANCEL_WINDOW_MS).toISOString()
    );
  });

  it("returns null for shipped", () => {
    assert.equal(shopperCancelUntil({ ...sample, status: "shipped" }), null);
  });
});

describe("shopperCancelBlockReason", () => {
  const now = new Date("2026-09-01T12:00:00.000Z");

  it("returns null when cancellable", () => {
    assert.equal(
      shopperCancelBlockReason(
        { ...sample, status: "new", createdAt: "2026-09-01T11:00:00.000Z" },
        now
      ),
      null
    );
  });

  it("explains already cancelled", () => {
    assert.match(
      shopperCancelBlockReason(
        { ...sample, status: "cancelled", createdAt: "2026-09-01T11:00:00.000Z" },
        now
      ) ?? "",
      /already cancelled/i
    );
  });

  it("explains shipped or delivered", () => {
    assert.match(
      shopperCancelBlockReason(
        { ...sample, status: "shipped", createdAt: "2026-09-01T11:00:00.000Z" },
        now
      ) ?? "",
      /no longer be cancelled/i
    );
  });

  it("explains window ended", () => {
    assert.match(
      shopperCancelBlockReason(
        { ...sample, status: "new", createdAt: "2026-08-30T12:00:00.000Z" },
        now
      ) ?? "",
      /24-hour cancel window/i
    );
  });
});

describe("toShopperTrackPayload cancellable", () => {
  it("includes cancellable and cancelUntil", () => {
    // Freeze: use order created "now" relative — assert shape; for true cancellable
    // use a createdAt within 24h of real now OR pass through canShopperCancel logic.
    const recent = {
      ...sample,
      status: "new" as const,
      createdAt: new Date().toISOString(),
    };
    const payload = toShopperTrackPayload(recent);
    assert.equal(payload.cancellable, true);
    assert.ok(payload.cancelUntil);
    assert.equal(typeof payload.cancelUntil, "string");

    const shipped = toShopperTrackPayload({ ...sample, status: "shipped" });
    assert.equal(shipped.cancellable, false);
    assert.equal(shipped.cancelUntil, null);
  });
});

describe("SHOPPER_CANCEL_NOTE", () => {
  it("is the fixed customer note", () => {
    assert.equal(SHOPPER_CANCEL_NOTE, "Cancelled by customer");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx tsx --test lib/db/order-rules.test.ts`

Expected: FAIL — `canShopperCancel` / exports not found.

- [ ] **Step 3: Implement rules**

In `lib/db/order-rules.ts`, add:

```ts
export const SHOPPER_CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;
export const SHOPPER_CANCEL_NOTE = "Cancelled by customer";

export type ShopperTrackPayload = {
  // ...existing fields...
  cancellable: boolean;
  cancelUntil: string | null;
};

export function canShopperCancel(order: Order, now: Date = new Date()): boolean {
  const status = order.status ?? "new";
  if (status !== "new" && status !== "processing") return false;
  const created = Date.parse(order.createdAt ?? "");
  if (!Number.isFinite(created)) return false;
  return now.getTime() - created <= SHOPPER_CANCEL_WINDOW_MS;
}

export function shopperCancelUntil(order: Order): string | null {
  const status = order.status ?? "new";
  if (status !== "new" && status !== "processing") return null;
  const created = Date.parse(order.createdAt ?? "");
  if (!Number.isFinite(created)) return null;
  return new Date(created + SHOPPER_CANCEL_WINDOW_MS).toISOString();
}

export function shopperCancelBlockReason(
  order: Order,
  now: Date = new Date()
): string | null {
  if (canShopperCancel(order, now)) return null;
  const status = order.status ?? "new";
  if (status === "cancelled") {
    return "This order is already cancelled.";
  }
  if (status === "shipped" || status === "delivered") {
    return "This order can no longer be cancelled online. Contact us if you need help.";
  }
  return "The 24-hour cancel window has ended. Contact us if you need help.";
}
```

Update `toShopperTrackPayload`:

```ts
export function toShopperTrackPayload(order: Order): ShopperTrackPayload {
  return {
    // ...existing fields...
    cancellable: canShopperCancel(order),
    cancelUntil: shopperCancelUntil(order),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx tsx --test lib/db/order-rules.test.ts`

Expected: PASS (all tests in file).

- [ ] **Step 5: Commit**

```bash
git add lib/db/order-rules.ts lib/db/order-rules.test.ts
git commit -m "feat: add shopper cancel eligibility rules for T-20"
```

---

### Task 2: Shopper cancel API route

**Files:**
- Create: `app/api/orders/[orderId]/cancel/route.ts`

**Interfaces:**
- Consumes: `getOrderById`, `updateOrderStatus`, `sendOrderStatusUpdateEmail`, `shopperLookupNotFound`, `SHOPPER_NOT_FOUND_MESSAGE`, `canShopperCancel`, `shopperCancelBlockReason`, `SHOPPER_CANCEL_NOTE`, `toShopperTrackPayload`
- Produces: `POST` handler returning 404 / 409 / 200 as in spec

- [ ] **Step 1: Create the route**

Create `app/api/orders/[orderId]/cancel/route.ts`:

```ts
import { NextResponse } from "next/server";

import {
  SHOPPER_CANCEL_NOTE,
  SHOPPER_NOT_FOUND_MESSAGE,
  canShopperCancel,
  shopperCancelBlockReason,
  shopperLookupNotFound,
  toShopperTrackPayload,
} from "@/lib/db/order-rules";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import { getOrderById, updateOrderStatus } from "@/lib/order-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Shopper: cancel own order within 24h while new/processing.
 * Body: { "email": "checkout@email.com" }
 */
export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const orderId = params.orderId;
  if (!orderId) {
    return NextResponse.json({ error: "Missing order ID." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const email =
    typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
  if (!email) {
    return NextResponse.json(
      { error: "Provide the email used at checkout." },
      { status: 400 }
    );
  }

  const order = await getOrderById(orderId);
  if (shopperLookupNotFound(order, email)) {
    return NextResponse.json({ error: SHOPPER_NOT_FOUND_MESSAGE }, { status: 404 });
  }

  const now = new Date();
  if (!canShopperCancel(order!, now)) {
    return NextResponse.json(
      { error: shopperCancelBlockReason(order!, now) },
      { status: 409 }
    );
  }

  const updated = await updateOrderStatus(
    orderId,
    "cancelled",
    SHOPPER_CANCEL_NOTE
  );
  if (!updated) {
    return NextResponse.json(
      { error: "Could not cancel the order. Please try again." },
      { status: 500 }
    );
  }

  let emailSent = false;
  let emailError: string | undefined;
  if (order!.customer?.email) {
    try {
      emailSent = await sendOrderStatusUpdateEmail(order!.customer.email, {
        orderId,
        name: order!.customer.name || "there",
        status: "cancelled",
        note: SHOPPER_CANCEL_NOTE,
        total: order!.total,
      });
    } catch (err) {
      emailError = err instanceof Error ? err.message : "send failed";
    }
  }

  return NextResponse.json({
    ok: true,
    order: toShopperTrackPayload(updated),
    email: emailSent
      ? "sent"
      : emailError
        ? `failed: ${emailError}`
        : "not sent (no email on order)",
  });
}
```

- [ ] **Step 2: Typecheck the route**

Run: `npx tsc --noEmit`

Expected: no errors related to cancel route / payload.

- [ ] **Step 3: Commit**

```bash
git add app/api/orders/[orderId]/cancel/route.ts
git commit -m "feat: add shopper order cancel API for T-20"
```

---

### Task 3: Track UI — cancel + confirm

**Files:**
- Modify: `components/orders/track-order.tsx`

**Interfaces:**
- Consumes: Track payload `cancellable`, `cancelUntil`; `POST /api/orders/:id/cancel` with `{ email }`
- Produces: Cancel control + inline confirm; updates `result` from response `order`

- [ ] **Step 1: Extend TrackResponse and add cancel UI state**

In `components/orders/track-order.tsx`:

1. Add to `TrackResponse`:

```ts
  cancellable: boolean;
  cancelUntil: string | null;
```

2. Add state next to existing hooks:

```ts
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
```

3. Add handler:

```ts
  async function cancelOrder() {
    if (!result) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(result.orderId)}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        }
      );
      const body = await res.json().catch(() => null);
      if (res.status === 404) {
        setCancelError(SHOPPER_NOT_FOUND_MESSAGE);
        return;
      }
      if (!res.ok || !body?.order) {
        setCancelError(
          typeof body?.error === "string"
            ? body.error
            : "Could not cancel. Try again."
        );
        if (body?.order) setResult(body.order);
        return;
      }
      setResult(body.order);
      setConfirmCancel(false);
    } catch {
      setCancelError("Could not cancel. Try again.");
    } finally {
      setCancelling(false);
    }
  }
```

4. After the timeline `</ol>` (still inside the status card), when `result.cancellable`:

```tsx
            {result.cancellable ? (
              <div className="mt-6 border-t border-border pt-5">
                {!confirmCancel ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      You can cancel until{" "}
                      {formatDate(result.cancelUntil)} while we haven&apos;t shipped.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3 w-full sm:w-auto"
                      onClick={() => {
                        setCancelError(null);
                        setConfirmCancel(true);
                      }}
                    >
                      Cancel order
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-sm font-medium text-foreground">
                      Cancel this order? You can&apos;t undo this.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={cancelling}
                        onClick={() => setConfirmCancel(false)}
                      >
                        Keep order
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={cancelling}
                        onClick={() => void cancelOrder()}
                      >
                        {cancelling ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Yes, cancel
                      </Button>
                    </div>
                  </div>
                )}
                {cancelError ? (
                  <p role="alert" className="mt-3 text-sm text-destructive">
                    {cancelError}
                  </p>
                ) : null}
              </div>
            ) : null}
```

5. When starting a new `search()`, reset cancel UI:

```ts
    setConfirmCancel(false);
    setCancelError(null);
```

(inside `search`, near other resets)

- [ ] **Step 2: Smoke-check types**

Run: `npx tsc --noEmit`

Expected: clean for track-order changes.

- [ ] **Step 3: Commit**

```bash
git add components/orders/track-order.tsx
git commit -m "feat: add self-cancel controls on Track order for T-20"
```

---

### Task 4: Closeout docs

**Files:**
- Modify: `docs/modules/orders/RELEASE_NOTES.md` (prepend)
- Modify: `docs/dev-priorities.md` (T-20 → ✅ Done; clear Active task or advance)
- Optionally one line in `docs/modules/orders/ORDERS_IMPLEMENTATION.md` under Track

- [ ] **Step 1: Release note**

Prepend to `docs/modules/orders/RELEASE_NOTES.md`:

```md
## 2026-09-01 — T-20 Shopper self-cancel

- Customers can cancel from `/track` within 24 hours while status is new or processing.
- Same cancelled email as admin; history note: “Cancelled by customer”.
```

- [ ] **Step 2: Mark T-20 done in `docs/dev-priorities.md`**

Set T-20 status to ✅ Done with verification note; clear **Active task** for T-20 (restore parked note for T-15/T-16 as appropriate).

- [ ] **Step 3: Run full unit suite**

Run: `npm test`

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add docs/modules/orders/RELEASE_NOTES.md docs/dev-priorities.md docs/modules/orders/ORDERS_IMPLEMENTATION.md
git commit -m "docs: close out T-20 shopper self-cancel"
```

---

## Spec coverage check

| Spec requirement | Task |
|---|---|
| `canShopperCancel` / 24h / new|processing | Task 1 |
| Payload `cancellable` + `cancelUntil` | Task 1 |
| POST cancel + email + note | Task 2 |
| Track UI confirm | Task 3 |
| 404 / 409 messages | Tasks 1–2 |
| Release note + tracker | Task 4 |

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-01-t20-shopper-self-cancel.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — implement in this session with executing-plans checkpoints  

Which approach?
