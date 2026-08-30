# Task 3 spec excerpt — counting only

Session cohort = started_at in Karachi range AND is_demo = false.

Visitors = COUNT DISTINCT visitor_id on that cohort. Never COUNT a visitors table.

Shop reach (may be non-nested):
- Sessions, product_view, add_to_cart, checkout_started, converted (session linked to ≥1 non-demo order)

% of previous = ordered transitions, never > 100%:
- PV% = |PV| / |Sessions|
- ATC% = |PV then later ATC| / |PV|
- Checkout% = |ATC then later checkout_started| / |ATC reach|
- Converted% = |checkout_started then later order.createdAt| / |checkout_started reach|

Sessions row conversionFromPrevious = null (do not show 100%).

Unattributed = missing/empty order snapshot source. Never map to direct.

RAW_RETENTION_DAYS = 90.
trafficRangeAvailable: range.start >= karachiYmd(now minus 90 days). Inclusive.

Do not rewrite T-14 order funnel math. Reuse isoInRange/karachiYmd from analytics-rules.ts only.
