## 43. Coverage audit and remaining gaps

All figures below were **computed by script from the registers in this document** when it was generated.

| Metric | Value |
|---|---:|
| Source files successfully read completely | 3 of 3 |
| Source references recorded (distinct file+section/topic pointers to BP, V3, OCT; **not** a count of sentences) | 378 (BP 119, V3 159, OCT 100) |
| Unique consolidated requirements | 180 |
| Duplicate source references merged (references minus one per requirement) | 200 |
| Requirements supported by 1 / 2 / 3 source files | 40 / 79 / 59 |
| Requirement categories | AUTO 1, DATA 15, REQ 113, SAFE 12, SEC 20, UX 15, VIS 4 |
| Requirement status | confirmed 129, proposed 17, conflicting 20, awaiting approval 14 |
| Conflicting requirements | 20 |
| Owner/professional decisions outstanding (all open) | 32 |
| External sources cited and retrieved (not UNVERIFIED) | 17 |
| Research entries marked UNVERIFIED / not performed | 3 |
| Screens specified | 87 (field-level detail: 87) |
| Workflows specified | 18 (WF-01–WF-18) |
| Automation rules specified | 32 |
| Acceptance tests defined (none run) | 272 — API 67, Device 20, E2E 85, Field 1, Integration 69, Review 13, Security 2, Unit 8, Visual 7 |
| Requirements flagged legal/safety/accounting review (L) | 47 |
| Requirements flagged external-integration dependency (E) | 19 |
| Requirements flagged owner decision (D) | 39 |
| Requirements needing legal/safety/accounting **or** provider review (L or E) | 58 |
| Requirements with no linked acceptance test | 0 |
| Requirements with no linked screen (cross-cutting; carried by templates/modules) | 51 |
| BP 66-point items mapped / V3 audit-fix items mapped / OCT items mapped | 66 / 23 / 35 |
| Requirements not referenced by any coverage map | 46 |
| Contrast pairs computed / passing | 21 / 21 |

### 43.1 Coverage map: Blueprint 66-point checklist

| Item | Source point | Requirement IDs |
|---|---|---|
| BP-01 | Reconstruct brain dump for low-literacy use | AIEC-UX-0005, AIEC-UX-0004, AIEC-UX-0007 |
| BP-02 | App acts as manager and assistant | AIEC-REQ-0108, AIEC-UX-0006, AIEC-REQ-0090 |
| BP-03 | Fresh branch and staged build | AIEC-REQ-0107 |
| BP-04 | Seamless end-to-end workflow | AIEC-DATA-0002, AIEC-DATA-0008, AIEC-REQ-0112 |
| BP-05 | Internet/GitHub research | AIEC-REQ-0107, AIEC-SEC-0019 |
| BP-06 | Ask until key decisions clear, push back | AIEC-REQ-0107, AIEC-REQ-0106 |
| BP-07 | Role-based login/UI | AIEC-UX-0001, AIEC-SEC-0001, AIEC-SEC-0005 |
| BP-08 | Find/fill missing data | AIEC-REQ-0108, AIEC-UX-0003 |
| BP-09 | Single project record and enforceable permissions | AIEC-DATA-0002, AIEC-SEC-0004 |
| BP-10 | Asset-light worker ladder and trust | AIEC-REQ-0077, AIEC-REQ-0079, AIEC-REQ-0072 |
| BP-11 | Worker honesty strategy | AIEC-REQ-0086, AIEC-REQ-0067, AIEC-REQ-0061 |
| BP-12 | Three layers deeper | AIEC-REQ-0109, AIEC-REQ-0110 |
| BP-13 | Human in the loop | AIEC-REQ-0063, AIEC-SAFE-0012, AIEC-REQ-0092 |
| BP-14 | Lead generation and sports-bike icon | AIEC-REQ-0004, AIEC-REQ-0003 |
| BP-15 | Daily routines per role | AIEC-REQ-0004, AIEC-REQ-0026, AIEC-SAFE-0006, AIEC-REQ-0095, AIEC-REQ-0094 |
| BP-16 | Rider finds ready shafts | AIEC-REQ-0003 |
| BP-17 | GPS photos and contact number | AIEC-REQ-0003, AIEC-DATA-0014, AIEC-REQ-0005 |
| BP-18 | Automatic address and safe hands-free operation | AIEC-REQ-0006, AIEC-SAFE-0003 |
| BP-19 | Rider route/area map and suggested leads | AIEC-REQ-0007, AIEC-REQ-0008 |
| BP-20 | Tap map photo for site detail | AIEC-REQ-0007, AIEC-UX-0012 |
| BP-21 | Commission and leaderboard | AIEC-REQ-0009, AIEC-REQ-0082 |
| BP-22 | Leads auto-forward to Sales | AIEC-REQ-0015, AIEC-REQ-0014 |
| BP-23 | Map-organised leads and WhatsApp photos | AIEC-REQ-0015, AIEC-REQ-0016 |
| BP-24 | Response tracking and calls | AIEC-REQ-0016, AIEC-REQ-0017 |
| BP-25 | Auto quote by floors/type/finish | AIEC-REQ-0018, AIEC-REQ-0019 |
| BP-26 | 160/150/140/130 ladder and 120 floor | AIEC-REQ-0020, AIEC-REQ-0024 |
| BP-27 | Digital agreement and Rs 10,000 token | AIEC-REQ-0028, AIEC-REQ-0029 |
| BP-28 | Customer shaft/power SOP | AIEC-REQ-0040 |
| BP-29 | QC measurements and drawing release | AIEC-REQ-0041, AIEC-REQ-0043 |
| BP-30 | Supplier container dispatch | AIEC-REQ-0048, AIEC-REQ-0051 |
| BP-31 | NBFC/EMI and three-key lock | AIEC-REQ-0032, AIEC-SAFE-0005 |
| BP-32 | 70/20/10, return flow, final NOC | AIEC-REQ-0030, AIEC-REQ-0031, AIEC-REQ-0053, AIEC-REQ-0047 |
| BP-33 | Material custody signatures | AIEC-REQ-0052 |
| BP-34 | CCTV and container lock | AIEC-SEC-0013, AIEC-SAFE-0005 |
| BP-35 | Technician starts 14-day clock | AIEC-REQ-0057 |
| BP-36 | Strict SOP and evidence-driven earnings | AIEC-REQ-0059, AIEC-REQ-0067 |
| BP-37 | Pune/Maharashtra safety rules | AIEC-REQ-0059, AIEC-REQ-0044 |
| BP-38 | Surprise QC and weekly payouts | AIEC-REQ-0068, AIEC-REQ-0073 |
| BP-39 | Final handover signatures | AIEC-REQ-0070 |
| BP-40 | Technician map/progress/money/leaderboard | AIEC-REQ-0098, AIEC-DATA-0015, AIEC-REQ-0082 |
| BP-41 | Customer quote/chat/payment/EMI/progress/AMC | AIEC-REQ-0098 |
| BP-42 | New-worker aggregator | AIEC-REQ-0084, AIEC-REQ-0083 |
| BP-43 | Admin map and analytics | AIEC-REQ-0091, AIEC-REQ-0093 |
| BP-44 | Owner growth dashboard | AIEC-REQ-0094 |
| BP-45 | Duplicate update at 10% | AIEC-REQ-0010 |
| BP-46 | Multi-photo camera, no gallery proof, stamped evidence | AIEC-SEC-0014, AIEC-DATA-0014 |
| BP-47 | Themes and visual polish | AIEC-VIS-0002, AIEC-VIS-0004 |
| BP-48 | Role-by-role UX improvements | AIEC-REQ-0107, AIEC-REQ-0104 |
| BP-49 | Marathi/Hindi toggle | AIEC-UX-0010 |
| BP-50 | Safety log/PDF | AIEC-REQ-0060, AIEC-SAFE-0006 |
| BP-51 | Chat history and approval evidence | AIEC-REQ-0096 |
| BP-52 | Contractor model, weekly 10%, loyalty | AIEC-REQ-0073, AIEC-REQ-0076 |
| BP-53 | Contractor classification | AIEC-REQ-0072 |
| BP-54 | Weekly earnings ledger | AIEC-DATA-0015, AIEC-DATA-0013 |
| BP-55 | XP, levels, badges, appeals | AIEC-REQ-0082, AIEC-REQ-0081 |
| BP-56 | Loyalty without coercion/exit | AIEC-REQ-0076, AIEC-REQ-0075 |
| BP-57 | Backend financial rules, audit, no self-approval | AIEC-SEC-0012, AIEC-SEC-0003, AIEC-SEC-0006 |
| BP-58 | Acceptance tests | AIEC-REQ-0105, AIEC-REQ-0104 |
| BP-59 | Tap names/site IDs/cards | AIEC-UX-0012 |
| BP-60 | Find bugs and workflow gaps | AIEC-REQ-0107, AIEC-REQ-0112 |
| BP-61 | Full screen, install prompt, adaptive sizing | AIEC-REQ-0002, AIEC-VIS-0003, AIEC-UX-0011 |
| BP-62 | Notification sounds and haptics | AIEC-UX-0009, AIEC-REQ-0097 |
| BP-63 | Review-and-polish pass | AIEC-REQ-0107 |
| BP-64 | Automated onboarding/escalation and star counts | AIEC-REQ-0083, AIEC-REQ-0078 |
| BP-65 | Forced install and background behaviour | AIEC-REQ-0002, AIEC-SAFE-0001 |
| BP-66 | Pasted prompts: zero typing, relay, offline, BOM, call masking, IoT, safety log, AMC QR | AIEC-UX-0004, AIEC-REQ-0061, AIEC-REQ-0065, AIEC-REQ-0050, AIEC-SEC-0007, AIEC-SAFE-0011, AIEC-REQ-0060, AIEC-REQ-0099 |

### 43.2 Coverage map: V3 audit-fix table (§14)

| Item | V3 fix | Requirement IDs |
|---|---|---|
| V3F-01 | F-01 Handover/NOC before licence | AIEC-REQ-0045, AIEC-REQ-0070 |
| V3F-02 | F-02 Permit before drawings | AIEC-REQ-0044, AIEC-REQ-0043 |
| V3F-03 | F-03 SOS and entrapment flow | AIEC-SAFE-0008, AIEC-SAFE-0009 |
| V3F-04 | F-04 Worker pay tied to customer rating | AIEC-REQ-0071, AIEC-REQ-0074 |
| V3F-05 | F-05 Variation and cancellation rules | AIEC-REQ-0039, AIEC-REQ-0034 |
| V3F-06 | F-06 Cash-flow model, escrow before dispatch | AIEC-REQ-0036, AIEC-REQ-0031, AIEC-REQ-0033 |
| V3F-07 | F-07/F-08 Matrix roles and Owner scope | AIEC-SEC-0005, AIEC-REQ-0094 |
| V3F-08 | F-09 Single Admin deadlock | AIEC-SEC-0006, AIEC-SAFE-0002 |
| V3F-09 | F-10 Peer relay and sub-stage 1 | AIEC-REQ-0061, AIEC-REQ-0058 |
| V3F-10 | F-11 Safety self-certification and PDF privacy | AIEC-SAFE-0006, AIEC-REQ-0060 |
| V3F-11 | F-12 Multi-tower and duplicate gaps | AIEC-DATA-0003, AIEC-REQ-0010 |
| V3F-12 | F-13 Rider sees customer phone | AIEC-SEC-0007 |
| V3F-13 | F-14 Customer parties and push reliability | AIEC-DATA-0004, AIEC-REQ-0103 |
| V3F-14 | F-15 QC competence and licence documents | AIEC-SAFE-0012, AIEC-REQ-0046 |
| V3F-15 | F-16 Consent validity | AIEC-REQ-0012 |
| V3F-16 | F-17 Access vs bond period | AIEC-SEC-0008 |
| V3F-17 | F-18 Audit vs DPDP erasure | AIEC-DATA-0011, AIEC-SEC-0020 |
| V3F-18 | F-19/F-20 Missing states, readiness deadline | AIEC-DATA-0007, AIEC-REQ-0040 |
| V3F-19 | F-21 Build order dependencies | AIEC-REQ-0106, AIEC-REQ-0102 |
| V3F-20 | F-22/F-30 False rejects and cold start | AIEC-REQ-0064, AIEC-REQ-0063, AIEC-REQ-0011 |
| V3F-21 | F-23 Fines and Option A bond | AIEC-REQ-0075, AIEC-REQ-0073 |
| V3F-22 | F-25..F-34 Language, custody, timelines, thresholds, NOC | AIEC-UX-0010, AIEC-REQ-0052, AIEC-REQ-0057, AIEC-REQ-0039, AIEC-REQ-0047 |
| V3F-23 | F-35..F-41 Gamification, rider cover, UX conflicts, trust overlap | AIEC-REQ-0082, AIEC-SAFE-0004, AIEC-UX-0011, AIEC-REQ-0079 |

### 43.3 Coverage map: OCT_FILE.TXT items

| Item | OCT content | Requirement IDs |
|---|---|---|
| OCT-01 | Rider sees map photos, travel, area covered | AIEC-REQ-0007 |
| OCT-02 | Lead pricing 60% margin bot negotiation to 30% then manual to min 20% | AIEC-REQ-0020, AIEC-REQ-0021 |
| OCT-03 | Low entry barrier token 10k | AIEC-REQ-0029 |
| OCT-04 | EMI facility with GPS/digital lock container | AIEC-REQ-0032, AIEC-SAFE-0005 |
| OCT-05 | If not paid material returned; win-win zero risk | AIEC-REQ-0053, AIEC-REQ-0031 |
| OCT-06 | Remaining 10% at handover then NOC | AIEC-REQ-0070, AIEC-REQ-0047 |
| OCT-07 | Digital lock opens only with customer+technician+admin with CCTV | AIEC-SAFE-0005, AIEC-SEC-0013 |
| OCT-08 | Technician site approval start and complete in 2 weeks | AIEC-REQ-0057 |
| OCT-09 | Payments only when SOP followed, AI + admin critical | AIEC-REQ-0067 |
| OCT-10 | Technician bank payment weekly after QC and admin approval | AIEC-REQ-0073, AIEC-REQ-0074 |
| OCT-11 | Handover signatures of customer, technician, QC | AIEC-REQ-0070 |
| OCT-12 | Customer sees quote, bot chat, payment, EMI, progress, complaint bot, AMC | AIEC-REQ-0098, AIEC-REQ-0100 |
| OCT-13 | Admin sees and controls all roles on map with filters | AIEC-REQ-0091, AIEC-REQ-0090 |
| OCT-14 | Owner page for business development | AIEC-REQ-0094 |
| OCT-15 | Camera only, multiple photos, no file manager, stamp | AIEC-SEC-0014, AIEC-DATA-0014 |
| OCT-16 | Themes iOS 2026 white/coloured | AIEC-VIS-0002 |
| OCT-17 | Legal liability safety indemnity log | AIEC-SAFE-0006, AIEC-REQ-0060 |
| OCT-18 | Chat tab for approvals rather than calls | AIEC-REQ-0096 |
| OCT-19 | Contractor module A classification | AIEC-REQ-0072 |
| OCT-20 | Contractor module B weekly earnings ledger | AIEC-DATA-0015, AIEC-REQ-0073 |
| OCT-21 | Contractor module C gamification | AIEC-REQ-0082, AIEC-REQ-0081 |
| OCT-22 | Contractor module D loyalty without coercion | AIEC-REQ-0076 |
| OCT-23 | Contractor module E security and approval | AIEC-SEC-0017, AIEC-SEC-0006, AIEC-SEC-0003 |
| OCT-24 | Contractor module F acceptance tests | AIEC-REQ-0105, AIEC-SEC-0017 |
| OCT-25 | Tap name/site id/card for information | AIEC-UX-0012 |
| OCT-26 | Full screen start, download notification, adaptive, 20-130 slider | AIEC-REQ-0002, AIEC-VIS-0003, AIEC-UX-0011 |
| OCT-27 | Notifications premium sound and haptics | AIEC-UX-0009 |
| OCT-28 | Forced install and background | AIEC-REQ-0002, AIEC-SAFE-0001 |
| OCT-29 | Prompt 1 four dashboards, safety gate, 5-stage line, live media, escrow wallet | AIEC-REQ-0058, AIEC-SAFE-0006, AIEC-SEC-0014, AIEC-REQ-0098, AIEC-REQ-0055, AIEC-REQ-0091 |
| OCT-30 | Prompt 2 relay, offline sync, BOM guard | AIEC-REQ-0061, AIEC-REQ-0065, AIEC-REQ-0050 |
| OCT-31 | Prompt 3 call masking, IoT kill switch, safety log, AMC flip | AIEC-SEC-0007, AIEC-SAFE-0011, AIEC-REQ-0060, AIEC-REQ-0099 |
| OCT-32 | Marathi question: worker honesty strategy | AIEC-REQ-0086 |
| OCT-33 | Find gaps and bugs, focus workflow | AIEC-REQ-0112, AIEC-REQ-0107 |
| OCT-34 | Stars with review count | AIEC-REQ-0078 |
| OCT-35 | Automatic onboarding escalation to high level | AIEC-REQ-0083 |

### 43.4 Remaining gaps (honest list)

1. Requirements not listed in the three coverage maps (they still carry source references in the matrix): DEMO, PERM_WIZARD, ACCOUNT_RECOVERY, CONSENT_REC, COLOUR_RULES, UNDO10, FIVE_TABS, A11Y, APPEND_ONLY, EVENT_FACTS, PARALLEL_TRACKS, OFFLINE_QUEUE, OVERRIDE_LOUD, LEAD_STATUS_VIEW, LEAD_METRICS, HANDOFF_TRIGGERS, BOT_LIMITS, RATE_CARD, FULL_COST_BASE, QUOTE_DISCLOSURE, COLD_FOLLOWUP, LEARNING_LOOP, NO_WALLET, SUPPLIER_PAY, TAX_RULES, PAY_DISPUTE, QC_REJECT_SITE, SUPPLIER_ONBOARD, MATERIAL_CLAIM, CABIN_DELIVERY, TECH_ABSENT, TRAINEE_RULES, INCIDENT, EVID_CHECKS, EVID_ACCESS, VIDEO10, INSPECTOR_GATE, DEMOTION, GIG_CONTRIB, BONUS_6M, TRAINING, INSURANCE, QR_NO_PII, PWA_NATIVE, PERF_TARGETS, GIG_REGISTRATION.
2. **No application repository was supplied**; existing code, architecture and data could not be inspected. Section 29 is therefore a recommendation, not a migration plan.
3. **India Code URL could not be fetched** (robots policy). The 2017 Act was read via the PRS copy; the status and commencement of the 2026 Amendment, the Rules, and the current Bombay Lift Rules text are unresolved (DEC-031).
4. **Research still not performed** (R-16): Material Design 3 site, OWASP web Top 10 and MASVS text, PostGIS, Flutter vs React Native/Expo specifics, PWA background sync, push, maps, e-sign/e-stamp, NBFC, container-lock vendors, hosting, BIS current editions, practitioner forums. Related requirements are tagged PROPOSED or UNVERIFIED. Several verified items rest on secondary summaries (R-05, R-06, R-11, R-19, R-20).
5. **Field-level specification now exists for all 87 of 87 screens** (sections 15.1 to 15.12; SCR-017 is in 15.2). Remaining design work: wireframes are drawn for only 20 representative panels, so a designer must still produce wireframes and visual mock-ups for the others from this text; Marathi and Hindi message drafts need native-speaker review and the full string catalogue is incomplete; the exact response limits, thresholds and amounts marked OWNER DECISION are not set.
6. **Per-requirement validation/permission/automation/failure columns** are carried by module, workflow, automation, failure and test sections rather than as separate cells in every matrix row; rows carry requirement-specific numbers and rules. A row-level expansion should be generated if the build agent needs it.
7. **Source reference granularity:** OCT_FILE.TXT has no numbered sections; its references are by topic heading. No line numbers are cited.
8. **Amounts not defined in the sources and not invented:** rider verified-lead amount and main commission, technician rates by level, 6-month bonus pool, SLA numerics (Coordinator review time, appeal response, Owner decision limit), rescue response time, latency/uptime targets, RPO/RTO, retention periods.
9. **Roles added by inference** (Senior Technician, Rescue responder, Resident, Backup approver) need owner confirmation; their permission rows inherit the narrowest applicable role.
10. **All numeric thresholds** (60-day window, 5% variation, trust weights, ladder cut-offs, 14 days, 72 h QC) are source *proposals* and must be validated by the pilot and the lift engineer.
11. **Test status:** no test was run; the catalogue is a plan.
12. **Appendix B (SQL) has not been executed or syntax-checked**; it is a design sketch of 20 core tables. Appendix C holds 44 messages (Rider, Technician, Customer and the messages quoted for other roles) in English, Marathi and Hindi, all drafts needing native-speaker review; messages not quoted in the specs, and Marathi/Hindi voice scripts, are not yet written.
13. **Counts method:** the statistics above come from script parsing of the registers in this document; they measure internal consistency and traceability, not completeness of the real-world requirement set.

### 43.5 Consistency review log (second-pass checks)

| Check | Method | Result |
|---|---|---|
| Cross-references (screens, automations, decisions, tests, research, workflows) | Script scanned the whole assembled document and tested every ID against its register | 87 screen IDs, 32 automation IDs, 18 workflow IDs, all cited decision, test and research IDs resolve; 0 dangling |
| Requirement-key mentions in prose | Script compared every upper-case key token with the register | All valid; the only other tokens are ER-diagram entity names and one error-code example |
| Stage table (16.2) vs V3 §5 stage table | Row-by-row manual comparison, including time limits (24 h, 48 h, 7 days, 3 days, 30 days, 14 days, 72 h) | 15 of 16 rows matched; stage 11 money wording refined to V3's escrow-release and supplier-split wording |
| Permission matrix (section 8) vs V3 §4 matrix | Row-by-row comparison of 15 rows × 12 roles | Matched |
| OCT numeric claims (60% extra, bot to 30%, minimum 20%, 160/130 example, ₹10,000 token, 70% at container, 20% cabin) | Searched the source text | Confirmed present; 120 floor and ladder steps 150/140 come from V3/BP |
| Test ID format | Script | Defect found (3-digit vs 4-digit IDs); fixed to 4 digits everywhere |
| Screen coverage | Script comparing the inventory with the field-level sections | Defect found (SCR-083 missing); fixed |
| Stray reference | Manual | A chat-spec row cited a test number that belonged to another screen; fixed |
| Section 24 payout alternatives vs OCT wording | Re-read OCT lines on weekly payment and the contractor module | Matched (10% weekly of the week's earnings, 90% outstanding, instalments at 10% of opening balance); the OCT aim of 3-month loyalty added to PAYOUT_MODEL |
| Section 5/6 legal claims re-checked against sources (second pass) | Re-searched PRS Act text and 2026 Bill, DPDP timeline across five sources | Act definition of approved contractor and licensing confirmed; DPDP dates confirmed; **three corrections made**: Amendment content (Superintending Engineer, enactment unconfirmed), SPDI status marked disputed, licence renewal period marked inconsistent in secondary sources |
| Gig-worker rules re-checked against six sources | Re-searched contribution status and aggregator duties | Contribution rate/start still unnotified (confirmed); **new finding**: registration and daily worker-reporting duties are reported as already in force, added as GIG_REGISTRATION and tied to DEC-030 |
| Razorpay Route hold/release claim re-checked | Re-read the transfer and modify-settlement-hold documentation | Confirmed: on_hold true/false, optional on_hold_until, INR only, captured payments only; not described as escrow (spec wording unchanged) |
| WhatsApp window and pricing rules re-checked | Searched and read Meta's pricing-updates page | Confirmed per-delivered-message billing, 24-hour service window and 72-hour free entry-point window; opt-in and policy detail still rests on secondary sources |
| Not yet re-verified line by line | — | Legal summaries against primary texts; Marathi/Hindi message drafts; remaining V3 and BP numeric claims outside the stage table and matrix |
