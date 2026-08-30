# VoltGear Architecture Reference

This document is a navigation map, not a substitute for inspecting current code.

## Application shape

VoltGear is a Next.js App Router ecommerce application with customer storefront, custom admin, server-side commerce/data access, Supabase persistence and Vercel hosting.

## Architectural principles

- Server-authoritative commerce calculations.
- Existing data/store adapters are preferred over direct component-level database access.
- Client components are limited to actual interactivity.
- Public pages should degrade safely when optional CMS content is empty.
- Admin and public concerns remain separated.
- Shared commerce UI such as ProductCard should remain a single source of truth.
- Schema changes are migration-driven and additive by default.

## High-value surfaces

Storefront: navbar/search/categories, hero, homepage merchandising, PLP/category/search, PDP, cart, checkout, support/policies.

Admin: snapshot, products/categories, homepage/hero merchandising, orders, analytics/insights, settings.

Data: products/variants/categories, orders/statuses, CMS/drafts, homepage sections, analytics sessions/events, inventory.

## Change discipline

Before changing a surface, trace its route -> component -> data adapter -> relevant type/schema/test. Do not broaden inspection without evidence it is needed.
