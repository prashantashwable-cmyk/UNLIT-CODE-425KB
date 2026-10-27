---
description: Start or continue a build phase (usage /phase N)
argument-hint: <phase number 0-10>
---
Work on phase $ARGUMENTS of the AIEC build.
1. Read CLAUDE.md invariants, STATE.md, and the phase section in docs/BUILD_PLAN.md. If the phase has no task list yet, read its row in docs/spec/39-* plus the modules and sections it cites, then write the checklist into BUILD_PLAN.md first.
2. Check the decisions the phase depends on in docs/spec/40-decisions-overview.md. For any unanswered one, implement only the stated default behind a feature flag, and list it in STATE.md.
3. Pick the next unticked task. Find its tests in docs/data/tests.jsonl (grep), write failing tests, implement, run them.
4. Mark device or provider dependent work NEEDS_DEVICE / NEEDS_PROVIDER; never claim it passed.
5. Run /check-invariants, update STATE.md, commit on a branch, summarise what is done, blocked and next.
