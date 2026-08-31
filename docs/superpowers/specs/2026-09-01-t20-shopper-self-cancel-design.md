# Spec: T-20 — Shopper self-cancel (Track order)

## Objective

Let a customer cancel their own COD order from `/track` within **24 hours** of placement, while status is still **new** or **processing**, so they do not need a return flow for “changed my mind” cancels.

**User:** shopper on `/track`; staff still cancel anytime from admin.

**Why now:** Track shows status but cannot cancel. Returns are the wrong path for pre-ship cancels.

**Success:** After Order ID + email lookup, eligible orders show **Cancel order** → confirm → status becomes `cancelled`, timeline updates, same cancelled email as admin cancel. Ineligible orders never show the control (or show a clear blocked message if they try the API).

## Locked decisions

| Topic | Decision |
|---|---|
| Approach | Dedicated shopper cancel API + Track UI (not reuse admin status auth) |
| Eligible statuses | `new` or `processing` only |
| Window | ≤ **24 hours** from `createdAt` (server clock) |
| After ship | No self-cancel (`shipped` / `delivered` / `cancelled` blocked) |
| Confirm UX | One button → short confirm (“Yes, cancel”) — **no reason** |
| History note | Fixed: `Cancelled by customer` |
| Email | Same T-04 cancelled template as admin cancel |
| Lookup auth | Same as Track: order ID + checkout email |
| Wrong email | Same generic 404 message as Track (no ID leak) |
| Inventory | Unchanged — no restock side effects (admin cancel has none today) |
| Demo orders | Same rules; no special case |

## Architecture

```
GET  /api/orders/[orderId]?email=     → track payload + cancellable (+ cancelUntil)
POST /api/orders/[orderId]/cancel    → { email } → cancel + email + updated payload
TrackOrder UI                         → Cancel when cancellable; confirm; refresh result
lib/db/order-rules.ts                 → canShopperCancel, cancelUntil, payload fields
```

Admin `POST /api/orders/[orderId]/status` stays admin-only and can still cancel anytime (including past 24h / after ship if staff choose).

## Rules (pure helpers)

```ts
SHOPPER_CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000
SHOPPER_CANCEL_NOTE = "Cancelled by customer"

canShopperCancel(order, now = Date): boolean
  - false if missing createdAt
  - false if status not in { new, processing }
  - false if now - createdAt > 24h
  - else true

shopperCancelUntil(order): string | null
  - ISO of createdAt + 24h when status is new/processing; else null
```

`toShopperTrackPayload` adds:

- `cancellable: boolean` — `canShopperCancel(order)`
- `cancelUntil: string | null` — for UI copy (“Cancel anytime until …”)

## API: `POST /api/orders/[orderId]/cancel`

**Body:** `{ "email": "…" }` (required, trimmed, case-insensitive match).

**Flow:**

1. Load order by ID.
2. If `shopperLookupNotFound(order, email)` → **404** + `SHOPPER_NOT_FOUND_MESSAGE`.
3. If `!canShopperCancel(order)` → **409** with a shopper-safe reason:
   - already cancelled → “This order is already cancelled.”
   - shipped / delivered → “This order can no longer be cancelled online. Contact us if you need help.”
   - past window → “The 24-hour cancel window has ended. Contact us if you need help.”
4. `updateOrderStatus(orderId, "cancelled", SHOPPER_CANCEL_NOTE)`.
5. Send `sendOrderStatusUpdateEmail` with status `cancelled` (same as admin status route). Email failure does **not** roll back cancel; respond with ok + email status like admin route.
6. Return **200** `{ ok: true, order: toShopperTrackPayload(updated) }` so the UI can replace state without a second GET.

**Out of scope:** rate limiting beyond existing patterns; CAPTCHA; cancel reason; restock.

## Track UI

Preserve current Track layout (card, timeline, items).

When `result.cancellable`:

- Show secondary/destructive **Cancel order** under the timeline (above items or below items — prefer **below timeline, above items**).
- Helper line: “You can cancel until {cancelUntil} while we haven’t shipped.”
- Click → inline confirm panel (not a separate route): “Cancel this order? You can’t undo this.” + **Keep order** / **Yes, cancel**.
- On success: set result to returned payload; confirm panel closes; timeline shows Cancelled.
- On 409: show returned error; hide cancel if no longer eligible.
- On 404: same as bad lookup.
- Disable buttons while request in flight.

No cancel control when `cancellable` is false (including already cancelled). Contact link remains for help after the window.

## Impact analysis

| Area | Verdict |
|---|---|
| Data model | No migration. Reuse status + history. |
| Auth / PII | Email proof only; payload still omits phone/address. |
| Admin | Unchanged; staff cancel anytime. Note distinguishes customer vs staff (staff may leave custom notes). |
| Email (T-04) | Reuse cancelled template; no new template. |
| Analytics (T-14/T-15) | Customer cancels count as `cancelled` like admin — expected. |
| Checkout / stock | No change. |
| Storefront chrome | `/track` already continuity-capable; no route rename. |
| Tests | Extend `order-rules` tests; optional route smoke via rules only if no API harness. |

**Spawned follow-ups:** none required. Optional later: restock on cancel (new task if product wants it).

## Testing

Unit tests in `lib/db/order-rules.test.ts` (or adjacent):

- allow: new + 1h old
- allow: processing + 23h old
- deny: processing + 25h old
- deny: shipped / delivered / cancelled even if fresh
- deny: missing createdAt
- payload includes `cancellable` / `cancelUntil`

Manual: place COD order → `/track` → cancel within window → email + admin detail shows cancelled + note.

## Acceptance

- [ ] Eligible Track result shows Cancel + confirm; success → Cancelled timeline
- [ ] Shipped / >24h / already cancelled: no cancel control; API 409 if forced
- [ ] Wrong email: 404, same message as Track
- [ ] Cancelled email sent (same template as admin)
- [ ] History note is `Cancelled by customer`
- [ ] Unit tests green; `npm test` / related suite passes

## Out of scope

- Returns / refunds after delivery
- Partial cancel / line-item cancel
- Changing the 24h window via admin settings
- Inventory restock automation
