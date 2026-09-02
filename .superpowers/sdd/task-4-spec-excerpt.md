# Task 4 spec excerpt — Insights

Max 8 cards. T-15 emits HIGH and MEDIUM only (LOW on the type, never produced).
One card per rule id; worst candidate wins. No id suffixes.

relativeDrop(prior, current) = (prior-current)/prior; if prior===0 return null. Fire relative drop if >= 0.25 for shop/processing.

Cancel rate only: relativeRise = (current-prior)/prior; fire if >= 0.25. If prior===0 skip relative, use absolute >=25% floor.

Shop/source/landing/validation: skip if trafficAvailable false OR sessionCount < 30.
HIGH shop: sessionCount >= 100 AND usable prior (prior.trafficAvailable).
MEDIUM shop: sessionCount >= 30.

Fulfillment 8-9: mature orders only (createdAt <= now - 24h). Floor 10 mature placed. HIGH if >= 30 mature AND usable prior. Allowed when traffic NA.

Absolute shop floors (transition rates):
- pv/sessions < 0.30
- PV then later ATC / PV < 0.15
- ATC then later checkout / ATC < 0.30
- checkout then later order / checkout < 0.40

Rules:
1 shop_drop_product_view
2 shop_drop_add_to_cart
3 shop_drop_checkout
4 shop_drop_convert
5 source_underperforms: source sessions>=30 and convertedRate <= half site convertedSessions/sessions; worst gap
6 landing_low_pdp: path sessions>=30 and pv reach <20%; skip /checkout and /checkout/*
7 checkout_validation_hotspot: >=20 events, one category >=40%
8 fulfillment_processing_gap: mature processing/placed <50% or relative drop >=25%
9 fulfillment_cancel_rate: mature cancelled/placed >=25% or relative rise >=25%

No ROAS, PII, Unattributed=Direct, auto storefront changes.
Possible causes are hypotheses. Sort HIGH then larger gap.
