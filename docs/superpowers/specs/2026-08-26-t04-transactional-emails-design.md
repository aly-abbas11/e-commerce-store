# Spec: T-04 — Transactional order emails

## Objective

Replace the five customer order emails with a light, phone-first layout. Confirmation BCCs the store inbox. Checkout stays cash on delivery. Sending stays on Resend.

**User:** customers receive the emails; you get a copy of new orders only.

**Why now:** T-03 lets you set status from `/admin/orders`. The emails still use the old dark HTML.

**Success:** Place an order → customer and you get confirmation (order ID, items, COD, delivery address, Track). Set processing / shipped / delivered / cancelled → customer gets that email (headline, order ID, optional note, Track). Status emails are not BCC’d. Abandoned cart, win-back, and review-request HTML stay as they are.

## Tech stack

- Existing `lib/email.ts` (Resend `deliver()`, `FROM_EMAIL`, `RESEND_API_KEY`)
- Checkout: `app/api/checkout/route.ts` → `sendOrderConfirmationEmail`
- Status: `app/api/orders/[orderId]/status/route.ts` → `sendOrderStatusUpdateEmail` (no email when status is `new`)
- `/track?orderId=&email=` already used in the Track button
- Unit tests next to the builders (`lib/email-rules.ts` + `lib/email-rules.test.ts`, same pattern as T-03)

## Commands

```
npm run dev
npm test
npx tsc --noEmit
```

## Project structure

```
lib/email-rules.ts                 → builders + BCC helper (unit-tested)
lib/email.ts                       → light order shell, wire deliver() bcc/reply-to
app/api/checkout/route.ts          → pass address/city/postal/phone into confirmation
.env.example                       → ORDER_NOTIFY_EMAIL
```

Do not add an email CMS, React Email, or a new provider. Do not restyle marketing templates.

## Locked decisions

| Topic | Decision |
|---|---|
| Which emails | Confirm, processing, shipped, delivered, cancelled only |
| Layout | New light, phone-first HTML. Not today’s dark `#0b0f19` card |
| Marketing emails | Abandoned cart, win-back, review-request: unchanged |
| Your copy | BCC on **confirmation only**. Status emails: customer only |
| BCC address | `ORDER_NOTIFY_EMAIL` in env. If unset, still send to the customer; skip BCC |
| Reply-To | `ORDER_NOTIFY_EMAIL` when set, so “reply to this email” reaches you |
| Confirmation body | Name, order ID, items, totals, cash on delivery, delivery address (city, postal, phone), Track |
| Status body | Headline, order ID, optional admin note, Track. No phone/address |
| `new` status | Still does not send (confirmation already went out at checkout) |
| Courier | No carrier API. Tracking number goes in the T-03 optional note |
| Provider | Resend. No key → log to console (today’s dev behaviour) |

## Approaches considered

1. **Rebuild the five templates in `lib/email.ts` (chosen).** Small surface, tests on HTML/text builders, `deliver()` gains `bcc` / `reply_to`. Marketing templates keep the old shell.
2. React Email / extra package. Nicer components, extra dependency, no gain for five static letters.
3. Admin-editable templates. Out of scope (no email CMS).

## Architecture

```
Checkout
  → sendOrderConfirmationEmail(customerEmail, payload with address)
  → deliver({ to: customer, bcc: [ORDER_NOTIFY_EMAIL] if set, reply_to, html: light confirm })

Admin status (not `new`)
  → sendOrderStatusUpdateEmail(customerEmail, { status, note, … })
  → deliver({ to: customer, no bcc, reply_to, html: light status })
```

Shared **order shell** (light): white background, dark text, brand name, title, body, footer. Used only by the five order emails.

`deliver()` already posts to Resend. Add optional `bcc` and `reply_to` on that JSON body. Do not send BCC to the customer’s own address.

Checkout payload today omits address. Extend `OrderEmailPayload` and pass `phone`, `address`, `city`, `postal` from the order customer.

## Copy (plain language)

- **Confirmed:** Thanks, we have the order. Pay cash on delivery. Check the address. Track anytime.
- **Processing:** We are packing it. We will email again when it ships.
- **Shipped:** It is on the way. Admin note under the headline when present (courier / tracking).
- **Delivered:** It has arrived. Reply if something is wrong.
- **Cancelled:** Cancelled. COD, so nothing was charged. Reply if this was a mistake.

Subjects stay identifiable: brand + status + order ID (same idea as today).

## Error handling

| Case | Behavior |
|---|---|
| No `RESEND_API_KEY` | Log the message (including bcc). Checkout / status still succeed |
| Send fails | Log; checkout and status update still succeed (today’s behaviour) |
| No `ORDER_NOTIFY_EMAIL` | Customer still gets mail. No BCC |
| Missing customer email | Do not send (status route already skips) |
| Note empty | Omit the note block |

## Testing strategy

Write failing tests **before** HTML (`lib/email-rules.ts` + `lib/email-rules.test.ts`). Extend `npm test`.

- Confirmation HTML is light (does not use the old dark `#0b0f19` shell)
- Confirmation includes order ID, item names, “cash on delivery” / paid on delivery, Track URL with order ID + email, and address when provided
- Status HTML includes the note when provided; does **not** include phone or address even if present on a fat payload
- `bccList(to, notifyEmail)` returns `[notify]` on confirmation when notify is set and different from `to`; otherwise `[]`
- `npx tsc --noEmit` clean

**Manual:** place a test order (or use Resend dashboard / console log if no key) → confirm light layout + BCC. In admin, set shipped + note → customer-shaped email, no BCC. `/track` from the button still works.

## Code style

Keep `emailTemplates.postPurchase` / `abandonedCart` / `winback` on the existing dark `shell()`. Extract a second `orderShell()` rather than restyling marketing by accident. Reuse `ORDER_STATUS_VALUES`. Follow T-03: unit-tested builders, thin route wiring.

## Boundaries

- **Always:** Light order emails. BCC confirmation only. Status emails have no phone/address. Tests before HTML.
- **Ask first:** New email kinds, admin template editor, switching off Resend, sending on `new` status.
- **Never:** Abandoned/win-back/review HTML in this task. Courier APIs. T-07 storefront chrome. Staff accounts. Card payments.

## Out of scope

- T-05 analytics, T-06 staging, T-07 redesign, T-08 Vercel
- Abandoned cart, win-back, review-request templates
- Admin preview / test-send UI
- Courier / tracking-carrier integrations

## Success criteria

- [x] Five order emails use the light layout
- [x] Confirmation BCCs `ORDER_NOTIFY_EMAIL` when set
- [x] Status emails go to the customer only; optional note shows
- [x] Confirmation shows COD + delivery address; status emails do not show phone/address
- [x] Track button uses `/track?orderId=&email=`
- [x] Marketing templates unchanged
- [x] `npx tsc --noEmit` and `npm test` pass

## Open questions

None. Intent confirmed 2026-08-26.
