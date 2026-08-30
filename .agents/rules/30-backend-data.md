# Backend & Data Rule

Preserve the existing data-access architecture and server/client boundaries. Do not introduce random direct Supabase calls when an existing store/adapter layer exists.

Server-authoritative logic remains authoritative for prices, order totals, inventory transitions, checkout and status changes.

Before schema work, inspect relevant migrations and current table/function contracts. Prefer additive changes, proper constraints, deterministic ordering, safe foreign keys and server-side validation.

Do not silently catch broad database failures. Gracefully handle only known optional-feature absence/error states; unexpected errors must surface appropriately.
