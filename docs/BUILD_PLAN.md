# Build plan (from spec §39). One phase at a time. Tick boxes here and in STATE.md.

Legend: ☁ buildable and testable in a cloud session · 📱 NEEDS_DEVICE · 🔌 NEEDS_PROVIDER · ⚖️ needs professional · ⚠️ needs owner decision.
Test IDs refer to `docs/data/tests.jsonl` (grep `T-0xx`).

## Phase 0 — Decide (no code)
- [ ] ⚠️ Fill `answer` fields in `docs/data/decisions.json` (source of truth) as the owner decides; track tier 1 and tier 2 decisions in `docs/DECISIONS.md` (created 2026-10-27; copy table from `docs/spec/40-decisions-overview.md`, add answer/date/approver columns)
- [x] ADR `docs/adr/0001-stack.md` (DEC-012) — owner confirmed 2026-10-27 (Kotlin, Android-only, Supabase)
- [ ] ⚖️ Request written opinions: lawyer, CA, licensed lift engineer, payment provider
- Exit: owner signs off spec. Tests: T-099

## Phase 1 — Foundation  (M1, M12, M15; SCR-001–020)
- [ ] ☁ Migrations from `docs/appendix/schema-skeleton.sql` (it is an unexecuted draft: fix syntax, run it, add the "not shown" tables from §29.1)
- [ ] ☁ Use `bash scripts/test-db.sh schema` then `bash scripts/test-db.sh rls`; exit criterion is zero rows from rls_coverage.sql (currently 15 tables missing)
- [ ] ☁ RLS on every table + `apply_stage_transition` (idempotent, no self-approval, proofs + approver roles checked) + RLS tests (T-001, T-002, T-098)
- [ ] ☁ Auth/OTP, role assignment, delegate/backup approver, audit log (append-only), outbox
- [ ] ☁ Evidence asset model + checks + sync protocol (`captured→queued→uploading→server_received→checked→accepted/rejected`) (T-062–T-069)
- [ ] ☁ Design tokens → theme, i18n loader from messages.draft.json (mr/hi/en), scale slider with clamped critical controls (DEC-024)
- [ ] 📱 Evidence camera, offline queue on device, SOS button
- Exit: each role sees only its allowed data. Tests: T-001–T-008, T-062–T-069, T-098

## Phase 2 — Money rails  (M13) — needs ⚠️ DEC-001/002/003/004/008/018/019/023/030
- [ ] ☁ Double-entry ledger, balanced-journal constraint, reversal-only corrections
- [ ] ☁ Webhook receiver: signature verify, durable before 2xx, `unique(provider, provider_event_id)`, replay-safe
- [ ] ☁ Payout batches (disabled by flag), provider adapter interface + fixture adapter 🔌
- [ ] ☁ Daily reconciliation job, cancellation/refund engine (§21.4)
- Exit: test payment received, held, split, paid out in sandbox. Tests: T-027–T-035, T-070–T-077

## Phase 3 — Rider (M2): day start/end, tracking, capture, OCR, consent, duplicates (PostGIS), earnings — 📱 mostly. Tests T-009–T-016
## Phase 4 — Sales (M3): WhatsApp templates 🔌, requirement capture, price engine with role floors, bot→human hand-off. Tests T-017–T-025
## Phase 5 — Agreement→QC (M4, M6): e-stamp/eSign 🔌, token, readiness, QC clearance, variation (DEC-009), drawings. Tests T-026–T-040
## Phase 6 — Permit, supply, delivery (M7): statutory tracker, BOM, container 3-key custody, EMI 🔌. Tests T-041, T-045–T-050
## Phase 7 — Installation (M5, M15): daily safety gate, SOP sub-stages, AI + human review, pauses, ledger rules. Tests T-051–T-059, T-064–T-065
## Phase 8 — QC, licence, handover (M6, M14): Inspector gate, licence record, 3 signatures, final 10%, AMC, rescue QR (DEC-011 gated). Tests T-041–T-044, T-060, T-088–T-089, T-105–T-106
## Phase 9 — Control (M8–M11, M13): admin queue/map, owner view, analytics, ladder automation. Tests T-078–T-084
## Phase 10 — Polish & pilot: low-literacy usability (4/5 unaided), pen test, restore drill. Tests T-090–T-100

Phases 3–10 are expanded into task lists by `/phase N` the first time they are started (read §39 row + cited modules, write the checklist here, then work).
Never label anything production-ready (spec §38).
