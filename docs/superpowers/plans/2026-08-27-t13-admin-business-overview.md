# Admin business overview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/admin` is a Home snapshot (six tiles + Needs you) using locked Karachi-day counting rules.

**Architecture:** Pure `buildDashboardSnapshot` in `lib/db/dashboard-rules.ts`. Admin page loads existing orders/products/reviews and renders `Dashboard`. Orders/Products lists take optional search params. No new tables.

**Tech Stack:** Next.js 14 App Router, existing admin shell, `tsx --test`, `formatPrice`.

## Global Constraints

- Timezone: Asia/Karachi
- Pending: new + processing
- Demo orders/products excluded from tiles
- Exact copy from UI plan
- No charts, no db push, no deploy, no git commit unless asked
- Live `/` and `/home2` unchanged

---

### Task 1: Dashboard counting rules

**Files:**
- Create: `lib/db/dashboard-rules.ts`
- Test: `lib/db/dashboard-rules.test.ts`
- Modify: `package.json` test script

**Interfaces:**
- Produces: `buildDashboardSnapshot`, `orderMatchesStatusFilter`, `productMatchesStockAttention`, `DashboardSnapshot`

- [ ] Write failing tests, run, implement, add to `npm test`

---

### Task 2: Home UI + nav + login

**Files:**
- Create: `components/admin/dashboard.tsx`
- Modify: `app/admin/page.tsx`, `components/admin/admin-shell.tsx`, `components/messaging/admin-login-form.tsx`

- [ ] Render snapshot; Home first in nav; login → `/admin`

---

### Task 3: List filters

**Files:**
- Modify: `app/admin/orders/page.tsx`, `components/admin/order-list.tsx`, `app/admin/products/page.tsx`, `components/admin/product-list.tsx`

- [ ] `?status=` and `?stock=attention`

---

### Task 4: Verify

- [ ] `npm test`, `npx tsc --noEmit`, curl `/admin`, `/`, `/home2`
