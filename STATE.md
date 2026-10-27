# STATE (update after every task; this is the memory between cloud sessions)

**Current phase:** 0 → 1 (stack confirmed; other tier 1 decisions run on their defaults)
**Last updated:** 2026-10-27

NEXT: Phase 1 task 1 - migrations from docs/appendix/schema-skeleton.sql with RLS on every table so `bash scripts/test-db.sh rls` returns zero rows (fix vacuous pass + spatial_ref_sys first); RLS tests first (FIRST_PROMPTS #2)

## Done
- 2026-10-27 Cloud environment setup script configured by owner; verified in a fresh session: PostGIS present at start, `test-db.sh schema` exits 0, `rls` lists 16 tables (15 app + spatial_ref_sys).
- 2026-10-27 Phase 0: project unpacked from the uploaded zip into the repo root. Ran `spec.py dec` for tier 1 (012, 014, 005, 016, 017, 027, 031): all unanswered. Wrote `docs/adr/0001-stack.md` (PROPOSED, not decided) and `docs/DECISIONS.md` tracker (32 decisions, answer/date/approver columns).
- 2026-10-27 Verified in a Claude Code cloud session: `test-db.sh schema` applies the draft with zero errors **after** `apt-get install postgresql-16-postgis-3`; `rls` lists the 15 tables below plus `spatial_ref_sys`.
- Package verified in a scratch container: Postgres 16 + PostGIS install works via apt; `scripts/test-db.sh schema` applies `docs/appendix/schema-skeleton.sql` (plus `scripts/db-shim.sql` stand-ins for Supabase `authenticated` role and `auth.uid()`) with zero errors. Not yet verified inside an actual Claude Code cloud environment.

## Known findings (Phase 1 must fix)
- `bash scripts/test-db.sh rls` shows 15 app tables WITHOUT row level security: approval, audit_event, consent_record, evidence_check, ledger_journal, lift, payment, project_assignment, provider_webhook, quote_version, role_assignment, rule_config, site, stage_transition, user_account. Draft only enables RLS on 5 tables and defines 1 policy.
- Draft has ~20 tables; spec §29.1 lists ~25 more not yet written (customer, supplier, bom, container, permit, licence, inspection, task, ...).
- `apply_stage_transition` exists only as a comment, not a function.
- `test-db.sh rls` passes vacuously: if `schema` fails (e.g. PostGIS missing, as in a fresh cloud env without the setup script) it prints 0 rows. Phase 1 must make `schema` failure fail the check and assert expected tables exist.
- `spatial_ref_sys` (PostGIS system table, owned by the extension) shows in the rls list; decide to exclude it in `tests/db/rls_coverage.sql` or enable RLS with a read-only policy.
- CLAUDE.md says the ADR is Phase 1 task 1; BUILD_PLAN puts it in Phase 0. Treated as Phase 0.

## In progress
-

## Blocked (needs owner / professional / provider / device)
- Tier 1 decisions still open: DEC-005, 016, 017, 027, 031 (build uses their defaults; see docs/DECISIONS.md). ADR 0001 section 5 Q4–Q7 open (maintainer, phone models, hosting budget, data residency; India region assumed until the lawyer answers)
- Written opinions: lawyer, CA, licensed lift engineer, payment provider

## NEEDS_DEVICE / NEEDS_PROVIDER backlog
-

## Assumptions made (each must cite a DEC default)
-

- DECIDED AIEC-DEC-012 on 2026-10-27 by Owner: Native Kotlin (Jetpack Compose) for Rider/Technician/QC, Android-only at launch; web (TypeScript + React) for other roles; Supabase-hosted PostgreSQL+PostGIS; TypeScript server. Per docs/adr/0001-stack.md  (review flags in config/flags.defaults.json)

- DECIDED AIEC-DEC-014 on 2026-10-27 by Owner: Phases as in section 39; Pune-only pilot  (review flags in config/flags.defaults.json)
