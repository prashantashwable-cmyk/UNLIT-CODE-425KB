## 24. Contractor management and earnings

### 24.1 Ledger
Each line: project, contractor, milestone, evidence, QC result, approval time, agreed rate, payment status. Buckets per LEDGER_BUCKETS (V3 four buckets vs OCT eight categories — the data model supports the superset; display follows DEC-001).

### 24.2 Payout alternatives (illustrative ₹50,000 of confirmed earnings; none implemented)

| Model | Week/time point | Paid so far | Outstanding | Note |
|---|---|---:|---:|---|
| A (OCT literal / V3 Option A): 10% of job each weekend | after week 4 | ₹20,000 | ₹30,000 | fully paid after week 10 |
| A | after week 10 | ₹50,000 | ₹0 | about 2.5 months |
| OCT module: 10% first weekend, then 10% of opening balance weekly | after week 4 | ₹17,195 | ₹32,805 | geometric decay, never reaches zero |
| OCT module: 10% first weekend, then 10% of opening balance weekly | after week 12 | ₹35,879 | ₹14,121 | geometric decay, never reaches zero |
| OCT module: 10% first weekend, then 10% of opening balance weekly | after week 26 | ₹46,769 | ₹3,231 | geometric decay, never reaches zero |
| B (V3 Option B): 70% first weekend after QC, 30% 90-day bond | first weekend | ₹35,000 | ₹15,000 | bond released after 90 days with no defect; 6-month bonus amount undefined |
| B | day 90+ | ₹50,000 | ₹0 | legality of bond ⚖️ |
| C (lowest-risk proposal, not in sources): pay all confirmed undisputed earnings in the next weekly cycle | first weekly cycle | ₹50,000 | ₹0 | loyalty via separate documented bonus only |

*Observation (computed):* a "10% of opening balance each week" rule never reaches zero; a final settlement date or sweep rule is required whichever model is chosen.

### 24.3 Rules (SOURCE)
Confirmed = QC pass + Admin approval. Customer rating affects bonus/promotion only (7-day auto-accept). No cash fines; deductions only per signed contract after review. Never confiscate on exit; documented exit and final settlement. Two-person approval for material overrides; provider-confirmed paid only.

### 24.4 Ladder, rating, trust, gamification
Applicant → Trainee → Technician → Senior Technician → QC Inspector (thresholds in LADDER). Weighted rating (C·m + Σstars)/(C+n): one 5★ review → 4.36; fifty 4.8★ → 4.72 (computed). Trust score weights 40/15/10/10/15/10. Bronze–Platinum tiers are a **separate reward system** from the career ladder (DEC-032). No automatic demotion on unreviewed allegations; appeals have an SLA; speed alone earns nothing.

### 24.5 Onboarding engine
Apply → verify (ID, bank, face with liveness, e-Shram) → learn → safety test → trial job → auto-proposal with Admin confirm → monthly spoken review; stalled steps escalate automatically to Coordinator then Admin.
