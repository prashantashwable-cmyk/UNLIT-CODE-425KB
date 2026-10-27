-- RLS tests: role policies from the permission matrix (spec §8, docs/data/permissions.csv) and invariant 6.
-- Run with: bash scripts/test-db.sh test. Everything happens in one transaction that is rolled back.
-- Does NOT cover T-001 (customer phone + 403 + audit event: customer table and API not written yet); only checks the
-- worker phone column is hidden. Partly covers T-002: access_until is honoured, but nothing yet sets it to handover
-- + 90 days from RuleConfig, and the defect/AMC ticket exception needs tables not written yet.
\set QUIET on
\o /dev/null
begin;
create schema t;
grant usage on schema t to anon, authenticated, service_role;

-- Act as an API caller: uid null = anon, else authenticated with that JWT subject.
create function t.login(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(uid::text, ''), true);
  perform set_config('role', case when uid is null then 'anon' else 'authenticated' end, true);
end $$;

create function t.eq(actual bigint, expected bigint, label text) returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception 'FAIL % (as %): expected %, got %', label, current_user, expected, actual;
  end if;
  raise notice 'ok - %', label;
end $$;

-- Runs sql as the current role; passes only if it raises the given SQLSTATE.
create function t.throws(sql text, state text, label text) returns void language plpgsql as $$
begin
  execute sql;
  raise exception 'FAIL % (as %): expected error %, statement succeeded', label, current_user, state;
exception when others then
  if sqlstate = 'P0001' and sqlerrm like 'FAIL %' then raise; end if;
  if sqlstate <> state then
    raise exception 'FAIL % (as %): expected error %, got % %', label, current_user, state, sqlstate, sqlerrm;
  end if;
  raise notice 'ok - %', label;
end $$;
grant execute on all functions in schema t to anon, authenticated, service_role;

-- ---------- fixtures (as table owner, bypasses RLS) ----------
insert into user_account (id, phone_e164, display_name) values
  ('00000000-0000-0000-0000-0000000000a1', '+919800000001', 'admin'),
  ('00000000-0000-0000-0000-0000000000a2', '+919800000002', 'owner'),
  ('00000000-0000-0000-0000-0000000000a3', '+919800000003', 'ex-admin'),
  ('00000000-0000-0000-0000-0000000000b1', '+919800000011', 'tech assigned'),
  ('00000000-0000-0000-0000-0000000000b2', '+919800000012', 'tech expired'),
  ('00000000-0000-0000-0000-0000000000b3', '+919800000013', 'tech unassigned'),
  ('00000000-0000-0000-0000-0000000000c1', '+919800000021', 'customer'),
  ('00000000-0000-0000-0000-0000000000c2', '+919800000022', 'qc'),
  ('00000000-0000-0000-0000-0000000000c3', '+919800000023', 'supplier');
insert into role_assignment (user_id, role, valid_to) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin', null),
  ('00000000-0000-0000-0000-0000000000a2', 'owner', null),
  ('00000000-0000-0000-0000-0000000000a3', 'admin', now() - interval '1 day'),
  ('00000000-0000-0000-0000-0000000000b1', 'technician', null),
  ('00000000-0000-0000-0000-0000000000b2', 'technician', null),
  ('00000000-0000-0000-0000-0000000000b3', 'technician', null),
  ('00000000-0000-0000-0000-0000000000c1', 'customer', null),
  ('00000000-0000-0000-0000-0000000000c2', 'qc', null),
  ('00000000-0000-0000-0000-0000000000c3', 'supplier', null);
insert into site (id, name, geom) values
  ('00000000-0000-0000-0000-00000000005a', 'site A', 'SRID=4326;POINT(73.85 18.52)'),
  ('00000000-0000-0000-0000-00000000005b', 'site B', 'SRID=4326;POINT(73.80 18.50)');
insert into lift (id, site_id) values
  ('00000000-0000-0000-0000-00000000001a', '00000000-0000-0000-0000-00000000005a'),
  ('00000000-0000-0000-0000-00000000001b', '00000000-0000-0000-0000-00000000005b');
insert into project (id, lift_id) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-00000000001a'),
  ('00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-00000000001b');
insert into project_assignment (project_id, user_id, role, access_until) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000b1', 'technician', now() + interval '30 days'),
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000b2', 'technician', now() - interval '1 day'),
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000c1', 'customer', null),
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000c2', 'qc', null),
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000c3', 'supplier', null);
insert into stage_transition (from_stage, to_stage) values ('lead_captured', 'lead_verified');
insert into stage_event (project_id, actor_id, actor_role, from_stage, to_stage, idempotency_key) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000a1', 'admin', null, 'lead_captured', 'k1');
insert into evidence_asset (id, project_id, captured_by, kind, sha256, original_uri, client_time) values
  ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000f1',
   '00000000-0000-0000-0000-0000000000b1', 'photo', '\x00', 's3://x/1', now()),
  ('00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000f2',
   '00000000-0000-0000-0000-0000000000b3', 'photo', '\x01', 's3://x/2', now()),
  ('00000000-0000-0000-0000-0000000000e3', '00000000-0000-0000-0000-0000000000f1',
   '00000000-0000-0000-0000-0000000000b2', 'photo', '\x04', 's3://x/3', now()),
  ('00000000-0000-0000-0000-0000000000e4', null,
   '00000000-0000-0000-0000-0000000000b3', 'photo', '\x05', 's3://x/4', now());
insert into evidence_check (evidence_id, check_type, result) values
  ('00000000-0000-0000-0000-0000000000e1', 'hash', 'green');
insert into quote_version (project_id, version, price_paise, valid_until, rate_card_version, created_by, created_role) values
  ('00000000-0000-0000-0000-0000000000f1', 1, 150000000, now() + interval '7 days', 'rc1',
   '00000000-0000-0000-0000-0000000000a1', 'admin');
insert into ledger_journal (id, project_id, kind, idempotency_key) values
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000f1', 'token', 'j1');
insert into ledger_entry (journal_id, account, debit_paise, credit_paise) values
  ('00000000-0000-0000-0000-0000000000d1', 'bank', 1000000, 0),
  ('00000000-0000-0000-0000-0000000000d1', 'customer_advance', 0, 1000000);
insert into provider_webhook (provider, provider_event_id, raw_payload, signature_ok) values ('fixture', 'ev1', '{}', true);
insert into payment (project_id, milestone, amount_paise) values ('00000000-0000-0000-0000-0000000000f1', 'token', 1000000);
insert into payout (contractor_id, cycle, amount_paise, idempotency_key) values
  ('00000000-0000-0000-0000-0000000000b1', '2026-10-01', 500000, 'p1'),
  ('00000000-0000-0000-0000-0000000000b3', '2026-10-01', 500000, 'p2');
insert into approval (project_id, kind, requested_by) values
  ('00000000-0000-0000-0000-0000000000f1', 'override', '00000000-0000-0000-0000-0000000000a1');
insert into consent_record (subject_phone_hash, purpose, notice_version, language, granted) values ('\x02', 'marketing', 'n1', 'mr', true);
insert into audit_event (action) values ('test');
insert into rule_config (key, version, value, effective_from) values ('price_floor', 1, '1.2', now());

-- ---------- coverage ----------
select t.eq((select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
    and not exists (select 1 from pg_depend d where d.classid = 'pg_class'::regclass and d.objid = c.oid and d.deptype = 'e')),
  0, 'every public app table has RLS enabled');
select t.eq((select count(*) from information_schema.role_table_grants
  where table_schema = 'public' and table_name = 'spatial_ref_sys' and grantee in ('anon', 'authenticated')),
  0, 'PostGIS spatial_ref_sys not granted to API roles');

-- ---------- anon sees and writes nothing ----------
select t.login(null);
do $$ declare r record; n bigint; begin
  for r in select c.relname from pg_class c join pg_namespace s on s.oid = c.relnamespace
           where s.nspname = 'public' and c.relkind = 'r' and c.relname <> 'spatial_ref_sys' loop
    begin
      execute format('select count(*) from public.%I', r.relname) into n;
    exception when insufficient_privilege then n := 0;
    end;
    perform t.eq(n, 0, 'anon reads 0 rows from ' || r.relname);
  end loop;
end $$;
select t.throws($$insert into audit_event (action) values ('forged')$$, '42501', 'anon cannot write audit_event');
reset role;

-- ---------- unassigned technician ----------
select t.login('00000000-0000-0000-0000-0000000000b3');
select t.eq((select count(*) from project), 0, 'unassigned technician sees no project');
select t.eq((select count(*) from site), 0, 'unassigned technician sees no site');
select t.eq((select count(*) from lift), 0, 'unassigned technician sees no lift');
select t.eq((select count(*) from evidence_asset), 1, 'unassigned user sees only own project-less capture (lead), not captures on unassigned projects');
select t.eq((select count(*) from payout), 1, 'technician sees only own payout (earnings: own)');
reset role;

-- ---------- assigned technician ----------
select t.login('00000000-0000-0000-0000-0000000000b1');
select t.eq((select count(*) from project), 1, 'assigned technician sees assigned project');
select t.eq((select count(*) from site), 1, 'assigned technician sees assigned site');
select t.eq((select count(*) from lift), 1, 'assigned technician sees assigned lift');
select t.eq((select count(*) from stage_event), 1, 'assigned technician sees stage events of assigned project');
select t.eq((select count(*) from evidence_asset), 2, 'assigned technician sees evidence of assigned project');
select t.eq((select count(*) from evidence_check), 1, 'assigned technician sees checks on visible evidence');
select t.eq((select count(*) from project_assignment), 1, 'technician sees only own assignment rows');
select t.eq((select count(*) from quote_version), 0, 'technician never sees quoted price (matrix: —)');
select t.eq((select count(*) from ledger_journal), 0, 'technician never sees ledger journals');
select t.eq((select count(*) from ledger_entry), 0, 'technician never sees ledger entries');
select t.eq((select count(*) from payment), 0, 'technician gets no payment rows (paid/not-paid view comes later)');
select t.eq((select count(*) from consent_record), 0, 'technician never sees consent records');
select t.eq((select count(*) from audit_event), 0, 'technician never sees audit log');
select t.eq((select count(*) from rule_config), 0, 'technician never sees rule config (base cost/margin)');
select t.throws($$select count(*) from provider_webhook$$, '42501', 'provider webhooks are server-only (no grant)');
select t.eq((select count(*) from user_account), 1, 'technician sees only own account row');
select t.eq((select count(*) from role_assignment), 1, 'technician sees only own role rows');
select t.eq((select count(*) from stage_transition), 1, 'stage transition rules are readable');
-- T-001 (database part): phone numbers are not readable through the API roles, even own row; server reads and audits.
select t.throws($$select phone_e164 from user_account$$, '42501', 'worker phone column hidden from API roles (masking; not T-001)');
select t.throws($$select * from user_account$$, '42501', 'select * on user_account is denied (no phone leak)');
-- Writes that must go through the server (stage function, upload pipeline, webhook receiver).
select t.throws($$update project set stage = 'handover'$$, '42501', 'no direct stage update; only apply_stage_transition (invariant 4)');
select t.throws($$insert into role_assignment (user_id, role) values ('00000000-0000-0000-0000-0000000000b1', 'admin')$$,
  '42501', 'technician cannot grant self admin');
select t.throws($$insert into project_assignment (project_id, user_id, role) values
  ('00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-0000000000b1', 'technician')$$,
  '42501', 'technician cannot assign self to a project');
select t.throws($$update evidence_asset set sha256 = '\xff'$$, '42501', 'evidence has no UPDATE grant (invariant 1)');
select t.throws($$delete from evidence_asset$$, '42501', 'evidence has no DELETE grant (invariant 1)');
select t.throws($$insert into evidence_asset (id, project_id, captured_by, kind, sha256, original_uri, client_time) values
  (gen_random_uuid(), '00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000b1', 'photo', '\x03', 'gallery://x', now())$$,
  '42501', 'no direct evidence insert: capture goes through the upload pipeline');
select t.throws($$update project_assignment set access_until = null$$, '42501', 'technician cannot extend own access');
reset role;

-- ---------- T-002: expired technician access ----------
select t.login('00000000-0000-0000-0000-0000000000b2');
select t.eq((select count(*) from project), 0, 'T-002 (partial) technician past access_until sees no project');
select t.eq((select count(*) from site), 0, 'T-002 (partial) technician past access_until sees no site');
select t.eq((select count(*) from evidence_asset), 0, 'T-002 (partial) technician past access_until sees no evidence, not even own captures');
reset role;

-- ---------- customer on the project ----------
select t.login('00000000-0000-0000-0000-0000000000c1');
select t.eq((select count(*) from project), 1, 'customer sees own project');
select t.eq((select count(*) from quote_version), 1, 'customer sees quoted price (matrix: S)');
select t.eq((select count(*) from payment), 1, 'customer sees own payment status');
select t.eq((select count(*) from ledger_entry), 0, 'customer never sees ledger');
select t.eq((select count(*) from evidence_asset), 0, 'customer does not see technician evidence');
select t.throws($$update payment set status = 'confirmed'$$, '42501', 'customer cannot set payment status (invariant 2)');
reset role;

-- ---------- QC on the project ----------
select t.login('00000000-0000-0000-0000-0000000000c2');
select t.eq((select count(*) from quote_version), 0, 'QC never sees quoted price');
select t.eq((select count(*) from evidence_asset), 2, 'QC sees evidence of assigned project');
reset role;

-- ---------- supplier on the project ----------
select t.login('00000000-0000-0000-0000-0000000000c3');
select t.eq((select count(*) from site), 0, 'supplier does not get full site row (matrix: delivery point only)');
select t.eq((select count(*) from project), 0, 'supplier gets no project row (own orders view later)');
select t.eq((select count(*) from stage_event), 0, 'supplier gets no stage events');
select t.eq((select count(*) from quote_version), 0, 'supplier never sees customer quote');
reset role;

-- ---------- admin ----------
select t.login('00000000-0000-0000-0000-0000000000a1');
select t.eq((select count(*) from project), 2, 'admin sees all projects');
select t.eq((select count(*) from evidence_asset), 4, 'admin sees all evidence');
select t.eq((select count(*) from ledger_entry), 2, 'admin sees ledger');
select t.eq((select count(*) from payout), 2, 'admin sees all payouts');
select t.eq((select count(*) from audit_event), 1, 'admin sees audit log');
select t.eq((select count(*) from rule_config), 1, 'admin sees rule config');
select t.eq((select count(*) from user_account), 9, 'admin sees all accounts (without phone column)');
select t.throws($$update payment set status = 'confirmed'$$, '42501', 'admin cannot set payment status by hand (webhook only)');
select t.throws($$insert into ledger_entry (journal_id, account, debit_paise) values ('00000000-0000-0000-0000-0000000000d1', 'x', 1)$$,
  '42501', 'admin cannot post ledger entries directly');
select t.throws($$update rule_config set value = '1.0'$$, '42501', 'admin cannot edit rules directly (propose/approve flow)');
select t.throws($$insert into audit_event (action) values ('forged')$$, '42501', 'admin cannot write audit log directly');
select t.throws($$delete from audit_event$$, '42501', 'audit log has no DELETE grant');
select t.throws($$update project set stage = 'handover'$$, '42501', 'admin has no direct stage update either (invariant 4)');
reset role;

-- ---------- owner ----------
select t.login('00000000-0000-0000-0000-0000000000a2');
select t.eq((select count(*) from project), 2, 'owner sees all projects');
select t.eq((select count(*) from ledger_entry), 0, 'owner gets no ledger rows (matrix: totals; view later)');
select t.eq((select count(*) from payout), 0, 'owner gets no individual payouts (matrix: totals)');
select t.eq((select count(*) from site), 0, 'owner gets no full site rows (matrix: summary)');
select t.eq((select count(*) from evidence_asset), 0, 'owner gets no evidence rows');
select t.eq((select count(*) from audit_event), 1, 'owner sees audit log (weekly override review)');
select t.eq((select count(*) from quote_version), 1, 'owner sees quoted price');
reset role;

-- ---------- expired admin role ----------
select t.login('00000000-0000-0000-0000-0000000000a3');
select t.eq((select count(*) from project), 0, 'admin role past valid_to grants nothing');
select t.eq((select count(*) from audit_event), 0, 'expired admin sees no audit log');
reset role;

-- ---------- server role (service_role) still cannot rewrite history ----------
set local role service_role;
select t.throws($$update evidence_asset set sha256 = '\xff'$$, '42501', 'service_role has no UPDATE on evidence');
select t.throws($$delete from ledger_entry$$, '42501', 'service_role has no DELETE on ledger entries');
select t.throws($$truncate audit_event$$, '42501', 'service_role cannot TRUNCATE audit log');
select t.throws($$update ledger_journal set kind = 'x'$$, '42501', 'ledger journals are append-only for service_role');
reset role;
-- Even the table owner cannot bypass append-only with TRUNCATE (row triggers alone would miss it).
-- Fire the deferred balance checks first so TRUNCATE is refused by our trigger, not by pending events.
set constraints all immediate;
select t.throws($$truncate evidence_asset cascade$$, 'P0001', 'TRUNCATE on evidence blocked by statement trigger');
select t.throws($$truncate stage_event$$, 'P0001', 'TRUNCATE on stage_event blocked');
select t.throws($$truncate ledger_entry$$, 'P0001', 'TRUNCATE on ledger_entry blocked');
select t.throws($$truncate audit_event$$, 'P0001', 'TRUNCATE on audit_event blocked');
select t.throws($$update consent_record set granted = false$$, 'P0001', 'consent records are append-only (withdrawal is a new row)');
select t.throws($$update evidence_check set result = 'red'$$, 'P0001', 'evidence checks are append-only');
-- Ledger: an entry must move money.
select t.throws($$insert into ledger_entry (journal_id, account) values ('00000000-0000-0000-0000-0000000000d1', 'x')$$,
  '23514', 'zero-amount ledger entry rejected');
-- New functions are not executable by API roles by default.
create function public.t_probe() returns int language sql as 'select 1';
select t.eq((select count(*) from information_schema.role_routine_grants
  where routine_name = 't_probe' and grantee in ('anon', 'authenticated', 'PUBLIC')), 0,
  'new public functions are not granted to anon/authenticated/PUBLIC by default');

rollback;
