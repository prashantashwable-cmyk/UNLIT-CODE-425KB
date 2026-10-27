-- apply_side_state tests: spec §16.3 (on hold / disputed / cancelled / lost), invariant 5 (loud, audited).
-- Not covered here: held-day clock exclusion (no SLA clock yet), refund engine on cancel (Phase 2, receives the outbox
-- event), "3 reminders unanswered" automation for Lost (later phase), worker pay during Disputed (T-035, Phase 2).
-- Run with: bash scripts/test-db.sh test. One transaction, rolled back.
\set QUIET on
\o /dev/null
begin;
\ir helpers.sql

create function t.side(p uuid, s side_state_t, k text, actor uuid, r text, reason text default null, cause text default null,
                       ev uuid[] default '{}')
returns uuid language sql as $$ select public.apply_side_state(p, s, k, actor, r, reason, cause, ev) $$;
grant execute on function t.side to anon, authenticated, service_role;

-- ---------- fixtures ----------
insert into user_account (id, phone_e164, display_name) values
  ('00000000-0000-0000-0000-0000000000a1', '+919800000001', 'admin'),
  ('00000000-0000-0000-0000-0000000000a9', '+919800000009', 'owner'),
  ('00000000-0000-0000-0000-000000000051', '+919800000051', 'sales'),
  ('00000000-0000-0000-0000-000000000061', '+919800000061', 'rider'),
  ('00000000-0000-0000-0000-000000000071', '+919800000071', 'technician'),
  ('00000000-0000-0000-0000-000000000091', '+919800000091', 'customer'),
  ('00000000-0000-0000-0000-000000000092', '+919800000092', 'other customer');
insert into role_assignment (user_id, role) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin'),
  ('00000000-0000-0000-0000-0000000000a9', 'owner'),
  ('00000000-0000-0000-0000-000000000051', 'sales'),
  ('00000000-0000-0000-0000-000000000061', 'rider'),
  ('00000000-0000-0000-0000-000000000071', 'technician'),
  ('00000000-0000-0000-0000-000000000091', 'customer'),
  ('00000000-0000-0000-0000-000000000092', 'customer');
insert into site (id, geom) values ('00000000-0000-0000-0000-00000000005a', 'SRID=4326;POINT(73.85 18.52)');
insert into lift (id, site_id, unit_label) values
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-00000000005a', 'L1'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-00000000005a', 'L2');
insert into project (id, lift_id, stage) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000011', 'installation'),
  ('00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-000000000012', 'contacted');
insert into project_assignment (project_id, user_id, role) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000071', 'technician'),
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000091', 'customer'),
  ('00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-000000000051', 'sales'),
  ('00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-000000000061', 'rider');
insert into evidence_asset (id, project_id, captured_by, kind, sha256, original_uri, client_time, risk) values
  ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000071', 'photo', '\x01', 'cap://1', now(), 'green'),
  ('00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000071', 'photo', '\x02', 'cap://2', now(), 'red'),
  ('00000000-0000-0000-0000-0000000000e3', '00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-000000000061', 'photo', '\x03', 'cap://3', now(), 'green');

-- ---------- rules are data ----------
select t.eq((select count(*) from side_state_rule where from_side = 'cancelled'), 0, 'Cancelled is final: no rule leaves it');
select t.eq((select count(*) from side_state_rule where 'owner' = any (allowed_roles)), 0, 'Owner does not set side states');
select t.ok((select causes @> '{customer,supplier,weather,permit,defect}' and min_evidence >= 1
             from side_state_rule where from_side = 'none' and to_side = 'on_hold'), 'On hold needs a cause from §16.3 and proof');

-- ---------- on hold ----------
select t.login(null);
select t.throws($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'on_hold', 'h0', '00000000-0000-0000-0000-0000000000a1', 'admin')$q$,
  '42501', 'anon cannot change side state');
reset role;
select t.login('00000000-0000-0000-0000-000000000071');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'on_hold', 'h0', '00000000-0000-0000-0000-000000000071', 'technician',
  'rain', 'weather', array['00000000-0000-0000-0000-0000000000e1']::uuid[])$q$, 'ROLE_NOT_ALLOWED', 'technician cannot put a project on hold');
reset role;
select t.login('00000000-0000-0000-0000-0000000000a9');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'on_hold', 'h0', '00000000-0000-0000-0000-0000000000a9', 'owner',
  'rain', 'weather', array['00000000-0000-0000-0000-0000000000e1']::uuid[])$q$, 'ROLE_NOT_ALLOWED', 'Owner cannot put a project on hold');
reset role;
select t.login('00000000-0000-0000-0000-0000000000a1');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'on_hold', 'h1', '00000000-0000-0000-0000-0000000000a1', 'admin',
  null, 'weather', array['00000000-0000-0000-0000-0000000000e1']::uuid[])$q$, 'REASON_REQUIRED', 'hold needs a reason');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'on_hold', 'h1', '00000000-0000-0000-0000-0000000000a1', 'admin',
  'rain', null, array['00000000-0000-0000-0000-0000000000e1']::uuid[])$q$, 'SIDE_CAUSE_INVALID', 'hold needs a cause');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'on_hold', 'h1', '00000000-0000-0000-0000-0000000000a1', 'admin',
  'rain', 'holiday', array['00000000-0000-0000-0000-0000000000e1']::uuid[])$q$, 'SIDE_CAUSE_INVALID', 'cause must be from the configured list');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'on_hold', 'h1', '00000000-0000-0000-0000-0000000000a1', 'admin',
  'rain', 'weather')$q$, 'SIDE_PROOF_REQUIRED', 'hold needs proof');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'on_hold', 'h1', '00000000-0000-0000-0000-0000000000a1', 'admin',
  'rain', 'weather', array['00000000-0000-0000-0000-0000000000e2']::uuid[])$q$, 'SIDE_PROOF_REQUIRED', 'red-risk photo is not proof');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'on_hold', 'h1', '00000000-0000-0000-0000-0000000000a1', 'admin',
  'rain', 'weather', array['00000000-0000-0000-0000-0000000000e3']::uuid[])$q$, 'SIDE_PROOF_REQUIRED', 'another project''s photo is not proof');
select t.side('00000000-0000-0000-0000-0000000000f1', 'on_hold', 'h1', '00000000-0000-0000-0000-0000000000a1', 'admin',
  'heavy rain, shaft flooded', 'weather', array['00000000-0000-0000-0000-0000000000e1']::uuid[]);
select t.ok((select t.side('00000000-0000-0000-0000-0000000000f1', 'on_hold', 'h1', '00000000-0000-0000-0000-0000000000a1', 'admin',
  'heavy rain, shaft flooded', 'weather', array['00000000-0000-0000-0000-0000000000e1']::uuid[])
  = (select id from stage_event where idempotency_key = 'h1')), 'replay returns the same event');
reset role;
select t.ok((select side_state = 'on_hold' and stage = 'installation' from project where id = '00000000-0000-0000-0000-0000000000f1'),
  'project is on hold; stage unchanged');
select t.ok((select side_state = 'on_hold' and from_stage = 'installation' and to_stage = 'installation'
                and reason = 'heavy rain, shaft flooded' and detail->>'kind' = 'side_state' and detail->>'from_side' = 'none'
                and detail->>'cause' = 'weather' and evidence_ids = array['00000000-0000-0000-0000-0000000000e1']::uuid[]
             from stage_event where idempotency_key = 'h1'), 'side-state event records who, why, cause and proof');
select t.eq((select count(*) from audit_event where action = 'side_state.on_hold' and entity_id = '00000000-0000-0000-0000-0000000000f1'),
  1, 'hold is audited');
select t.eq((select count(*) from outbox where topic = 'project.side_state_changed'), 1, 'outbox event written');
-- stage cannot move while on hold
select t.login('00000000-0000-0000-0000-0000000000a1');
select t.err($q$select public.apply_stage_transition('00000000-0000-0000-0000-0000000000f1', 'qc_inspector', 's1', '00000000-0000-0000-0000-0000000000a1', 'admin')$q$,
  'SIDE_STATE_BLOCKED', 'stage cannot move while on hold');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'on_hold', 'h2', '00000000-0000-0000-0000-0000000000a1', 'admin',
  'again', 'weather', array['00000000-0000-0000-0000-0000000000e1']::uuid[])$q$, 'SIDE_STATE_ILLEGAL', 'already on hold');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'lost', 'h2', '00000000-0000-0000-0000-0000000000a1', 'admin',
  'gone', 'declined')$q$, 'SIDE_STATE_ILLEGAL', 'on hold -> lost is not an allowed move');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'none', 'h2', '00000000-0000-0000-0000-0000000000a1', 'admin')$q$,
  'REASON_REQUIRED', 'resume needs a reason');
select t.side('00000000-0000-0000-0000-0000000000f1', 'none', 'h2', '00000000-0000-0000-0000-0000000000a1', 'admin', 'water pumped out, shaft dry');
reset role;
select t.ok((select side_state = 'none' from project where id = '00000000-0000-0000-0000-0000000000f1'), 'Admin resumes the project');

-- ---------- disputed ----------
select t.login('00000000-0000-0000-0000-0000000000a1');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'disputed', 'd1', '00000000-0000-0000-0000-0000000000a1', 'admin',
  'customer unhappy', 'weather')$q$, 'SIDE_CAUSE_INVALID', 'dispute cause must be payment or quality');
select t.side('00000000-0000-0000-0000-0000000000f1', 'disputed', 'd1', '00000000-0000-0000-0000-0000000000a1', 'admin', 'door finish rejected', 'quality');
select t.side('00000000-0000-0000-0000-0000000000f1', 'none', 'd2', '00000000-0000-0000-0000-0000000000a1', 'admin', 'door panel replaced');
reset role;
select t.eq((select count(*) from audit_event where action in ('side_state.disputed', 'side_state.none')), 3, 'dispute and resolutions audited');

-- ---------- lost and revisit ----------
select t.login('00000000-0000-0000-0000-0000000000a1');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'lost', 'l0', '00000000-0000-0000-0000-0000000000a1', 'admin',
  'gone', 'declined')$q$, 'SIDE_STATE_ILLEGAL', 'Lost applies only before agreement (a project in installation is not lost)');
reset role;
select t.login('00000000-0000-0000-0000-000000000051');
select t.side('00000000-0000-0000-0000-0000000000f2', 'lost', 'l1', '00000000-0000-0000-0000-000000000051', 'sales', 'customer chose another vendor', 'declined');
reset role;
select t.login('00000000-0000-0000-0000-000000000061');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f2', 'none', 'l2', '00000000-0000-0000-0000-000000000061', 'rider', 'revisit')$q$,
  'SIDE_PROOF_REQUIRED', 'revisit needs a new capture');
select t.side('00000000-0000-0000-0000-0000000000f2', 'none', 'l2', '00000000-0000-0000-0000-000000000061', 'rider',
  'builder called back, new tower', null, array['00000000-0000-0000-0000-0000000000e3']::uuid[]);
reset role;
select t.ok((select side_state = 'none' from project where id = '00000000-0000-0000-0000-0000000000f2'), 'revisit capture re-opens a lost project');

-- ---------- cancelled is final ----------
select t.login('00000000-0000-0000-0000-000000000092');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'cancelled', 'c1', '00000000-0000-0000-0000-000000000092', 'customer', 'no longer needed')$q$,
  'ROLE_NOT_ALLOWED', 'a customer not on the project cannot cancel it');
reset role;
select t.login('00000000-0000-0000-0000-000000000091');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'cancelled', 'c1', '00000000-0000-0000-0000-000000000091', 'customer')$q$,
  'REASON_REQUIRED', 'cancellation needs a reason');
select t.side('00000000-0000-0000-0000-0000000000f1', 'cancelled', 'c1', '00000000-0000-0000-0000-000000000091', 'customer', 'building sold');
reset role;
select t.eq((select count(*) from outbox where topic = 'project.side_state_changed' and payload->>'to_side' = 'cancelled'), 1,
  'cancellation emits the event the refund engine will consume');
select t.login('00000000-0000-0000-0000-0000000000a1');
select t.err($q$select t.side('00000000-0000-0000-0000-0000000000f1', 'none', 'c2', '00000000-0000-0000-0000-0000000000a1', 'admin', 'undo')$q$,
  'SIDE_STATE_ILLEGAL', 'Cancelled is final, even for Admin');
select t.err($q$select public.apply_stage_transition('00000000-0000-0000-0000-0000000000f1', 'qc_inspector', 's2', '00000000-0000-0000-0000-0000000000a1', 'admin')$q$,
  'SIDE_STATE_BLOCKED', 'cancelled project cannot move stage');
select t.err($q$select public.apply_stage_transition('00000000-0000-0000-0000-0000000000f1', 'cabin_delivery', 's3', '00000000-0000-0000-0000-0000000000a1', 'admin', 'reopen')$q$,
  'SIDE_STATE_BLOCKED', 'cancelled project cannot move backward either');
reset role;

-- ---------- no way around the function ----------
select set_config('request.jwt.claim.sub', '', true);
set local role service_role;
select t.throws($q$update project set side_state = 'none'$q$, '42501', 'service_role cannot set side state directly');
select t.throws($q$delete from side_state_rule$q$, '42501', 'service_role cannot delete side-state rules');
select t.throws($q$update side_state_rule set allowed_roles = '{technician}'$q$, '42501', 'service_role cannot widen side-state rules');
reset role;

rollback;
