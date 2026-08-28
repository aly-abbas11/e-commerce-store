# Spec: T-08 — Vercel production deploy

## Objective

Put this store on Vercel so you have a public HTTPS URL. Same Supabase and Cloudinary as local. Shoppers can open the live shop; you can open admin with `ADMIN_TOKEN`.

**User:** you.

**Why now:** T-01–T-07 work on localhost. Next is a real URL (T-05 Clarity waits on this).

**Success:** `https://*.vercel.app` (or the project URL Vercel assigns) loads `/`, `/product/[slug]`, checkout, `/admin/login`, and `/home2`. Catalog comes from Supabase. `/studio` still redirects to admin. No Sanity project required at build or runtime.

## Tech stack

- Vercel (Next.js 14, existing `vercel.json`)
- Same Supabase project as `.env.local`
- Same Cloudinary
- CLI deploy of the working tree (`vercel --prod`). GitHub push is not required for this task.

## Commands

```
npm test
npx tsc --noEmit
npx vercel --prod --yes
```

No `supabase db push`. Do not print or commit secrets. Do not `git push` unless asked.

## Locked decisions

| Topic | Decision |
|---|---|
| Host | Vercel |
| Database | Same Supabase as local (T-06). No second project |
| Images | Same Cloudinary |
| Domain | Vercel-assigned URL first. Custom domain later if you ask |
| Git | Deploy from this machine. Do not push to GitHub unless asked |
| Sanity | Unused. `/studio` redirects to `/admin/login` |
| Admin | `ADMIN_TOKEN` required in production. No demo fallback |
| Cron | `/api/flows` daily (Hobby-safe). Authorize with `CRON_SECRET` |
| Preview URLs | `/home2` and `/product2` stay `noindex` (T-07 keep both) |
| Clarity | Not this task (T-05) |

## Approaches considered

1. **Vercel CLI production deploy + env from `.env.local` (chosen).** Fastest; includes uncommitted T-01–T-07 code. Logged-in CLI user already exists.
2. Push `main` to GitHub and let Vercel build from git. Would need a commit + push of a large uncommitted tree. Out of scope unless you ask.
3. Separate staging Vercel project. Extra account surface; T-06 demo already covers sandbox on the same DB.

## Architecture

```
Local working tree
  → vercel env (production): Supabase, Cloudinary, Resend, ADMIN_TOKEN, CRON_SECRET
  → vercel --prod
  → https://<project>.vercel.app
       shop reads/writes same Supabase
       emails via Resend if key is set
       cron GET /api/flows with Bearer CRON_SECRET
```

`publicSiteUrl()` prefers `NEXT_PUBLIC_SITE_URL`, then Vercel’s production host, then localhost. After the first URL exists, set `NEXT_PUBLIC_SITE_URL` to that origin (no trailing slash) and redeploy so sitemap, robots, and email links match.

## Error handling

| Case | Behavior |
|---|---|
| Missing `SUPABASE_SERVICE_ROLE_KEY` | Build/runtime fails loudly. Do not ship |
| Missing `ADMIN_TOKEN` in production | Admin secret resolver throws. No demo password |
| Unauthenticated `/api/flows` in production | 401 |
| Hobby cron schedule too frequent | Use once per day |
| Sanity env missing | App still builds; studio redirect does not need Sanity |

## Impact analysis

| Surface | Today | T-08 |
|---|---|---|
| Shop / admin / demo | localhost | Same code on Vercel |
| Supabase | Local env | Same project keys on Vercel |
| `lib/admin.ts` | Demo fallback password | Production must set `ADMIN_TOKEN` |
| `GET /api/flows` | Open GET | Production requires `CRON_SECRET` |
| `vercel.json` cron | Hourly | Daily (Hobby) |
| Sitemap / emails | `localhost:3000` fallback | `publicSiteUrl()` |
| GitHub `origin/main` | Behind local work | Unchanged (no push) |
| T-05 Clarity | Blocked | Still blocked until you add a Clarity ID on the real URL |

## Testing strategy

- `publicSiteUrl` unit tests (explicit / Vercel / localhost)
- Production admin secret refuses empty env
- Cron auth: prod 401 without bearer; allows matching secret
- `npm test`, `npx tsc --noEmit`
- After deploy: curl `/`, `/robots.txt`, `/admin/login`, `/studio` (redirect), `/product2` still noindex

## Boundaries

- **Always:** Same database. No secrets in git. Production admin token required.
- **Ask first:** Custom domain, GitHub auto-deploy, a second Vercel/Supabase project.
- **Never:** Printing `.env.local` values. Clarity on this task.

## Out of scope

- T-05 Clarity project ID
- Custom domain / DNS
- GitHub Actions CI
- Switching `/` to gadget chrome
- Card payments

## Success criteria

- [x] Production URL loads the shop from Supabase
- [x] Admin login works with `ADMIN_TOKEN` (not the demo fallback)
- [x] `/studio` → `/admin/login`
- [x] Preview routes still `noindex`
- [x] `npm test` and `tsc` pass
- [x] Cron route rejects anonymous production requests

## Phase breakdown

1. URL + admin + cron helpers and tests
2. Wire helpers; daily cron; `.env.example` placeholders
3. Link Vercel project, copy env (keys only logged), `vercel --prod`
4. Hit the live URL; set `NEXT_PUBLIC_SITE_URL` if needed; closeout docs
