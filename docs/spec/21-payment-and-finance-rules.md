## 21. Payment and finance rules

### 21.1 Principles
- Commercial **ledger**, not a stored-value wallet; authorised provider; webhook signature verified server-side; idempotency keys; immutable double-entry journal; corrections by reversal.
- States: pending, failed, reversed, disputed, confirmed — separate.
- A client "success" page is never proof. Reconcile daily with provider/bank reports.
- Provider hold/release is a mechanism; whether it satisfies "escrow" legally is unconfirmed (R-10).

### 21.2 Customer schedule (₹10,00,000 example, token credited to 70%)

| Milestone | Amount |
|---|---:|
| Token (agreement) | ₹10,000 |
| Standard material 70% less token | ₹6,90,000 |
| Custom cabin 20% | ₹2,00,000 |
| Handover 10% | ₹1,00,000 |
| **Total (token credited)** | **₹10,00,000** |

*Alternative if token is additional (DEC-003):* ₹10,000 + ₹7,00,000 + ₹2,00,000 + ₹1,00,000 = **₹10,10,000** unless the contract value is reduced; refund/credit treatment undefined.

If the token is **additional** (DEC-003) the engine produces the alternative schedule shown above; the owner/CA decide before any invoice logic is final.

### 21.3 Money gates
Dispatch and cabin production gates read the **configured trigger** (DEC-004, DEC-019). EMI: NBFC pays; status only from NBFC; disbursal timing per DEC-004.

### 21.4 Cancellation and refund (SOURCE proposal, V3§5; ⚖️⚠️)

| Cancel at | Proposed rule |
|---|---|
| Before QC clearance (stages 5–7) | Token refunded in full if QC rejects site; otherwise less documented costs incurred |
| After production order, before dispatch | Token forfeited plus proven supplier cost for custom items |
| After dispatch | Return freight and handling charged; rest refunded per agreement |
| After 70%/20% paid | Custom cabin non-refundable; standard material returnable only if unopened and BOM-matched |
| After installation starts | No refund of delivered and installed work; dispute process |

### 21.5 Disputes, reversals, receipts
Payment receipts generated from provider data; chargebacks and reversals create new ledger entries; customer dispute → Disputed side state; already-confirmed worker pay continues.

### 21.6 Cash-flow table (to fill before pilot; no figures invented)

| Milestone | Cash in | Costs before next cash in | Gap to fund |
|---|---|---|---|
| Token | ₹10,000 | Rider verified-lead amount, e-stamp, eSign, permit fees, stage-7 QC visit | to fill |
| 70% | ₹6,90,000 | Supplier standard material, container, GPS/lock, transport, payment fees | to fill |
| 20% | ₹2,00,000 | Custom cabin, payment fees | to fill |
| Installation | none | Labour, QC, Inspector fees, insurance | to fill |
| 10% | ₹1,00,000 | AMC reserve, contingency, final payout | to fill |

Tax matters (GST on supply + installation, customer TDS, contractor TDS/GST, advance as revenue vs liability) are CA questions (section 41).
