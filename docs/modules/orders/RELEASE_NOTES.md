# Orders — release notes

## 2026-08-26 — Admin orders and shopper tracking (T-03)

- Staff can pack from **Orders** in `/admin`: compact table, search by ID / name / email, then a full COD detail with contact, address, items, and timeline.
- Any status (`new`, `processing`, `shipped`, `delivered`, `cancelled`) can be set with an optional note. Existing status emails still send; new templates stay T-04.
- `/track` still needs order ID + checkout email. After a match it shows a status headline, vertical timeline, items, and totals. Phone and address stay off that page. A wrong lookup does not reveal whether the order ID exists.
