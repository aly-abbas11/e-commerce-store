# STEP 4 — Product Detail Page Conversion & Trust Depth

## 1. Git Before
- Branch: `main` (single initial commit, never committed during this step).
- 46 pre-existing status lines (32 modified + 14 untracked from Steps 1–3). Nothing staged or committed.

## 2. PDP Architecture Before
- Server component `app/product/[slug]/page.tsx`: two-column grid — `ProductGallery` (static thumbnails, no lightbox, no swipe) + right panel with H1, price, stock badge, `AddToCart`, `BackInStockNotification`, shipping/warranty microcopy — plus `ProductTabs` (Description/Specifications/Reviews), `FrequentlyBoughtTogether` (claimed "Bundle and save" with invented discounts), `RelatedProducts`, `StickyAddToCart`, JSON-LD.
- FBT was category/cross-category pairing with no purchase history; BackInStockNotification POSTed to `/api/newsletter` which only console.logs (no subscription storage) — a fake system.
- All 16 products have features + specifications; ALL reviews are `isDemo:true` (reviewCount 0, rating null); no product has compatibility / inTheBox / video / variants / faq / sku / brand.

## 3. Final PDP Section Order
Breadcrumb → PurchaseSection (gallery + purchase panel) → Key Features → Compatibility ("Works With") → What's in the Box → Technical Specifications → Product Description → See It in Action → Customer Reviews → Product FAQ → Complete Your Setup (FBT) → You May Also Like → Sticky Add-to-Cart. Sections that have no data return null and are omitted — the live catalog renders: breadcrumb, purchase, Key Features, Specifications, Description, Reviews, Related, Sticky.

## 4. Above the Fold
- Mobile-first: gallery on top (priority main image, "Save X%" genuine-discount badge, tap-to-enlarge), then H1 + brand eyebrow + SKU, price + strike-through + discount badge, stock badge, variant Options, quantity, Add to Cart, Buy Now, COD reassurance — all visible without scrolling at 390×844.
- Breadcrumb (Home / Category / Product) with `aria-current="page"` above the panel.

## 5. Media
- Gallery rewritten: lightbox (prev/next, counter "n / N", Escape + close button), 40px-threshold touch swipe for mobile, 5-column thumbnails, variant image prepended when a variant is selected, `priority` on the primary image, zoom-affordance icon. Verified by Playwright (tap opens lightbox, swipe changes active image, Escape closes).

## 6. Price/Discount
- Price renders from `formatPrice` (Rs PKR). Compare-at price shows as a strikethrough with a "Save X%" badge computed ONLY from genuine `compareAtPrice` values (never invented). Server truth unchanged: JSON-LD `offers.price` always equals the product price.

## 7. Stock
- Single source of truth `lib/stock.ts`: `in-stock` → purchasable; `low-stock` → "Low Stock" warning, purchasable (no quantities invented); `out-of-stock` → "Sold Out", all purchase controls disabled, never "Pre-Order". Adopted by PurchaseSection, Sticky CTA, ProductCard, QuickView, and the homepage hero featured card (label-only change; card design untouched).

## 8. Variants
- Additive schema + query fields. `variants[]` (name, sku, price, compareAtPrice, stockStatus, image, isDefault). PurchaseSection defaults to the `isDefault` variant; per-variant price/strike/discount/stock; sold-out variant buttons are disabled with dashed line-through styling and `aria-label="<name> (sold out)"`; `aria-pressed` tracks selection.

## 9. Quantity
- Stepper (Minus/Plus, min 1, max 99) wired to Add to Cart and Buy Now; aria labels on the stepper buttons; persisted into the cart line item quantity.

## 10. Add to Cart
- Adds selected product/variant with chosen quantity via the cart provider; in-page flying-to-cart effect + `trackAddToCart` analytics (unchanged event contract); button shows a transient "Added" check state. Disabled with "Sold Out" label when the selected variant/product is out of stock.

## 11. Buy Now
- New `BuyNow` component (Option A, documented): adds the selected product/variant + quantity to the current cart, PRESERVING any existing cart contents, then `router.push("/checkout")`. Guarded by a `buying` state to prevent double-adds; hidden entirely for sold-out products (panel and sticky). Verified by Playwright: lands on /checkout, item present, and a pre-seeded cart is not wiped.

## 12. COD/Shipping/Trust
- COD reassurance ("Cash on Delivery available — pay when your order arrives") shown when `codEnabled`; hidden when the product is sold out (no order can be placed).
- Trust grid: Free shipping over threshold (threshold-gated), warranty duration only when `warrantyMonths` set (formatted "N-year" when divisible by 12), returns window only when `returnWindowDays` set, standard shipping fee when > 0, WhatsApp compatibility help (`wa.me`) only when `whatsappNumber` set. Live settings: COD + shipping + free-shipping shown; warranty/returns/WhatsApp hidden (all null). Header/footer trust strip is untouched.

## 13. Key Features
- New `KeyFeaturesSection`: bulleted feature list from `features[]` with a Check icon; renders only when features exist (all 16 live products render it).

## 14. Compatibility
- New `CompatibilitySection` ("Works With"): chip list from `compatibility[]`; hidden when absent (all live products hidden — no invented pairings).

## 15. In-the-Box
- New `InTheBoxSection` ("What's in the Box"): list from `inTheBox[]`; hidden when absent (all live products hidden — no invented accessories).

## 16. Specifications
- New `SpecificationsSection`: 2-column responsive rows with zebra striping from `specifications[]`; renders only when specs exist (all 16 live products render it).

## 17. Video
- New `ProductVideoSection` ("See It in Action"): `<video controls preload="none" playsInline>` with Cloudinary video URL or a trusted https URL + optional poster; hidden when no genuine source exists (all live products hidden).

## 18. Reviews
- ReviewsSection shows ONLY genuine reviews (`!r.isDemo` defense-in-depth on top of the GROQ `reviews[isDemo != true]` filter); distribution breakdown + "Based on N reviews"; verified-purchase badge; clean "No reviews yet" state; ReviewForm preserved (submit → `/api/reviews` → moderation via `reviewSubmission`, email-triggered reminder, photo upload). Live data shows the no-reviews state (all seeded reviews are demo).

## 19. FAQ
- New `ProductFaqSection` reusing the existing FAQAccordion, from `productFaq[]`; renders only when real Q&A exists (live products hidden).

## 20. FBT/Related
- FBT renamed "Complete Your Setup" with truthful copy: category + compatible cross-category suggestions, in-stock only, checkboxes, combined price (NO invented bundle savings), "Add All to Cart". RelatedProducts now sorts same-category suggestions in-stock first (cap 8), keeping the existing carousel.

## 21. Sticky CTA
- StickyAddToCart rewritten: product image + name + price + Add to Cart + Buy Now, appears mid-scroll via IntersectionObserver, hidden entirely for sold-out products, z-40 (below the cart drawer), mobile-first bar with backdrop blur.

## 22. Sanity Changes
- `sanity/schemas/product.ts` ADDITIVE: `brand` (string), `sku` (string), `compatibility[]` (string), `inTheBox[]` (string), `productVideo{url, cloudinaryPublicId, poster}` (object), `variants[]` (object list: name/sku/price/compareAtPrice/stockStatus/image/isDefault), `productFaq[]` (question/answer). No destructive migrations; sections auto-hide until merchant data exists.
- `lib/types.ts` + `lib/sanity/queries.ts` extended to match. `lib/stock.ts` new.

## 23. Content Truth Scan
- Programmatic scan of all 16 products (name, shortDescription, features, specifications, description) for best-seller/limited-stock/#1/warranty/returns/official/fastest/guaranteed/free-gift patterns: **0 matches**. PDP shows no aggregate rating, no demo review names, no fake warranty/return/WhatsApp claims. BackInStockNotification is no longer rendered (no real backend exists); the unused file remains but is unreachable.

## 24. JSON-LD
- Single Product schema per PDP: name, description, image array, sku, brand (only when set), category, Offer (PKR, product price, availability mapping in-stock/low-stock/out-of-stock → InStock/LimitedAvailability/OutOfStock, priceValidUntil, NewCondition). `aggregateRating` and `review` blocks render ONLY from genuine reviews — with none on the live catalog, neither appears (verified).

## 25. Accessibility
- One H1 per page; section headings via `SectionHeading`; `aria-labelledby` on sections; variant buttons `aria-pressed` + sold-out aria-labels; lightbox has sr-only title, close button, Escape; quantity steppers labelled; breadcrumb `aria-current="page"`; all clickable gallery/CTA surfaces keyboard-accessible; color-agnostic Sold Out state (label + border dash).

## 26. Performance
- New dependencies: **0**; no new packages. Sticky CTA lazy-loaded (`next/dynamic`, ssr:false). Primary gallery image `priority`; secondary images `loading="lazy"`; video `preload="none"`. Server-rendered sections only query the single product document; FBT fetches suggestions client-side and renders nothing when empty. PDP route payload 9.74 kB (pre-render) / 207 kB.

## 27. Files Changed
- Modified: `app/product/[slug]/page.tsx`, `components/product/frequently-bought-together.tsx`, `product-card.tsx`, `product-gallery.tsx`, `quick-view.tsx`, `sticky-add-to-cart.tsx`, `lib/sanity/queries.ts`, `lib/types.ts`, `sanity/schemas/product.ts`, `scripts/frontend-ssr.mjs`, `scripts/frontend-ui.mjs`.
- New: `lib/stock.ts`, `components/product/buy-now.tsx`, `purchase-section.tsx`, `product-info-sections.tsx`.
- STEP 4 product-page diff: 12 tracked files, +906 / −256 lines. (Pre-existing Step 1–3 changes remain untouched.)

## 28. Typecheck
- `npx tsc --noEmit` — clean, 0 errors.

## 29. Lint
- `npm run lint` — 0 errors. Only pre-existing warnings remain (exhaustive-deps in cart-upsell/mega-menu/product-comparison/sticky `img` + the same FBT dep warning that existed before).

## 30. Build
- `rm -rf .next && NODE_OPTIONS=--max-old-space-size=4096 npm run build` — ✓ Compiled successfully, 54/54 static pages generated, product routes SSG.

## 31. Test Suites
- SSR: **763 passed, 0 failed** (was 499 at STEP 3 baseline; +264 new PDP checks incl. fixture-based section J covering compatibility/in-the-box/video/FAQ/variants positive render, section-hiding negatives, trust-row truth, Buy Now/Sold Out, JSON-LD sku/brand/no-aggregate).
- UI: **113 passed, 0 failed** (was 101; new section J: Buy Now → /checkout, cart preservation, no Buy Now when sold out, COD copy, lightbox open/next/Escape, sticky CTA).
- Admin: **84 passed, 0 failed**.
- **Total: 960 checks green.**

## 32. Production PDP Verification
- `next start -p 3001`: airdots-pro (in-stock): 1 H1, Buy Now, Add to Cart, COD copy, Free/Standard shipping, no fake warranty/return/WhatsApp, Key Features + Specs + Description + Reviews, sections hidden when absent, JSON-LD PKR/in-stock/no-aggregate. mini-buds (out-of-stock): Sold Out, no Buy Now, no COD (not purchasable), sticky SSR-null, JSON-LD OutOfStock.
- Viewports 390×844 / 430×932 / 768×1024 / 1440×900: no horizontal overflow, exactly one H1, section order correct, Buy Now visible, no broken images, sticky CTA visible mid-scroll — all PASS. Mobile tap opens lightbox; touch-swipe changes active image.

## 33. Known Issues
- Hero featured card image sits below the fold at 390×844 (pre-existing; hero redesign is out of scope).
- JSON-LD `url` uses `NEXT_PUBLIC_SITE_URL` which is unset in this environment (`http://localhost:3000`); production will set the real domain.
- Sticky CTA renders on all breakpoints (pre-existing behavior); it is functionally sound on desktop too.

## 34. Git After
- Still on `main`; nothing staged/committed/pushed. Status now 52 lines (46 pre-existing + 4 new STEP 4 files: `lib/stock.ts`, `buy-now.tsx`, `purchase-section.tsx`, `product-info-sections.tsx`).

## 35. VERDICT
- **STEP 4 COMPLETE.** PDP converted to a mobile-first, high-converting product page: Buy Now, honest trust/COD signals, truthful sections that hide when data is absent, unified stock semantics, 0 new dependencies, 960 checks green, content truth scan clean.

## 36. Next Phase
- **STEP 5 — Catalog & Collection Pages**: apply the same truth-first, mobile-first conversion pass to `/products` and `/products/[category]` (filters/sort, compare, in-stock preference, merchant merchandising) while keeping the PDP work intact.