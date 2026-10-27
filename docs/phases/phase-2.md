# Phase 2 context pack (generated; mapping PROPOSED)

Workflows: WF-08, WF-12

Read first: `python3 scripts/spec.py sec 16.2` (stage rules). Screens are read one at a time, never whole modules:
- `15.1` (modules/15.01-rider.md): preamble `spec.py sec 15.1`; screens SCR-027 via `spec.py sec SCR-nnn`
- `15.2` (modules/15.02-technician.md): preamble `spec.py sec 15.2`; screens SCR-050, SCR-053, SCR-058 via `spec.py sec SCR-nnn`
- `15.3` (modules/15.03-customer.md): preamble `spec.py sec 15.3`; screens SCR-037, SCR-038 via `spec.py sec SCR-nnn`
- `15.5` (modules/15.05-admin-owner.md): preamble `spec.py sec 15.5`; screens SCR-077, SCR-078 via `spec.py sec SCR-nnn`
- `15.7` (modules/15.07-supplier-nbfc.md): preamble `spec.py sec 15.7`; screens SCR-065, SCR-066 via `spec.py sec SCR-nnn`
- `15.9` (modules/15.09-shared-core.md): preamble `spec.py sec 15.9`; screens SCR-011 via `spec.py sec SCR-nnn`

## Requirements (24)
- AIEC-REQ-0009 [COMMISSION] Rider earns a small fixed amount at lead verification (stage 2). Main commission is pending when token is paid and paid at QC clearance (stage 7). Commission rules are sh… (S · awaiting approval D)
- AIEC-REQ-0030 [PAY_SCHEDULE] Customer schedule on a Rs 10,00,000 example: token 10,000; standard material 70% minus token = 6,90,000; custom cabin 20% = 2,00,000; handover 10% = 1,00,000; total 100%.… (S · conflicting DL)
- AIEC-REQ-0031 [ESCROW_GATE] Money gates: 70% (less token) confirmed in escrow-capable provider before dispatch (V3) versus paid at container arrival (OCT); 20% confirmed before cabin production rele… (S · conflicting DLE)
- AIEC-SEC-0011 [NO_WALLET] No unlicensed stored-value wallet. Show an earnings ledger and use an authorised payout provider. OCT's 'digital wallet' wording is preserved as a conflicting source requ… (S · conflicting L)
- AIEC-SEC-0012 [PAY_TRUTH] Payment state comes only from verified provider webhook signature or reconciliation, never a client success screen. States pending, failed, reversed, disputed, confirmed … (S · confirmed E)
- AIEC-DATA-0013 [LEDGER] Immutable double-entry ledger with separate accounts for customer, supplier, platform fee, tax and contractor payable; corrections by reversal. Daily/weekly reconciliatio… (S · confirmed)
- AIEC-REQ-0032 [EMI_NBFC] EMI via NBFC against material in GPS container: NBFC pays milestone, customer repays NBFC. Disbursal confirmed before dispatch (V3) versus against material on site (OCT).… (S · conflicting DLE)
- AIEC-REQ-0033 [PAY_METHODS] Large milestones use virtual account/RTGS/NEFT or methods the partner supports; UPI, cheque, card limits, settlement and chargeback windows verified with provider. (P · proposed E)
- AIEC-REQ-0034 [REFUND_CANCEL] Cancellation/refund by stage: before QC clearance token refunded in full if QC rejects site, else less documented costs; after production order token forfeited plus prove… (S · awaiting approval DL)
- AIEC-REQ-0035 [SUPPLIER_PAY] Supplier paid from customer payment after it clears and after the partner's chargeback window, by automatic split; who pays return trip agreed in writing. Refund after su… (S · awaiting approval DLE)
- AIEC-REQ-0036 [CASHFLOW] Cash-flow table per milestone (cash in, costs before next cash in, gap to fund) filled with real figures before pilot; no figures invented. (S · awaiting approval D)
- AIEC-REQ-0037 [TAX_RULES] GST on supply plus installation, customer TDS on milestones, TDS/GST on contractor payments, treatment of customer advance are confirmed by a CA before billing logic is f… (S · awaiting approval L)
- AIEC-REQ-0038 [PAY_DISPUTE] Customer payment dispute sets Disputed side state; already confirmed worker pay is not frozen. (S · confirmed)
- AIEC-REQ-0067 [PAID_ON_PROOF] Technician payment enters the ledger only when SOP followed with exact photo/video evidence checked by AI and, in critical cases, by Admin. Money and safety are the most … (S · confirmed)
- AIEC-REQ-0071 [CUSTOMER_RATING] Customer rating is optional; if none within 7 days the job counts as accepted; rating affects bonus and promotion only, never base pay. (S · conflicting D)
- AIEC-REQ-0072 [CONTRACTOR_CLASS] Workers are independent third-party contractors/project-based service providers with signed agreements. Store verified identity, skills, certifications, agreement version… (S · conflicting L)
- AIEC-DATA-0015 [LEDGER_BUCKETS] Earnings ledger buckets. V3: Provisional, Confirmed, Payable this weekend, Loyalty/quality bond. OCT module: Pending verification, Verified, Approved due, Weekend payout,… (S · conflicting D)
- AIEC-REQ-0073 [PAYOUT_MODEL] Worker payout model undecided: (OCT literal) 100% shown instantly, 10% of that week's earnings paid each weekend and the remaining collective amount paid out gradually at… (S · conflicting DL)
- AIEC-REQ-0074 [CONFIRMED_RULE] Earnings become Confirmed only on QC pass plus Admin approval; weekly transfer approved by Admin. OCT also lists customer satisfaction as a condition for transfer; V3 rem… (S · conflicting D)
- AIEC-REQ-0075 [NO_FINES] No cash fines. Deductions only where signed contract states them and law allows, after independent review; penalty points allowed; amounts protected by law never withheld… (S · conflicting L)
- AIEC-REQ-0076 [NO_FORFEIT] Earned amounts are never confiscated because a contractor resigns or stops accepting work. Exit and final-settlement workflow with final statement, tax documents, authori… (S · confirmed L)
- AIEC-SEC-0017 [PAYOUT_CONTROLS] Payout requests are idempotent; material overrides need two-person approval; paid status only from provider confirmation; daily/weekly reconciliation; concurrent contract… (S · confirmed E)
- AIEC-REQ-0085 [GIG_CONTRIB] Aggregator contribution of 1-2% of turnover capped at 5% of worker payouts under the Code on Social Security: verified that rate and start date were not yet notified as o… (P · proposed L)
- AIEC-REQ-0087 [BONUS_6M] Zero-defect bonus pool at 6 months (OCT prompt 1 and V3 Option B); amount and rule undefined. (S · awaiting approval D)

## Tests (47) — `python3 scripts/spec.py test N`
- Integration: 14, 27, 28, 29, 35, 70, 71, 72, 74, 75, 76, 108, 132, 133, 142, 163, 197, 221, 222, 239, 265
- API: 30, 31, 32, 47, 73, 77, 143, 147, 164, 168, 183, 198, 220, 240
- Unit: 33, 34, 102
- Review: 99, 131, 167, 173
- E2E: 181, 187, 192, 237, 254

## Decisions to check (tier 2) — `python3 scripts/spec.py dec N`
- AIEC-DEC-001: default → Payout batch disabled; the ledger only records earnings
- AIEC-DEC-002: default → No reserve; reserve bucket exists but is switched off
- AIEC-DEC-003: default → Credited to the 70% (V3 draft), pending the CA
- AIEC-DEC-004: default → Before dispatch (V3), pending written provider and NBFC confirmation
- AIEC-DEC-008: default → Floor of 1.20 on the fully loaded base; both markup and margin shown internally
- AIEC-DEC-018: default → No: rating affects bonus and promotion only
- AIEC-DEC-019: default → Before production (V3)
- AIEC-DEC-023: default → Points only
- AIEC-DEC-030: default → A placeholder cost line; no engine
