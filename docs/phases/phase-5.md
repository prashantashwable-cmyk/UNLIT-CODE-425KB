# Phase 5 context pack (generated; mapping PROPOSED)

Workflows: WF-05, WF-06

Read first: `python3 scripts/spec.py sec 16.2` (stage rules). Screens are read one at a time, never whole modules:
- `15.3` (modules/15.03-customer.md): preamble `spec.py sec 15.3`; screens SCR-035, SCR-036, SCR-037, SCR-039, SCR-040, SCR-041, SCR-042, SCR-045 via `spec.py sec SCR-nnn`
- `15.4` (modules/15.04-qc.md): preamble `spec.py sec 15.4`; screens SCR-060, SCR-061 via `spec.py sec SCR-nnn`
- `15.5` (modules/15.05-admin-owner.md): preamble `spec.py sec 15.5`; screens SCR-079 via `spec.py sec SCR-nnn`
- `15.9` (modules/15.09-shared-core.md): preamble `spec.py sec 15.9`; screens SCR-011 via `spec.py sec SCR-nnn`

## Requirements (9)
- AIEC-DATA-0004 [CUST_PARTIES] Customer parties stored separately: signatory (with authority proof), payer, site representative (named per delivery with delegation proof), EMI borrower. (S · confirmed)
- AIEC-REQ-0028 [AGREEMENT] Digital agreement online after deal won: e-stamp, agreement read aloud in customer's language, Aadhaar-OTP eSign by authorised signatory and company, authority proof, agr… (S · confirmed LE)
- AIEC-REQ-0029 [TOKEN] Token of fixed Rs 10,000 paid online at agreement. Whether token is part of the 70% (credited) or additional, and refund if QC rejects site, are undecided. (S · conflicting DL)
- AIEC-REQ-0039 [VARIATION] At QC clearance, measured spec versus quoted spec: if base cost differs by more than 5% (proposed), a versioned variation quote at same multipliers is eSigned before prod… (P · proposed D)
- AIEC-REQ-0040 [READINESS_SOP] Customer receives picture-based SOP for shaft and power readiness; uploads readiness photos; reminders every 3 days; 30-day limit from agreement then re-quote or cancel u… (S · confirmed)
- AIEC-REQ-0041 [QC_CLEARANCE] QC Inspector visits for clearance within 48 h of readiness: shaft approval, numeric measurement fields with units, tolerance from engineer-approved checklist and OEM draw… (S · confirmed L)
- AIEC-REQ-0042 [QC_REJECT_SITE] If QC rejects the site, customer gets a picture list of fixes and project returns to Site readiness. (S · confirmed)
- AIEC-REQ-0043 [DRAWINGS_RELEASE] Customer receives drawings and technical details in the app only after QC clearance and the applicable commercial/legal gate. (S · confirmed)
- AIEC-REQ-0098 [CUSTOMER_VIEWS] Customer sees quotation and negotiation bot chat, agreement, payment schedule/history, EMI schedule, readiness checklist, drawings, pizza-tracker progress 0-100% with ver… (S · confirmed)

## Tests (30) — `python3 scripts/spec.py test N`
- E2E: 26, 39, 134, 151, 194, 195, 196, 200, 201, 205, 212
- Integration: 27, 28, 29, 35, 38, 76, 199
- API: 30, 31, 32, 36, 37, 40, 104, 202, 211, 213
- Unit: 33, 34

## Decisions to check (tier 3) — `python3 scripts/spec.py dec N`
- AIEC-DEC-007: default → 60 days and 10% of the main commission, only if the update adds something new
- AIEC-DEC-009: default → 5% on the full-cost baseline
- AIEC-DEC-015: default → NOC cannot be issued or used as a lever until defined
- AIEC-DEC-024: default → Slider kept; critical controls clamped
- AIEC-DEC-025: default → Permission-based only
- AIEC-DEC-026: default → Chat first; no recording until provider, notice and retention are approved
- AIEC-DEC-028: default → Earnings screen shows Amount not set yet
- AIEC-DEC-029: default → Job offers cannot show a rate until set
- AIEC-DEC-032: default → Kept separate
