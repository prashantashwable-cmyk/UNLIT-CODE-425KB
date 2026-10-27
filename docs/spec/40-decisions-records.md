### 40.1 Decision records

### AIEC-DEC-001 — Contractor payout model and weekly percentages

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-001 |
| Conflicting source statements and locations | OCT:contractors payment says 100% shown instantly, 10% real payout weekly, remainder 10% weekly; OCT:Contractor B says 10% of eligible earnings weekly then 10% of opening balance per week if legally approved; V3§7.5 Option A 10% per weekend (10 weekends) and Option B 70% first weekend plus 30% 90-day bond plus 6-month bonus |
| Business or safety impact | Worker liquidity, labour-law exposure, retention |
| Options | A literal 10% weekly; B 70/30; C pay 100% of confirmed undisputed amount weekly with separate documented bonus |
| Advantages and risks | A: strong retention but weak cash for workers and legal risk. B: faster cash but needs lawful bond basis. C: lowest legal risk, weakest lock-in |
| Recommended option | B is V3 working assumption; C is the lowest-risk option; no option is verified lawful |
| Approval needed from | Owner + labour lawyer + CA |
| Can implementation proceed before the decision? | No: payout batch stays disabled; ledger and evidence work can proceed |

### AIEC-DEC-002 — Holdback / reserve / bond lawfulness

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-002 |
| Conflicting source statements and locations | OCT:Contractor B 'legally permitted, contractually documented reserve'; V3§7.5 bond released after 90 days with no defect; BP§4.13 any reserve needs legal review |
| Business or safety impact | Possible unlawful withholding of earned pay |
| Options | No reserve; capped reserve with release date; bonus-only (earned only on top) |
| Advantages and risks | Reserve lowers churn but raises legal risk; bonus avoids withholding |
| Recommended option | Bonus-only unless lawyer approves a documented reserve |
| Approval needed from | Labour lawyer + CA |
| Can implementation proceed before the decision? | Yes for build; reserve bucket configurable but off |

### AIEC-DEC-003 — Meaning and accounting of the 10,000 token

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-003 |
| Conflicting source statements and locations | OCT: token 10k only online; V3§7.2 deducted from the 70% (6,90,000); BP§4.6 credit against 70% recommended draft but CA must confirm |
| Business or safety impact | Revenue/liability treatment, refund obligation |
| Options | Credited to 70%; additional; separate refundable deposit |
| Advantages and risks | Credited keeps total 10,00,000; additional raises total; deposit simplifies refunds |
| Recommended option | Credited to 70% (V3/BP draft) pending CA |
| Approval needed from | Owner + CA + lawyer |
| Can implementation proceed before the decision? | Yes: schedule engine takes a configured treatment |

### AIEC-DEC-004 — When the 70% is paid

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-004 |
| Conflicting source statements and locations | OCT: 70% when container reaches site, paid at delivery; V3§5 stage 10 confirmed in escrow before dispatch; EMI disbursal before dispatch (V3§7.2) vs against material on site (OCT) |
| Business or safety impact | Cash exposure, return-trip risk |
| Options | Before dispatch; at delivery before unlock; split |
| Advantages and risks | Before dispatch: no return risk, customer friction. At delivery: matches OCT, higher return risk |
| Recommended option | Before dispatch (V3), subject to provider and NBFC written confirmation, and confirmation that the provider is RBI-authorised and may hold milestone funds (R-17) |
| Approval needed from | Owner + payment provider + NBFC + lawyer |
| Can implementation proceed before the decision? | Partly: unlock/dispatch gates read configured trigger |

### AIEC-DEC-005 — Responsibility for erection permission and lift licence

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-005 |
| Conflicting source statements and locations | V3§10.2 company licence or partner contractor per job; BP§7 licence holder; lexplosion summary says contractor licence needs a valid electrical contractor licence |
| Business or safety impact | Operating without licence is a legal and safety exposure |
| Options | AIEC holds licence; partner contractor holds per job; owner applies |
| Advantages and risks | Own licence gives control but needs eligibility; partners add cost |
| Recommended option | Unresolved |
| Approval needed from | Owner + qualified lift professional + lawyer |
| Can implementation proceed before the decision? | Yes: app stores holder per project |

### AIEC-DEC-006 — Supplier advances, freight, returns, damaged material

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-006 |
| Conflicting source statements and locations | V3§7.2 who pays return trip; V3§5 PO with no advance; BP§4.8 liability per custody interval |
| Business or safety impact | Cash gap and loss allocation |
| Options | No advance; milestone advance; supplier funds returns |
| Advantages and risks | Advance reduces supplier risk but raises AIEC cash need |
| Recommended option | Unresolved |
| Approval needed from | Owner + CA + supplier agreement |
| Can implementation proceed before the decision? | Partly: PO/claim records proceed |

### AIEC-DEC-007 — Duplicate-lead window and commission base

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-007 |
| Conflicting source statements and locations | OCT: duplicate accepted as update with only 10% payment; V3 60-day window, 10% of main commission only if adds new; BP: useful update accepted under rule |
| Business or safety impact | Rider disputes, fraud |
| Options | 60 days vs other; 10% of main commission vs fixed amount |
| Advantages and risks | Window length trades rider reward against fairness |
| Recommended option | 60 days and 10% of main commission (proposed) |
| Approval needed from | Owner |
| Can implementation proceed before the decision? | Yes: values configurable |

### AIEC-DEC-008 — Margin floor, discount authority, markup vs margin

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-008 |
| Conflicting source statements and locations | OCT: 60% extra, bot up to 30%, minimum 20%, example 160/130/120; V3§7.1 ladder; BP: 120 may be 16.7% margin before omitted costs |
| Business or safety impact | Loss-making sales |
| Options | Keep markup multipliers; define floor on fully loaded margin |
| Advantages and risks | Multipliers simple but may hide costs |
| Recommended option | Floor 1.20 on fully loaded base (BP) after CA review |
| Approval needed from | Owner + CA |
| Can implementation proceed before the decision? | Yes: rate card configurable |

### AIEC-DEC-009 — Variation approval threshold

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-009 |
| Conflicting source statements and locations | V3 and BP propose 5% cost difference; not in OCT |
| Business or safety impact | Dispute over changed spec |
| Options | 5%; other percent; absolute amount |
| Advantages and risks | Low threshold creates friction |
| Recommended option | 5% on full-cost baseline (proposed) |
| Approval needed from | Owner + lift engineer |
| Can implementation proceed before the decision? | Yes: value configurable |

### AIEC-DEC-010 — Independence of QC vs installation approval

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-010 |
| Conflicting source statements and locations | OCT Prompt2 Team B inspects Team A; V3 QC or another team never same team; BP independent QC |
| Business or safety impact | Self-checking risk |
| Options | Peer team; QC only; both |
| Advantages and risks | Peer is faster; QC is stronger |
| Recommended option | QC for safety-critical, peer for others |
| Approval needed from | Owner + lift engineer |
| Can implementation proceed before the decision? | Yes |

### AIEC-DEC-011 — Emergency rescue staffing and response

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-011 |
| Conflicting source statements and locations | V3§5,§10.2; BP§7; none defines staffing |
| Business or safety impact | Life safety |
| Options | Own 24x7 line; AMC contractor; partner service |
| Advantages and risks | Own line costly; outsource needs SLA |
| Recommended option | Unresolved; never promise a time before a staffed line exists |
| Approval needed from | Owner + lift professional + insurer |
| Can implementation proceed before the decision? | Partial: QR page can ship only with a staffed number |

### AIEC-DEC-012 — PWA vs native Android and stack

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-012 |
| Conflicting source statements and locations | OCT forced install and background; V3 Flutter; MP React Native/Expo option; BP native Android for field roles |
| Business or safety impact | Tracking, camera, offline reliability |
| Options | Flutter; React Native/Expo; PWA only |
| Advantages and risks | Native needed for foreground service tracking; PWA cannot guarantee |
| Recommended option | Native Android for Rider/Technician/QC; web for other roles; framework by owner |
| Approval needed from | Owner + builder |
| Can implementation proceed before the decision? | Yes after framework choice |

### AIEC-DEC-013 — Order of inspection, licence, handover, final payment

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-013 |
| Conflicting source statements and locations | V3 licence stage 15 before handover stage 16; OCT handover then NOC; BP licence gate before handover |
| Business or safety impact | Legal lift operation |
| Options | V3 order; allow custody-only handover |
| Advantages and risks | V3 order is safer |
| Recommended option | V3 order, confirmed by lift professional |
| Approval needed from | Lift professional + lawyer |
| Can implementation proceed before the decision? | No for handover gate; yes for earlier work |

### AIEC-DEC-014 — Release 1 scope

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-014 |
| Conflicting source statements and locations | V3§11 phases; BP§8; pilot Pune only |
| Business or safety impact | Delivery risk |
| Options | Rider+Sales first; full lifecycle; subset |
| Advantages and risks | Subset reaches field test sooner |
| Recommended option | Phases in section 39 |
| Approval needed from | Owner |
| Can implementation proceed before the decision? | Yes |

### AIEC-DEC-015 — Meaning of NOC

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-015 |
| Conflicting source statements and locations | OCT: NOC given when handover complete; V3 NOC not defined |
| Business or safety impact | Withholding a document as payment lever may be unlawful |
| Options | Define document; rename; drop |
| Advantages and risks | Undefined NOC is a legal risk |
| Recommended option | Define or rename before use |
| Approval needed from | Lawyer + Owner |
| Can implementation proceed before the decision? | Partial |

### AIEC-DEC-016 — Worker classification and 'no liability' intent

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-016 |
| Conflicting source statements and locations | OCT: treat as third-party contractors so no liability; V3/BP: label does not eliminate duties |
| Business or safety impact | Misclassification |
| Options | Contractor model with reviewed terms; employment for some roles |
| Advantages and risks | Control via proof and tracking may look like employment |
| Recommended option | Review before contracts |
| Approval needed from | Labour lawyer + CA |
| Can implementation proceed before the decision? | Partial |

### AIEC-DEC-017 — Digital wallet vs ledger

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-017 |
| Conflicting source statements and locations | OCT wallet instantly 100%; V3/BP no stored-value wallet |
| Business or safety impact | RBI authorisation |
| Options | Ledger plus payout partner |
| Advantages and risks | Wallet needs authorisation |
| Recommended option | Ledger |
| Approval needed from | Lawyer + payment partner |
| Can implementation proceed before the decision? | Yes: ledger built |

### AIEC-DEC-018 — Customer satisfaction and worker pay

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-018 |
| Conflicting source statements and locations | OCT weekly payment approved by admin and customer satisfaction; V3 rating affects bonus only |
| Business or safety impact | Customers can hold pay hostage |
| Options | Rating gates base pay; bonus only |
| Advantages and risks | Bonus-only protects workers |
| Recommended option | Bonus only (V3) |
| Approval needed from | Owner + lawyer |
| Can implementation proceed before the decision? | Yes |

### AIEC-DEC-019 — Cabin 20% timing

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-019 |
| Conflicting source statements and locations | OCT: 20% at cabin delivery; V3 in escrow before cabin production |
| Business or safety impact | Custom item cannot be resold |
| Options | Before production; at delivery |
| Advantages and risks | Before production protects AIEC |
| Recommended option | Before production (V3) |
| Approval needed from | Owner + supplier + CA |
| Can implementation proceed before the decision? | Yes |

### AIEC-DEC-020 — IoT/GSM commissioning lock

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-020 |
| Conflicting source statements and locations | OCT Prompt3 kill-switch until final payment; V3 optional later only if engineer confirms; MP never disable lift |
| Business or safety impact | Passenger entrapment and legal risk |
| Options | Not built; engineer-approved design later |
| Advantages and risks | Safety rule overrides |
| Recommended option | Not in release 1 |
| Approval needed from | Lift engineer + Owner |
| Can implementation proceed before the decision? | Yes: excluded |

### AIEC-DEC-021 — Safety consent form

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-021 |
| Conflicting source statements and locations | OCT selfie video or button consent; V3 tick-only removed; BP not a waiver |
| Business or safety impact | Negligence exposure |
| Options | Video+photo certified by competent person |
| Advantages and risks | Tick is weak evidence |
| Recommended option | V3 approach |
| Approval needed from | Lift engineer + lawyer |
| Can implementation proceed before the decision? | Yes |

### AIEC-DEC-022 — 14-day clock start and length

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-022 |
| Conflicting source statements and locations | OCT within 2 weeks; V3 from site start; BP from readiness gate approval |
| Business or safety impact | Unfair penalties |
| Options | Site start; readiness approval |
| Advantages and risks | Different incentives |
| Recommended option | Define after engineer validates 14 days |
| Approval needed from | Owner + lift engineer |
| Can implementation proceed before the decision? | Yes |

### AIEC-DEC-023 — Penalties

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-023 |
| Conflicting source statements and locations | OCT Prompt2 penalty points; V3 no cash fines |
| Business or safety impact | Wage law |
| Options | Points only |
| Advantages and risks | Cash fines risk |
| Recommended option | Points only |
| Approval needed from | Labour lawyer |
| Can implementation proceed before the decision? | Yes |

### AIEC-DEC-024 — Scale slider range

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-024 |
| Conflicting source statements and locations | OCT 20%-130%; BP constrain to minimum accessible sizes |
| Business or safety impact | Unusable controls |
| Options | Keep 20-130 for non-critical; clamp critical |
| Advantages and risks | Full range shrinks controls |
| Recommended option | Clamp (section 12) |
| Approval needed from | Owner |
| Can implementation proceed before the decision? | Yes |

### AIEC-DEC-025 — Automatic marketing calls

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-025 |
| Conflicting source statements and locations | OCT automatic call after response; V3/BP consent and TRAI rules; BP do not call every contact |
| Business or safety impact | Regulatory fines |
| Options | Call only with permission |
| Advantages and risks | Auto-calling all risks complaints |
| Recommended option | Permission-based, with DLT-registered templates, recorded consent, DND scrub and calling-hours control (R-20) |
| Approval needed from | Lawyer |
| Can implementation proceed before the decision? | Yes |

### AIEC-DEC-026 — Call masking and recording

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-026 |
| Conflicting source statements and locations | OCT Prompt3 recorded calls; BP provider, retention, notice needed |
| Business or safety impact | Privacy law |
| Options | Record with notice; do not record; chat only |
| Advantages and risks | Recording aids evidence |
| Recommended option | Chat first; recording after provider and notice |
| Approval needed from | Lawyer |
| Can implementation proceed before the decision? | Partial |

### AIEC-DEC-027 — Approvals: two Admins or Owner second

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-027 |
| Conflicting source statements and locations | V3§4 and §11; BP§7 |
| Business or safety impact | Deadlock |
| Options | Two Admins; Admin+Owner/delegate |
| Advantages and risks | Two Admins costs staff |
| Recommended option | Unresolved |
| Approval needed from | Owner |
| Can implementation proceed before the decision? | Yes |

### AIEC-DEC-028 — Rider pay amounts

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-028 |
| Conflicting source statements and locations | V3§11 asks verified-lead amount and main commission; no amounts in sources |
| Business or safety impact | Budget |
| Options | Owner sets |
| Advantages and risks | Unknown |
| Recommended option | Unresolved |
| Approval needed from | Owner |
| Can implementation proceed before the decision? | Yes: configurable |

### AIEC-DEC-029 — Technician labour rate basis

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-029 |
| Conflicting source statements and locations | V3§11 per lift vs per sub-stage by level |
| Business or safety impact | Cost model |
| Options | Per lift; per sub-stage |
| Advantages and risks | Sub-stage aligns with proof |
| Recommended option | Unresolved |
| Approval needed from | Owner |
| Can implementation proceed before the decision? | Yes |

### AIEC-DEC-030 — Gig worker contribution applicability

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-030 |
| Conflicting source statements and locations | V3§10.2 1-2% of turnover capped 5%; research (re-checked 25 Oct 2026): rate and start date still not notified, but aggregator registration and daily worker-reporting duties are reported as already in force, so applicability to AIEC matters now |
| Business or safety impact | Pricing and compliance |
| Options | Include reserve in base cost; wait |
| Advantages and risks | Reserve early avoids repricing |
| Recommended option | Include placeholder line in cost base |
| Approval needed from | CA + labour lawyer |
| Can implementation proceed before the decision? | Yes |

### AIEC-DEC-031 — Maharashtra amendment status

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-031 |
| Conflicting source statements and locations | V3§10.2 passed March 2026 effective on notified date; research found bill and legislature publications but no commencement notice |
| Business or safety impact | Titles, authority names (Superintending Engineer) and process may change |
| Options | Wait for notification; build configurable authority names |
| Advantages and risks | Wrong terms in forms |
| Recommended option | Verify at go-live |
| Approval needed from | Lawyer + lift professional |
| Can implementation proceed before the decision? | Yes |

### AIEC-DEC-032 — Level naming: career ladder vs gamification tiers

| Field | Detail |
|---|---|
| Decision ID | AIEC-DEC-032 |
| Conflicting source statements and locations | OCT trainee to technician to QC; OCT/V3 Bronze to Platinum badges |
| Business or safety impact | Two systems with similar names |
| Options | Separate ladder (career) from tiers (reward) |
| Advantages and risks | Single system simpler |
| Recommended option | Keep separate |
| Approval needed from | Owner |
| Can implementation proceed before the decision? | Yes |
