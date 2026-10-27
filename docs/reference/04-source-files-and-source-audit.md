## 4. Source files and source audit

| File | Lines | Bytes | Nature | Unique contribution |
|---|---:|---:|---|---|
| OCT_FILE.TXT | 371 | 22,723 | Owner's brain dump (English, Marathi) incl. contractor module and 3 pasted prompts | Original intent, numbers (160/130/120, 10k, 70/20/10, 14 days), wording ("wallet", "kill switch") |
| ALL_INDIA_ELEVATORS_COMPANY___App_Build_Spec_v3.md | 715 | 77,217 | Builder-ready spec with 16 stages, permission matrix, money rules, trust score | Stage order, matrix, cancellation table, ladder numbers, legal checklist |
| AIEC_Elevator_OS_Research_Enhanced_Blueprint.md | 765 | 40,132 | Review and improvement blueprint | Safety/legal/financial corrections, 66-point coverage list, phases |

**Method.** Every heading, table and list in the three files was read. Requirements were extracted into a register (section 42); each row records its source file and section/topic (no invented line numbers). Overlaps were merged while keeping each distinct number, exception and condition; contradictions became decisions (section 40). Coverage maps in section 43 trace the BP 66-point list, the V3 audit fixes, and OCT items to requirement IDs.

**Observed file-level conflicts:** OCT asks for "100% instant digital wallet" and "no liability" via contractor labelling; V3 and BP say wallet needs RBI authorisation and labels do not remove duties. OCT omits any licence step; V3 inserts one before handover. These are preserved as conflicting requirements, not resolved.
