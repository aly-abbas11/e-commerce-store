# Spec: Admin ops upgrades (T-27…T-31)

## Objective

Give the VoltGear store owner five high-ROI admin upgrades after the Shopify-class platform ship: faster COD follow-up on Home, deeper customer history, saved marketing email templates, Cmd+K findability, and promo codes.

**User:** store owner (single admin password).

**Why now:** Catalog, inbox, collections, messaging, and nav IA are shipped. Remaining friction is daily ops (call COD orders, find people/orders, run promos) not more CMS screens.

**Success:** Each T-## works end-to-end on live `/admin` with Biometic theme; unit tests for pure rules; migrations pushed when needed.

## Locked decisions

| Topic | Decision |
|---|---|
| Program approach | Gap-first vertical slices (Approach 1) |
| Order | T-27 Home COD → T-28 Customer profile → T-29 Email templates → T-30 Cmd+K → T-31 Promo codes |
| Free shipping threshold | Keep Settings `freeShippingThreshold` / `shippingFee`; codes are additive |
| Out of scope | Gift cards, visual email builder, staff RBAC, theme editor, multi-warehouse, menu editor |

## Impact analysis (summary)

| Area | Blast radius |
|---|---|
| T-27 | `dashboard-rules`, `dashboard.tsx`, order phone fields already on orders |
| T-28 | New `/admin/customers/[key]`; joins orders + `contact_submissions` by email/phone |
| T-29 | New `email_templates` table; Messaging compose; seed Blank/Promo/Restock |
| T-30 | `admin-shell` palette; compact search API or client indexes |
| T-31 | New `promo_codes` (+ order discount fields); checkout + cart apply; admin CRUD |

Visibility: still single-admin; no new roles. Demo orders stay excluded from customer CRM and Needs you live lists.

---

## T-27 — Home COD follow-up

### Requirements
- Pending Needs you rows (new/processing) show **WhatsApp** and **Call** when phone is present (`whatsappHref` / `telHref` from `lib/contact-links.ts`).
- Shipped orders older than **3 calendar days** (Karachi, based on `statusUpdatedAt` else `createdAt`) appear as stale follow-ups (list up to 8 + count), not only a single aggregate count.
- Aggregate “all shipped waiting” can remain; stale list is the COD-specific signal.

### Rules
- `SHIPPED_STALE_DAYS = 3`
- `isShippedStale(order, now)` — status shipped and age ≥ 3 Karachi days
- Pending order snapshot includes `phone: string`

### UI
- Needs you pending row: order link + WhatsApp + Call (stop row-only navigation for actions).
- Stale shipped rows link to order detail.

### Out of scope
- Configurable N days in Settings (hardcode 3 for v1).
- Auto-SMS.

---

## T-28 — Customer profile depth

### Requirements
- `/admin/customers/[key]` where `key` is the same aggregation key as the list (email lowercased, else phone, else orderId).
- Show identity, order history (non-demo), inbox messages matching email or phone.
- List page links each row to the profile.

### Out of scope
- Merging duplicate keys; editing customer; marketing send log unless already persisted (skip if no store).

---

## T-29 — Saved email templates

### Requirements
- Table `email_templates`: id, name, subject, body_text, updated_at.
- Admin CRUD under Messaging (Email tab) or lightweight list+edit.
- Compose loads saved templates + keep seeded defaults if DB empty.
- No HTML builder.

---

## T-30 — Cmd+K search

### Requirements
- Global palette in `AdminShell` (Cmd/Ctrl+K).
- Results: orders by orderId, products by name/slug, customers by email/phone/name.
- Navigate on select; empty query shows hint.

### Out of scope
- Full-text DB search; fuzzy ranking beyond simple includes.

---

## T-31 — Promo / discount codes

### Requirements
- Admin CRUD: code, type (`percent` | `fixed` | `free_shipping`), value (for percent/fixed), first_order_only, active, starts_at/ends_at optional, usage_count.
- Checkout + cart: apply code field; validate; adjust shipping/total; persist on order.
- Settings free-ship threshold unchanged when no code.

### Out of scope
- BOGO, collection-scoped discounts, automatic discounts without a code.

---

## Acceptance (program)

- [ ] T-27: phone actions on pending; stale shipped listed
- [ ] T-28: customer profile shows orders + inbox
- [ ] T-29: save template, reuse in compose
- [ ] T-30: Cmd+K jumps to order/product/customer
- [ ] T-31: create code, apply at checkout, order stores discount
- [ ] Suite green; migrations pushed for T-29/T-31
