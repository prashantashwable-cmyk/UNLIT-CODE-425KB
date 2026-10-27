## 7. Business model and operating principles

**Asset-light platform.** AIEC holds no stock and no payroll. Workers are independent contractors under reviewed agreements (⚖️ classification risk, DEC-016). Money moves through authorised providers only.

**Four locks (V3§1):** no material leaves without payment · no worker is paid without proof · nobody bypasses the platform · no lift runs without a licence.

**Entity relationships**

```mermaid
erDiagram
  CUSTOMER ||--o{ SITE : owns
  SITE ||--o{ LIFT : contains
  LIFT ||--|| PROJECT : "one file per lift"
  PROJECT ||--o{ QUOTE_VERSION : has
  PROJECT ||--|| AGREEMENT : has
  PROJECT ||--o{ PAYMENT : receives
  PROJECT ||--o{ PURCHASE_ORDER : triggers
  SUPPLIER ||--o{ PURCHASE_ORDER : fulfils
  PURCHASE_ORDER ||--o| CONTAINER : ships_in
  PROJECT ||--o{ STAGE_EVENT : records
  PROJECT ||--o{ EVIDENCE : holds
  PROJECT ||--o{ QC_INSPECTION : undergoes
  PROJECT ||--o| LICENCE : needs
  PROJECT ||--o| AMC : becomes
  AMC ||--o{ SERVICE_TICKET : receives
  CONTRACTOR ||--o{ EARNING_LINE : earns
  PROJECT ||--o{ EARNING_LINE : generates
```

**Canonical lifecycle** (preserved from V3§5; OCT has no licence stage → DEC-013):

```mermaid
stateDiagram-v2
  [*] --> LeadCaptured
  LeadCaptured --> LeadVerified
  LeadVerified --> Contacted
  Contacted --> Quoted
  Quoted --> AgreementToken
  AgreementToken --> SiteReadiness
  SiteReadiness --> QCClearance
  QCClearance --> SiteReadiness: QC rejects
  QCClearance --> PermitApplied
  PermitApplied --> ProductionOrder
  ProductionOrder --> Dispatch
  Dispatch --> ContainerDelivery
  ContainerDelivery --> CabinDelivery
  CabinDelivery --> Installation
  Installation --> QCInspector
  QCInspector --> Installation: fail / rework
  QCInspector --> Licence
  Licence --> Handover
  Handover --> AMC
  AMC --> [*]
```
