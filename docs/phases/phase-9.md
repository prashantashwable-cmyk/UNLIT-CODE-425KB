# Phase 9 context pack (generated; mapping PROPOSED)

Workflows: WF-13, WF-17

Read first: `python3 scripts/spec.py sec 16.2` (stage rules). Screens are read one at a time, never whole modules:
- `15.1` (modules/15.01-rider.md): preamble `spec.py sec 15.1`; screens SCR-026, SCR-027 via `spec.py sec SCR-nnn`
- `15.2` (modules/15.02-technician.md): preamble `spec.py sec 15.2`; screens SCR-050 via `spec.py sec SCR-nnn`
- `15.5` (modules/15.05-admin-owner.md): preamble `spec.py sec 15.5`; screens SCR-073, SCR-074, SCR-075, SCR-076, SCR-081, SCR-083, SCR-084, SCR-085 via `spec.py sec SCR-nnn`
- `15.6` (modules/15.06-sales-negotiator.md): preamble `spec.py sec 15.6`; screens SCR-034 via `spec.py sec SCR-nnn`
- `15.9` (modules/15.09-shared-core.md): preamble `spec.py sec 15.9`; screens SCR-003, SCR-006, SCR-008, SCR-010 via `spec.py sec SCR-nnn`
- `15.11` (modules/15.11-worker-onboarding.md): preamble `spec.py sec 15.11`; screens SCR-069, SCR-070, SCR-071, SCR-072 via `spec.py sec SCR-nnn`

## Requirements (39)
- AIEC-UX-0012 [TAP_DETAIL] Tapping a name, site ID or card opens the related information (role-permitted). (S · confirmed)
- AIEC-DATA-0006 [EVENT_FACTS] Every important event records actor, role, project/lift, action, previous/new state, server and client time, location where lawful, evidence IDs and hashes, approval reas… (S · confirmed)
- AIEC-DATA-0007 [SIDE_STATES] Besides one main stage the project may be in one side state: On hold (with proof), Disputed (with owner), Cancelled (stage rule), Lost (cold). Moving back needs a reason … (S · confirmed)
- AIEC-DATA-0008 [STATE_MACHINE] Stage engine is a server-side state-machine table: current state, allowed next states, side states, required proofs, required approvers, deadline, money effects, fallback… (S · confirmed)
- AIEC-DATA-0011 [RETENTION] Evidence and audit stay under legal hold during project, defect/bond period and statutory limit; afterwards personal data is anonymised on request while audit keeps the a… (S · confirmed L)
- AIEC-SEC-0003 [AUDIT_LOG] Append-only audit of every change and every read of sensitive data (phone, KYC, bank, sensitive images). Alerts for privilege changes and data export. (S · confirmed)
- AIEC-SEC-0004 [SERVER_AUTHZ] All permissions enforced server-side with database row-level security on every exposed table and operation; a hidden button is not a permission; direct API requests are d… (S · confirmed)
- AIEC-SEC-0005 [PERM_MATRIX] Permission matrix of section 8 (12 source roles) is enforced by the database. (S · confirmed)
- AIEC-SEC-0006 [NO_SELF_APPROVE] Nobody approves their own work or override. At least two approvers always available (two Admins, or Admin plus Owner/named delegate). Material disputes, deductions and ma… (S · confirmed D)
- AIEC-SEC-0008 [TIME_BOX_ACCESS] Technician loses site details when the bond period ends (90 days after handover); afterwards sees only defect or AMC tickets assigned. (S · confirmed D)
- AIEC-SEC-0009 [OVERRIDE_LOUD] Admin override needs typed or spoken reason, shows red on the timeline, and appears in the Owner weekly summary. Below-floor override additionally needs second approval. (S · confirmed)
- AIEC-REQ-0013 [LEAD_METRICS] Funnel conversion, duplicate rate, verified-lead cost, rider safety incidents and earnings per productive hour are tracked. (P · proposed)
- AIEC-SAFE-0007 [TRAINEE_RULES] Trainees work only on approved low-risk tasks under supervision; promotion needs demonstrated skills, required certification and human approval. (S · confirmed)
- AIEC-REQ-0077 [LADDER] Ladder Applicant, Trainee, Technician, Senior Technician, QC Inspector with thresholds: Trainee quiz 80% plus safety test; Technician 5 jobs, trust>=75, rating>=4.4 with … (P · proposed D)
- AIEC-REQ-0078 [WEIGHTED_RATING] Weighted rating = (C*m + sum of stars)/(C + n) with C=10, m=platform average (e.g. 4.3, fixed between reviews); screen shows both stars and review count. (S · confirmed)
- AIEC-REQ-0079 [TRUST_SCORE] Trust score 0-100: first-time quality 40%, weighted customer rating 15%, peer relay 10%, on-time 10%, safety streak/no flags 15%, rework/complaints 10%. Formula, minimum … (P · proposed)
- AIEC-REQ-0080 [DEMOTION] Trust below level floor for 30 days: one level down; fake evidence, face-match failure or serious safety breach: paused at once to Admin; two surprise-QC fails in 60 days… (S · confirmed)
- AIEC-REQ-0081 [APPEALS] Appeals for wrong ratings or rejected evidence with fixed response SLA and visible status. (S · confirmed D)
- AIEC-REQ-0082 [GAMIFY] XP for verified quality milestones; Bronze/Silver/Gold/Platinum levels; badges for safety, first-pass QC, skills, punctuality, customer satisfaction; weekly and monthly q… (S · confirmed)
- AIEC-REQ-0083 [ONBOARD_ENGINE] Onboarding: apply by voice/buttons, verify (ID, bank, face enrolment with liveness, e-Shram/platform registration), AI-guided training in 3 languages, picture quiz, safet… (S · confirmed L)
- AIEC-REQ-0084 [AGGREGATOR_PAGE] Open page for new workers (no login to look): earning calculator from real data (shows no figure until real data exists), skills wanted by area, filters by skill/city/ava… (S · confirmed)
- AIEC-REQ-0086 [HONESTY_STRATEGY] Honesty design: daily identity check, proof only via in-app camera, payment on proof, next team/QC checks previous work, surprise QC, bond/bonus only as contract allows, … (S · confirmed)
- AIEC-REQ-0088 [TRAINING] AI-guided training per SOP with short videos in Marathi/Hindi/English; quizzes by pictures. (S · confirmed)
- AIEC-REQ-0090 [ADMIN_QUEUE] Admin Today is an exceptions-first queue: approvals, red projects, disputes, payouts, failed AI checks, SOS/incident follow-ups. Each exception has one accountable owner,… (S · confirmed)
- AIEC-REQ-0091 [ADMIN_MAP] Admin live map of riders, technicians, QC, containers and sites with filters by role, stage, area, delay, level, payment status; tap any item opens its Project file. Colo… (S · confirmed)
- AIEC-REQ-0092 [APPROVALS_INBOX] Approvals: container third key, critical evidence, price overrides, pauses and replacements, payouts (one-click batches), worker promotions; named backup approver at all … (S · confirmed)
- AIEC-REQ-0093 [ANALYTICS] Business analytics: leads per rider per km, conversion by stage, quote win rate by price level, days per stage, QC first-pass rate, cash in vs owed, worker supply by area… (S · confirmed)
- AIEC-REQ-0094 [OWNER_PAGE] Owner page: revenue and cash, pipeline value, average margin, lifts installed/in progress, worker supply and quality, top 5 risks, plus short decision queue (rule changes… (S · confirmed)
- AIEC-REQ-0095 [DAY_CLOSE] Admin evening day-close rolls unreviewed items to tomorrow with an owner. (S · confirmed)
- AIEC-SEC-0019 [SEC_BASELINE] Security baseline: TLS everywhere, encrypt sensitive offline data, no secrets in bundle/logs/backups, rate limits on OTP/API/OCR/quote/unlock/payout, webhook signature va… (S · confirmed)
- AIEC-SEC-0020 [PRIVACY] Collect only needed data; purpose-specific notices and consent in three languages; withdrawal; data-subject requests; breach procedure; retention and anonymisation; priva… (S · confirmed L)
- AIEC-REQ-0105 [NO_PROD_CLAIM] The system is not called production-ready until integrations, automated tests, security review, field tests, recovery tests and professional approvals are actually comple… (S · confirmed)
- AIEC-REQ-0106 [PILOT_SCOPE] Pilot scope decisions: Pune only, lift types and floors, multi-tower acceptance, supplier count, pilot crew of Owner's trusted Senior Technicians, supply side started bef… (S · awaiting approval D)
- AIEC-REQ-0107 [BUILD_PROCESS] Build process requested: fresh branch, several careful steps, each phase ends in working demo tested by a real user of that role, research on internet/GitHub, ask questio… (S · confirmed)
- AIEC-REQ-0108 [MANAGER_ASSISTANT] App acts as manager (assigns, tracks deadlines, nudges, escalates, routes exceptions) and assistant (speaks instructions, fills known fields, suggests next action, drafts… (S · confirmed)
- AIEC-REQ-0109 [THREE_LAYERS] Specification answers what was meant and needed (trust and cash control machine, one clock and one truth, honesty must pay) not only what was literally asked. (S · confirmed)
- AIEC-REQ-0110 [FOUR_LOCKS] Four locks on profit: no material leaves without payment, no worker paid without proof, nobody bypasses the platform, no lift runs without a licence. Data moat: geotagged… (S · confirmed)
- AIEC-REQ-0112 [FAILURE_PATHS] Every workflow has a defined failure path: no network, GPS or camera denied, invalid/expired quote, payment pending/failed/duplicate callback, supplier delay, material mi… (S · confirmed)
- AIEC-REQ-0113 [GIG_REGISTRATION] If counsel confirms that AIEC is a covered aggregator, the app registers each contractor on the government gig-worker portal when onboarded and reports joins and exits in… (P · proposed LED)

## Tests (62) — `python3 scripts/spec.py test N`
- API: 1, 2, 4, 57, 69, 98, 121, 170, 171, 180, 183, 210, 213, 214, 218, 223, 227, 235
- Unit: 78, 81, 144
- Integration: 79, 80, 108, 127, 145, 165, 225, 228, 249, 265, 267, 269, 272
- E2E: 82, 84, 97, 114, 119, 146, 149, 150, 156, 160, 201, 216, 217, 219, 246, 251, 264, 266, 271
- Review: 83, 96, 154, 155, 258
- Security: 95
- Device: 178, 257, 262

## Decisions to check (tier 0) — `python3 scripts/spec.py dec N`
