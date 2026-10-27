## 16. Workflow state machines and transition rules

### 16.1 Workflow list (18)

| WF | Workflow | Normal flow | Failure / exception flow |
|---|---|---|---|
| WF-01 | Access, onboarding, settings | OTP → face/PIN → wizard → Today | Lost phone → human-reviewed recovery; permission denied → guided help |
| WF-02 | Rider day and lead capture | Start day → ride → capture → confirm → End day | Camera/GPS denied → cannot capture proof lead; save draft note and ask Coordinator; speed too high → refuse |
| WF-03 | Lead verification and duplicates | AI check + geofence → verified | Drift → manual review; duplicate → attach update |
| WF-04 | Sales, quote, negotiation | Message → reply → requirement → quote → ladder → accept | Opt-out/no consent → human task; below limit → Negotiator → Owner |
| WF-05 | Agreement and token | Read aloud → e-stamp → eSign → token | Provider failure → retry/human fallback; authority missing → blocked |
| WF-06 | Readiness, QC clearance, variation | Readiness → QC → variation check → drawings | QC reject → fix list; >threshold → signed variation |
| WF-07 | Permit and production | Permit filed → PO accepted | Supplier delay → exception; permit missing → PO blocked |
| WF-08 | Payment, escrow, EMI | Milestone confirmed by provider/NBFC | Pending/failed/duplicate callback; dispute → Disputed side state |
| WF-09 | Dispatch, delivery, custody | Pack → seal → deliver → 3 keys → custody sign | Unpaid at door → return; lock offline → offline code |
| WF-10 | Installation and safety gate | Daily gate → SOP steps → peer check | Red hazard → freeze; AI reject → human review; pause with proof |
| WF-11 | QC, inspection, licence, handover | QC → Inspector → licence → sign → final 10% → AMC | Inspector rejects → fix list; refuse final 10% → dispute |
| WF-12 | Earnings and payout | Proof → provisional → QC+Admin → confirmed → cycle → provider-paid | Failed/reversed transfer; dispute isolates amount |
| WF-13 | Ladder, trust, appeals | Metrics → proposal → Admin confirm | Allegation → review; appeal SLA |
| WF-14 | AMC, service, rescue | Handover → AMC profile → tickets | Trapped → human rescue; repeat fault → root cause |
| WF-15 | SOS and incident | SOS → 112 → freeze → form → close | Delivery failure → call fallback; insurer/regulator tasks |
| WF-16 | Evidence capture and sync | Capture → stamp → queue → upload → checks | Conflict → keep both and review; never discard |
| WF-17 | Admin exceptions, approvals, governance | Queue → decide → audit | Approver absent → backup |
| WF-18 | Chat, notifications | Event → outbox → channel → receipt | Push fails → fallback; quiet hours defer non-emergency |

### 16.2 Transition rules for the 16 stages

| # | Stage | Owner | Gate to move on (proof) | Money event | Time limit |
|---|---|---|---|---|---|
| 1 | Lead captured | Rider | ≥3 in-app stamped photos, number confirmed, consent recorded | Rider verified-lead amount after stage 2 (amount undefined) | Same day |
| 2 | Lead verified | System, then Sales | Not duplicate (or attached), AI check passed, geofence OK or manual review | — | 24 h |
| 3 | Contacted | Sales bot | Consent present, template sent, reply logged, requirement captured | — | 48 h |
| 4 | Quoted/negotiated | Bot → Negotiator | Price ≥ role floor accepted; quote subject to measured spec | — | 7 days then cold |
| 5 | Agreement and token | Customer signatory | e-stamp, eSign, authority proof, token confirmed | Token received; commission pending | 3 days |
| 6 | Site readiness | Customer | Readiness photos per SOP | — | 30 days |
| 7 | QC clearance + variation check | QC | Measurements verified; variation signed if >threshold; drawings released | Main rider commission paid | 48 h after readiness |
| 8 | Permit applied | Admin (licensed contractor) | Erection permission filed; number saved | — | 7 days |
| 9 | Production order | Supplier | PO accepted on confirmed spec + variation; permit number | PO issued | As agreed |
| 10 | Dispatch | Supplier | Funds gate satisfied (DEC-004); packed against BOM; sealed | 70% held | — |
| 11 | Container delivery | Rep + Technician + Admin | 3 keys + CCTV; BOM check; custody signed | Escrow released to company; supplier paid its standard-material share by split (provider terms ⚠️) | Same day else return |
| 12 | Cabin delivery | Customer rep | 20% gate (DEC-019); delivered; signed | 20% released | Same day |
| 13 | Installation | Technician team | Daily safety gate; every SOP step proved; peer/QC check | Provisional earnings | 14 days (DEC-022) |
| 14 | QC and Inspector | QC, Electrical Inspector | QC pass; safety-critical items signed by qualified human; Inspector passed | Earnings → Confirmed (with Admin approval) | QC 72 h |
| 15 | Licence | Admin | Licence number, holder, renewal date stored | — | 30 days |
| 16 | Handover | Rep + Technician + QC | Three eSignatures; final 10% confirmed; NOC per definition; AMC and QR | 10% in | Same visit |

*Time limits are source proposals (V3) pending lift-engineer validation.*

### 16.3 Side states and exits

| Side state | Entered by | Exit | Effect |
|---|---|---|---|
| On hold | Admin with proof (customer/supplier/weather/permit/defect) | Admin resumes; clock excludes held days | Worker penalties suspended |
| Disputed | Admin on payment or quality dispute | Admin resolves with reason | Confirmed worker pay **not** frozen |
| Cancelled | Customer/Admin per cancellation table (section 21.4) | Final | Refund engine runs |
| Lost | 3 reminders unanswered or customer declines | Revisit capture re-opens | Rider revisit rules apply |

**Illegal transitions** (jump, skip, backward without reason) are rejected by the server (T-098). Moving backward needs a reason and creates an Issue.
