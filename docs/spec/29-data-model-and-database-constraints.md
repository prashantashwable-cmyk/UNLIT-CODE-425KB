## 29. Data model and database constraints

**Recommended core (PROPOSED, consistent with sources):** PostgreSQL with row-level security on every exposed table (R-14), PostGIS for geofence/duplicate matching, object storage for evidence, background job queue, append-only event/audit tables. Choice of Supabase is an *implementation dependency*, not a decision made here (DEC-012). The repository was not available, so no migration-compatibility analysis was possible.

### 29.1 Canonical entities

| Group | Entities | Key constraints |
|---|---|---|
| Parties | Customer, CustomerContactConsent, Contact(party roles: signatory/payer/rep/borrower), Supplier, ContractorProfile, UserAccount, RoleAssignment | Unique phone per account; role assignment has start/end; consent rows immutable |
| Property | Site (geometry, geofence radius), Lift (site_id, tower/unit label), Project (lift_id unique) | One active Project per Lift; geofence index (GiST) |
| Sales | Lead, LeadAttribution, Quote, QuoteVersion, VariationQuote, RateCard, RateCardVersion | Quote version immutable; price ≥ role floor enforced by function; attribution unique(lead_id, rider_id, kind) |
| Contract | Agreement, Signature, Permit, Licence, Inspection | Agreement version immutable; licence has holder and expiry |
| Workflow | ProjectStage, StageEvent (append-only), Task, GateRule, SLAClock, Escalation, Approval, Issue | Transition table (from,to,required proofs, approvers); StageEvent has idempotency_key unique |
| Evidence | EvidenceAsset, EvidenceCheck, HumanReview, Defect, Rework | capture_id unique; hash not null; no UPDATE/DELETE grant |
| Logistics | PurchaseOrder, BOM, MaterialLot, Container, CustodyEvent, LockEvent | Lock events append-only; serial/lot unique per project |
| Money | LedgerAccount, LedgerEntry (double entry), PayoutBatch, Payout, ProviderWebhook, Reconciliation, Payment | unique(provider, provider_event_id); entries balance (sum debit = sum credit per journal); no UPDATE/DELETE |
| Workforce | Skill, Certification, TrainingAttempt, TrustSnapshot, Rating, Appeal, Badge, XPEvent | Trust snapshots immutable with reason codes |
| Comms | ChatThread, ChatMessage, Notification (outbox), DeliveryReceipt | Message kind = human/system/approval |
| Service | AMCContract, AMCTicket, RescueIncident, Incident | Ticket severity enum |
| Governance | AuditEvent (append-only), DataConsent, RetentionRule, RuleConfig, RuleChange | Rule change needs Owner approval record |

### 29.2 Status enums (initial)
`stage`: lead_captured … handover, amc (16); `side_state`: none, on_hold, disputed, cancelled, lost; `payment`: pending, confirmed, failed, reversed, disputed; `evidence_risk`: green, amber, red; `ticket_severity`: trapped_person, unsafe_operation, breakdown, repeat_fault, routine; `approval`: requested, approved, rejected, expired.

### 29.3 Indexes (initial)
Geofence GiST on Site; (project_id, created_at) on StageEvent/Evidence; (contractor_id, cycle) on LedgerEntry/Payout; unique idempotency keys; partial index on open exceptions.

### 29.4 Retention
Retention classes: evidence/audit (legal hold during project, defect/bond period and statutory limit — **period not set; ⚖️**), consent records (life of relationship + limit), call recordings (only if approved; DEC-026), CCTV (⚖️), location tracks (short, duty-only). After retention, personal identifiers are anonymised; audit action preserved.
