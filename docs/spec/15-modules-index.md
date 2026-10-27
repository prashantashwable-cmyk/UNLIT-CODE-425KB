## 15. Detailed module specifications

Each module lists layout, primary component, interaction and visual treatment. Field modules use **Outdoor high-contrast** or **Light glass**; Admin/Owner may use **Colour glass** or the **dark Command Center** option.

| Module | Roles | Layout and visual treatment | Primary interaction | Key requirements |
|---|---|---|---|---|
| M1 Access and onboarding | ALL | Full-screen splash, large language buttons with flag-free text (मराठी/हिंदी/English), number pad | OTP → face/PIN → permission wizard with picture per permission | ROLE_LOGIN, PERM_WIZARD, ACCOUNT_RECOVERY, CONSENT_REC |
| M2 Rider | Rider | Map-dominant; bottom sheet for pin detail; capture button 30% height; large km/area/earnings counters | Stop-to-capture → confirm number → consent yes → duplicate check | LEAD_CAPTURE, STOP_CAPTURE, RIDER_MAP, DUP_LEAD |
| M3 Sales and negotiation | Sales, Negotiator, Owner | Map + queue; chat with price-history chip; floor never shown to customer view | Take over chat; offer price within limit | AUTO_QUOTE, PRICE_LADDER, BELOW_FLOOR |
| M4 Customer | Customer | Pizza-tracker top card; tabs for Quote, Pay, Track, Drawings, Safety, Service, AMC; read-aloud agreement | Sign, pay, approve unlock, upload readiness photos | CUSTOMER_VIEWS, AGREEMENT, PAY_SCHEDULE |
| M5 Technician | Technician | Today card = current SOP step; padlock for locked steps; 10-second video recorder; money coin-stack | Safety gate → SOP video → proof capture → peer check | SAFETY_GATE, SOP_VERSIONED, PEER_RELAY |
| M6 QC | QC | Visit list on map; numeric measurement form with units and tolerance chip; instrument-in-photo prompt | Measure → pass/fail → sign | QC_CLEARANCE, SURPRISE_QC |
| M7 Supplier and NBFC | Supplier, NBFC | Compact office layout; order stepper; packing photo checklist | Accept order → pack → dispatch (blocked until funds confirmed) | SUPPLIER_PO, DISPATCH_RULES, EMI_NBFC |
| M8 Coordinator | Coordinator | Review queue with side-by-side evidence; assisted-mode banner "assisting <name>" | Resolve flag within response limit | ASSISTED, GPS_DRIFT |
| M9 Worker aggregator and onboarding | Applicant | Hero with earning calculator (only real data), skill/city filters, picture quiz | Join → KYC → training → safety test → trial | AGGREGATOR_PAGE, ONBOARD_ENGINE |
| M10 Admin | Admin | Exceptions-first list; live map with colour filters; approvals inbox | Resolve top exception; approve with reason | ADMIN_QUEUE, ADMIN_MAP, APPROVALS_INBOX |
| M11 Owner | Owner | One-page cards (cash, pipeline, margin, risks) + decision queue; optional dark theme | Decide queued item | OWNER_PAGE |
| M12 Chat and approvals | ALL | Chronological timeline, human vs system bubbles distinguished by icon and alignment; approval cards with Approve/Reject | Structured approval reply | CHAT |
| M13 Money and ledger | ALL | Bucket chips (Provisional, Confirmed, Payable, Bond/Reserve, Disputed), table-to-card; provider reference visible | Open line → evidence | LEDGER_BUCKETS, LEDGER |
| M14 AMC, service and rescue | Customer, Resident, Technician, Rescue | QR page with one huge red "Person trapped" and one blue "Report problem" | Trapped → human line; fault → ticket | AMC_FLIP, ENTRAPMENT, SERVICE_TICKET |
| M15 Safety and incident | Technician, Admin | Persistent red SOS, incident form with photo; freeze banner on all phones of that site | SOS → 112 → incident | SOS, INCIDENT |

- [15.1 Field-level specification: Rider role (SCR-021 to SCR-028)](modules/15.01-rider.md)
- [15.2 Field-level specification: Technician role (SCR-017, SCR-050 to SCR-058)](modules/15.02-technician.md)
- [15.3 Field-level specification: Customer role (SCR-035 to SCR-049)](modules/15.03-customer.md)
- [15.4 Field-level specification: QC Inspector role (SCR-059 to SCR-062)](modules/15.04-qc.md)
- [15.5 Field-level specification: Admin and Owner (SCR-073 to SCR-085)](modules/15.05-admin-owner.md)
- [15.6 Field-level specification: Sales and Negotiator (SCR-029 to SCR-034)](modules/15.06-sales-negotiator.md)
- [15.7 Field-level specification: Supplier and NBFC (SCR-063 to SCR-066)](modules/15.07-supplier-nbfc.md)
- [15.8 Field-level specification: Coordinator (SCR-067, SCR-068)](modules/15.08-coordinator.md)
- [15.9 Field-level specification: shared access and core screens (SCR-001 to SCR-014, SCR-018 to SCR-020)](modules/15.09-shared-core.md)
- [15.10 Field-level specification: evidence camera and review (SCR-015, SCR-016)](modules/15.10-evidence-camera.md)
- [15.11 Field-level specification: worker onboarding (SCR-069 to SCR-072)](modules/15.11-worker-onboarding.md)
- [15.12 Field-level specification: resident QR and rescue (SCR-086, SCR-087)](modules/15.12-resident-rescue.md)
