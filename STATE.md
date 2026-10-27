# STATE (update after every task; this is the memory between cloud sessions)

**Current phase:** 1 (Foundation)
**Last updated:** 2026-10-27

NEXT: Phase 1 - approval functions (request_approval / decide_approval: no self-approval, approver role + assignment, decided_at, audit) and apply_side_state (on hold / disputed / cancelled / lost per §16.3, Admin with reason, audited); tests first. The server key currently cannot write approvals or side_state at all.

## Done
- 2026-10-27 Phase 1 state machine: `db/migrations/0004_stage_machine.sql` adds `apply_stage_transition` (security definer; the only way to change stage), `issue` and `outbox` tables, and 15 default forward gates in `stage_transition` (data, editable later as settings). Checks: caller = actor, role held, assignment (Admin exempt), idempotency after authorisation (replay returns same event; conflicting reuse refused), side state, skip/jump/same-stage refused, backward Admin-only with reason → Issue + audit, proofs (checked photos of this project, approvals by matrix roles assigned to the project and decided after the last backward move, webhook-confirmed payments, licence holder, quote). Defaults applied: DEC-004 (70% before dispatch), DEC-005 (licence holder before permit), DEC-013 (licence before handover), DEC-019 (20% before production), DEC-027 (approval gates closed until 2 approvers + a backup exist). Sales bot can never be a gate approver (check constraint). Server key cannot write stage/side state/stage events/outbox/gate rules/approvals or create projects past the first stage. Evidence: `bash scripts/test-db.sh test` → PASS rls_test.sql + stage_transition_test.sql, 182 assertions; 8 mutants of the function each fail the suite. rls-auditor + spec-reviewer findings fixed (approver roles per matrix, approver assignment, stale approvals, unchecked evidence, key probing, service-role bypasses, foreign evidence ids). RLS: role `sales` now sees assigned project/site/quote/payment (matrix S).
- 2026-10-27 Phase 1 RLS task: migrations in `db/migrations/` (0001 core = draft schema minus its RLS stub; 0002 RLS; 0003 append-only hardening). Every app table has RLS; API roles are SELECT-only, row-filtered; all writes go through server/security-definer functions. Evidence: `bash scripts/test-db.sh test` → PASS rls_test.sql, 104 assertions; `bash scripts/test-db.sh rls` → OK, exit 0. Mutation check: widening quote access to technicians makes the suite fail. rls-auditor and spec-reviewer findings fixed (TRUNCATE bypass, service_role UPDATE/DELETE on append-only tables, expired-access evidence leak, 0/0 ledger rows, Owner/Supplier over-read, default EXECUTE on new functions).
- 2026-10-27 `test-db.sh`: `schema` applies shim + db/migrations and fails loudly; `rls` exits 1 if any table lacks RLS or the schema is missing (vacuous pass fixed); new `test` command. PostGIS `spatial_ref_sys` excluded from coverage (extension-owned) and revoked from API roles.
- 2026-10-27 Cloud environment setup script configured by owner; verified in a fresh session: PostGIS present at start, `test-db.sh schema` exits 0, `rls` lists 16 tables (15 app + spatial_ref_sys).
- 2026-10-27 Phase 0: project unpacked from the uploaded zip into the repo root. Ran `spec.py dec` for tier 1 (012, 014, 005, 016, 017, 027, 031): all unanswered. Wrote `docs/adr/0001-stack.md` (PROPOSED, not decided) and `docs/DECISIONS.md` tracker (32 decisions, answer/date/approver columns).
- 2026-10-27 Verified in a Claude Code cloud session: `test-db.sh schema` applies the draft with zero errors **after** `apt-get install postgresql-16-postgis-3`; `rls` lists the 15 tables below plus `spatial_ref_sys`.
- Package verified in a scratch container: Postgres 16 + PostGIS install works via apt; `scripts/test-db.sh schema` applies `docs/appendix/schema-skeleton.sql` (plus `scripts/db-shim.sql` stand-ins for Supabase `authenticated` role and `auth.uid()`) with zero errors. Not yet verified inside an actual Claude Code cloud environment.

## Known findings (Phase 1 must fix)
- Draft has ~20 tables; spec §29.1 lists ~25 more not yet written (customer, supplier, bom, container, permit, licence, inspection, task, ...). Each new table needs RLS + tests (the coverage test fails until it has RLS).
- T-055 not covered: peer check by another team needs a team model (installation_peer_check accepts any assigned QC/technician other than the requester).
- T-004 only partly: requester <> approver enforced; override flow, second Admin/Owner approval and red timeline entry not built.
- Licence gate (licence -> handover) accepts a `licence_recorded` approval; licence number/holder/renewal date need the licence table.
- Projects can only be created at `lead_captured` (server insert grant on lift_id/customer_id/licence_holder); a create-project function with audit is still to do.
- Gate rules (`stage_transition`) are editable only by the migration role; the Admin-propose / Owner-approve settings flow (rule_config versioning) is still to do.
- The approver of a gate may also move the stage (requester and approver are two people; a third would deadlock a two-approver team). Revisit if the owner wants three-person gates.
- T-001 NOT covered: customer phone lives on the unwritten customer table; needs the API 403 + audit event. Only the worker phone column is hidden (`user_account.phone_e164` not granted to API roles).
- T-002 partial: `access_until` is honoured by RLS, but nothing yet sets it to handover + 90 days from RuleConfig; the defect/AMC ticket exception needs those tables.
- Views still needed for matrix cells that are narrower than rows: Owner site summary and earnings/ledger totals, worker own earnings from ledger, Technician/QC paid/not-paid payment status, Supplier delivery point and own orders, same-project team map.
- quote_version "immutable once sent" is not enforced (no sent flag in the draft).
- `site.geofence_m default 50` (from the draft) is a hardcoded tolerance: move to RuleConfig (invariant 8).
- Supabase deploy check: revoking on `spatial_ref_sys` may need the extension owner (supabase_admin); `alter default privileges revoke execute on functions from public` applies to the migration role only.
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
