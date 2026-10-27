# First prompts (paste into Claude Code on the web, one per session)

**1. Decisions tracker (Phase 0)**
> Read CLAUDE.md and STATE.md. Run `python3 scripts/spec.py dec` for each tier 1 decision (012, 014, 005, 016, 017, 027, 031). Write `docs/adr/0001-stack.md` proposing a stack with trade-offs for a low-end Android field app plus web, Postgres RLS, and offline sync. Do not decide; list what you need from me. Update STATE.md.

**2. Schema foundation (Phase 1, after the stack is confirmed)**
> /phase 1. Task: make every table in docs/appendix/schema-skeleton.sql have row level security with role policies from `spec.py perm`, so `bash scripts/test-db.sh rls` returns zero rows. Write RLS tests first. Run rls-auditor when done.

**3. State machine**
> Implement `apply_stage_transition` per `spec.py sec 16.2` and the comment in the schema. Tests first (find tests with `spec.py test stage`, `spec.py test skip`, `spec.py test idempot`). Cover: skip, backward, replay with same idempotency key, self-approval, missing proof, missing approver role.

**4. Ledger and webhooks (Phase 2, only after DEC-001/002/003/004/008 answers are recorded with `scripts/decide.py`)**
> /phase 2. Start with the double-entry ledger and the webhook receiver. Provider calls go behind an interface with a recorded-fixture adapter.

Record an owner answer: `python3 scripts/decide.py 12 "Native Kotlin for field roles" --by "Owner"`

**After a limit or new session**
> /resume-work
