## 39. Implementation phases and dependencies

| Phase | Scope | Prerequisites | Modules/screens | Data/API | External dependencies | Security | Acceptance tests | Exit criteria | Risks |
|---|---|---|---|---|---|---|---|---|---|
| 0 Decide | Resolve DEC-001–006, 012, 013; rate card; SOP author; reviews | Owner time; professionals | none | rule configs defined | Lawyer, CA, lift engineer, payment partner, NBFC | — | T-099 | Owner signs off spec; written opinions | Delay, scope creep |
| 1 Foundation | Login, roles, RLS, Site/Lift/Project, state machine, languages/themes/scale, evidence camera, offline queue, chat, audit, SOS | Phase 0 stack | M1, M12, M15, SCR-001–020 | Core schema, auth, outbox | Push, maps | RLS tests, secrets | T-001–T-008, T-062–T-069, T-098 | Each role sees only allowed data | Low-end devices |
| 2 Money rails | Ledger, provider integration, webhooks, payouts, KYC, onboarding basics | Provider selected | M13 | Ledger, webhook | Payment/payout provider | Signature, idempotency | T-027–T-035, T-070–T-077 | Test payment received, held, split, paid out | Escrow unconfirmed |
| 3 Rider | Day start/end, tracking, capture, OCR, consent, duplicates, map, earnings | 1, 2 | M2 | Leads, geo | OCR, geocoding | Tracking privacy | T-009–T-016 | 3 riders × 5 days Pune; ≥90% leads pass verification | Android background limits |
| 4 Sales | WhatsApp, calls, requirement, price engine, bot, hand-off | 1, 3 | M3 | Quote, rate card | WhatsApp provider | Floor enforcement | T-017–T-025 | 20 real leads quoted; none below floor | Template approval, TRAI |
| 5 Agreement to QC | e-stamp/eSign, token, readiness, QC clearance, variation, drawings | 2, 4 | M4, M6 | Agreement, variation | e-stamp/eSign | Authority proof | T-026–T-040 | First token paid and variation check end-to-end | Legal text |
| 6 Permit, supply, delivery | Statutory tracker, supplier, BOM, container, custody, EMI | 5, vendors | M7 | PO, BOM, lock events | Container vendor, NBFC | Lock approvals | T-041, T-045–T-050 | One container delivered and unlocked correctly | Vendor limits |
| 7 Installation | Safety gate, 5 sub-stages, SOP videos, AI + human, pauses, SOS, safety PDF, ledger rules | 1, 2, 6 | M5, M15 | SOP versions, evidence checks | AI provider, STT/TTS | Evidence integrity | T-051–T-059, T-064–T-065 | One lift installed in 14 days with full evidence | AI false rejects |
| 8 QC, licence, handover | Surprise QC, Inspector gate, licence, 3 signatures, final 10%, NOC, AMC, rescue QR | 7 | M6, M14 | Licence, AMC | Rescue staffing | QR no PII | T-041–T-044, T-060, T-088–T-089, T-105–T-106 | First lift licensed, handed over, in AMC | Statutory timing |
| 9 Control | Admin queue/map, Owner, analytics, onboarding engine, ladder automation | 1–8 | M8–M11, M13 | KPIs | — | Audit alerts | T-082–T-084, T-078–T-081 | Admin runs full day from app with backup approver | Data volume |
| 10 Polish and pilot | Role-by-role polish, usability with low-literacy users, restore drills | All | all | — | — | Pen test, restore | T-090–T-100 | 4/5 users unaided per field task; security review; restore tested | Real-world gaps |

The later phases remain in scope; they are sequenced, not removed.
