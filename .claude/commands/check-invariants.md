---
description: Audit the working tree against the 10 CLAUDE.md invariants
---
Review `git diff` and the code it touches against each invariant in CLAUDE.md. For each, say PASS / FAIL / N-A with file and line evidence. Specifically look for: gallery or file-picker evidence paths, payment state set from client input, float/decimal money, UPDATE/DELETE on append-only tables, stage writes outside apply_stage_transition, tables without RLS, hardcoded thresholds or authority names, AI output that approves safety items, secrets or PII in logs. Fix FAILs or list them in STATE.md → Blocked.
