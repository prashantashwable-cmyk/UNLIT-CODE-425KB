## 8. User roles and permission matrix

**Roles inventory** (12 source roles + 4 added by inference; none removed or merged):

| Role | Source | Main job |
|---|---|---|
| Rider / Scout | OCT, V3 | Find lift-ready sites, capture leads |
| Sales bot | OCT, V3 | WhatsApp, calls, quote, first negotiation (system actor) |
| Negotiator (human) | V3 | Close deals down to floor |
| Customer / Builder | OCT, V3 | Pay, approve, sign, track, complain; may name a representative |
| Trainee / Technician | OCT, V3 | Install and service by SOP |
| QC Inspector | OCT, V3 | Clearance, surprise QC, handover witness |
| Supplier | OCT, V3 | Produce, pack, ship |
| NBFC partner | OCT, V3 | Approve and track EMI |
| Coordinator | V3 | Assist workers, onboarding, field issues; never approves work |
| Admin | OCT, V3 | Run and approve everything |
| Owner | OCT, V3 | Growth view and decision queue |
| Applicant | V3 | Onboarding and training only |
| Senior Technician *(inferred from ladder, V3§9)* | V3 | Leads whole installation, mentors |
| Rescue / AMC responder *(inferred, V3§5)* | V3 | 24×7 human response to trapped-person alert |
| Resident (QR user, no login) *(inferred, BP§4.16)* | BP | Report fault or trapped person |
| Backup approver / delegate *(V3§4)* | V3 | Second approver when Admin/Owner unavailable |

**Permission matrix** (S see · D do · — never; reproduced from V3§4 and enforced by database policies; the 4 inferred roles inherit the narrowest applicable row and need owner confirmation):

| Data / action | Rider | Sales bot | Negotiator | Customer | Technician | QC | Supplier | NBFC | Coordinator | Admin | Owner | Applicant |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Base cost and margin | — | rules only | floor only | — | — | — | own supply price | — | — | S/D | S | — |
| Quoted price | — | S/D to bot limit | S/D to floor | S | — | — | — | S | — | S/D | S/D incl. below floor with reason | — |
| Customer phone | masked | S | S | own | masked calls | masked | — | S with consent | — | S | — | — |
| Worker phone | — | — | — | masked | own | own | — | — | assigned, audited | S | — | own |
| Site location/photos | own leads | S | S | own | assigned | assigned | delivery point | S | assigned sites | S | summary | — |
| Drawings | — | — | — | S | assigned | assigned | S (production) | — | — | S/D | — | — |
| Payment status | — | S | S | own | paid/not paid | same | own orders | own loans | — | S/D | S | — |
| Open container lock | — | — | — | D (named rep, key 1/3) | D (key 1/3) | — | — | — | — | D (key 3/3) | — | — |
| Capture evidence | own leads | — | — | readiness photos | assigned | assigned | dispatch photos | — | assisted only | — | — | training only |
| Approve stage gate | — | — | — | readiness, handover | site start; peer check of other team | QC gates | dispatch | loan | recommend only | all + override | — | — |
| Approve pause/replacement | — | — | — | — | request | — | — | — | recommend | D | — | — |
| Release payout | — | — | — | — | — | — | — | — | — | D (2nd approver above limit) | D as 2nd approver | — |
| Earnings | own | — | own | — | own | own | own invoices | — | — | all | totals | — |
| Other workers on map | — | — | — | — | same-project team | — | — | — | assigned | all | heat map | — |
| Change rules | — | — | — | — | — | — | — | — | — | propose | approve | — |

**Hard rules (SOURCE, V3§4):** no self-approval; ≥2 approvers always available; masked contact; technician access ends 90 days after handover (defect/AMC tickets only); every override loud and reviewed by Owner weekly; sensitive reads logged; offline unlock codes issued by someone other than the third-key Admin.

**For each role** the following are specified in section 15 (module tables) and section 11 (screen inventory): responsibilities, allowed screens, allowed actions, data visibility, approval authority, financial/evidence permissions, restrictions, escalation path, audit. Escalation path default: worker → Coordinator → Admin → Owner; backup approver when absent.
