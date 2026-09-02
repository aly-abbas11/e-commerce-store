# T-15 spec excerpt for Task 1 only

Source: docs/superpowers/specs/2026-08-27-t15-first-party-traffic-design.md

## Event whitelist

- page_view properties {}
- product_view properties {}
- add_to_cart / remove_from_cart: { quantity } integer
- checkout_started properties {}
- checkout_step: { step: "details" | "confirm" }
- checkout_validation_error: { category } from name, email, phone, address, city, empty_cart, price_changed, stock, other
- page_type: home, catalog, product, cart, checkout, search, content, other
- is_demo in JSON is ignored
- No purchase / order_placed event

## Source precedence

1. Validated explicit UTM/source
2. Click id: ttclid → tiktok, fbclid → meta, gclid → google
3. Search-engine referrer → organic
4. Other external referrer → referral
5. No external attribution → direct
6. Malformed/unknown explicit attribution → other

Never send unknown explicit values to direct.
Known utm_source mapping (plan): tiktok, meta, facebook→meta, google, instagram→meta (case-insensitive).

## Sanitize

- referrer: origin + pathname; strip query and fragment; empty if unparseable
- Caps: path 200, slug 180, utm/campaign 80, click id 128, referrer 200
- pathname: never keep query string

## Origin / rate limit

- Origin missing → allowed; else hostname (strip port) must match Host
- 60/min/IP in production; if no IP, key by vg_sid; if neither, always allow; never a global "unknown" bucket
- TTL + size-bounded map (maxKeys 5000 production)

## Out of this task

Session cookies, checkout, migration, admin UI, T-14, TikTok/Meta APIs.
