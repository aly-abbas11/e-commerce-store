# Vercel production implementation

The shop runs on Vercel. Database and images stay on the same Supabase and Cloudinary projects as local.

## Live URL

https://voltgear-coral.vercel.app

Vercel project: `voltgear` (account that ran `vercel link`). GitHub auto-deploy is **not** connected (no write access to `aly-abbas11/e-commerce-store`). Ship from this folder:

```
npx vercel --prod --yes
```

## What was wired

- Production env copied from `.env.local` (Supabase, Cloudinary, Resend, admin token, cron secret). Sanity keys were skipped. Do not commit `.env.local`.
- `NEXT_PUBLIC_SITE_URL` falls back to Vercel’s production host when unset (`lib/deploy-rules.ts` `publicSiteUrl()`).
- Production admin requires `ADMIN_TOKEN` (no demo fallback).
- `GET /api/flows` returns 401 unless `Authorization: Bearer <CRON_SECRET>`. Vercel Cron sends that header. Schedule is daily (`0 9 * * *` in `vercel.json`) so it fits the Hobby plan.
- `/studio` still redirects to `/admin/login`.

## Env

Placeholders live in `.env.example`. Real values stay in `.env.local` and the Vercel dashboard. To copy keys again without printing values: `node scripts/push-vercel-env.mjs`.

After a custom domain, set `NEXT_PUBLIC_SITE_URL` to that origin (no trailing slash) and redeploy.

## Out of this module

Custom domain, GitHub integration, Clarity (T-05), switching `/` to gadget chrome, card payments.
