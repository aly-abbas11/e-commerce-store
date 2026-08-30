# MCP & Plugin Strategy

The goal is fewer manual copy/paste loops, not more tools.

## Recommended high-value connections

1. Supabase — schema/project inspection and controlled database workflows.
2. GitHub — repository/branch/PR context once the correct account has access.
3. Browser/Chrome — rendered UI inspection, responsive QA, console/runtime debugging.
4. Vercel — deployment/project/log/environment inspection if available in the current Antigravity installation.

Install only tools you will actually use. Too many integrations add tool-selection noise and authorization surface.

## Permissions philosophy

Permanently allow only narrowly scoped read/test commands you understand. Keep review gates for production deployments, environment writes, remote DB migrations, recursive deletion, arbitrary scripts and destructive git/database commands.

## Suggested safe recurring commands

- `npm run test`
- `npm run lint`
- `npm run build`
- `npx tsc --noEmit`
- exact inventory adapter test command
- `git status --short`
- `git diff`
- `git diff --check`
- targeted search/read commands

## Keep gated

- `supabase db push/reset`
- SQL mutation
- `vercel --prod`
- Vercel env add/update/remove
- recursive deletion
- arbitrary `node -e`
- `git reset --hard`
- `git clean`
- broad process kills
