# Phase 8 context pack (generated; mapping PROPOSED)

Workflows: WF-11, WF-14

Read first: `python3 scripts/spec.py sec 16.2` (stage rules). Screens are read one at a time, never whole modules:
- `15.3` (modules/15.03-customer.md): preamble `spec.py sec 15.3`; screens SCR-046, SCR-048, SCR-049 via `spec.py sec SCR-nnn`
- `15.4` (modules/15.04-qc.md): preamble `spec.py sec 15.4`; screens SCR-059, SCR-062 via `spec.py sec SCR-nnn`
- `15.5` (modules/15.05-admin-owner.md): preamble `spec.py sec 15.5`; screens SCR-080 via `spec.py sec SCR-nnn`
- `15.12` (modules/15.12-resident-rescue.md): preamble `spec.py sec 15.12`; screens SCR-086, SCR-087 via `spec.py sec SCR-nnn`

## Requirements (10)
- AIEC-REQ-0045 [LICENCE_GATE] Licence number, holder and renewal date saved; licence gate comes before handover, final payment and NOC (V3); OCT lists handover then NOC without a licence step. Handove… (S · conflicting DL)
- AIEC-REQ-0047 [NOC_DEF] NOC must be defined (document, issuer, legal basis) or renamed before it is used as a payment lever. Customer refusing the final 10%: dispute thread, NOC withheld per app… (S · awaiting approval DL)
- AIEC-SAFE-0009 [ENTRAPMENT] Cabin QR 'person trapped' button bypasses bots and rings a human rescue line 24x7 with escalation if unanswered and emergency-service handoff. Who staffs it and response … (S · awaiting approval DL)
- AIEC-SAFE-0011 [NO_REMOTE_DISABLE] Software never remotely disables an operating lift, defeats a safety circuit or traps passengers. OCT's GSM/IoT kill-switch lock is therefore not built in release 1; only… (S · conflicting L)
- AIEC-REQ-0068 [SURPRISE_QC] After installation a surprise QC with strong evidence is scheduled by the system and revealed to QC only on the day; failure creates rework task without pay for rework, p… (S · confirmed)
- AIEC-REQ-0069 [INSPECTOR_GATE] QC pass plus Electrical Inspector inspection (wait tracked separately from company SLA) must complete before licence; Inspector rejection attaches fix list and keeps lice… (S · confirmed L)
- AIEC-REQ-0070 [HANDOVER_SIGN] Handover requires customer representative, installation Technician and QC Inspector present; three eSignatures; final 10% paid; optional satisfaction rating; NOC per defi… (S · confirmed L)
- AIEC-REQ-0099 [AMC_FLIP] After required handover and licence gates, project converts to an AMC profile with contract dates, schedule, QR code in the cabin, tickets, renewal reminders (licence ren… (S · confirmed)
- AIEC-REQ-0100 [SERVICE_TICKET] QR intake and complaint bot/voice note create tickets with severity: trapped person, unsafe operation, breakdown, repeat fault, routine; track acknowledgement, dispatch, … (S · confirmed)
- AIEC-SEC-0018 [QR_NO_PII] Cabin QR resolves to a controlled Lift ID without exposing customer personal data and shows site identifier plus direct human rescue route with accessible text. (S · confirmed)

## Tests (21) — `python3 scripts/spec.py test N`
- API: 41, 43, 44, 88, 105, 211, 214
- E2E: 42, 60, 106, 206, 208, 209, 215, 268, 270
- Review: 61, 167
- Integration: 89, 166, 269

## Decisions to check (tier 4) — `python3 scripts/spec.py dec N`
- AIEC-DEC-006: default → No advance; claims are recorded; return costs unassigned
- AIEC-DEC-010: default → QC for safety-critical items, peer team for others
- AIEC-DEC-011: default → The trapped-person page is not published and no response time is stated
- AIEC-DEC-013: default → V3 order; handover blocked without licence
- AIEC-DEC-020: default → Excluded
- AIEC-DEC-021: default → Video plus photo certified by a competent person; tick-only rejected
- AIEC-DEC-022: default → From site start with paused days excluded, pending the lift engineer
