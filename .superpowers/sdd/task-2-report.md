# Task 2 Report: Session resolve rules

## Status

**Complete.** `lib/db/analytics-session-rules.ts` and `lib/db/analytics-session-rules.test.ts` implemented per brief and binding ambiguity resolution.

## Scope

| File | Action |
|------|--------|
| `lib/db/analytics-session-rules.ts` | Created |
| `lib/db/analytics-session-rules.test.ts` | Created |
| `package.json` | Appended test file to `test` script only |

No edits to Task 1 ingest helpers, `analytics-rules.ts`, or other modules.

## Exports

- `SESSION_IDLE_MS = 30 * 60 * 1000`
- `SessionState` type
- `resolveAnalyticsSession(input)` — session/visitor resolution only; does **not** import or call `normalizeSource`
- `shouldApplyFirstTouch(isNewSession)` — returns `isNewSession` (first-touch deferred to caller)

### `resolveAnalyticsSession` behavior

- **Visitor id:** `cookieVisitorId ?? existingVisitorId ?? newId()`
- **`isNewVisitor`:** both cookie and existing visitor id are null
- **Reuse session** when all hold:
  - `existingSession` present
  - `cookieSessionId === existingSession.id`
  - idle time (`now - lastActivityAt`) ≤ `SESSION_IDLE_MS`
  - `existingSession.isDemo === demoCookie`
- **New session** otherwise; same visitor when cookie or existing visitor id present
- **`isDemo`:** always `demoCookie`
- **`newId`:** optional injectable `() => string`, default `() => crypto.randomUUID()`

## TDD evidence

### RED — Step 2 (module missing)

```
Error: Cannot find module './analytics-session-rules'
✖ lib\db\analytics-session-rules.test.ts
ℹ pass 0
ℹ fail 1
```

Command: `npx tsx --test lib/db/analytics-session-rules.test.ts`

### GREEN — Step 4 (after implementation)

Focused run:

```
▶ SESSION_IDLE_MS — ✔ is 30 minutes
▶ shouldApplyFirstTouch — ✔ is true only for new sessions
▶ resolveAnalyticsSession
  ✔ creates new visitor and session when no cookies
  ✔ reuses session when last activity was 29 minutes ago
  ✔ starts new session after 31 minutes idle but keeps visitor
  ✔ does not resurrect an expired session from a replayed cookie
  ✔ starts new session when demo flag differs but keeps visitor
  ✔ starts new session when cookie session id has no existing row but keeps visitor
ℹ tests 8 — pass 8 — fail 0
```

Full suite (`npm test`):

```
ℹ tests 114 — pass 114 — fail 0
```

## Test cases (brief checklist)

- [x] No cookies → new visitor + new session, `isNewSession` true
- [x] Session last activity 29 minutes ago → reuse
- [x] Session last activity 31 minutes ago → new session, same visitor
- [x] Replayed cookie for expired session (31 min) → new session, do not resurrect
- [x] `existingSession.isDemo === false` and `demoCookie === true` → new session, same visitor
- [x] `shouldApplyFirstTouch(isNewSession)` true only when new
- [x] Bonus: cookie session id with no DB row → new session, same visitor

## Commits

None (per instructions).

## Concerns

None. Boundary at exactly 30 minutes idle reuses session (`<= SESSION_IDLE_MS`); brief only specifies 29 min reuse and 31 min new, which both pass.
