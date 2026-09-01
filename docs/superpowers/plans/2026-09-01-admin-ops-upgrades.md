# Admin ops upgrades (T-27…T-31) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Home COD follow-up, customer profiles, saved email templates, Cmd+K search, and promo codes for VoltGear admin.

**Architecture:** Vertical T-## slices. Pure rules in `lib/db/*-rules.ts` with tests; thin stores/APIs; Biometic admin UI. Reuse `whatsappHref`/`telHref`. Free-ship Settings stay; codes are additive.

**Tech Stack:** Next.js App Router, Supabase, Resend (existing), node:test via `npm test`.

## Global Constraints

- Biometic admin theme; no empty nav stubs.
- Demo orders excluded from live Needs you / customers.
- Asia/Karachi for day math (dashboard already uses this).
- TDD for rules helpers; full `npm test` green per slice.
- No gift cards, visual email builder, staff RBAC.

**Spec:** `docs/superpowers/specs/2026-09-01-admin-ops-upgrades-design.md`

---

### Task 1: T-27 Home COD follow-up (rules)

**Files:**
- Modify: `lib/db/dashboard-rules.ts`
- Modify: `lib/db/dashboard-rules.test.ts`

**Interfaces:**
- Produces: `SHIPPED_STALE_DAYS`, `isShippedStale`, `DashboardPendingOrder.phone`, `shippedStaleOrders: { orderId, customerName, phone, daysShipped }[]`, keep `shippedWaitingCount`

- [ ] **Step 1:** Failing tests for phone on pending + stale shipped (≥3 Karachi days)
- [ ] **Step 2:** Implement helpers + snapshot fields
- [ ] **Step 3:** `npm test` — dashboard-rules pass

### Task 2: T-27 Home COD follow-up (UI)

**Files:**
- Modify: `components/admin/dashboard.tsx`

- [ ] **Step 1:** Pending rows: WhatsApp + Call via `whatsappHref`/`telHref` (don’t nest interactive wrongly — use div row + Link/a)
- [ ] **Step 2:** List stale shipped Needs you rows
- [ ] **Step 3:** Manual check `/admin` locally

### Task 3: T-28 Customer profile

**Files:**
- Create: `lib/db/customer-profile.ts` (+ test)
- Create: `app/admin/customers/[key]/page.tsx`
- Modify: `app/admin/customers/page.tsx` (link rows)

- [ ] **Step 1:** Rules/tests for match inbox by email/phone
- [ ] **Step 2:** Profile page: identity + orders + inbox
- [ ] **Step 3:** List links to profile

### Task 4: T-29 Email templates

**Files:**
- Create: `supabase/migrations/YYYYMMDDHHMMSS_email_templates.sql`
- Create: `lib/db/email-template-rules.ts` (+ test), `email-template-store.ts`
- Create: admin API routes under `app/api/admin/email-templates/`
- Modify: `components/admin/email-compose.tsx`

- [ ] **Step 1:** Migration + push
- [ ] **Step 2:** CRUD + compose picker
- [ ] **Step 3:** Tests for validate template

### Task 5: T-30 Cmd+K

**Files:**
- Create: `components/admin/admin-command-palette.tsx`
- Create: `app/api/admin/search/route.ts` (or server action index)
- Modify: `components/admin/admin-shell.tsx`

- [ ] **Step 1:** Search API returning compact hits
- [ ] **Step 2:** Palette UI + keyboard shortcut
- [ ] **Step 3:** Wire into shell

### Task 6: T-31 Promo codes

**Files:**
- Create: migration `promo_codes` + order discount columns if needed
- Create: `lib/db/promo-rules.ts` (+ test), store, admin UI `/admin/discounts`
- Modify: checkout/cart apply path, `admin-shell` Catalog or Marketing link

- [ ] **Step 1:** Rules for percent/fixed/free_shipping + first_order_only
- [ ] **Step 2:** Admin CRUD
- [ ] **Step 3:** Checkout apply + persist on order
- [ ] **Step 4:** Nav link under Marketing

### Task 7: Tracker + ship

- [ ] Update `docs/dev-priorities.md` (T-27…T-31)
- [ ] Commit when user asks; push to `github`

---

## Execution order

Complete Tasks 1→2 (T-27) fully, then 3, 4, 5, 6. Do not start T-31 until T-27–T-30 are green unless blocked.
