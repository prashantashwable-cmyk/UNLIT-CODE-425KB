## 40. Conflicts, ambiguities and owner decisions

**CONFLICTS, AMBIGUITIES AND OWNER DECISIONS.** None below has been resolved by this document. Each row gives conflicting source statements with locations, impact, options, risks, recommendation (only where supportable), who must approve, and whether implementation may proceed.

### 40.0 Decision order for the owner

Answer these in tier order; each tier unblocks the phases named. The right-hand column is what the software does **until** a decision is made: it never guesses, and money or safety features that depend on an unanswered decision stay off. Full option analysis for each decision follows.

| Tier | Decision | Question for the owner (plain words) | If not answered, the build default is |
|---|---|---|---|
| 1. Before the build starts | AIEC-DEC-012 | Will the field app (Rider, Technician, QC) be Android-only at launch, and which framework? | Native Android for field roles, web for others; framework chosen by the builder before Phase 1 |
| 1. Before the build starts | AIEC-DEC-014 | What is in release 1, and is the pilot Pune only? | Phases in section 39; Pune pilot |
| 1. Before the build starts | AIEC-DEC-005 | Who holds the lift contractor licence on each job: AIEC, a partner contractor, or the owner? | The app stores the licence holder per project; a job cannot reach the permit stage without one named |
| 1. Before the build starts | AIEC-DEC-016 | Are workers independent contractors, and has a labour lawyer approved the contract terms? | Live contractor onboarding stays off until a legal review is recorded; demo mode works |
| 1. Before the build starts | AIEC-DEC-017 | Confirm: no stored-value wallet, only an earnings ledger and an authorised payout partner? | Ledger only (no wallet) |
| 1. Before the build starts | AIEC-DEC-027 | Who are the two approvers, and who is the named backup approver? | Approval features cannot go live until two named approvers and a backup exist |
| 1. Before the build starts | AIEC-DEC-031 | Who will check the status of the 2026 Amendment and the current Rules at go-live? | Authority names and forms are configuration, nothing is hardcoded |
| 2. Before money features (Phase 2) | AIEC-DEC-001 | How are workers paid: 10% a week, 70% now plus 30% bond, or all confirmed earnings weekly? | Payout batch disabled; the ledger only records earnings |
| 2. Before money features (Phase 2) | AIEC-DEC-002 | May any part of earned pay be held back (reserve or bond)? | No reserve; reserve bucket exists but is switched off |
| 2. Before money features (Phase 2) | AIEC-DEC-003 | Is the Rs 10,000 token part of the 70% or extra, and when is it refunded? | Credited to the 70% (V3 draft), pending the CA |
| 2. Before money features (Phase 2) | AIEC-DEC-004 | Must the customer's 70% be confirmed before dispatch or at delivery? | Before dispatch (V3), pending written provider and NBFC confirmation |
| 2. Before money features (Phase 2) | AIEC-DEC-008 | What is the minimum price: markup or margin, on which cost base? | Floor of 1.20 on the fully loaded base; both markup and margin shown internally |
| 2. Before money features (Phase 2) | AIEC-DEC-018 | Does customer satisfaction affect worker base pay? | No: rating affects bonus and promotion only |
| 2. Before money features (Phase 2) | AIEC-DEC-019 | Is the 20% cabin payment due before production or at delivery? | Before production (V3) |
| 2. Before money features (Phase 2) | AIEC-DEC-023 | Penalty points only, with no cash fines? | Points only |
| 2. Before money features (Phase 2) | AIEC-DEC-030 | Should the 1-2% gig-worker contribution be priced in now? | A placeholder cost line; no engine |
| 3. Before sales, quotes and rider features (Phases 3 to 5) | AIEC-DEC-007 | What is the duplicate-lead window and the second rider's share? | 60 days and 10% of the main commission, only if the update adds something new |
| 3. Before sales, quotes and rider features (Phases 3 to 5) | AIEC-DEC-009 | At what difference does a variation quote become mandatory? | 5% on the full-cost baseline |
| 3. Before sales, quotes and rider features (Phases 3 to 5) | AIEC-DEC-015 | What does NOC legally mean, and can it be withheld? | NOC cannot be issued or used as a lever until defined |
| 3. Before sales, quotes and rider features (Phases 3 to 5) | AIEC-DEC-024 | Keep the 20% to 130% scale slider with minimum control sizes? | Slider kept; critical controls clamped |
| 3. Before sales, quotes and rider features (Phases 3 to 5) | AIEC-DEC-025 | Are automatic marketing calls allowed only with consent, DLT registration and a DND check? | Permission-based only |
| 3. Before sales, quotes and rider features (Phases 3 to 5) | AIEC-DEC-026 | Are calls recorded? | Chat first; no recording until provider, notice and retention are approved |
| 3. Before sales, quotes and rider features (Phases 3 to 5) | AIEC-DEC-028 | What does a rider earn per verified lead and per won deal? | Earnings screen shows Amount not set yet |
| 3. Before sales, quotes and rider features (Phases 3 to 5) | AIEC-DEC-029 | Is technician pay per lift or per sub-stage, by level? | Job offers cannot show a rate until set |
| 3. Before sales, quotes and rider features (Phases 3 to 5) | AIEC-DEC-032 | Keep the career ladder and the Bronze to Platinum reward tiers separate? | Kept separate |
| 4. Before installation and field safety (Phases 6 to 8) | AIEC-DEC-006 | Who pays supplier advances, freight, returns and damaged material? | No advance; claims are recorded; return costs unassigned |
| 4. Before installation and field safety (Phases 6 to 8) | AIEC-DEC-010 | Who must approve safety-critical checks: QC only, or also a peer team? | QC for safety-critical items, peer team for others |
| 4. Before installation and field safety (Phases 6 to 8) | AIEC-DEC-011 | Who staffs 24x7 rescue, and what response can you promise? | The trapped-person page is not published and no response time is stated |
| 4. Before installation and field safety (Phases 6 to 8) | AIEC-DEC-013 | Confirm the order: inspection, licence, handover, final payment? | V3 order; handover blocked without licence |
| 4. Before installation and field safety (Phases 6 to 8) | AIEC-DEC-020 | Confirm no remote lift lock in release 1? | Excluded |
| 4. Before installation and field safety (Phases 6 to 8) | AIEC-DEC-021 | How is safety consent proved on site? | Video plus photo certified by a competent person; tick-only rejected |
| 4. Before installation and field safety (Phases 6 to 8) | AIEC-DEC-022 | When does the 14-day clock start, and is 14 days right? | From site start with paused days excluded, pending the lift engineer |
