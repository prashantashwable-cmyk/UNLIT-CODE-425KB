## 25. Admin and Owner Command Center

**KPI catalogue** (formulas are definitions to implement; no value is invented):

| KPI | Formula | Data source | Refresh | Filters / drill-down | Owner/Admin action |
|---|---|---|---|---|---|
| Active projects by stage | count(Project) grouped by main stage | Project | Real-time | Stage, area, lift type → project list | Open delayed project |
| Delayed / blocked | stage age > stage limit, or side state | Stage events | Real-time | Cause, owner → timeline | Assign, escalate |
| Payment exceptions | provider ≠ ledger, pending > N days | Reconciliation | Daily | Provider, milestone → transaction | Resolve mismatch |
| QC first-pass rate | QC passes first time ÷ QC attempts | QC | Daily | Team, level | Retrain, review |
| Missing evidence | gates waiting on proof | Evidence checks | Real-time | Project, worker | Nudge/retake |
| Pending approvals | open approvals by age | Approvals | Real-time | Type, approver | Approve/delegate |
| Supplier delay | committed date − actual | PO | Daily | Supplier | Escalate |
| Worker availability | active workers ÷ jobs open by area | Worker/availability | Daily | Skill, area | Recruit |
| SLA breaches | count breached clocks | SLA clocks | Real-time | SLA, role | Escalate |
| Lead funnel conversion | stage-to-stage ratios | Lead/Project | Daily | Rider, area | Coach |
| Quote win rate by first-quote level | wins ÷ quotes per level | Quote versions | Weekly | Area, level | Tune rate card |
| Gross margin after full costs | (price − fully loaded cost) ÷ price | Ledger, cost lines | Weekly | Project, lift type | Reprice |
| Cash exposure / aging receivables | cash out committed − cash in; invoice age | Ledger | Daily | Milestone | Collect, hold |
| AMC renewals due | contracts expiring ≤ 60 days | AMC | Daily | Customer | Renew |

Dashboards show **only connected-provider data**; an unconnected provider is labelled "not connected" (T-084).
