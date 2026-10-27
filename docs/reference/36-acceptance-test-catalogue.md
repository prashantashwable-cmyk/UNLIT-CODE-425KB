## 36. Acceptance test catalogue

A requirement is complete only when it works end to end, enforces permissions, handles errors, and passes its tests. **No test has been run; this catalogue is the plan.** Short references such as T-041 in earlier sections mean AIEC-TEST-0041. Levels: Unit, API, Integration, E2E, Device, Visual, Security, Review, Field.

| Test ID | Requirement keys | Given / When / Then | Level |
|---|---|---|---|
| AIEC-TEST-0001 | SERVER_AUTHZ, PERM_MATRIX | Given a Technician token / When it requests the customer phone number by direct API / Then 403 and an audit event, regardless of UI | API |
| AIEC-TEST-0002 | SERVER_AUTHZ, TIME_BOX_ACCESS | Given 91 days after handover / When the Technician opens site details / Then denied except assigned defect or AMC ticket | API |
| AIEC-TEST-0003 | ROLE_MULTI | Given an account with Rider and Technician roles / When switching role / Then permissions are re-evaluated and Rider screens vanish | E2E |
| AIEC-TEST-0004 | NO_SELF_APPROVE, OVERRIDE_LOUD | Given Admin A created an override / When A tries to approve it / Then blocked; second Admin or Owner can approve; red timeline entry exists | API |
| AIEC-TEST-0005 | DEMO | Given demo mode / When a fake payment is made / Then no real provider call, no real message, separate database | E2E |
| AIEC-TEST-0006 | FORCE_INSTALL, PWA_NATIVE | Given Rider logs in from a browser / When real use / Then refused with install guide; demo still works | E2E |
| AIEC-TEST-0007 | BG_TRACK | Given battery saver kills the service / When tracking stops / Then app shows limited-tracking state and Admin alert after 30 min | Device |
| AIEC-TEST-0008 | ACCOUNT_RECOVERY | Given a lost phone / When recovery is started / Then old sessions are revoked and human review is required | E2E |
| AIEC-TEST-0009 | CONSENT_REC, LEAD_CONSENT | Given voice consent recorded / When viewing lead / Then purpose, notice version, language, timestamp, authority are stored | Integration |
| AIEC-TEST-0010 | LEAD_CAPTURE, STOP_CAPTURE | Given speed above near-zero / When Rider opens capture / Then camera refuses with 'Stop safely to capture' | Device |
| AIEC-TEST-0011 | LEAD_CAPTURE, AUTO_ADDRESS | Given three in-app photos and GPS / When saved / Then Project file exists with auto address and stamped photos | E2E |
| AIEC-TEST-0012 | OCR_NUMBER, MASK_CONTACT | Given OCR proposes a number / When Rider confirms / Then number is stored and shown masked to Rider | E2E |
| AIEC-TEST-0013 | DUP_LEAD | Given a lead inside an existing geofence within 60 days / When a second rider captures / Then it attaches as update, no new Project | API |
| AIEC-TEST-0014 | DUP_LEAD, COMMISSION | Given the update adds a new contact / When token and QC pass / Then second rider gets exactly one 10% line; zero if nothing new | Integration |
| AIEC-TEST-0015 | DUP_LEAD, SITE_LIFT | Given a capture for a different tower of the same Site / When saved / Then a new Lift Project is created | API |
| AIEC-TEST-0016 | GPS_DRIFT | Given 80 m drift in basement / When capture is submitted / Then one-tap review, not rejection | E2E |
| AIEC-TEST-0017 | WA_OUTREACH | Given opt-out received / When any campaign runs / Then no further template to that number | Integration |
| AIEC-TEST-0018 | WA_OUTREACH | Given customer window closed / When bot replies / Then only an approved template is sent | Integration |
| AIEC-TEST-0019 | AUTO_CALL | Given no call permission / When reply arrives / Then no call is scheduled and a human task exists | Integration |
| AIEC-TEST-0020 | PRICE_LADDER, BOT_LIMITS | Given base 100 / When bot offers 129 / Then server rejects; 130 allowed after counter; first quote 160 | API |
| AIEC-TEST-0021 | PRICE_LADDER, NEGOTIATOR | Given Negotiator role / When offering 119 / Then rejected; 120 accepted | API |
| AIEC-TEST-0022 | BELOW_FLOOR | Given Owner offers 115 with reason / When second approval missing / Then not saved; with second approval saved and audited | API |
| AIEC-TEST-0023 | PRICE_LADDER, QUOTE_DISCLOSURE | Given customer view / When inspecting API response / Then floor and margin never present | API |
| AIEC-TEST-0024 | RATE_CARD, AUTO_QUOTE | Given rate card expired / When quote is requested / Then blocked with Admin task | API |
| AIEC-TEST-0025 | FULL_COST_BASE | Given a cost line is missing from base / When base is calculated / Then floor check shows incomplete-cost warning | Unit |
| AIEC-TEST-0026 | AGREEMENT | Given agreement not read aloud or authority proof missing / When eSign requested / Then blocked | E2E |
| AIEC-TEST-0027 | TOKEN, PAY_TRUTH | Given a client success screen but no webhook / When status is read / Then payment stays pending | Integration |
| AIEC-TEST-0028 | PAY_TRUTH, LEDGER | Given the same webhook delivered twice / When processed / Then one ledger entry only | Integration |
| AIEC-TEST-0029 | PAY_TRUTH | Given invalid webhook signature / When received / Then rejected, logged, no state change | Integration |
| AIEC-TEST-0030 | ESCROW_GATE, DISPATCH_RULES | Given 70% not confirmed / When Supplier taps dispatch / Then blocked with reason | API |
| AIEC-TEST-0031 | ESCROW_GATE, CABIN_DELIVERY | Given 20% not confirmed / When cabin production release requested / Then blocked | API |
| AIEC-TEST-0032 | EMI_NBFC | Given loan document uploaded but NBFC status pending / When gate is checked / Then not approved | API |
| AIEC-TEST-0033 | PAY_SCHEDULE | Given contract 10,00,000 and token credited / When schedule generated / Then 10,000 + 6,90,000 + 2,00,000 + 1,00,000 = 10,00,000 | Unit |
| AIEC-TEST-0034 | REFUND_CANCEL | Given cancellation at each stage / When rule applied / Then refund equals approved table output | Unit |
| AIEC-TEST-0035 | PAY_DISPUTE, PAYOUT_CONTROLS | Given customer disputes payment / When project Disputed / Then confirmed worker pay still pays | Integration |
| AIEC-TEST-0036 | VARIATION | Given measured base differs 5.1% / When QC saves / Then variation quote is required before production order | API |
| AIEC-TEST-0037 | VARIATION, SUPPLIER_PO | Given unsigned variation / When PO issued / Then blocked | API |
| AIEC-TEST-0038 | READINESS_SOP | Given 30 days since agreement / When readiness incomplete / Then re-quote or cancel decision opens | Integration |
| AIEC-TEST-0039 | QC_CLEARANCE | Given a measurement out of tolerance / When saved / Then defect, owner, due date and reinspection gate created | E2E |
| AIEC-TEST-0040 | DRAWINGS_RELEASE | Given QC not passed / When customer opens drawings / Then locked with reason | API |
| AIEC-TEST-0041 | PERMIT_TRACK, LICENCE_GATE | Given no licence number / When handover requested / Then blocked | API |
| AIEC-TEST-0042 | LICENCE_GATE, HANDOVER_SIGN | Given licence present but one signature missing / When completing handover / Then blocked; final payment not released | E2E |
| AIEC-TEST-0043 | HANDOVER_SIGN | Given work complete and QC pass / When viewing events / Then work completion, QC approval, inspection, licence, handover, financial closure are separate records | API |
| AIEC-TEST-0044 | NOC_DEF | Given NOC not yet defined in rules / When NOC issue is attempted / Then blocked | API |
| AIEC-TEST-0045 | BOM | Given extra cable requested without photo / When submitted / Then blocked; with emergency flag human decision path opens | E2E |
| AIEC-TEST-0046 | CONTAINER_LOCK | Given only two of three approvals / When unlock requested / Then lock stays closed | API |
| AIEC-TEST-0047 | CONTAINER_LOCK, PAY_TRUTH | Given three approvals but delivery payment unconfirmed / When unlock requested / Then refused | API |
| AIEC-TEST-0048 | OFFLINE_CODE | Given offline code issued by third-key Admin / When used / Then rejected; by independent issuer accepted once within 15 min | API |
| AIEC-TEST-0049 | CUSTODY | Given unlock occurred / When custody clause unsigned / Then installation cannot start | E2E |
| AIEC-TEST-0050 | RETURN_FLOW | Given payment unconfirmed at door / When Admin confirms / Then return task and safe-custody checklist open | E2E |
| AIEC-TEST-0051 | SITE_START_14D | Given a pause with proof / When 14-day clock is shown / Then paused days excluded | Unit |
| AIEC-TEST-0052 | SAFETY_GATE | Given tick-only consent / When tasks unlock requested / Then refused; video, photo and competent-person certification unlock | E2E |
| AIEC-TEST-0053 | SAFETY_GATE, SAFETY_CRITICAL | Given red hazard flagged / When any task submitted / Then work frozen until authorised competent person clears | E2E |
| AIEC-TEST-0054 | SAFETY_PDF | Given End day / When PDF generated / Then builder copy has blurred faces and original retained under access control | Integration |
| AIEC-TEST-0055 | PEER_RELAY | Given Team A submits stage 3 / When Team A approves its own work / Then rejected; other team or QC approval moves earnings | API |
| AIEC-TEST-0056 | SOP_VERSIONED, SUBSTAGES5 | Given SOP v2 published / When a job starts / Then job pins v2 and evidence list | Integration |
| AIEC-TEST-0057 | TRAINEE_RULES | Given Trainee / When a safety-critical task is assigned / Then not assignable | API |
| AIEC-TEST-0058 | SOS | Given no network / When SOS tapped / Then 112 dialler opens at once and SMS alert is attempted with delivery state | Device |
| AIEC-TEST-0059 | SOS, INCIDENT | Given SOS online / When raised / Then site freeze, Admin alert, incident form open | E2E |
| AIEC-TEST-0060 | ENTRAPMENT, QR_NO_PII | Given resident scans QR / When tapping Person trapped / Then human rescue route, no bot, no customer data shown | E2E |
| AIEC-TEST-0061 | NO_REMOTE_DISABLE | Given any API / When searched for lift-control commands / Then none exist | Review |
| AIEC-TEST-0062 | CAMERA_ONLY | Given proof-required task / When gallery import tried / Then not offered | Device |
| AIEC-TEST-0063 | EVID_STAMP | Given a capture / When uploaded / Then stamp, capture id, hash, original and rendered copy exist | Integration |
| AIEC-TEST-0064 | EVID_CHECKS | Given a photo of a screen / When checked / Then amber/red with reason and human review route | Integration |
| AIEC-TEST-0065 | AI_FAIRNESS | Given AI rejects / When worker taps Ask human / Then review task opens and no penalty applied | E2E |
| AIEC-TEST-0066 | OFFLINE_SYNC, OFFLINE_QUEUE | Given 30 captures offline / When network returns / Then all arrive once, with phone and server times | E2E |
| AIEC-TEST-0067 | OFFLINE_SYNC | Given app killed mid-upload / When restarted / Then upload resumes and no duplicates | Device |
| AIEC-TEST-0068 | OFFLINE_QUEUE | Given 7-hour gap / When synced / Then flagged for Admin review | Integration |
| AIEC-TEST-0069 | EVID_ACCESS, AUDIT_LOG | Given a sensitive image opened / When viewing audit / Then read event with actor exists | API |
| AIEC-TEST-0070 | CONFIRMED_RULE, PAYOUT_CONTROLS | Given QC pass without Admin approval / When cycle closes / Then not payable | Integration |
| AIEC-TEST-0071 | PAYOUT_CONTROLS | Given payout request retried / When provider confirms once / Then one payment, one paid status | Integration |
| AIEC-TEST-0072 | PAYOUT_CONTROLS | Given failed transfer / When retried / Then line stays outstanding and never shown as paid | Integration |
| AIEC-TEST-0073 | PAYOUT_MODEL | Given the owner has not chosen a model / When payout batch is created / Then blocked with decision link | API |
| AIEC-TEST-0074 | LEDGER_BUCKETS, PAYOUT_CONTROLS | Given two contractors on the same cycle / When batch runs concurrently / Then each paid once, totals reconcile | Integration |
| AIEC-TEST-0075 | NO_FORFEIT | Given contractor exits / When final settlement runs / Then earned undisputed balance is paid by hard date, zero closing balance | Integration |
| AIEC-TEST-0076 | QC_CLEARANCE, LEDGER_BUCKETS | Given QC reopened after Confirmed / When recalculated / Then correction by new entry, not edit | Integration |
| AIEC-TEST-0077 | NO_FINES | Given a deduction without contract basis / When requested / Then rejected | API |
| AIEC-TEST-0078 | WEIGHTED_RATING | Given one 5-star review and fifty 4.8 reviews / When computed with C=10, m=4.3 / Then 4.36 and 4.72 | Unit |
| AIEC-TEST-0079 | LADDER, DEMOTION | Given an unreviewed allegation / When ladder review runs / Then no automatic demotion; temporary safety pause only with human review | Integration |
| AIEC-TEST-0080 | APPEALS | Given an appeal filed / When SLA passes / Then escalation to Admin | Integration |
| AIEC-TEST-0081 | GAMIFY | Given fast but unsafe work / When leaderboard computed / Then speed alone gives no XP | Unit |
| AIEC-TEST-0082 | ADMIN_QUEUE, AUT-026 | Given a safety incident and a payment reminder / When Admin opens queue / Then incident first | E2E |
| AIEC-TEST-0083 | ANALYTICS | Given KPI list / When reviewed / Then each has formula, source, refresh, filter, drill-down, action | Review |
| AIEC-TEST-0084 | ADMIN_MAP | Given a provider is not connected / When map loads / Then no fake live data and a not-connected label | E2E |
| AIEC-TEST-0085 | CHAT | Given an approval in chat / When viewing / Then a structured record with actor, version, time, role exists | API |
| AIEC-TEST-0086 | NOTIFY_OUTBOX | Given push fails / When event is critical / Then SMS/WhatsApp fallback and receipt logged | Integration |
| AIEC-TEST-0087 | NOTIFY_OUTBOX, SOS | Given quiet hours / When SOS notification / Then delivered immediately | Integration |
| AIEC-TEST-0088 | AMC_FLIP | Given handover without licence / When AMC creation runs / Then blocked | API |
| AIEC-TEST-0089 | SERVICE_TICKET | Given five severity levels / When ticket arrives / Then correct route and SLA clock | Integration |
| AIEC-TEST-0090 | A11Y, COLOUR_RULES | Given status chips / When viewed in greyscale / Then icon and label still convey state | Visual |
| AIEC-TEST-0091 | A11Y, SCALE | Given scale 20% / When on a field screen / Then primary button still at least 30% height and 48 dp | Device |
| AIEC-TEST-0092 | LANG3 | Given Marathi and Hindi / When all screens rendered / Then no clipped Devanagari and voice lines exist | Visual |
| AIEC-TEST-0093 | ADAPTIVE | Given 360 px width / When opening every screen / Then no horizontal scroll except tables in their own scroller | Visual |
| AIEC-TEST-0094 | PERF_TARGETS, OFFLINE_SYNC | Given throttled slow network / When capturing evidence / Then capture works without blocking and queue shows state | Device |
| AIEC-TEST-0095 | SEC_BASELINE | Given OTP endpoint / When brute force attempted / Then rate limited and alerted | Security |
| AIEC-TEST-0096 | PRIVACY, RETENTION | Given erasure request on legal-hold data / When processed / Then audit action kept without personal identity after hold | Review |
| AIEC-TEST-0097 | FAILURE_PATHS | Given each listed failure / When simulated / Then user has retry, draft, help or escalate path and no data lost | E2E |
| AIEC-TEST-0098 | STATE_MACHINE, SIDE_STATES | Given any stage / When illegal jump is requested / Then refused; backward move needs reason and creates Issue | API |
| AIEC-TEST-0099 | CASHFLOW, TAX_RULES | Given pilot start / When checking Phase 0 exit / Then cash-flow table is filled and CA opinion recorded | Review |
| AIEC-TEST-0100 | USABILITY_TEST | Given five low-literacy users per field task / When tested unaided / Then at least four complete each task | Field |
| AIEC-TEST-0101 | MASK_CONTACT | Given masked calling configured / When Technician calls builder / Then real number never shown and call logged | Integration |
| AIEC-TEST-0102 | GIG_CONTRIB | Given contribution rate notified / When ledger posts / Then amount computed with cap check | Unit |
| AIEC-TEST-0103 | SUPPLIER_VIEW | Given a Supplier / When opening invoices / Then only own invoices visible | API |
| AIEC-TEST-0104 | CUST_PARTIES | Given delivery / When representative not named / Then unlock approval unavailable | API |
| AIEC-TEST-0105 | SURPRISE_QC | Given scheduled surprise QC / When QC opens list before the day / Then visit hidden until its day | API |
| AIEC-TEST-0106 | INSPECTOR_GATE | Given Inspector rejection / When fix list attached / Then licence gate stays closed | E2E |
| AIEC-TEST-0107 | COLD_FOLLOWUP | Given three unanswered reminders / When time passes / Then lead Cold and visible as revisit | Integration |
| AIEC-TEST-0108 | HONESTY_STRATEGY, PAID_ON_PROOF | Given missing proof / When milestone claimed / Then no provisional earnings | Integration |
| AIEC-TEST-0109 | ROLE_LOGIN | Given a new user with invitation / When OTP then face or PIN completed / Then role home opens; without invitation no role is granted | E2E |
| AIEC-TEST-0110 | PERM_WIZARD | Given first run / When wizard runs / Then each permission is explained with a picture before the OS prompt | Device |
| AIEC-TEST-0111 | ASSISTED | Given Coordinator assists a worker step / When worker face check is skipped / Then step is refused; when done the record shows assisted-by | E2E |
| AIEC-TEST-0112 | ZERO_TYPE | Given any Rider or Technician field screen / When audited / Then no free-text field is required to complete the task | Review |
| AIEC-TEST-0113 | SCREEN_GRAMMAR | Given field screens / When reviewed against the 12 rules / Then each rule passes (one job, 30% button, max 3 choices, SOS and Help present) | Review |
| AIEC-TEST-0114 | NEXT_CARD, MANAGER_ASSISTANT | Given a stage change / When Today opens / Then Next-step card shows task, who is waiting and earning | E2E |
| AIEC-TEST-0115 | VOICE_ASSIST | Given language set to Marathi / When a screen opens / Then voice line plays in Marathi and repeat works; amounts are spoken | Device |
| AIEC-TEST-0116 | UNDO10 | Given a normal submit / When Undo tapped within 10 s / Then nothing is sent; container unlock and SOS show no Undo | E2E |
| AIEC-TEST-0117 | SOUNDS | Given five event types / When delivered / Then each has a distinct sound and vibration and SOS works with sound disabled | Device |
| AIEC-TEST-0118 | THEMES | Given each theme / When switched / Then all components follow it and status colours keep meaning | Visual |
| AIEC-TEST-0119 | TAP_DETAIL, FIVE_TABS | Given any role / When tapping a name, site ID or card / Then permitted detail opens; five tabs present | E2E |
| AIEC-TEST-0120 | SINGLE_RECORD, APPEND_ONLY | Given a project / When an evidence or ledger line is edited by API / Then UPDATE/DELETE refused; correction creates a linked entry | API |
| AIEC-TEST-0121 | EVENT_FACTS | Given any stage change / When event is read / Then actor, role, states, times, location, evidence hashes, reason, idempotency key present | API |
| AIEC-TEST-0122 | PARALLEL_TRACKS | Given permit pending / When supplier production gate is checked / Then each track follows its own gate | Integration |
| AIEC-TEST-0123 | RIDER_ROUTINE, RIDER_MAP | Given a Rider day / When ended / Then summary shows leads, km, area, earnings, rank, suggested area and map layers render | E2E |
| AIEC-TEST-0124 | SUGGEST_AREAS | Given area data / When suggestions render / Then no claim of full public-registry coverage | Review |
| AIEC-TEST-0125 | LEAD_STATUS_VIEW, LEADS_TO_SALES | Given a verified lead / When Sales opens map / Then lead appears sorted by distance and score and Rider sees status | E2E |
| AIEC-TEST-0126 | RIDER_COVER | Given Rider onboarding / When insurance not recorded / Then duty start refused | API |
| AIEC-TEST-0127 | LEAD_METRICS, LEAD_VERIFY | Given captured leads / When verification runs / Then verified within 24 h or flagged; funnel metrics computed | Integration |
| AIEC-TEST-0128 | REQ_CAPTURE | Given incomplete requirement / When quote requested / Then missing fields requested before any binding quote | API |
| AIEC-TEST-0129 | HANDOFF_TRIGGERS | Given customer asks for a human / When detected / Then hand-off occurs with full chat | Integration |
| AIEC-TEST-0130 | PIPELINE_REPORT, LEARNING_LOOP | Given evening / When report runs / Then leads, replies, quotes, wins, average discount and win rate by first-quote level shown | Integration |
| AIEC-TEST-0131 | NO_WALLET | Given ledger screens / When reviewed / Then no stored-value wallet balance exists and amounts come from ledger | Review |
| AIEC-TEST-0132 | PAY_METHODS | Given milestone above UPI limit / When payment started / Then supported method guidance shown | Integration |
| AIEC-TEST-0133 | SUPPLIER_PAY | Given customer payment cleared / When chargeback window not elapsed / Then supplier split not released | Integration |
| AIEC-TEST-0134 | QC_REJECT_SITE | Given QC rejects / When saved / Then customer gets picture fix list and project returns to readiness | E2E |
| AIEC-TEST-0135 | LICENCE_HOLDER | Given a project / When licence holder missing / Then permit and handover steps blocked | API |
| AIEC-TEST-0136 | SUPPLIER_ONBOARD | Given a new supplier / When unverified / Then cannot receive a PO | API |
| AIEC-TEST-0137 | CCTV_PRIVACY | Given CCTV clip / When opened by unauthorised role / Then denied and logged | API |
| AIEC-TEST-0138 | MATERIAL_CLAIM | Given damaged item / When claim opened / Then supplier notified and safe sub-stages continue | E2E |
| AIEC-TEST-0139 | TECH_ABSENT | Given Technician absent 2 days / When rule fires / Then Coordinator alerted and earnings split by verified work | Integration |
| AIEC-TEST-0140 | AI_HUMAN | Given non-critical steps / When sampled / Then 10% get human review; first 30 jobs 100% | Integration |
| AIEC-TEST-0141 | VIDEO10 | Given plumb-line step / When recorded / Then 10-second video has burned-in time and GPS | Device |
| AIEC-TEST-0142 | CUSTOMER_RATING | Given no rating in 7 days / When time passes / Then accepted; rating never changes base pay | Integration |
| AIEC-TEST-0143 | CONTRACTOR_CLASS | Given contractor onboarding / When agreement unsigned / Then no offers can be accepted | API |
| AIEC-TEST-0144 | TRUST_SCORE | Given weights / When computed / Then score matches formula and shows reason codes | Unit |
| AIEC-TEST-0145 | ONBOARD_ENGINE, TRAINING | Given stalled onboarding / When time passes / Then escalated to Coordinator then Admin; training exists in 3 languages | Integration |
| AIEC-TEST-0146 | AGGREGATOR_PAGE | Given no real earnings data / When calculator opens / Then no figure is shown | E2E |
| AIEC-TEST-0147 | BONUS_6M | Given bonus undefined / When payout run / Then no bonus is paid | API |
| AIEC-TEST-0148 | INSURANCE | Given insurance expiring in 30 days / When alert job runs / Then Admin alerted; expired blocks assignment | Integration |
| AIEC-TEST-0149 | APPROVALS_INBOX, DAY_CLOSE | Given pending approvals and unreviewed items / When Admin day-close / Then items roll to tomorrow with owner | E2E |
| AIEC-TEST-0150 | OWNER_PAGE | Given Owner / When viewing / Then decision queue and weekly summary present with delegate rule | E2E |
| AIEC-TEST-0151 | CUSTOMER_VIEWS | Given Customer / When project advances / Then tracker, photos, payments, map and safety PDFs update | E2E |
| AIEC-TEST-0152 | STACK, PWA_NATIVE | Given chosen stack / When RLS tests run / Then service key absent from clients and field apps are native Android | Security |
| AIEC-TEST-0153 | PUSH_FALLBACK | Given iPhone user without installed web push / When approval needed / Then SMS/WhatsApp link sent | Integration |
| AIEC-TEST-0154 | NO_PROD_CLAIM | Given release checklist / When any required item is open / Then system is not labelled production-ready | Review |
| AIEC-TEST-0155 | PILOT_SCOPE, BUILD_PROCESS | Given pilot scope not decided / When phase 3 starts / Then blocked by checklist | Review |
| AIEC-TEST-0156 | THREE_LAYERS, FOUR_LOCKS | Given the four locks / When tested together / Then no dispatch without funds, no pay without proof, no bypass, no handover without licence | E2E |
| AIEC-TEST-0157 | VISUAL_SYSTEM | Given components / When rendered / Then tokens used with no hardcoded colour or size | Visual |
| AIEC-TEST-0158 | DEMO, CONSENT_REC | Given demo / When consent recorded / Then stored only in demo database | Integration |
| AIEC-TEST-0159 | ACCOUNT_RECOVERY, A11Y | Given keyboard-only web user / When logging in / Then focus order, visible focus and no puzzle step pass | Visual |
| AIEC-TEST-0160 | COLOUR_RULES, OVERRIDE_LOUD | Given an override / When timeline rendered / Then red entry with reason appears in Owner weekly summary | E2E |
| AIEC-TEST-0161 | OFFLINE_QUEUE, BOT_LIMITS | Given bot / When asked for unapproved timeline or spec / Then refuses and hands off | Integration |
| AIEC-TEST-0162 | RATE_CARD, FULL_COST_BASE, QUOTE_DISCLOSURE | Given a quote / When created / Then states assumptions and rate card version; cost base lines complete | API |
| AIEC-TEST-0163 | COLD_FOLLOWUP, PAY_DISPUTE | Given dispute and silence / When rules run / Then states Disputed/Cold correct | Integration |
| AIEC-TEST-0164 | TAX_RULES, CABIN_DELIVERY | Given tax opinion missing / When invoice logic enabled / Then blocked; cabin release follows configured gate | API |
| AIEC-TEST-0165 | TRAINEE_RULES, DEMOTION, INCIDENT | Given Trainee and incident / When actions requested / Then limits and freeze rules apply | Integration |
| AIEC-TEST-0166 | EVID_CHECKS, EVID_ACCESS, INSPECTOR_GATE | Given evidence and Inspector wait / When timers run / Then Inspector wait excluded from company SLA | Integration |
| AIEC-TEST-0167 | GIG_CONTRIB, QR_NO_PII, PERF_TARGETS | Given placeholder contribution / When QR resolved / Then no personal data and cost line shown as unnotified | Review |
| AIEC-TEST-0168 | SUPPLIER_PAY, LEAD_STATUS_VIEW | Given supplier view / When invoices opened / Then status from provider only | API |
| AIEC-TEST-0169 | HANDOFF_TRIGGERS, NEGOTIATOR | Given Negotiator unavailable / When hand-off requested / Then Admin queue receives it | Integration |
| AIEC-TEST-0170 | SERVER_AUTHZ, SEC_BASELINE | Given a Customer token / When calling a Negotiator-only price endpoint (function-level) / Then 403 even if the object ID is theirs | API |
| AIEC-TEST-0171 | SERVER_AUTHZ, QUOTE_DISCLOSURE | Given a Customer PATCHes a quote with extra properties (status, floor, price) / When saved / Then non-permitted properties are ignored or rejected and audited | API |
| AIEC-TEST-0172 | AUTO_CALL, WA_OUTREACH | Given a number on DND or without registered consent, or the time is outside permitted calling hours / When a marketing call or SMS is scheduled / Then it is blocked and a human task created | Integration |
| AIEC-TEST-0173 | ESCROW_GATE, PAY_SCHEDULE | Given the payment provider's written authorisation statement is missing / When milestone-hold flow is enabled / Then the feature flag stays off and the Admin sees the missing-document warning | Review |
| AIEC-TEST-0174 | RIDER_ROUTINE, RIDER_COVER | Given face mismatch twice at Start day / When retried / Then a Coordinator review task opens and the Rider is not blocked permanently; with location off the day cannot start | E2E |
| AIEC-TEST-0175 | RIDER_MAP | Given the map cannot load / When the Rider opens List view / Then every pin is listed with address, status and distance; other riders' coverage shows no pins | E2E |
| AIEC-TEST-0176 | LEAD_CAPTURE, CAMERA_ONLY | Given only 2 photos taken / When Next is tapped / Then it is disabled with the missing-photo message; gallery import is not offered | Device |
| AIEC-TEST-0177 | LEAD_CONSENT | Given the contact is marked Not sure authorised / When consent recording is attempted / Then it is blocked and the lead is saved with outreach disabled | E2E |
| AIEC-TEST-0178 | LEAD_CONSENT, FAILURE_PATHS | Given microphone permission denied / When saving the lead / Then lead saves without consent and states that no outreach will happen | Device |
| AIEC-TEST-0179 | DUP_LEAD | Given an update without a new-information tick / When saved / Then it attaches as update and creates no commission claim | API |
| AIEC-TEST-0180 | MASK_CONTACT, SERVER_AUTHZ | Given a Rider token / When requesting a saved lead's phone, quote price or payment data / Then only the masked number is returned and price/payment fields are denied | API |
| AIEC-TEST-0181 | COMMISSION | Given rider commission amounts are not configured / When the earnings screen loads / Then it shows Amount not set yet and no figure | E2E |
| AIEC-TEST-0182 | RIDER_ROUTINE, OFFLINE_SYNC | Given 3 queued items and no network / When End day is tapped / Then the day ends, tracking stops, the queue continues and nothing is lost | Device |
| AIEC-TEST-0183 | CONTRACTOR_CLASS, TRAINEE_RULES | Given an unsigned agreement or a Trainee / When offers load / Then unsigned users cannot accept and Trainees see only approved low-risk jobs; decline has no penalty | API |
| AIEC-TEST-0184 | SAFETY_GATE, BG_TRACK | Given 240 m from site / When CHECK IN is tapped / Then it is refused with distance; basement drift within tolerance goes to review, not rejection | Device |
| AIEC-TEST-0185 | SAFETY_GATE, SAFETY_CRITICAL | Given all four gate rows captured / When the certifier has not approved / Then tasks stay locked and no override unlocks them; Coordinator then Admin are alerted | E2E |
| AIEC-TEST-0186 | SAFETY_GATE, SOS | Given a hazard reported mid-day / When any step is submitted / Then work is frozen on all assigned phones until an authorised person clears it | E2E |
| AIEC-TEST-0187 | SOP_VERSIONED, SAFETY_CRITICAL, PAID_ON_PROOF | Given an earthing step with proof / When submitted / Then Technician cannot complete it and it shows Waiting for QC approval; no earnings appear until accepted | E2E |
| AIEC-TEST-0188 | PEER_RELAY | Given Team A's sub-stage / When a Team A member opens the peer check / Then blocked; Team B or QC can check with 3 photos | API |
| AIEC-TEST-0189 | BOM, MATERIAL_CLAIM | Given an extra-material request without a serial photo / When submitted / Then blocked; with the emergency toggle a human decision path opens | E2E |
| AIEC-TEST-0190 | SITE_START_14D | Given a pause request without proof or rejected by Admin / When decided / Then the clock is not paused and the reason is shown | Integration |
| AIEC-TEST-0191 | SAFETY_PDF, OFFLINE_SYNC | Given End day with pending evidence / When the PDF is generated / Then it is marked evidence pending and re-issued when the files arrive | Integration |
| AIEC-TEST-0192 | LEDGER_BUCKETS, PAYOUT_MODEL | Given no approved payout model / When the money screen loads / Then buckets show without dates or percentages and the announcement text appears | E2E |
| AIEC-TEST-0193 | SOS | Given a gloved press-and-hold of one second / When SOS is activated / Then the 112 dialler opens first and the alert/delivery state follows; a drag gesture is never required | Device |
| AIEC-TEST-0194 | CUSTOMER_VIEWS, RATE_CARD, BOT_LIMITS | Given a quote older than 7 days / When Accept is tapped / Then refused with the expired message; counter below the server limit never shows the floor and may hand off | E2E |
| AIEC-TEST-0195 | AGREEMENT, CUST_PARTIES | Given a signer without verified authority / When Sign is tapped / Then blocked with the authority message and a review task is created | E2E |
| AIEC-TEST-0196 | AGREEMENT, LANG3 | Given the agreement screen / When Sign is attempted before audio ends and without I-read-it-myself / Then disabled; either path records the choice and the language version shown | E2E |
| AIEC-TEST-0197 | PAY_TRUTH, PAY_METHODS, PAY_SCHEDULE | Given an amount above the method limit or a pending payment / When viewing Payments / Then bank-transfer guidance appears, no second charge is prompted and status stays Awaiting bank until confirmation | Integration |
| AIEC-TEST-0198 | EMI_NBFC, CONSENT_REC | Given no data-sharing consent / When Apply is tapped / Then blocked; given a loan letter upload but NBFC pending / Then gate unchanged | API |
| AIEC-TEST-0199 | READINESS_SOP | Given a gallery photo for a readiness item / When saved / Then tagged customer-supplied and QC verification required | Integration |
| AIEC-TEST-0200 | DRAWINGS_RELEASE | Given QC cleared and gate satisfied / When the customer opens drawings / Then view-only with watermark and the open is logged; before that locked with reason | E2E |
| AIEC-TEST-0201 | CUSTOMER_VIEWS, ADMIN_MAP | Given no GPS provider connected / When the tracker loads / Then it shows Live tracking not connected and only stage-approved photos | E2E |
| AIEC-TEST-0202 | CUST_PARTIES, CUSTODY | Given representative change within 24 h of delivery / When saved / Then Admin approval is required | API |
| AIEC-TEST-0203 | CONTAINER_LOCK, OFFLINE_CODE | Given face mismatch twice or not the named representative / When approving unlock / Then no unlock and an Admin review task is created | E2E |
| AIEC-TEST-0204 | CUSTODY, MATERIAL_CLAIM | Given BOM mismatch lines / When handover is signed / Then mismatches become claims and installation start stays blocked until the custody clause is signed | E2E |
| AIEC-TEST-0205 | VARIATION | Given the customer declines a variation / When saved / Then options continue-original-if-feasible or cancel-per-table are offered and production stays blocked | E2E |
| AIEC-TEST-0206 | HANDOVER_SIGN, LICENCE_GATE, NOC_DEF | Given no licence record / When the customer opens Final handover / Then read-only Waiting for licence; refusing final payment opens a dispute and withholds NOC per definition | E2E |
| AIEC-TEST-0207 | SAFETY_PDF | Given a day with pending evidence / When the customer opens the PDF list / Then the entry shows Evidence pending and faces are blurred in the builder copy | Integration |
| AIEC-TEST-0208 | ENTRAPMENT, SERVICE_TICKET | Given the PERSON TRAPPED button / When pressed / Then the bot is skipped and the human rescue route opens; no response-time promise is shown | E2E |
| AIEC-TEST-0209 | AMC_FLIP, PERMIT_TRACK | Given AMC data / When the customer opens AMC / Then dates, next service and licence-renewal owner from the contract are shown | E2E |
| AIEC-TEST-0210 | SERVER_AUTHZ, SINGLE_RECORD | Given Customer A's token / When requesting Customer B's project, payments or chat by ID / Then 403 and an audit event | API |
| AIEC-TEST-0211 | SURPRISE_QC, QC_CLEARANCE | Given a surprise visit scheduled for tomorrow / When QC opens the list today / Then it is hidden; on the day it appears with a Today tag | API |
| AIEC-TEST-0212 | QC_CLEARANCE, SAFETY_CRITICAL | Given a measurement without a legible instrument photo, or a signer without the defined qualification / When submitting / Then the row stays incomplete and sign-off is disabled with the reason | E2E |
| AIEC-TEST-0213 | VARIATION, SERVER_AUTHZ | Given a QC token / When requesting base cost, price or variation percentage / Then denied; only Variation required Yes/No is returned | API |
| AIEC-TEST-0214 | INSPECTOR_GATE, NO_SELF_APPROVE | Given an inspector who worked on or approved the installation / When opening the final QC / Then blocked with the conflict message | API |
| AIEC-TEST-0215 | SAFETY_CRITICAL, SURPRISE_QC | Given one safety-critical item failed / When the final decision is chosen / Then it is fixed to FAIL and rework plus reinspection gate are created | E2E |
| AIEC-TEST-0216 | ADMIN_QUEUE | Given exceptions of mixed severity and a closure attempt without note or evidence / When the queue renders and Close is tapped / Then order is severity then due time and closing is refused without a note | E2E |
| AIEC-TEST-0217 | ADMIN_MAP | Given filters role=Technician and red delay / When applied / Then only matching real-data markers show; a disconnected provider shows its banner and no markers | E2E |
| AIEC-TEST-0218 | APPEND_ONLY, OVERRIDE_LOUD | Given an Admin on a project file / When trying to edit or delete evidence or a ledger line / Then refused; a correction creates a linked entry and an override shows red with reason | API |
| AIEC-TEST-0219 | NO_SELF_APPROVE, APPROVALS_INBOX | Given an Admin's own approval request while absent / When the backup approver opens the inbox / Then the request appears for the backup and the requester cannot approve it | E2E |
| AIEC-TEST-0220 | PAYOUT_MODEL, PAYOUT_CONTROLS | Given no approved payout model / When Approve batch is tapped / Then disabled with explanation and the API refuses | API |
| AIEC-TEST-0221 | PAYOUT_CONTROLS, CONFIRMED_RULE | Given a batch above the limit and one failed transfer / When approved / Then a second approver is required and the failed line returns to Outstanding with an exception | Integration |
| AIEC-TEST-0222 | LEDGER, PAY_TRUTH | Given a reconciliation mismatch / When the daily job runs / Then an exception is created and no entry is changed automatically; a fix needs reversal plus second approver | Integration |
| AIEC-TEST-0223 | RATE_CARD, SERVER_AUTHZ, SEC_BASELINE | Given a proposal to disable the price floor check or safety certification / When submitted / Then refused and logged; an allowed change needs Owner approval and takes effect from its stated date | API |
| AIEC-TEST-0224 | PERMIT_TRACK, INSURANCE | Given a licence expiring in 30 days / When the job runs / Then alerts go to Admin and the Owner and handover/AMC rules use the stored licence holder | Integration |
| AIEC-TEST-0225 | APPEALS, DEMOTION | Given an appeal beyond its SLA / When time passes / Then it escalates; a decision shows reason codes and a voice explanation | Integration |
| AIEC-TEST-0226 | INCIDENT, SOS | Given an open incident / When Admin tries to unfreeze the site / Then it requires the incident lead's closure of safety conditions | E2E |
| AIEC-TEST-0227 | OWNER_PAGE, NO_SELF_APPROVE | Given a decision the Owner requested / When the Owner tries to approve it / Then blocked and routed to the delegate | API |
| AIEC-TEST-0228 | OWNER_PAGE, BELOW_FLOOR | Given the Owner is away beyond the response limit / When a decision is pending / Then it goes to the named delegate and the Owner sees it in the weekly summary | Integration |
| AIEC-TEST-0229 | LEADS_TO_SALES, COLD_FOLLOWUP | Given verified leads of mixed age and consent / When Sales opens the queue / Then cards sort by distance and score, overdue 48 h cards are red and consent badges show per channel | E2E |
| AIEC-TEST-0230 | WA_OUTREACH, AUTO_CALL | Given no consent, an opt-out, or a call outside permitted hours / When SEND or CALL is tapped / Then the action is disabled or blocked with the reason and no provider call is made | Integration |
| AIEC-TEST-0231 | REQ_CAPTURE, AUTO_QUOTE | Given a missing mandatory requirement field / When SEND QUOTE is tapped / Then the named field is flagged and the quote is not created | E2E |
| AIEC-TEST-0232 | PRICE_LADDER, QUOTE_DISCLOSURE | Given a Sales user / When editing the price below their limit or requesting cost data / Then refused with Lowest-you-can-offer text and no margin or base cost is returned | API |
| AIEC-TEST-0233 | BOT_LIMITS, HANDOFF_TRIGGERS | Given a customer asks the bot for a delivery date or special term / When processed / Then the bot refuses and a human hand-off is created and logged | Integration |
| AIEC-TEST-0234 | NEGOTIATOR, PRICE_LADDER | Given a Negotiator view / When inspecting API responses / Then only the floor is returned, never base cost or margin; an offer below the floor is refused | API |
| AIEC-TEST-0235 | BELOW_FLOOR, OVERRIDE_LOUD | Given a below-floor request / When the requester or Negotiator tries to approve / Then blocked; Owner plus a second approver is required and the event appears in the weekly summary | API |
| AIEC-TEST-0236 | SUPPLIER_PO, SUPPLIER_ONBOARD | Given an order without signed variation or permit number, or to an unverified supplier / When issued / Then blocked; acceptance stores the exact spec version | API |
| AIEC-TEST-0237 | DISPATCH_RULES, ESCROW_GATE | Given the configured payment gate is unconfirmed / When the Supplier opens Packing and dispatch / Then DISPATCH is disabled with the waiting message | E2E |
| AIEC-TEST-0238 | DISPATCH_RULES, BOM | Given a BOM line without serial or photo / When dispatch is attempted / Then the line is blocked and a mismatch claim path is offered | E2E |
| AIEC-TEST-0239 | SUPPLIER_PAY, SUPPLIER_VIEW | Given customer payment cleared but chargeback window open / When the Supplier opens invoices / Then status shows Chargeback window and no payment is released | Integration |
| AIEC-TEST-0240 | EMI_NBFC, CONSENT_REC | Given an application without borrower consent / When the NBFC opens it / Then documents are not shared; status shown to the customer equals the NBFC-set status only | API |
| AIEC-TEST-0241 | ASSISTED | Given assisted mode is active / When the worker's face check is not completed / Then the step cannot be submitted; afterwards assisted mode ends and the Coordinator cannot approve the work | E2E |
| AIEC-TEST-0242 | GPS_DRIFT, AI_FAIRNESS | Given a GPS drift flag waiting for review / When the worker continues / Then no penalty is applied; a wrong flag leaves earnings and trust unchanged | Integration |
| AIEC-TEST-0243 | EVID_CHECKS, TECH_ABSENT | Given an AI evidence-quality or safety flag / When routed / Then it appears for QC or Admin, not in the Coordinator review queue; identity flags appear for the Coordinator | API |
| AIEC-TEST-0244 | FORCE_INSTALL, DEMO, PWA_NATIVE | Given Android browser, iPhone browser and a published mandatory update / When the splash opens / Then install prompt or picture guide shows, login is blocked until update, and offline without session shows Connect once | E2E |
| AIEC-TEST-0245 | LANG3 | Given device language unknown / When first opened / Then Marathi is default; choosing a language persists to profile and is applied to text, voice and PDFs | E2E |
| AIEC-TEST-0246 | ROLE_LOGIN, SEC_BASELINE | Given an uninvited number / When OTP is verified / Then no role or account is created and the invite message shows; wrong or expired codes show their messages | E2E |
| AIEC-TEST-0247 | ROLE_LOGIN, ACCOUNT_RECOVERY | Given repeated wrong PINs / When the limit is reached / Then the screen locks and routes to recovery; face unlock is optional and PIN always works | Device |
| AIEC-TEST-0248 | PERM_WIZARD | Given each permission denied in turn / When using the dependent feature / Then the stated fallback appears (assisted help, duty blocked, no voice notes, SMS fallback) with re-enable steps | Device |
| AIEC-TEST-0249 | CONSENT_REC, PRIVACY | Given an optional purpose declined and later withdrawn / When data is used / Then the purpose is not applied and the withdrawal is stored with version and time | Integration |
| AIEC-TEST-0250 | ROLE_MULTI | Given a role switch / When the sheet closes / Then permissions are re-evaluated and sensitive screens are closed | E2E |
| AIEC-TEST-0251 | NEXT_CARD, ADMIN_QUEUE | Given a safety item and an earnings reminder / When Today loads / Then the safety item is the Next-step card; a locked step shows its reason and who to call | E2E |
| AIEC-TEST-0252 | CHAT | Given a human message and a payment event / When the thread renders / Then they are visually distinct, approval cards produce structured records and offline sends show not-sent markers | E2E |
| AIEC-TEST-0253 | CHAT, MASK_CONTACT | Given a phone number typed into chat / When sent / Then it is masked and a warning shown while the message still reaches the thread | Integration |
| AIEC-TEST-0254 | PAID_ON_PROOF, PAY_TRUTH | Given each role / When the Money tab opens / Then it routes to the role's money screen and no amount is computed on the phone | E2E |
| AIEC-TEST-0255 | SCALE, THEMES, SOUNDS | Given scale 20% and each theme / When Settings changes apply / Then critical controls keep minimum size, preview shows the effect and field roles cannot hide the on-duty indicator | Visual |
| AIEC-TEST-0256 | NOTIFY_OUTBOX | Given a critical notification / When acknowledged or deleted / Then it persists until acknowledged and remains in audit | E2E |
| AIEC-TEST-0257 | OFFLINE_SYNC, FAILURE_PATHS | Given a conflict and a rejected item in the queue / When viewing sync status / Then both stay as Needs attention and nothing is discarded; low storage warns before capture is blocked | Device |
| AIEC-TEST-0258 | SCREEN_GRAMMAR, FAILURE_PATHS | Given help is requested / When shown / Then the displayed response time equals only staffed hours and no emergency promise appears | Review |
| AIEC-TEST-0259 | ACCOUNT_RECOVERY | Given a lost phone / When recovery completes / Then old sessions are revoked, new device bound only after human verification, and Admin accounts need two reviewers | E2E |
| AIEC-TEST-0260 | DEMO | Given demo mode / When the user exits / Then data resets, the banner was visible throughout and no real tracking, message or payment occurred | E2E |
| AIEC-TEST-0261 | CAMERA_ONLY, EVID_STAMP | Given a capture / When uploaded / Then stamp fields, capture ID, original and rendered copies, hash and both time sources exist and files were encrypted at rest on the phone | Integration |
| AIEC-TEST-0262 | CAMERA_ONLY, FAILURE_PATHS | Given low storage, camera busy and overheating / When capturing / Then prompts appear, existing captures stay safe and a draft is kept | Device |
| AIEC-TEST-0263 | EVID_CHECKS, AI_FAIRNESS | Given green, amber and red results / When reviewed / Then each shows a picture reason, red or amber offers Ask a person, and safety-critical items show Waiting for QC | E2E |
| AIEC-TEST-0264 | AGGREGATOR_PAGE | Given no recorded pay data / When the calculator is opened / Then no earnings figure is shown | E2E |
| AIEC-TEST-0265 | ONBOARD_ENGINE, CONTRACTOR_CLASS | Given a stalled onboarding step / When time passes / Then escalation goes to Coordinator then Admin and the agreement must be signed before any offer | Integration |
| AIEC-TEST-0266 | TRAINING, LADDER | Given a quiz below 80% / When submitted / Then promotion is blocked and retry follows the configured cool-down | E2E |
| AIEC-TEST-0267 | TRAINEE_RULES, ONBOARD_ENGINE | Given a Trainee on a trial / When a promotion proposal is made / Then Admin confirms with a spoken explanation and no safety-critical task was assigned | Integration |
| AIEC-TEST-0268 | QR_NO_PII, ENTRAPMENT | Given the cabin QR / When opened with no network or with data / Then no network shows printed-number instructions, with data only site name and lift label appear and no customer personal data | E2E |
| AIEC-TEST-0269 | ENTRAPMENT, FAILURE_PATHS | Given PERSON TRAPPED unanswered / When the escalation time passes / Then backup, Admin and Owner are alerted and the page tells the user to keep calling 112 | Integration |
| AIEC-TEST-0270 | ENTRAPMENT, INCIDENT, NO_REMOTE_DISABLE | Given an incoming rescue alert / When acknowledged and dispatched / Then every action is audited, an incident is created, and no console action can operate or disable the lift | E2E |
| AIEC-TEST-0271 | ANALYTICS, AUDIT_LOG | Given an Admin exports a KPI table / When the export completes / Then an audit event exists, personal data is masked, and a KPI with a disconnected source shows Not connected instead of a value | E2E |
| AIEC-TEST-0272 | GIG_REGISTRATION, ONBOARD_ENGINE | Given counsel has marked AIEC as a covered aggregator / When a contractor completes onboarding or exits / Then a portal registration or exit record is queued once (idempotent) with a daily report; given applicability unconfirmed Then data is captured but nothing is submitted | Integration |

**Additional coverage rules for the build agent:** each stage transition (16 forward, backward-with-reason, side states) has a positive and a blocked test; each payment lock, role permission and automation retry has an idempotency test; each screen's default states (loading, empty, error, offline, permission-denied) have a visual test at 360 px in Marathi, Hindi and English.
