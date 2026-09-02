### Task 2: Session resolve rules

**Files:**
- Create: `lib/db/analytics-session-rules.ts`
- Test: `lib/db/analytics-session-rules.test.ts`

**Interfaces:**
- Consumes: `normalizeSource` from Task 1
- Produces: `SESSION_IDLE_MS = 30 * 60 * 1000`, `resolveAnalyticsSession`, `shouldApplyFirstTouch`

```ts
export type SessionState = {
  id: string;
  visitorId: string;
  lastActivityAt: string;
  isDemo: boolean;
  source?: string;
};

export function resolveAnalyticsSession(input: {
  now: Date;
  cookieVisitorId: string | null;
  cookieSessionId: string | null;
  demoCookie: boolean;
  existingSession: SessionState | null;
  existingVisitorId: string | null;
}): {
  visitorId: string;
  sessionId: string;
  isNewSession: boolean;
  isNewVisitor: boolean;
  isDemo: boolean;
};
```

New visitor id / session id: `crypto.randomUUID()` (injectable in tests).

- [ ] **Step 1: Write the failing test**

Cases:

- No cookies â†’ new visitor + new session, `isNewSession` true.
- Session last activity 29 minutes ago â†’ reuse.
- Session last activity 31 minutes ago â†’ new session, **same** visitor.
- Replayed cookie for a session whose `lastActivityAt` is 31 minutes ago â†’ new session (do not resurrect).
- `existingSession.isDemo === false` and `demoCookie === true` â†’ new session, same visitor.
- `shouldApplyFirstTouch(isNewSession)` true only when new.

- [ ] **Step 2: Run test â€” expect FAIL**

- [ ] **Step 3: Implement `resolveAnalyticsSession`**

Do not overwrite source here; caller applies first-touch only if `isNewSession`.

- [ ] **Step 4: Tests PASS; `npm test` still green**

---
