# Agent Efficiency Rule

Minimize wasted context and repeated work.

1. Search targeted paths first.
2. Do not re-audit files already understood unless the current task changes them.
3. Use a plan only for genuinely multi-step/architectural tasks.
4. Prefer one implementation pass plus one closure pass.
5. Run targeted tests while working; run the full suite once at the end.
6. Keep final reports short unless performing a formal gate.
7. Do not create temporary scripts when an existing command/tool can answer the question safely.
8. Do not ask questions whose answers are available in code or rules.
9. Never change package/test scripts merely to make verification numbers look better.

## Strict Read-Only Discipline

When the operator explicitly says:

- read-only
- do not modify files
- do not change anything
- inspection only
- verification only

then perform ZERO filesystem writes.

Do not create:

- scratch files
- temporary reports
- generated helper scripts
- cached summaries
- redirected output files

unless the operator explicitly authorizes writing them.

Prefer direct read/search commands and keep intermediate reasoning in memory.

A read-only task must leave `git status --short` unchanged.

## Exact Inventory Discipline

When asked to enumerate workspace Rules, Skills, Workflows, MCPs, or other configuration:

1. inspect the relevant configuration directory once;
2. enumerate every discovered item;
3. reconcile the reported count with the filesystem count;
4. do not silently omit available items.

If filesystem count and reported count differ, investigate before claiming configuration recognition succeeded.

## Verification Cost Discipline

Do not mechanically run the maximum verification suite for every task.

Use the least expensive verification set that provides strong confidence for the actual blast radius.

Escalate verification depth based on risk, not habit.
