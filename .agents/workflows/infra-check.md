---
title: Infrastructure Check
description: Verify local/Supabase/Vercel/runtime readiness without changing production.
---

Verification only unless explicitly told otherwise.

Check local env presence without values, Supabase target/link/migration sync, critical schema, service-role server-only use, local runtime, Vercel project/env names, production Supabase ref, deployment status, HTTP smoke tests, logs, tests/typecheck/lint/build and git secret safety.

Do not deploy, apply migrations or mutate production data. Return READY FOR DEVELOPMENT or exact blocker.
