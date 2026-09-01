# DRAFT — VoltGear admin platform program

**Status:** Research brief — superseded for approval by the master plan.  
**Master plan (approve this):** `docs/plans/2026-09-01-admin-platform-master-plan.md`  
**Date:** 2026-09-01

This is a **program brief** (research + gaps + proposed task sequence). It is **not** the final think-before-plan master plan. Edge cases and section 14 build steps stay open until the user picks an approach.

---

## 1. Plain summary

You want a Shopify-easy admin for VoltGear: find things fast, control catalog and site content, see contact/complaints, manage orders, and message people (email + SMS). Much of this already exists in pieces. The work is to fill real gaps, group navigation like Shopify, and ship in small T-## slices—not rebuild admin from zero.

---

## 2. Goal (program-level)

Done means: a merchant can run daily store ops from `/admin` with Shopify-class basics **plus** VoltGear extras (COD analytics, WhatsApp broadcast, complaint inbox, demo sandbox), without missing contact messages or fighting a flat product list.

---

## 3. Ask restatement (awaiting “Yes, that’s it”)

How might we give the store owner a Shopify-easy VoltGear admin so they can run the whole store from one place: easy navigate/find; inbox for contact + complaints; full catalog (categories, collections, products/images); site content + social links; single + bulk email/SMS with templates; products listed by category in admin; collection placement on home; order detail + status—and research Shopify parity plus COD-specific extras?

---

## 4. What already exists (codebase evidence)

| Area | Evidence |
|------|----------|
| Admin shell nav | `components/admin/admin-shell.tsx` — Home, Analytics, Orders, Products, Shop types, Pages, Hero, Settings, Testimonials, Reviews, Messaging |
| Orders + status | `/admin/orders`, T-03 Done |
| Products + shop types | `/admin/products`, `/admin/categories`, T-09 Done |
| Pages / hero / settings (social) | Settings form: Instagram, TikTok, Facebook, WhatsApp |
| Reviews / testimonials | Admin pages exist |
| Messaging | `/admin/broadcast` — **phone SMS/WhatsApp**, not marketing email (`/api/messaging/send`) |
| Transactional email | `lib/email.ts` via Resend — order lifecycle (T-04) |
| Contact form | `POST /api/contact` — webhook/log only; **not stored for admin** |
| Collections | Product `featured` flag + bestsellers rules — **no collection CRUD** |
| Home section placement | Tracker lists **T-10** Planned (PR #3 noted); `/admin/home` not on this tree at draft time |
| Admin theme | T-12a Biometic theme started; T-12 deeper UX still open |

---

## 5. Shopify admin research (essentials)

Typical Shopify sidebar groups:

1. **Home** — today’s work / alerts  
2. **Orders** — fulfill, notes, drafts/returns (we have core status flow)  
3. **Products** — catalog, inventory, **Collections**, gift cards  
4. **Customers** — profiles, segments  
5. **Content** — pages, menus, files  
6. **Analytics** — we have COD-aware analytics  
7. **Marketing / Messaging** — email + SMS campaigns, templates, segments  
8. **Discounts** — codes / automatic discounts  
9. **Settings** — store, domains, notifications, staff  

Useful refs:

- [Shopify Help — Navigating the admin](https://help.shopify.com/en/manual/shopify-admin/shopify-admin-overview)  
- [eesel — Shopify admin dashboard guide](https://www.eesel.ai/blog/shopify-admin)  
- [Shopify Messaging — create email campaigns](https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-email/create-email)  
- [Shopify Messaging product](https://www.shopify.com/email-marketing) — templates, bulk, SMS alongside email; batching for large lists; consent/deliverability matter  

**Pitfalls people hit:** buying email lists (bad deliverability); sending huge blasts without batching; no unsubscribe/consent; treating “featured” as full collections; flat nav that doesn’t scale.

**VoltGear extras Shopify is weak on for this shop:** COD-first revenue truth, WhatsApp-first Pakistan messaging, complaint register → admin inbox, demo sandbox, shopper self-cancel on `/track`.

---

## 6. Gap list (must build vs polish)

| Need from ask | Status |
|---------------|--------|
| Easy navigate / minimal UI | Partial (theme); needs IA regroup + findability (T-12) |
| Contact + complaints → admin | **Missing** (persist + inbox UI) |
| Categories / products / images | Mostly done; polish |
| Social / icon URLs | Done in Settings |
| Page content CMS | Done (Pages) |
| Single + bulk **email** + templates | **Missing** (SMS exists; Resend exists for transactional only) |
| Products listed **by category** in admin | **Missing** (flat searchable list) |
| Collections + home placement | **Missing / T-10** |
| Order status + details | Done |
| Customers CRM | Thin / missing dedicated screen |
| Discounts | Not in ask as primary; suggest later |

---

## 7. Suggested extras (for a complete COD store)

Not required by the original ask, but worth sequencing later:

- Discount codes / free-shipping rules  
- Customer profiles (orders + contact history in one place)  
- Nav/menu editor (Shopify Content → Menus)  
- Abandoned-cart style “Needs you” for unpaid COD follow-up (we have dashboard Needs you — extend)  
- Media library for reusable images  
- Staff roles (if more than one admin)  
- Global admin search (`Cmd+K`) like Shopify  

---

## 8. Proposed T-## sequence (NOT registered in `dev-priorities.md` yet)

IDs provisional after T-20:

| ID | Title | Depends | Notes |
|----|-------|---------|-------|
| T-10 | Homepage sections CRUD | T-09 | Already Planned — finish/merge before or with collections placement |
| T-21 | Admin IA / Shopify-style nav groups | T-12a | Groups: Orders · Catalog · Content · Customers/Inbox · Marketing · Analytics · Settings |
| T-22 | Inbox: contact + complaints | — | Persist submissions; type=contact\|complaint; admin list/detail; mark read |
| T-23 | Collections CRUD + home placement | T-10 | Manual + rule-based collections; place on home |
| T-24 | Products admin by category | T-09 | Grouped sections / sticky category filter when shop types grow |
| T-25 | Marketing email (single + bulk + templates) | T-04, messaging | Resend from domain; templates; consent; batching |
| T-26 | Customers light CRM | T-03 | Profiles from orders + messaging contacts |
| T-27+ | Discounts / menus / media (optional) | — | After core |

---

## 9. First-slice options (user must pick)

| Option | Meaning |
|--------|---------|
| **A** | Inbox first (contact + complaints) |
| **B** | Catalog + collections + home placement |
| **C** | Email messaging (single/bulk/templates) |
| **D** | Admin nav/UX overhaul |

**Draft recommendation (not locked):** **B then A then C**, with **D** woven as thin IA improvements each slice (don’t wait for a big redesign). Reason: money/control of what shoppers see first; lost messages next; marketing email after inbox exists so replies have a home.

---

## 10. Program delivery options (user must pick)

### Option 1 — Gap-first vertical slices (recommended)
Ship one capability end-to-end per T-## (inbox OR collections OR email). Reuse Biometic admin chrome.  
**Pros:** Working value every PR; matches incremental-implementation.  
**Cons:** Nav still a bit messy until T-21 finishes.  
**Effort:** Large program, small per task.

### Option 2 — Big-bang admin rebuild
New shell, all features in one mega-branch.  
**Pros:** Clean IA day one.  
**Cons:** Long dark period; high merge risk.  
**Effort:** Very large.

### Option 3 — Shopify clone surface only
Match Shopify labels/nav first; fill features later.  
**Pros:** Feels familiar fast.  
**Cons:** Empty menu items frustrate; fake parity.  
**Effort:** Medium then still large for features.

**Draft recommendation:** Option 1.

---

## 11. Open questions (block master plan)

- [ ] User confirms restatement  
- [ ] First slice A/B/C/D (or ordered mix)  
- [ ] Program option 1 / 2 / 3  
- [ ] Are “complaints” a separate form/type or a subject on contact?  
- [ ] Email: marketing only, or also free-form “type one address and send”?  
- [ ] SMS vs email templates: shared UI or separate tabs?  
- [ ] Collections: manual product picks only, or also auto rules (bestsellers)?  
- [ ] Who may access admin (single owner vs staff roles)?  

---

## 12. Approval

- [ ] User approved this **program** brief  
- [ ] User approved a later **feature master plan** for the first T-##  
- Date / note: …

---

## 13. Next agent step after user replies

1. Lock first slice + program option.  
2. Full contact-point map + edge cases for that slice only.  
3. Write `docs/plans/YYYY-MM-DD-tNN-<name>-plan.md` (full 18 sections).  
4. Wait for **approved**.  
5. Feature-lifecycle intake → register T-## in `docs/dev-priorities.md` → implement in small steps.  
6. UI-design-explore only after product plan approval for UI-heavy slices.

---

## 14. Contact points (provisional — all major gaps)

### A) Inbox (contact + complaints)

| Path | Why | Likely change |
|------|-----|---------------|
| `app/api/contact/route.ts` | POST today: optional webhook + `console.info`; no DB | write — persist row |
| `components/gadget/gadget-contact-form.tsx` | Live `/contact` form fields | maybe — add type/kind if complaints differ |
| `components/sections/contact-form.tsx` | Alternate contact form | maybe — same API |
| `app/contact/page.tsx` | Contact page | maybe — complaint entry UX |
| Footer “Register a Complaint” → `/contact` | Same page as contact today | decide: same form + `kind=complaint` vs separate |
| New: `supabase/migrations/*_inbox.sql` | No `contact_submissions` table exists | write |
| New: `/admin/inbox` (+ API list/detail/patch) | No admin surface | write |
| `components/admin/admin-shell.tsx` | Nav | write — add Inbox |
| Optional: notify `ORDER_NOTIFY_EMAIL` / Resend on new message | Operator alert | maybe |

### B) Collections + home placement

| Path | Why | Likely change |
|------|-----|---------------|
| `products.featured` | Only “collection-like” flag today | read / keep |
| `lib/db/bestsellers-rules.ts` | Auto bestsellers heuristic | read / maybe power auto collections |
| New: `collections` + `collection_products` tables | No collection entity | write |
| New: `/admin/collections` | CRUD + product picks | write |
| T-10 / `site_settings.home_sections` (if merged) | Home order of sections | both — place collection blocks |
| Storefront home sections | Render collection rails | both |
| `app/api/store/products` | Featured query | maybe |

### C) Products by category (admin)

| Path | Why | Likely change |
|------|-----|---------------|
| `components/admin/product-list.tsx` | Flat search list | write — group by `category` / shop type |
| `lib/db/admin-store.ts` product list | Fetch order | maybe — sort by category |
| `shop_types` migration / categories admin | Source of section headings | read |

### D) Marketing email (single + bulk + templates)

| Path | Why | Likely change |
|------|-----|---------------|
| `lib/email.ts` | Resend deliver() — transactional | extend — generic send + templates |
| `FROM_EMAIL` / `RESEND_API_KEY` | Domain mail already wired | read |
| `/admin/broadcast` + `lib/messaging.ts` | SMS campaigns UI pattern to mirror | read / maybe share contacts |
| New: email templates store + send API | Missing | write |
| Newsletter `app/api/newsletter/route.ts` | Logs only today | maybe — feed subscriber list |
| Consent / unsubscribe | Shopify pitfall | write — required for bulk |

### E) Admin IA / Shopify-like nav

| Path | Why | Likely change |
|------|-----|---------------|
| `components/admin/admin-shell.tsx` | Flat 11-item nav | write — grouped sections |
| T-12 / T-12a theme | Biometic chrome | keep / polish |
| Optional global search | Shopify Cmd+K | later |

### F) Orders / settings / pages (mostly keep)

| Path | Why | Likely change |
|------|-----|---------------|
| `/admin/orders*` | Status + detail Done | polish only |
| `/admin/settings` social URLs | Done | keep |
| `/admin/pages*` | CMS pages Done | keep |
| `/admin/reviews*` | Product reviews ≠ contact inbox | keep separate |

---

## 15. Provisional API contracts (design only — not implemented)

Contract-first sketches for when the first slice locks. Errors follow existing admin style: `{ error: string }` + HTTP status until we standardize a richer shape.

### Inbox

```
POST   /api/contact
  body: { name, email, subject?, message, kind?: "contact" | "complaint" }
  → 201 { ok: true, id }

GET    /api/admin/inbox?kind=&status=&page=&pageSize=
  auth: admin
  → { data: InboxItem[], pagination }

GET    /api/admin/inbox/:id
  → InboxItem

PATCH  /api/admin/inbox/:id
  body: { status?: "new" | "read" | "closed", adminNote?: string }
  → InboxItem
```

`InboxItem`: id, kind, name, email, subject, message, status, createdAt, adminNote?

### Collections (later slice)

```
GET/POST     /api/admin/collections
GET/PATCH/DELETE /api/admin/collections/:id
PUT          /api/admin/collections/:id/products   { productIds: string[] }
```

### Marketing email (later slice)

```
GET/POST  /api/admin/email/templates
POST      /api/admin/email/send
  body: {
    mode: "single" | "bulk",
    to?: string,                 // single
    recipientIds?: string[],     // bulk from contacts/customers
    templateId?: string,
    subject: string,
    html?: string,
    text: string
  }
```

Reuse Resend via `lib/email.ts`. Bulk must batch (Shopify lesson: large lists need batching for deliverability).

---

## 16. Evidence notes (2026-09-01)

- “Register a Complaint” in footer links to **`/contact`** — same form as contact; no separate complaint API yet.  
- Product reviews (`review_submissions`) are **not** the customer contact inbox.  
- No `collections` table in current migrations.  
- Products already indexed by `category` (`products_category_idx`) — admin grouping is UI/query work, not a schema invention.  
- Email provider path exists (Resend); marketing send/templates do not.  
- SMS broadcast already models campaigns + recipients — good pattern to copy for email UI.

---

## 17. Edge case log (all TBD until user answers)

```
EDGE CASES:
- [ ] Complaint vs contact — decision: TBD (same form + kind vs separate page)
- [ ] Spam / flood on public contact POST — decision: TBD (rate limit / honeypot)
- [ ] Empty inbox — decision: TBD (empty state copy)
- [ ] Collection delete with products on home — decision: TBD
- [ ] Bulk email with no consent — decision: TBD (block vs allow transactional-only)
- [ ] Invalid / bounce addresses — decision: TBD
- [ ] Admin concurrent status edits on inbox — decision: TBD (last write wins OK?)
- [ ] Demo sandbox: should demo contact posts be is_demo? — decision: TBD
```

---

## 18. Shopify parity checklist (program scope)

Legend: ✅ have · 🟡 partial · ❌ gap · ➖ skip for now (COD / out of scope)

| Shopify-like capability | VoltGear | Verdict | Notes |
|-------------------------|----------|---------|-------|
| Home / today’s work | Dashboard T-13 | 🟡 | Exists; can add inbox unread + low stock (already) |
| Orders list + detail + status | T-03 | ✅ | Keep |
| Draft orders / returns portal | — | ➖ | Later if needed |
| Products CRUD + images | T-02/T-09 | ✅ | |
| Inventory / multi-location | stock_status | 🟡 | Simple statuses, not warehouses |
| **Collections** (manual + smart) | featured flag only | ❌ | MVP: manual picks + optional rule (featured/bestsellers). Don’t clone Shopify’s new multi-source model yet ([collection types](https://help.shopify.com/en/manual/products/collections/collection-types)) |
| Customers CRM | messaging contacts | 🟡→❌ | Need list + order history |
| Content pages | `/admin/pages` | ✅ | |
| Menus / navigation editor | hard-coded nav | ❌ | Suggest after collections |
| Theme editor | code/theme | ➖ | Not Shopify Online Store editor |
| Analytics | T-14/T-15 | ✅ | COD-aware advantage |
| Marketing email + templates | Resend transactional only | ❌ | T-25 |
| SMS marketing | `/admin/broadcast` | ✅ | Advantage |
| Inbox / customer messages | contact log only | ❌ | T-22 |
| Discounts | — | ➖ | Suggest T-27+ |
| Gift cards | — | ➖ | |
| Apps marketplace | — | ➖ | |
| Settings / social | `/admin/settings` | ✅ | |
| Staff permissions | single admin token | 🟡 | Fine for solo owner |
| Global search Cmd+K | — | ➖ | Nice-to-have with T-21 |
| **VoltGear extras** | COD analytics, demo, self-cancel, WhatsApp | ✅ | Keep; Shopify-weak areas |

**Dependency reality (repo evidence 2026-09-01):**

- **PR #3** `feature/t10-homepage-sections` is **OPEN** — home section show/hide + reorder. Collection *placement* should land **after or with** T-10 merge.  
- T-12a theme closed as superseded; Biometic admin theme merged via T-15 PR #5.  
- Tracker still says next: T-10 → rest of T-12.

---

## 19. Screens & workflow impact (provisional)

| Screen / flow | Today | After program | Risk |
|---------------|-------|---------------|------|
| Shopper `/contact` | Form → webhook/log; may be lost | Form → DB + admin Inbox | Must not break send success UX |
| Footer “complaint” | Same `/contact` | Same or typed complaint | Confusing if still unlabeled |
| Admin nav | Flat 11 links | Grouped Shopify-style | Muscle memory change |
| Admin Products | Flat list | Grouped by shop type | Empty category sections |
| Admin Collections (new) | n/a | Create bestsellers etc. | Overlap with `featured` |
| Admin Home layout | T-10 pending | Place collection rails | Depends on PR #3 |
| Admin Messaging | SMS only | SMS + Email tabs | Two channels, one mental model |
| Admin Orders | Works | Unchanged core | Don’t regress status email |
| Settings social | Works | Unchanged | — |

Manual processes outside code to confirm with owner: WhatsApp-only support today? Email list in Excel? How complaints are handled now (ignored / WhatsApp)?

---

## 20. Idea variations (idea-refine — not decisions)

How might we run a Shopify-easy admin without cloning Shopify’s whole platform?

1. **Simplification:** Inbox + category-grouped products + finish T-10 only — skip marketing email v1.  
2. **Inversion:** Don’t build email; deepen WhatsApp broadcast (Pakistan-first) and only notify admin of contact via WhatsApp.  
3. **10x:** Full Sidekick-like admin search + automations (abandoned COD follow-up). Too big for v1.  
4. **Combination:** Collections = shop types + featured rails; “collection” is just a home block pointing at a filter.  
5. **Audience shift:** Admin UX for a hired VA (labels + permissions) vs sole founder.  
6. **Expert lens:** COD stores win on **order triage + inbox + stock**, not theme toys.  
7. **Constraint removal:** If Resend + domain already work, email single-send is a thin layer on `deliver()`.  

Useful pressure: **email bulk without consent is worse than no email.** SMS already has a contact list pattern.
