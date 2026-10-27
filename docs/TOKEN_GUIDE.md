# Saving tokens without losing quality

Principle: **cut what is irrelevant to the task, never what is exact.** Reading less is safe; summarising a safety or money rule is not.

## Always safe
1. **Read one section, not one file.** `python3 scripts/spec.py sec SCR-052` (~0.5k tokens) instead of its 17 KB module (~4.5k). `toc <file>` lists headings first. `sec X --tree` adds sub-sections.
2. **Look up structured rows.** `spec.py req|test|dec|stage|perm|screen` return only the matching rows from `docs/data/`.
3. **One task per session.** `/clear` between unrelated tasks; state lives in `STATE.md` and git, not in chat history.
4. **Keep output small.** `rg -n -m5 pattern`, `| head -40`, run tests with quiet flags and `tail`, never print whole logs, JSON blobs or generated files.
5. **Write the plan to a file.** Plan once (plan mode), save to `STATE.md` or `docs/adr/`, then implement from the file after `/clear`.
6. **Stable prefix.** Keep `CLAUDE.md` short and rarely edited so repeated sessions reuse cached context; put changing facts in `STATE.md`.
7. **Subagents for wide reads.** For "find every place X is used" send a read-only subagent; only its findings return to the main context. Require it to cite file:line and spec IDs.
8. **Match model to risk.** Routine work (fixtures, scaffolding, i18n, CSS, boilerplate migrations) → a lighter model. Invariant-bearing work (state machine, ledger, webhooks, RLS, evidence pipeline, rescue flow) → the strongest model.

## Safe with care
- `/compact`: give it instructions so it keeps invariants, current task, open decisions and failing test names (e.g. `/compact keep CLAUDE.md invariants, current task, DEC defaults used, failing tests`). Prefer `/clear` + `STATE.md` for a clean restart.
- Phase packs are an index, not the truth. If a pack and a spec section disagree, the spec section wins.

## Never economise here
- The 10 invariants in `CLAUDE.md` (always loaded).
- Reading the exact requirement, tests and screen section before changing safety, money, evidence, permissions or the state machine.
- Writing the tests first, running `/check-invariants`, `rls-auditor` after schema work, `spec-reviewer` before a PR.
- Never replace a requirement with your own summary in code comments or docs; link its ID.
- Never skip a decision lookup (`spec.py dec N`) because "the default is obvious".

## Rough costs (chars/4 estimate)
CLAUDE.md ≈ 1.3k · phase pack 0.8–2.3k · one screen ≈ 0.5k · one module ≈ 4–5k · whole spec ≈ 57k + data 37k.
