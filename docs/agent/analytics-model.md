# VoltGear Commerce Analytics Model

Use the current implemented schema/events as source of truth; this document describes principles.

## Funnel dimensions

Visitor/session discovery -> product view -> add to cart -> checkout start -> order placed -> shipped -> delivered/cancelled.

Do not mix people, sessions, events and orders in the same denominator without explicitly defining the unit.

## Revenue

For COD operations, delivered revenue is the strongest realized-sale metric when that is how current reporting is defined. Placed order value remains a separate upstream metric.

## Attribution

Preserve current first-party source/referrer/UTM approach and existing first-touch/session semantics unless a deliberate analytics migration changes them.

## Insights

Require sufficient samples. Explain observed evidence and suggested action. Avoid statistically confident language on tiny samples.

## Privacy/retention

Follow current retention and demo-data rules. Admin/internal traffic should not contaminate public customer analytics where the existing architecture excludes it.
