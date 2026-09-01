# Spec: Analytics Funnel tab redesign (presentation)

## Objective

Make Analytics → Funnel easy to read: shop conversion and COD fulfillment as **separate structured panels**, with clear metrics per step — without changing funnel math.

**Approved:** 2026-09-01 — Approach 1 (two stacked panels, column metrics).

## Locked decisions

| Topic | Decision |
|---|---|
| Scope | UI only on Funnel tab |
| Shop panel | Sessions → product view → ATC → checkout → converted |
| COD panel | Placed → processing → shipped → delivered; rows still drill to orders |
| Metrics per step | Count · % of previous · % of first step |
| Out of scope | New stages, charts, cohort rule changes, checkout UX |

## Acceptance

- [ ] Two visually separated panels with titles + one-line helpers
- [ ] Columns readable on desktop; stacked metrics on small screens
- [ ] COD steps still open existing order drill
- [ ] Null `shopFunnel` still shows Not available + retention banner
