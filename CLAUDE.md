# AIEC Elevator OS — build instructions for Claude Code

Mobile-first, role-based, workflow-driven operating system for an elevator business (Pune pilot).
**The spec is the source of truth. It is a specification, not an app: nothing is built, tested or approved yet.**

## Read order (do not load the whole spec)
1. This file → `STATE.md` → `python3 scripts/spec.py phase N` (context pack: modules, requirements, tests, decisions for the phase).
2. Look things up, don't read: `python3 scripts/spec.py req|test|screen|dec|stage|perm <query>`. IDs are also greppable: `rg "AIEC-DEC-004" docs/`.
3. Read **sections, not files**: `spec.py sec SCR-052`, `spec.py sec 16.2`, `spec.py toc 15.02`. Open a whole spec file only when a task cites it; index at `docs/spec/INDEX.md`. Structured data (272 tests, 180 requirements, 87 screens, 16 stages, permission matrix, 32 decisions) lives in `docs/data/`. Long reference (research register, coverage audit, original test/trace tables) is in `docs/reference/`: ignore unless asked.
4. Feature switches for unanswered decisions: `config/flags.defaults.json` (all risky features default OFF).

## Non-negotiable invariants (a change that breaks one is a bug)
1. **Evidence lock:** proof exists only if captured by the in-app camera, stamped, hashed, queued. No gallery uploads. Evidence tables have no UPDATE/DELETE grant.
2. **Money lock:** payment status comes only from a signature-verified provider webhook, never a client success page. Money = `bigint` paise. Double-entry ledger, corrections by reversal, `unique(provider, provider_event_id)`, idempotency keys everywhere.
3. **Safety lock:** safety-critical sign-off is human-only. AI may flag, never approve. No remote lift lock (DEC-020). Rescue/trapped-person path always reaches a human and says "call 112".
4. **One Project per Lift**; stage changes only via the single server function `apply_stage_transition` (see `docs/appendix/schema-skeleton.sql`); 16 stages + side states; illegal/skip/backward transitions rejected.
5. **No self-approval**; two approvers + backup must exist; every override is loud and in the audit log.
6. **Server authorisation, not UI:** RLS on every table, object-level checks, masked phone numbers, technician access ends 90 days after handover. Service key is server-only.
7. **Offline never loses data:** client-generated UUID per capture, queue survives kill/reboot, conflicts keep both versions.
8. **No hardcoding** of legal authority names, rates, floors, thresholds, tolerances, time limits. They are versioned config (`RuleConfig`).
9. **No wallet.** Earnings *ledger* + authorised payout partner only (DEC-017).
10. Never claim "production-ready", "legally compliant" or "tested" unless it is true and evidenced (NO_PROD_CLAIM).

## Decisions: the app must never guess
Open owner decisions are in `docs/spec/40-decisions-overview.md` (tiered, with the **default behaviour until answered**). Implement that default behind a feature flag; do not invent answers. If a task needs an unanswered decision with no stated default, stop and add it to `STATE.md → Blocked`.
Features blocked until decided stay **disabled by config**: live payouts, payment release, live contractor onboarding, NOC, rescue page, rider/technician rates.

## Tags in the spec
SOURCE REQUIREMENT, VERIFIED EXTERNAL, PROPOSED IMPROVEMENT, INFERENCE, OWNER DECISION REQUIRED, LEGAL/SAFETY REVIEW (⚖️), EXTERNAL INTEGRATION, UNVERIFIED. Treat PROPOSED and UNVERIFIED as defaults, not facts. Appendix schema/tokens/strings are **drafts**: not executed, not syntax-checked, translations not native-reviewed.

## Token discipline (details: `docs/TOKEN_GUIDE.md`)
Read the exact section you need, never a summary of a safety or money rule. One task per session, `/clear` between tasks, keep tool output short (`rg -m`, `| head`, `tail`). Never skip tests, invariant checks or decision lookups to save tokens.

## Resumability (details: `docs/AUTO_RESUME.md`)
Sessions can end at any time (usage limit, timeout). Keep exactly one line `NEXT: <one concrete task>` in `STATE.md` (or `NEXT: none` / `NEXT: blocked - <why>`), update it after every task, and commit small and often. Never leave work only in chat. After a resume, `/resume-work`; trust `wip(checkpoint)` commits only after running the tests.

## Working agreements
- Work **one phase at a time** in `docs/BUILD_PLAN.md`; one task per session/branch; small commits; open a PR per task.
- Test-first: for each requirement, get its tests with `spec.py req KEY` then `spec.py test N` (T-041 = AIEC-TEST-0041), write them, then implement.
- After each task update `STATE.md` (done / evidence / blocked) and run `/check-invariants`.
- Use `.claude/agents/rls-auditor` after any schema or policy change and `spec-reviewer` before a PR.
- Field roles (Rider, Technician, QC) need low-end Android behaviour: ≥48 dp targets, Marathi-first (mr → hi → en), no reading required for field tasks, big icons + voice.
- Secrets only from environment variables; never commit keys, never log PII.

## Cloud-session limits (Claude Code on the web)
No Android device/emulator, no camera, no GPS, no real payment/WhatsApp/eSign providers. So in cloud: build and test backend (schema, RLS, state machine, ledger, webhooks, rules engine, sync protocol), shared logic and UI against mocks/fixtures. Mark anything needing a device or live provider as `NEEDS_DEVICE` / `NEEDS_PROVIDER` in `STATE.md`; never fake a pass. Integrations are written behind interfaces with a recorded-fixture adapter.
Web app: `cd web && npm test` (unit + screen tests), `npm run build`, `npm run screenshots` (Playwright, writes web/screenshots/, fails on console errors or missing translations).
Local DB: the setup script installs PostgreSQL + PostGIS; tests run against it: `bash scripts/test-db.sh start|reset|schema|rls|test|psql` (`schema` applies a Supabase shim plus `db/migrations/*.sql` in order; `rls` fails if any table lacks RLS; `test` rebuilds and runs `tests/db/*_test.sql`).

## Stack
Decided 2026-10-27 (DEC-012, `docs/adr/0001-stack.md`): PostgreSQL+PostGIS on Supabase (RLS on every table, rules in Postgres functions), TypeScript server and React web for non-field roles, **native Android (Kotlin + Jetpack Compose) for Rider/Technician/QC, Android-only at launch**. Release 1 = §39 phases, Pune pilot (DEC-014).
