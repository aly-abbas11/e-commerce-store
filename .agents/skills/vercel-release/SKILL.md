---
name: vercel-release
description: Verifies and releases VoltGear through Vercel with project/env checks, Supabase-target validation, explicit production approval, deployment smoke tests and runtime-log review.
---

# Vercel Release

## Preflight

- verify `.vercel/project.json` and intended project/team;
- verify required environment variable names without printing values;
- verify production Supabase ref matches intended project;
- run test/typecheck/lint/build/diff verification;
- ensure no known blocking runtime errors.

Stop before `vercel --prod` unless production deployment is explicitly authorized by the current task.

## After deployment

Verify deployment Ready plus HTTP/runtime checks for homepage, products, search, admin login and a real PDP only when business data exists. Review recent logs for server errors, env/key problems and Supabase failures.
