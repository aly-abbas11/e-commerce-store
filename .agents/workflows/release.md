---
title: VoltGear Release
description: Perform a controlled production release with a pre-deploy approval gate and post-deploy verification.
---

Use `vercel-release`.

Phase 1: tests/typecheck/lint/build/diff, project link, env names, intended Supabase ref, security-sensitive blockers, current deployment. Stop before production deployment unless explicitly authorized.

Phase 2 after authorization: deploy once, verify Ready, smoke-test critical routes, inspect logs, report release status and rollback concern if any. Stop.
