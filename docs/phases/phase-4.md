# Phase 4 context pack (generated; mapping PROPOSED)

Workflows: WF-04

Read first: `python3 scripts/spec.py sec 16.2` (stage rules). Screens are read one at a time, never whole modules:
- `15.3` (modules/15.03-customer.md): preamble `spec.py sec 15.3`; screens SCR-035 via `spec.py sec SCR-nnn`
- `15.5` (modules/15.05-admin-owner.md): preamble `spec.py sec 15.5`; screens SCR-079, SCR-083, SCR-085 via `spec.py sec SCR-nnn`
- `15.6` (modules/15.06-sales-negotiator.md): preamble `spec.py sec 15.6`; screens SCR-029, SCR-030, SCR-031, SCR-032, SCR-033, SCR-034 via `spec.py sec SCR-nnn`

## Requirements (16)
- AIEC-REQ-0015 [LEADS_TO_SALES] Verified leads auto-forward to Sales, organised on a map sorted by distance and score. (S · confirmed)
- AIEC-REQ-0016 [WA_OUTREACH] For each consented lead, send an approved WhatsApp template with site photos; log reply; template version, opt-in proof, opt-out and cost per contact stored; stop on opt-… (S · confirmed LE)
- AIEC-REQ-0017 [AUTO_CALL] Automatic call about lift requirement after response, only where channel permission and business rules allow; not every captured contact is called. Masked/recorded callin… (S · conflicting LE)
- AIEC-REQ-0018 [REQ_CAPTURE] Requirement capture: floors, stops, lift type (automatic/manual), finish (SS or powder-coated MS) plus capacity, speed, travel, machine-room/MRL/hydraulic/traction config… (S · confirmed)
- AIEC-REQ-0019 [AUTO_QUOTE] Quotation is built automatically from a rate card by floors, lift type and finish plus site factors from photos and QC (shaft height, distance, access). (S · confirmed)
- AIEC-REQ-0020 [PRICE_LADDER] With base cost B: first quote 1.60 B (160), bot concedes stepwise 150/140/130 only after a counter-offer (each may ask something back), floor 1.20 B (120) human Negotiato… (S · confirmed D)
- AIEC-REQ-0021 [NEGOTIATOR] Human Negotiator receives lead with full chat, photos and price history when asked below bot limit; may go down to floor. (S · confirmed)
- AIEC-REQ-0022 [HANDOFF_TRIGGERS] Visible human hand-off when customer asks, model uncertain, complaint, language mismatch or negotiation hits bot limit. (P · proposed)
- AIEC-SEC-0010 [BOT_LIMITS] Bot must not promise unapproved price, timeline, specification or contractual term; it obeys server-side minimums and approval thresholds. (S · confirmed)
- AIEC-DATA-0012 [RATE_CARD] Versioned rate card with effective date, approver, supplier source and expiry. Quote versions stored with reason. Quote expires after 7 days then lead goes cold. (S · confirmed)
- AIEC-REQ-0023 [FULL_COST_BASE] Base cost must include supplier, labour, QC visits, transport, container, payment fees, insurance, rider commission, AMC reserve, gig-worker contribution, contingency, wa… (S · confirmed DL)
- AIEC-REQ-0024 [BELOW_FLOOR] Below-floor price: Owner only, with reason, second approval and audit event. (S · confirmed)
- AIEC-REQ-0025 [QUOTE_DISCLOSURE] Quote states assumptions and that the final price is subject to measured spec at QC. Customer sees price history and final confirmed amount, never the hidden floor or int… (S · confirmed)
- AIEC-AUTO-0001 [COLD_FOLLOWUP] Customer silent: 3 reminders then lead goes cold and returns to rider map as revisit. Contact within 48 h of verification; quote decision within 7 days. (S · confirmed)
- AIEC-REQ-0026 [PIPELINE_REPORT] Evening pipeline report to Admin: leads, replies, quotes, wins, average discount. (S · confirmed)
- AIEC-REQ-0027 [LEARNING_LOOP] Admin sees win rate by first-quote level so 60% start can be tested against 45%/50% in some areas. (P · proposed)

## Tests (30) — `python3 scripts/spec.py test N`
- Integration: 17, 18, 19, 107, 129, 130, 161, 163, 169, 172, 228, 230, 233
- API: 20, 21, 22, 23, 24, 128, 162, 171, 223, 232, 234, 235
- Unit: 25
- E2E: 125, 194, 229, 231

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
