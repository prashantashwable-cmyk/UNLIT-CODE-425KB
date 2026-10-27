# Phase 6 context pack (generated; mapping PROPOSED)

Workflows: WF-07, WF-09

Read first: `python3 scripts/spec.py sec 16.2` (stage rules). Screens are read one at a time, never whole modules:
- `15.2` (modules/15.02-technician.md): preamble `spec.py sec 15.2`; screens SCR-055 via `spec.py sec SCR-nnn`
- `15.3` (modules/15.03-customer.md): preamble `spec.py sec 15.3`; screens SCR-042, SCR-043, SCR-044, SCR-049 via `spec.py sec SCR-nnn`
- `15.5` (modules/15.05-admin-owner.md): preamble `spec.py sec 15.5`; screens SCR-080 via `spec.py sec SCR-nnn`
- `15.7` (modules/15.07-supplier-nbfc.md): preamble `spec.py sec 15.7`; screens SCR-063, SCR-064, SCR-065 via `spec.py sec SCR-nnn`

## Requirements (16)
- AIEC-DATA-0009 [PARALLEL_TRACKS] Permit filing, supplier production and customer readiness may run as parallel tracks where their own gates allow. (S · confirmed)
- AIEC-SAFE-0002 [OFFLINE_CODE] Offline unlock code: issued by someone other than the Admin who is third key, single use, valid 15 minutes, still needs representative and technician face check, synchron… (S · confirmed)
- AIEC-REQ-0044 [PERMIT_TRACK] Statutory tracker per Lift: erection permission (filed after QC drawings, within 7 days), reference number, inspection, working licence, renewal/annual inspection where a… (S · confirmed L)
- AIEC-REQ-0046 [LICENCE_HOLDER] Decide whether AIEC or a partner contractor holds the lift contractor licence on each job; app stores the licence holder per project. The company never holds the owner's … (S · awaiting approval DL)
- AIEC-REQ-0048 [SUPPLIER_PO] Production order only on confirmed spec and signed variation, with permit number on file and dispatch date. Supplier accepts exact spec version; lead time, committed date… (S · awaiting approval D)
- AIEC-REQ-0049 [SUPPLIER_ONBOARD] Supplier onboarding and verification, RFQ and comparative quotation, bill of materials, material readiness (inferred from master brief; not detailed in sources). (P · proposed D)
- AIEC-REQ-0050 [BOM] Controlled BOM per sub-stage with quantity, serial/lot, substitutions, damage photos, approval. Extra material (cable, fasteners, sensors) needs a photo of damaged part w… (S · confirmed)
- AIEC-REQ-0051 [DISPATCH_RULES] Dispatch only after payment/EMI gate; material packed against BOM with photos; challan uploaded; container sealed; GPS and lock online. Supplier receives JIT alerts by pr… (S · confirmed)
- AIEC-SAFE-0005 [CONTAINER_LOCK] Container with GPS and digital lock opens only with approvals in app from customer's named representative, Technician and Admin, each with face check, while CCTV records,… (S · confirmed E)
- AIEC-SEC-0013 [CCTV_PRIVACY] CCTV and face checks are privacy-sensitive: defined access, purpose and retention. (S · confirmed L)
- AIEC-REQ-0052 [CUSTODY] At material handover the customer representative and installation Technician are present and sign digitally; custody clause states who is responsible for material until i… (S · confirmed L)
- AIEC-REQ-0053 [RETURN_FLOW] If payment is not confirmed the material returns to supplier with a safe-custody and escalation procedure, never an improvised roadside return; who bears return freight i… (S · awaiting approval DL)
- AIEC-REQ-0054 [MATERIAL_CLAIM] Missing or damaged material: photo against BOM line, supplier claim opened, installation continues on other sub-stages if safe. (S · confirmed)
- AIEC-REQ-0055 [SUPPLIER_VIEW] Supplier screens: new orders, dispatch date confirmation, JIT alerts, packing photos vs BOM, challan, seal check, delivery tracking, payment status of own invoices only. (S · confirmed)
- AIEC-REQ-0056 [CABIN_DELIVERY] Cabin delivered with representative present and handover signed; 20% released per the chosen escrow rule; supplier paid for cabin. (S · conflicting D)
- AIEC-REQ-0089 [INSURANCE] Insurance and responsibility records: contractor all-risk, workmen compensation/accident cover, third-party liability, rider cover, custody insurer; expiry and renewal al… (S · confirmed L)

## Tests (28) — `python3 scripts/spec.py test N`
- API: 30, 31, 37, 41, 46, 47, 48, 103, 135, 136, 137, 164, 202, 236
- E2E: 45, 49, 50, 138, 189, 203, 204, 209, 237, 238
- Integration: 122, 148, 224, 239

## Decisions to check (tier 4) — `python3 scripts/spec.py dec N`
- AIEC-DEC-006: default → No advance; claims are recorded; return costs unassigned
- AIEC-DEC-010: default → QC for safety-critical items, peer team for others
- AIEC-DEC-011: default → The trapped-person page is not published and no response time is stated
- AIEC-DEC-013: default → V3 order; handover blocked without licence
- AIEC-DEC-020: default → Excluded
- AIEC-DEC-021: default → Video plus photo certified by a competent person; tick-only rejected
- AIEC-DEC-022: default → From site start with paused days excluded, pending the lift engineer
