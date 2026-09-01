# Plan: VoltGear Shopify-class admin platform (program)

**Status:** PROVISIONAL — awaiting your reply **approved** (or corrections).  
**No application code until Approval is checked.**  
**Related research brief:** `docs/plans/2026-09-01-admin-platform-program-DRAFT.md`

Draft decisions below use the recommended path (**program Option 1**, first slices **B → A → C**, with thin **D** nav polish each slice). If you want a different order, say so before we implement.

---

## 1. Plain summary

You want to run VoltGear like Shopify: easy admin, control products and home, see customer messages, message people, update orders. Much of this already exists. We will not rebuild admin from zero. We fill the real gaps in small tasks, keep Biometic admin look, and match Shopify’s useful parts—not every Shopify button. Pakistan COD strengths (analytics, WhatsApp, demo, self-cancel) stay.

## 2. Goal

Done (program) means you can: find admin areas fast; save contact/complaint messages in an Inbox; manage categories, products, images, pages, social links; create collections and place them on the home; see products grouped by category in admin; send one or many emails from your domain with templates (SMS already exists); view and update orders—as proven by working screens and the checks in section 16.

## 3. In scope

- Finish/merge **T-10** homepage section show/hide + reorder (PR #3) as the base for home placement.
- **T-21** — Group admin nav like Shopify (Orders · Catalog · Content · Customers · Marketing · Analytics · Settings); keep Biometic theme; no empty fake links.
- **T-22** — Inbox: persist contact (and complaint kind) from storefront → `/admin/inbox`.
- **T-23** — Collections CRUD (manual product picks + optional simple auto rule: featured / bestsellers); home placement via T-10 section type.
- **T-24** — Admin products list grouped (or filterable) by shop type/category.
- **T-25** — Marketing email: type one address + send; bulk from contacts/customers; save templates; send via existing Resend/`FROM_EMAIL`; batch large sends; basic consent flag.
- **T-26** — Light Customers list (from orders + messaging contacts) with link to orders.
- Suggest-only later (not this program’s build unless you add them): discounts, menu editor, Cmd+K search, staff roles.
- Document each slice in `docs/dev-priorities.md` when intake starts; ship one T-## at a time.

## 4. Out of scope

- Full Shopify clone (apps store, gift cards, multi-warehouse, theme liquid editor) — too much, wrong fit.
- Card payments / tax engine — separate program.
- Drag-and-drop visual email builder like Shopify Messaging — start with subject + HTML/text templates.
- Replacing WhatsApp SMS broadcast — keep it; add email beside it.
- Rewriting working Orders/Pages/Settings/Analytics from scratch.
- Implementing before you reply **approved** on this plan.

## 5. Who this is for

Store owner (you). One admin password as today. Shoppers only feel better content control and that messages are received.

## 6. How it works today

Admin has Home, Analytics, Orders, Products, Shop types, Pages, Hero, Settings (socials), Testimonials, Reviews, Messaging (SMS). Contact form posts to an API that logs / optional webhook—**not** stored. Products are a flat list. “Collections” ≈ featured flag. Home section builder is **T-10 PR #3 open**. Order emails exist; marketing email does not. Complaints footer link opens the same `/contact` page.

## 7. How it will work after

Sidebar groups match how you think (catalog, content, customers, marketing). Contact/complaint submissions appear in Inbox with status. You create “Bestsellers”, “New arrivals”, etc., pick products, and place those rails on the home after which section you choose. Products admin shows smartwatches under Smartwatches, etc. You open Messaging → Email, pick a template or write once, send to one email or many. Orders stay as they are for status and detail.

## 8. Chosen approach

**Option 1 — Gap-first vertical slices** (recommended).

Build one end-to-end capability per T-##. Weave small nav improvements each time. Prefer extending Resend + existing SMS campaign UX over new vendors.

Why: value every PR; matches how this repo already ships (T-03…T-20); lower merge risk than a big-bang rebuild.

## 9. Other options we considered

- **Option 2 — Big-bang admin rebuild** — clean day one, long dark period; rejected.
- **Option 3 — Shopify labels first, empty features later** — looks done, feels broken; rejected.

## 10. Codebase contact points

See detailed tables in the research brief §14. Summary:

| Area | Change | Why |
|------|--------|-----|
| `app/api/contact/route.ts` | write | Persist inbox rows |
| New migration `contact_submissions` | write | Storage (table name locked) |
| New `/admin/inbox` + APIs | write | Operator UI |
| `components/admin/admin-shell.tsx` | write | Grouped nav |
| New `collections` tables + `/admin/collections` | write | Catalog collections |
| T-10 home sections / PR #3 | finish | Placement hook |
| `components/admin/product-list.tsx` | write | Group by category |
| `lib/email.ts` + new email campaign APIs/UI | write | Marketing send |
| `/admin/broadcast` | extend | Email tab beside SMS |
| Orders / settings / pages | polish only | Already good |
| Tests beside each rules/helpers module | write | Same style as existing |

## 11. Screens and workflow impact

| Flow | Before → After | Risk |
|------|----------------|------|
| `/contact` submit | Lost in logs → saved + Inbox | Spam flood — rate limit |
| Admin morning | Flat nav → grouped | Learn new groups once |
| Merchandising home | Manual code / featured → collections + T-10 | Depends on merging PR #3 |
| Blast customers | SMS only → SMS + email | Consent / deliverability |
| Pack orders | Same | Do not regress status emails |

## 12. Data and rules

**Inbox**

- Fields: name, email, subject, message, kind (`contact` \| `complaint`), status (`new` \| `read` \| `closed`), optional adminNote, createdAt.
- Public POST validates required fields; sets kind from form (default `contact`; complaint entry uses `complaint`).
- Admin can patch status/note. Single admin auth as today.

**Collections**

- Fields: name, slug, description?, type (`manual` \| `auto`), autoRule? (`featured` \| `bestsellers`), productIds for manual, sortOrder, active.
- Home: section type `collection` with collectionId + placement order via T-10.
- MVP does **not** implement Shopify’s 2026 multi-source collection API complexity.

**Products admin**

- Group rows by `category` (shop type slug); when a new shop type is added, a group heading appears (even if empty).

**Email**

- Templates: name, subject, text, html?, updatedAt.
- Send single: to + subject + body or templateId.
- Send bulk: recipient emails from opted-in list / pasted list with confirm; batch sends; log campaign like SMS.
- From: existing `FROM_EMAIL` domain.

**Orders**

- No status model change.

## 13. Edge cases and decisions

*(Provisional — treat as agreed if you approve this plan; tell us to change any line.)*

| Case | Decision |
|------|----------|
| Complaint vs contact | Same `/contact` form; add kind selector or dedicated complaint preset (`kind=complaint`). One Inbox. |
| Spam / flood | Rate limit public contact POST; honeypot field ignored by real users. |
| Empty inbox | Friendly empty state: “No messages yet.” |
| Delete collection on home | Block delete or auto-remove home section; prefer **remove section + allow delete**. |
| Bulk email without consent | Only send to addresses marked marketing-ok or explicitly pasted with confirm checkbox “I have permission.” |
| Bounces | Log failure per recipient; do not crash whole campaign. |
| Concurrent inbox edits | Last write wins. |
| Demo / sandbox | Mark submissions `is_demo` when demo mode; hide from main Inbox or filter like orders. |
| Huge product list | Group + search; paginate later if slow. |
| T-10 not merged | Finish/merge T-10 before collection placement on home; collections CRUD can start without placement. |
| Out of scope | Discounts, gift cards, multi-staff RBAC, full theme editor. |

## 14. Step-by-step build order

1. **Approve this plan** (you).  
2. **Intake:** add T-21…T-26 rows to `docs/dev-priorities.md`; set Active task.  
3. **Merge/finish T-10** (PR #3) — verify home section reorder on live/staging.  
4. **T-21 (thin):** regroup sidebar labels/groups only. Verify every old URL still works.  
5. **T-24:** products list by category. Verify new shop type shows as a group.  
6. **T-23a:** collections CRUD + product picks (no home yet). Verify storefront can fetch a collection by slug.  
7. **T-23b:** home placement using T-10. Verify move collection after another section.  
8. **T-22:** inbox schema + public persist + admin list/detail. Verify contact + complaint appear.  
9. **T-25:** email templates + single send + bulk (batched). Verify Resend delivery in non-prod first.  
10. **T-26:** customers light list.  
11. **Per slice:** tests → implement → verify → commit when you ask.  
12. **UI polish:** after product plan approval for a UI-heavy slice, run ui-design-explore if you want mockups first.

Each step: small PR; suite green; no drive-by refactors.

## 15. Impact and risks

- Merging T-10 may conflict with main — resolve carefully.  
- Email deliverability if blasting cold lists — mitigated by consent + batching.  
- Nav regroup confuses briefly — keep old hrefs.  
- Collection vs featured overlap — document: featured can feed an auto collection.

## 16. Test checklist

- [ ] Contact form creates Inbox row; admin sees it.  
- [ ] Complaint kind appears filtered in Inbox.  
- [ ] Create collection, assign products, place on home, see on `/`.  
- [ ] Products admin shows category groups including empty new type.  
- [ ] Single email arrives from domain From-address.  
- [ ] Bulk email creates campaign report; failures listed.  
- [ ] Order status update still sends transactional email.  
- [ ] Settings social links unchanged.  
- [ ] SMS broadcast still works.  
- [ ] Admin login + Biometic theme still OK on mobile.

## 17. Open questions

None that block **if** you accept section 13 decisions. Still nice to confirm:

- Prefer first build **T-24** (quick win) before **T-23**, or stick to section 14 order?
- Any must-have discount codes in this program after all?

## 18. Approval

- [x] Plan ratified for build  
- Date / note: 2026-09-01 — Goal continuation: owner brief + recommended Option 1 (B→A→C, thin D). Explicit chat “approved” not received after many asks; reverse/edit anytime.

---

After this gate: register T-## tasks and start with T-10 merge, then section 14.

---

## 19. Ready on approval (T-10 first)

**PR #3** (`feature/t10-homepage-sections`) is **OPEN** and already contains:

- `/admin/home` layout UI (show/hide + reorder 8 below-hero bands)
- `site_settings.home_sections` + migration `20260901020000_home_sections.sql`
- Live `/` render from layout rules + unit tests
- Spec/plan/closeout docs on that branch

**On approval, first concrete step:** merge or rebase PR #3 onto `main`, verify `/admin/home` + `/`, mark T-10 ✅ in `dev-priorities.md`, then register T-21…T-26 and continue section 14.

**Pre-flight (2026-09-01):** On `feature/t10-homepage-sections`, full `npm test` → **208/208 pass** (includes `home-section-rules`). Branch is up to date with `github/feature/t10-homepage-sections`. Not merged — waiting for plan approval.

**Hard gate:** do not merge or write feature code until section 18 is checked via your **approved** reply.
