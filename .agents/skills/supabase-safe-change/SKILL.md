---
name: supabase-safe-change
description: Safely performs VoltGear Supabase schema/data-layer work with target verification, migration awareness, additive design, secret safety and explicit remote-mutation gates.
---

# Supabase Safe Change

## Before changes

1. Verify intended project/environment without printing secrets.
2. Inspect current migration history and relevant schema/store adapters.
3. Determine whether a migration is genuinely required.
4. Prefer additive schema with constraints/indexes/FKs matching access paths.
5. Preserve backward compatibility when practical.

## Remote gate

Before any remote migration, show the exact target and exact migrations/actions. Require explicit operator approval unless the current task already explicitly authorizes that exact action.

Never print service-role keys, access tokens or DB passwords. Never expose service-role access in client bundles.

## Verification

Check migration synchronization, schema contract, auth/RLS behavior, application runtime and focused tests. Unexpected database errors must not be swallowed.
