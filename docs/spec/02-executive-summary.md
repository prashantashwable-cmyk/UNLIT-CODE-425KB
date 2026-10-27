## 2. Executive summary

AIEC is an asset-light platform that finds lift-ready construction sites (Riders), sells (Sales bot and Negotiator), contracts and collects money through milestones, procures from suppliers in a GPS container, installs with independent contractors (Technicians) working to a strict proof-based SOP, inspects (QC and the statutory Electrical Inspector), hands over, and then runs AMC.

The three sources agree on the spine and disagree on several money and safety details. This specification therefore:

1. Keeps **one Project record per Lift** under a Site, with one server-enforced state machine of **16 stages** plus side states.
2. Treats **evidence, money, and safety** as three locks: proof captured only by the in-app camera; payment status only from a verified provider callback; safety-critical sign-off only by a qualified human.
3. Lists **32 owner/professional decisions** (section 40) — none are silently chosen. Where a recommended default exists it is labelled and configurable.
4. Gives every screen and module a visual and interaction specification suitable for an inexpensive Android phone, Marathi-first.
5. Provides a traceability matrix (section 42) and a computed coverage audit (section 43).

**What the owner must do first:** answer the tier 1 and tier 2 decisions in section 40.0 (16 decisions) and obtain written opinions from a lawyer, CA, licensed lift engineer and the payment provider. Until then, payout and payment-release features stay disabled by configuration.
