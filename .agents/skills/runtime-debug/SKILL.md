---
name: runtime-debug
description: Diagnoses VoltGear runtime/server failures from exact logs and stack traces, makes the smallest root-cause fix, adds regression coverage and verifies affected routes.
---

# Runtime Debug

Never diagnose from a generic error page/digest alone.

1. Reproduce once.
2. Read current server/runtime logs.
3. Capture exact exception and stack.
4. Identify source file/function/line.
5. Establish root cause before editing.
6. Inspect only stack-related dependencies.
7. Make the smallest targeted fix.
8. Add/update regression test.
9. Verify affected route and nearby critical route(s).
10. Run final verification.

Do not repeatedly clear caches, broadly swallow exceptions, apply DB migrations merely to hide an application bug or kill every Node process.
