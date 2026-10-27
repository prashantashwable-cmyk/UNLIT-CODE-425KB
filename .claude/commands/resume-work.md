---
description: Continue exactly where the last session stopped (safe after a usage limit, crash or /clear)
---
Resume the AIEC build.
1. Read STATE.md and the git log (`git log --oneline -8`, `git status --short`). The line starting `NEXT:` is the task to continue. If the last commit is `wip(checkpoint)`, run the tests first to see what state the work is really in.
2. If NEXT is blocked, none, or needs an owner decision, device or provider: stop and report. Do not guess decisions.
3. Otherwise: `python3 scripts/spec.py phase <current phase>`, read only the sections the task cites, finish the task tests-first, run /check-invariants.
4. Update STATE.md: Done, Blocked, and set `NEXT:` to one concrete next task (or `NEXT: none` / `NEXT: blocked - reason`). Commit with a real message (not wip). Keep output short.
