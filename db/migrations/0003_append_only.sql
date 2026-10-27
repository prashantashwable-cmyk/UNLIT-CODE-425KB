-- 0003: append-only hardening (invariants 1, 2, 5). From the rls-auditor review of 0001/0002.
-- Row triggers in 0001 do not fire on TRUNCATE, and service_role (server key) had UPDATE/DELETE/TRUNCATE.

-- More tables are history, not state: a withdrawal, re-check or correction is a new row.
create trigger ledger_journal_ro before update or delete on ledger_journal for each row execute function forbid_update_delete();
create trigger evidence_check_ro before update or delete on evidence_check for each row execute function forbid_update_delete();
create trigger consent_ro        before update or delete on consent_record for each row execute function forbid_update_delete();

-- TRUNCATE bypasses row triggers: block it with statement triggers, for every role including the owner.
do $$ declare t text; begin
  foreach t in array array['stage_event','evidence_asset','evidence_check','ledger_journal','ledger_entry',
                           'audit_event','consent_record'] loop
    execute format('create trigger %I before truncate on public.%I for each statement execute function forbid_update_delete()',
                   t || '_no_truncate', t);
    execute format('revoke update, delete, truncate on public.%I from service_role', t);
  end loop;
end $$;

-- A ledger entry must move money (0/0 rows pass the balance trigger but mean nothing).
alter table ledger_entry add constraint ledger_entry_nonzero check (debit_paise + credit_paise > 0);
