# Spec: T-12a — Admin Biometic theme

## Objective

Make `/admin` feel like the live Biometic storefront: **forest sidebar** (footer-like), **cream main** (canvas), full **Fraunces + DM Sans**, including **login**.

**User:** store owner in admin.

**Why now:** Live shop is Biometic; admin still looks generic shadcn. Theme alignment is the first slice of T-12 (easier admin) before deeper layout UX.

**Success:** Signed-in shell and `/admin/login` use cream/forest/sage; nav active states readable on forest; primary buttons and cards inherit theme; storefront unchanged.

## Locked decisions

| Topic | Decision |
|---|---|
| Scope | Full Biometic: shell + controls + fonts (option C) |
| Login | Same theme (option A) |
| Approach | `.admin-theme` CSS scope remapping shadcn HSL tokens (option 1) |
| Sidebar | Forest `#1F3626`; light text; active = forest-mid / cream accent |
| Main | Cream `#F5F1E8`; white cards |
| Fonts | Fraunces (display/headings) + DM Sans (UI) — reuse `gadgetFontClass` |
| Out of scope | Nav IA changes, form field redesign per page, T-15 analytics |

## Architecture

```
app/admin/layout.tsx
  → wrapper: admin-theme + gadgetFontClass
  → AdminShell (sidebar forest / main cream)

globals.css
  → .admin-theme { same --g-* + shadcn remaps as .gadget-theme }
  → .admin-theme aside / nav active / login helpers as needed

components/admin/admin-shell.tsx
  → sidebar/main classNames use forest/cream utilities or CSS hooks
```

Login currently skips shell chrome but still sits under `AdminShell` early-return — ensure the **layout wrapper** still applies `.admin-theme` so login is themed even when shell returns children only.

## Visual rules

- Sidebar: `background: var(--g-forest)`; brand label cream; links taupe/cream; hover forest-mid; **active** cream tint or sage underline / `bg-[var(--g-forest-mid)]` + cream text.
- Main column: `background: var(--g-cream)`.
- Mobile header: forest or cream with forest text — prefer cream bar with forest icons for contrast with open drawer.
- Primary buttons: forest (via `--primary`).
- Do not change storefront `.gadget-theme` behavior.

## Impact

| Area | Verdict |
|---|---|
| Storefront | Untouched |
| Admin pages | Inherit via CSS variables; spot-fix any `bg-white` / hardcoded grays if broken |
| Analytics charts | May need a follow-up if chart colors clash — note if ugly, don’t block |
| T-10 Home layout | Benefits immediately |

## Acceptance

- [ ] `/admin` sidebar is forest; content area cream
- [ ] `/admin/login` cream + forest accents + fonts
- [ ] Active nav readable; Sign out visible
- [ ] Live shop `/` unchanged
- [ ] No new deps beyond existing gadget fonts

## Task id

Track as **T-12** first slice (theme). Deeper “easier layout” polish remains planned after this ships.
