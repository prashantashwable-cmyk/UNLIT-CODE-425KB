# Phase 7 context pack (generated; mapping PROPOSED)

Workflows: WF-10, WF-15

Read first: `python3 scripts/spec.py sec 16.2` (stage rules). Screens are read one at a time, never whole modules:
- `15.2` (modules/15.02-technician.md): preamble `spec.py sec 15.2`; screens SCR-017, SCR-051, SCR-052, SCR-053, SCR-054, SCR-056, SCR-057 via `spec.py sec SCR-nnn`
- `15.3` (modules/15.03-customer.md): preamble `spec.py sec 15.3`; screens SCR-047 via `spec.py sec SCR-nnn`
- `15.4` (modules/15.04-qc.md): preamble `spec.py sec 15.4`; screens SCR-062 via `spec.py sec SCR-nnn`
- `15.5` (modules/15.05-admin-owner.md): preamble `spec.py sec 15.5`; screens SCR-082 via `spec.py sec SCR-nnn`
- `15.8` (modules/15.08-coordinator.md): preamble `spec.py sec 15.8`; screens SCR-067 via `spec.py sec SCR-nnn`
- `15.12` (modules/15.12-resident-rescue.md): preamble `spec.py sec 15.12`; screens SCR-087 via `spec.py sec SCR-nnn`

## Requirements (10)
- AIEC-REQ-0057 [SITE_START_14D] Technician approves site start; installation must finish within 14 days. Clock starts when the agreed readiness gate is approved (BP) versus from site start (V3); pauses … (S · conflicting DL)
- AIEC-REQ-0058 [SUBSTAGES5] Five installation sub-stages, each with own SOP, proof list and peer check: 1 site check/readiness, 2 brackets and guide rails (plumb-line video), 3 cabin/machine/roping,… (S · confirmed L)
- AIEC-REQ-0059 [SOP_VERSIONED] Each stage has a versioned SOP written by a licensed lift engineer for Pune/Maharashtra, with 20-40 second video, required evidence, tools/materials, qualified approver a… (S · confirmed L)
- AIEC-SAFE-0006 [SAFETY_GATE] Before tasks unlock each day: selfie with helmet and harness (identity evidence only) inside geofence with basement tolerance, then video and photo of scaffolding, shaft … (S · conflicting L)
- AIEC-REQ-0060 [SAFETY_PDF] Automatic daily PDF Safety Log with photos, team names and times (faces blurred in customer copy, originals under access control) emailed to builder and shown in app. It … (S · confirmed L)
- AIEC-REQ-0061 [PEER_RELAY] Before the next sub-stage starts, QC or another team (never the same team) inspects the previous work with a 3-point photo checklist; approval moves the earlier team's ea… (S · confirmed)
- AIEC-REQ-0062 [TECH_ABSENT] Technician absent 2 days: Coordinator alerted, replacement offered, earnings split by verified work from assigned list. (S · confirmed)
- AIEC-SAFE-0008 [SOS] Red SOS on every field screen: one tap shows 112 call immediately (no server wait), alerts Admin and site contact, sends GPS, freezes site work on all phones as a workflo… (S · confirmed L)
- AIEC-SAFE-0010 [INCIDENT] Incident workflow records injury/entrapment, immediate actions, witnesses, regulator/insurer notification where required, evidence preservation, root-cause corrective act… (S · confirmed L)
- AIEC-SAFE-0012 [SAFETY_CRITICAL] Safety-critical items (earthing, brakes, overspeed governor, safety gear, door interlocks, final test) always need human QC sign-off whatever AI says; qualified-signer de… (S · confirmed L)

## Tests (28) — `python3 scripts/spec.py test N`
- Unit: 51
- E2E: 52, 53, 59, 65, 185, 186, 187, 212, 215, 226, 270
- Integration: 54, 56, 64, 87, 139, 165, 190, 191, 207
- API: 55, 57, 188, 243
- Device: 58, 184, 193

## Decisions to check (tier 4) — `python3 scripts/spec.py dec N`
- AIEC-DEC-006: default → No advance; claims are recorded; return costs unassigned
- AIEC-DEC-010: default → QC for safety-critical items, peer team for others
- AIEC-DEC-011: default → The trapped-person page is not published and no response time is stated
- AIEC-DEC-013: default → V3 order; handover blocked without licence
- AIEC-DEC-020: default → Excluded
- AIEC-DEC-021: default → Video plus photo certified by a competent person; tick-only rejected
- AIEC-DEC-022: default → From site start with paused days excluded, pending the lift engineer
