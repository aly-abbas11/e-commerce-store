# T-16 /home2 Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Biometic-inspired `/home2` with admin-managed Ronin-style product hero slides, trust strip, category tiles, bestsellers, and proof — without changing live `/`.

**Architecture:** New `hero_slides` table + pure ranking helpers in `lib/db/*-rules.ts`. Gadget chrome and `/home2` restyled to Biometic tokens. Admin Hero page becomes slide CRUD with publish gates. Live `hero_sections` singleton stays for `/`.

**Tech Stack:** Next.js App Router, Supabase migrations, Cloudinary/existing media field, `tsx --test`, existing gadget + admin patterns.

**Spec:** `docs/superpowers/specs/2026-09-01-t16-home2-redesign-design.md`

## Global Constraints

- Touch **`/home2` + gadget nav/footer + admin hero slides** only; live `/` and `/product/[slug]` stay as-is
- Palette: canvas `#FAFAFA`, surface `#FFFFFF`, line `#EAEAEA`, muted `#666666`, ink `#171717`, quiet volt `#0f766e` on labels only
- Hero: product-linked rich slides; autoplay + pause on hover; desktop split / mobile stack; max 8 published; OOS = visible, no click, “Out of stock”
- Publish gates: ≥1 published hero slide AND ≥1 published testimonial (admin warnings)
- Trust: COD · free shipping threshold · returns/warranty · curated (Track in nav/footer only)
- Category tile: ≥1 in-stock product with image, else hide; hide section if none
- Bestsellers: featured first → most ordered → most viewed; max 8; hide if empty
- Density: airy; no newsletter popup; no use-case / unusual-finds sections
- Inspiration only: Ronin slider structure, Biometic color calm — do not copy assets/copy
- TDD for rules helpers; add new test files to `package.json` `"test"` script
- Do not push schema or deploy unless asked; do not commit unless asked (or follow task commit steps if user said to execute with commits)

## File map

| File | Role |
|------|------|
| `supabase/migrations/YYYYMMDDHHMMSS_hero_slides.sql` | New slides table + RLS |
| `lib/types.ts` | `HeroSlide` type |
| `lib/db/hero-slide-rules.ts` | Publish/validation helpers |
| `lib/db/bestsellers-rules.ts` | Featured → orders → views ranking |
| `lib/db/store.ts` | `fetchHeroSlides`, bestsellers fetch |
| `lib/db/admin-store.ts` + `app/api/admin/hero/**` | Admin CRUD |
| `components/admin/hero-slides-form.tsx` | Admin UI |
| `app/admin/hero/page.tsx` | Wire new form |
| `components/gadget/gadget-hero-slider.tsx` | Storefront slider |
| `components/gadget/gadget-navbar.tsx` / `gadget-footer.tsx` | Chrome |
| `components/gadget/gadget-product-card.tsx` | Card restyle |
| `app/home2/page.tsx` | Section stack |
| `lib/db/*-rules.test.ts` | Unit tests |

---

### Task 1: Hero slide rules (TDD)

**Files:**
- Create: `lib/db/hero-slide-rules.ts`
- Create: `lib/db/hero-slide-rules.test.ts`
- Modify: `package.json` (add test path to `"test"`)

**Interfaces:**
- Produces:
  - `canPublishSlide(slide: { imageUrl?: string | null; productId?: string | null }): { ok: boolean; reason?: string }`
  - `canPublishHome(input: { publishedSlideCount: number; publishedTestimonialCount: number }): { ok: boolean; blockers: string[] }`
  - `resolveSlideCta(stockStatus: string | null | undefined): { label: string; disabled: boolean }`
  - `MAX_HERO_SLIDES = 8`

- [ ] **Step 1: Write failing tests**

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canPublishSlide,
  canPublishHome,
  resolveSlideCta,
  MAX_HERO_SLIDES,
} from "./hero-slide-rules";

describe("hero-slide-rules", () => {
  it("requires image and product to publish a slide", () => {
    assert.equal(canPublishSlide({ imageUrl: "", productId: "p1" }).ok, false);
    assert.equal(canPublishSlide({ imageUrl: "https://x", productId: "" }).ok, false);
    assert.equal(canPublishSlide({ imageUrl: "https://x", productId: "p1" }).ok, true);
  });

  it("blocks home publish without slides or testimonials", () => {
    const r = canPublishHome({ publishedSlideCount: 0, publishedTestimonialCount: 1 });
    assert.equal(r.ok, false);
    assert.match(r.blockers.join(" "), /slide/i);
  });

  it("disables CTA when out of stock", () => {
    assert.deepEqual(resolveSlideCta("out-of-stock"), {
      label: "Out of stock",
      disabled: true,
    });
    assert.deepEqual(resolveSlideCta("in-stock"), {
      label: "Shop now",
      disabled: false,
    });
  });

  it("caps at 8", () => {
    assert.equal(MAX_HERO_SLIDES, 8);
  });
});
```

- [ ] **Step 2: Run** `npx tsx --test lib/db/hero-slide-rules.test.ts` — expect FAIL (module missing)

- [ ] **Step 3: Implement** `lib/db/hero-slide-rules.ts` to satisfy tests

- [ ] **Step 4: Re-run tests** — expect PASS; add file to `package.json` `"test"`

- [ ] **Step 5: Commit** (if user asked for commits during execution)

---

### Task 2: Bestsellers ranking rules (TDD)

**Files:**
- Create: `lib/db/bestsellers-rules.ts`
- Create: `lib/db/bestsellers-rules.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `pickBestsellers(input: { products: Array<{ id: string; featured?: boolean; stockStatus?: string }>; orderCounts: Record<string, number>; viewCounts: Record<string, number>; limit?: number }): string[]` — returns product ids in display order

Rules from spec:
1. Exclude `out-of-stock`
2. Take featured (stable input order) first
3. Fill with highest `orderCounts`, then `viewCounts`, skip duplicates
4. Default limit 8

- [ ] **Step 1: Failing tests** covering featured-first, order fill, view fallback, OOS skip, limit 8, empty → `[]`

- [ ] **Step 2–4:** Implement + pass + wire into `npm test`

---

### Task 3: Migration `hero_slides`

**Files:**
- Create: `supabase/migrations/<timestamp>_hero_slides.sql`

**Schema (exact columns):**

```sql
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null,
  title text,
  subtitle text,
  sort_order integer not null default 0,
  status text not null default 'draft',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hero_slides_status_check check (status in ('draft', 'published'))
);

create index if not exists hero_slides_status_sort_idx
  on public.hero_slides (status, sort_order);

alter table public.hero_slides enable row level security;
-- no anon policies; service role only (match other CMS tables)
```

- [ ] **Step 1: Write migration file**
- [ ] **Step 2: Optional seed note in plan comments** — after push, admin creates ≥1 slide from a featured product (do not auto-break live `hero_sections`)
- [ ] **Step 3: Ask user before `db push`** — do not push silently

---

### Task 4: Types + store fetches

**Files:**
- Modify: `lib/types.ts` — add `HeroSlide`
- Modify: `lib/db/store.ts` — `fetchHeroSlides(includeDemo?)`, `fetchHomeBestsellers(includeDemo?)`
- Modify: `lib/db/map.ts` if mapping helpers live there

**Interfaces:**

```ts
export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  product: Product;
  sortOrder: number;
}
```

- [ ] `fetchHeroSlides`: published only, order by `sort_order`, join product via existing product mapper; respect demo filter; max 8
- [ ] `fetchHomeBestsellers`: load products + order_item aggregates + optional `product_view` counts from analytics; call `pickBestsellers`
- [ ] Keep `fetchHero` for live `/` unchanged

- [ ] Add thin integration-style unit test only if pure mappers are extracted; otherwise rely on Task 1–2 + manual verify

---

### Task 5: Admin slide CRUD

**Files:**
- Modify: `lib/db/admin-store.ts` — list/create/update/reorder/delete/publish slides
- Modify or create: `app/api/admin/hero/route.ts` and/or `app/api/admin/hero/slides/route.ts`
- Create: `components/admin/hero-slides-form.tsx`
- Modify: `app/admin/hero/page.tsx`
- Keep live singleton editor either behind a tab “Live home (legacy)” or separate route — **minimum:** preview slides are primary on this page; do not delete `hero_sections` API used by live `/`

**UI behavior:**
- List slides with image thumb, product name, status, sort controls
- Add slide: media field + product select + title/subtitle overrides
- Save draft / publish slide using `canPublishSlide`
- Top banner from `canPublishHome` when blockers exist
- Cap add button when published+draft count would exceed practical editing (enforce max 8 **published**)

- [ ] Manual check: empty slides → blocker text “Add at least one hero slide”
- [ ] Manual check: zero testimonials → blocker mentions testimonial

---

### Task 6: Gadget hero slider + tokens

**Files:**
- Create: `components/gadget/gadget-hero-slider.tsx`
- Create: `components/gadget/gadget-home-tokens.ts` (CSS variable class names / shared class strings) — optional if classes inlined consistently
- Modify: `components/gadget/gadget-navbar.tsx` — Logo · Shop · Search · Track · Cart
- Modify: `components/gadget/gadget-footer.tsx` — Logo, shop types, Track, warranty/returns, contact
- Modify: `components/gadget/gadget-product-card.tsx` — Biometic card chrome

**Slider behavior:**
- Client component: interval autoplay (~5s), `onMouseEnter` pause, dots + prev/next
- Desktop: grid split; mobile: image then copy (`md:` breakpoints)
- CTA uses `resolveSlideCta(product.stockStatus)`; if disabled, no navigation
- Link href: `/product2/${product.slug}`

- [ ] Verify reduce-motion: if easy, honor `prefers-reduced-motion` by disabling autoplay (nice-to-have; not a spec blocker)

---

### Task 7: `/home2` page assembly

**Files:**
- Modify: `app/home2/page.tsx`

**Section order:**
1. `GadgetHeroSlider` (required data; if zero published slides in DB, show empty state message for preview only — admin gate is the real fix)
2. Trust strip (4 cells; free shipping line from `normalizeSettings`)
3. Shop by type (filter tiles per spec)
4. Bestsellers grid → `/product2/...` via `GadgetProductCard`
5. Proof testimonials (up to 3)

- [ ] Remove old single `GadgetHero` usage from `/home2` (keep file if unused elsewhere or delete if only home2)
- [ ] Airy spacing, Biometic colors — no zinc-950 yellow gadget look

---

### Task 8: Verify

- [ ] `npm test`
- [ ] `npx tsc --noEmit`
- [ ] Manual: `/home2` desktop + narrow viewport
- [ ] Manual: OOS slide behavior
- [ ] Manual: `/` unchanged
- [ ] Manual: `/admin/hero` create + publish slide
- [ ] Update `docs/modules/storefront/STOREFRONT_IMPLEMENTATION.md` briefly when closing T-16 (stage 9) — can be a final doc task after code green

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Hero slides data + admin | 1, 3, 4, 5 |
| Autoplay / split / stack / OOS | 1, 6 |
| Trust / categories / bestsellers / proof | 2, 4, 7 |
| Biometic chrome | 6, 7 |
| Publish gates | 1, 5 |
| Live `/` untouched | 4, 7, 8 |
| Follow-ups T-17/T-18 | Not implemented (tracked only) |

## Approval

- [ ] User approved this implementation plan
- Date / note: …
