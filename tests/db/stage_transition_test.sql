-- apply_stage_transition tests: spec §16.2/16.3, invariants 3, 4, 5, DEC-005/027 defaults.
-- Covers T-098 (illegal jump refused; backward needs reason and creates an Issue).
-- Partly covers T-121 (actor, role, states, times, evidence hashes, reason, key; location not captured yet).
-- Does NOT cover T-004 (override flow, second Admin/Owner approval, red timeline) beyond the requester <> approver
-- constraint, nor T-055 (peer check by another team: no team model yet).
-- Run with: bash scripts/test-db.sh test. One transaction, rolled back.
\set QUIET on
\o /dev/null
begin;
\ir helpers.sql

-- Shorthand: call the function with an evidence list.
create function t.move(p uuid, s stage_t, k text, actor uuid, r text, reason text default null, ev uuid[] default '{}')
returns uuid language sql as $$ select public.apply_stage_transition(p, s, k, actor, r, reason, ev) $$;
grant execute on function t.move to anon, authenticated, service_role;

-- ---------- fixtures ----------
insert into user_account (id, phone_e164, display_name) values
  ('00000000-0000-0000-0000-0000000000a1', '+919800000001', 'admin 1'),
  ('00000000-0000-0000-0000-0000000000a2', '+919800000002', 'admin 2'),
  ('00000000-0000-0000-0000-0000000000a3', '+919800000003', 'backup approver'),
  ('00000000-0000-0000-0000-0000000000a9', '+919800000009', 'owner'),
  ('00000000-0000-0000-0000-000000000051', '+919800000051', 'sales assigned'),
  ('00000000-0000-0000-0000-000000000052', '+919800000052', 'sales unassigned'),
  ('00000000-0000-0000-0000-000000000061', '+919800000061', 'rider'),
  ('00000000-0000-0000-0000-000000000071', '+919800000071', 'technician'),
  ('00000000-0000-0000-0000-000000000081', '+919800000081', 'qc'),
  ('00000000-0000-0000-0000-000000000082', '+919800000082', 'qc expired role'),
  ('00000000-0000-0000-0000-000000000083', '+919800000083', 'qc on another project'),
  ('00000000-0000-0000-0000-000000000091', '+919800000091', 'customer'),
  ('00000000-0000-0000-0000-0000000000ff', '+919800000099', 'no roles');
insert into role_assignment (user_id, role, valid_to) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin', null),
  ('00000000-0000-0000-0000-0000000000a2', 'admin', null),
  ('00000000-0000-0000-0000-0000000000a3', 'backup_approver', null),
  ('00000000-0000-0000-0000-0000000000a9', 'owner', null),
  ('00000000-0000-0000-0000-000000000051', 'sales', null),
  ('00000000-0000-0000-0000-000000000052', 'sales', null),
  ('00000000-0000-0000-0000-000000000061', 'rider', null),
  ('00000000-0000-0000-0000-000000000071', 'technician', null),
  ('00000000-0000-0000-0000-000000000081', 'qc', null),
  ('00000000-0000-0000-0000-000000000082', 'qc', now() - interval '1 day'),
  ('00000000-0000-0000-0000-000000000083', 'qc', null),
  ('00000000-0000-0000-0000-000000000091', 'customer', null);
insert into site (id, geom) values ('00000000-0000-0000-0000-00000000005a', 'SRID=4326;POINT(73.85 18.52)');
insert into lift (id, site_id, unit_label) values
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-00000000005a', 'L1'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-00000000005a', 'L2'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-00000000005a', 'L3'),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-00000000005a', 'L4'),
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-00000000005a', 'L5'),
  ('00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-00000000005a', 'L6');
-- P1 lead flow; P2 other project; P3 at agreement (payment gate); P4 at QC clearance (DEC-005); P5 on hold.
insert into project (id, lift_id, stage, side_state) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000011', 'lead_captured', 'none'),
  ('00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-000000000012', 'lead_captured', 'none'),
  ('00000000-0000-0000-0000-0000000000f3', '00000000-0000-0000-0000-000000000013', 'agreement_token', 'none'),
  ('00000000-0000-0000-0000-0000000000f4', '00000000-0000-0000-0000-000000000014', 'qc_clearance', 'none'),
  ('00000000-0000-0000-0000-0000000000f5', '00000000-0000-0000-0000-000000000015', 'lead_captured', 'on_hold');
insert into project_assignment (project_id, user_id, role) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000051', 'sales'),
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000061', 'rider'),
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000071', 'technician'),
  ('00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-000000000083', 'qc'),
  ('00000000-0000-0000-0000-0000000000f4', '00000000-0000-0000-0000-000000000081', 'qc'),
  ('00000000-0000-0000-0000-0000000000f4', '00000000-0000-0000-0000-000000000082', 'qc'),
  ('00000000-0000-0000-0000-0000000000f4', '00000000-0000-0000-0000-000000000071', 'technician'),
  ('00000000-0000-0000-0000-0000000000f5', '00000000-0000-0000-0000-000000000051', 'sales');
-- e1-e3 checked photos on P1; e4 red; e5 other project; e6 video; e7 not yet checked.
insert into evidence_asset (id, project_id, captured_by, kind, sha256, original_uri, client_time, risk) values
  ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000061', 'photo', '\x01', 'cap://1', now(), 'green'),
  ('00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000061', 'photo', '\x02', 'cap://2', now(), 'amber'),
  ('00000000-0000-0000-0000-0000000000e3', '00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000061', 'photo', '\x03', 'cap://3', now(), 'green'),
  ('00000000-0000-0000-0000-0000000000e4', '00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000061', 'photo', '\x04', 'cap://4', now(), 'red'),
  ('00000000-0000-0000-0000-0000000000e5', '00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-000000000061', 'photo', '\x05', 'cap://5', now(), 'green'),
  ('00000000-0000-0000-0000-0000000000e6', '00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000061', 'video', '\x06', 'cap://6', now(), 'green'),
  ('00000000-0000-0000-0000-0000000000e7', '00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000061', 'photo', '\x07', 'cap://7', now(), null);

-- ---------- seeded rules ----------
select t.eq((select count(*) from stage_transition), 15, 'one forward rule per stage step (15)');
select t.eq((select count(*) from stage_transition
  where array_position(enum_range(null::stage_t), to_stage) <> array_position(enum_range(null::stage_t), from_stage) + 1),
  0, 'no seeded rule skips a stage');
select t.eq((select count(*) from stage_transition where cardinality(required_approver_roles) = 0), 0,
  'every rule names the roles allowed to move it');
select t.eq((select count(*) from stage_transition where 'owner' = any (required_approver_roles)), 0,
  'Owner moves no stage (matrix: —)');
select t.eq((select count(*) from stage_transition
  where jsonb_path_exists(required_proofs, '$[*].approver_roles[*] ? (@ == "sales" || @ == "negotiator" || @ == "owner" || @ == "rider")')),
  0, 'gate approvers follow the matrix: never Sales, Negotiator, Owner or Rider');
select t.throws($q$insert into stage_transition (from_stage, to_stage, required_approver_roles, required_proofs) values
  ('handover', 'licence', '{admin}', '[{"type":"approval","kind":"x","approver_roles":["sales"]}]')$q$,
  '23514', 'invariant 3: the Sales bot can never be configured as a gate approver');

-- ---------- authorisation ----------
select t.login(null);
select t.throws($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'x', '00000000-0000-0000-0000-0000000000a1', 'admin')$q$,
  '42501', 'anon cannot call apply_stage_transition');
reset role;

select t.login('00000000-0000-0000-0000-000000000051');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'x', '00000000-0000-0000-0000-0000000000a1', 'admin',
  null, array['00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000e2','00000000-0000-0000-0000-0000000000e3']::uuid[])$q$,
  'ACTOR_MISMATCH', 'caller cannot act as another user');
reset role;

select t.login('00000000-0000-0000-0000-0000000000ff');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'x', '00000000-0000-0000-0000-0000000000ff', 'admin',
  null, array['00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000e2','00000000-0000-0000-0000-0000000000e3']::uuid[])$q$,
  'ROLE_NOT_HELD', 'claiming a role the user does not hold is refused');
reset role;

select t.login('00000000-0000-0000-0000-000000000052');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'x', '00000000-0000-0000-0000-000000000052', 'sales',
  null, array['00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000e2','00000000-0000-0000-0000-0000000000e3']::uuid[])$q$,
  'ROLE_NOT_ALLOWED', 'sales not assigned to the project cannot move it');
reset role;

select t.login('00000000-0000-0000-0000-000000000071');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'x', '00000000-0000-0000-0000-000000000071', 'technician',
  null, array['00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000e2','00000000-0000-0000-0000-0000000000e3']::uuid[])$q$,
  'ROLE_NOT_ALLOWED', 'assigned technician is not a lead-verification role');
reset role;

select t.login('00000000-0000-0000-0000-0000000000a9');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'x', '00000000-0000-0000-0000-0000000000a9', 'owner',
  null, array['00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000e2','00000000-0000-0000-0000-0000000000e3']::uuid[])$q$,
  'ROLE_NOT_ALLOWED', 'Owner cannot move stages');
reset role;

-- ---------- proofs: lead captured -> verified needs 3 checked photos of this project ----------
select t.login('00000000-0000-0000-0000-000000000051');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'x', '00000000-0000-0000-0000-000000000051', 'sales',
  null, array['00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000e2']::uuid[])$q$,
  'STAGE_GATE_BLOCKED', 'missing proof: only 2 photos');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'x', '00000000-0000-0000-0000-000000000051', 'sales',
  null, array['00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000e2','00000000-0000-0000-0000-0000000000e4']::uuid[])$q$,
  'STAGE_GATE_BLOCKED', 'red-risk photo does not count as proof');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'x', '00000000-0000-0000-0000-000000000051', 'sales',
  null, array['00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000e2','00000000-0000-0000-0000-0000000000e7']::uuid[])$q$,
  'STAGE_GATE_BLOCKED', 'unchecked photo does not count as proof');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'x', '00000000-0000-0000-0000-000000000051', 'sales',
  null, array['00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000e2','00000000-0000-0000-0000-0000000000e5']::uuid[])$q$,
  'STAGE_GATE_BLOCKED', 'photo from another project does not count');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'x', '00000000-0000-0000-0000-000000000051', 'sales',
  null, array['00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000e2','00000000-0000-0000-0000-0000000000e6']::uuid[])$q$,
  'STAGE_GATE_BLOCKED', 'a video does not count as a photo');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'x', '00000000-0000-0000-0000-000000000051', 'sales',
  null, array['00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000e2']::uuid[])$q$,
  'STAGE_GATE_BLOCKED', 'the same photo listed twice counts once');
select t.eq((select count(*) from stage_event), 0, 'refused moves write no event');

-- success (also lists another project's photo and an unknown id: neither is stored on the event)
select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'k-verify', '00000000-0000-0000-0000-000000000051', 'sales',
  null, array['00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000e2','00000000-0000-0000-0000-0000000000e3',
              '00000000-0000-0000-0000-0000000000e5','00000000-0000-0000-0000-00000000dead']::uuid[]);
reset role;
select t.ok((select stage = 'lead_verified' from project where id = '00000000-0000-0000-0000-0000000000f1'), 'valid move updates the stage');
select t.ok((select actor_id = '00000000-0000-0000-0000-000000000051' and actor_role = 'sales'
                and from_stage = 'lead_captured' and to_stage = 'lead_verified' and idempotency_key = 'k-verify'
                and evidence_ids = array['00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000e2',
                                         '00000000-0000-0000-0000-0000000000e3']::uuid[]
                and detail->'evidence_sha256' = '["01","02","03"]'::jsonb
                and server_time is not null
             from stage_event where idempotency_key = 'k-verify'),
  'T-121 event has actor, role, states, time, key, and only this project''s evidence ids and hashes');
select t.eq((select count(*) from outbox where topic = 'stage.changed' and payload->>'project_id' = '00000000-0000-0000-0000-0000000000f1'),
  1, 'outbox row written in the same transaction');

-- ---------- idempotency ----------
select t.login('00000000-0000-0000-0000-000000000051');
select t.ok((select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'k-verify', '00000000-0000-0000-0000-000000000051', 'sales',
  null, array['00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-0000000000e2','00000000-0000-0000-0000-0000000000e3']::uuid[])
  = (select id from stage_event where idempotency_key = 'k-verify')), 'replay with same key returns the same event');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'contacted', 'k-verify', '00000000-0000-0000-0000-000000000051', 'sales')$q$,
  'IDEMPOTENCY_CONFLICT', 'same key for a different move is refused');
reset role;
select t.login('00000000-0000-0000-0000-0000000000ff');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'contacted', 'k-verify', '00000000-0000-0000-0000-0000000000ff', 'admin')$q$,
  'ROLE_NOT_HELD', 'unauthorised caller cannot probe whether a key exists');
reset role;
select t.eq((select count(*) from stage_event where project_id = '00000000-0000-0000-0000-0000000000f1'), 1, 'replay wrote no second event');
select t.eq((select count(*) from outbox), 1, 'replay wrote no second outbox row');

-- ---------- illegal moves (T-098) ----------
select t.login('00000000-0000-0000-0000-0000000000a1');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'quoted', 'k-skip', '00000000-0000-0000-0000-0000000000a1', 'admin')$q$,
  'STAGE_ILLEGAL', 'T-098 skip (verified -> quoted) refused, even for Admin');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'handover', 'k-jump', '00000000-0000-0000-0000-0000000000a1', 'admin')$q$,
  'STAGE_ILLEGAL', 'T-098 jump to handover refused');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'k-same', '00000000-0000-0000-0000-0000000000a1', 'admin')$q$,
  'STAGE_ILLEGAL', 'move to the current stage refused');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000ee', 'lead_verified', 'k-none', '00000000-0000-0000-0000-0000000000a1', 'admin')$q$,
  'PROJECT_NOT_FOUND', 'unknown project refused');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'contacted', '', '00000000-0000-0000-0000-0000000000a1', 'admin')$q$,
  'IDEMPOTENCY_REQUIRED', 'empty idempotency key refused');
reset role;

-- ---------- approvals: verified -> contacted needs a lead_verification approval by Admin ----------
select t.login('00000000-0000-0000-0000-000000000051');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'contacted', 'k-contact', '00000000-0000-0000-0000-000000000051', 'sales')$q$,
  'STAGE_GATE_BLOCKED', 'missing approval blocks the gate');
reset role;
-- approved by a rider (on the project, but not a gate approver)
insert into approval (id, project_id, kind, requested_by, approved_by, status, decided_at) values
  ('00000000-0000-0000-0000-00000000aa01', '00000000-0000-0000-0000-0000000000f1', 'lead_verification',
   '00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-000000000061', 'approved', now() - interval '1 hour');
select t.login('00000000-0000-0000-0000-000000000051');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'contacted', 'k-contact', '00000000-0000-0000-0000-000000000051', 'sales')$q$,
  'STAGE_GATE_BLOCKED', 'missing approver role: rider approval does not satisfy the gate');
reset role;
insert into approval (id, project_id, kind, requested_by, status) values
  ('00000000-0000-0000-0000-00000000aa02', '00000000-0000-0000-0000-0000000000f1', 'lead_verification',
   '00000000-0000-0000-0000-000000000051', 'requested');
select t.login('00000000-0000-0000-0000-000000000051');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'contacted', 'k-contact', '00000000-0000-0000-0000-000000000051', 'sales')$q$,
  'STAGE_GATE_BLOCKED', 'a requested (not approved) approval does not count');
reset role;
select t.throws($q$update approval set approved_by = requested_by, status = 'approved', decided_at = now()
  where id = '00000000-0000-0000-0000-00000000aa02'$q$, '23514', 'approval by its own requester is refused by constraint');
select t.throws($q$update approval set approved_by = '00000000-0000-0000-0000-0000000000a1', status = 'approved'
  where id = '00000000-0000-0000-0000-00000000aa02'$q$, '23514', 'an approved approval must record when it was decided');
update approval set approved_by = '00000000-0000-0000-0000-0000000000a1', status = 'approved', decided_at = now() - interval '1 hour'
  where id = '00000000-0000-0000-0000-00000000aa02';
select t.login('00000000-0000-0000-0000-000000000051');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'contacted', 'k-contact', '00000000-0000-0000-0000-000000000051', 'sales')$q$,
  'SELF_APPROVAL', 'requester of the gate approval cannot pass the gate themselves');
reset role;
-- DEC-027 default: no backup approver -> approval gates stay closed
update role_assignment set valid_to = now() - interval '1 second' where role = 'backup_approver';
select t.login('00000000-0000-0000-0000-0000000000a1');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'contacted', 'k-contact', '00000000-0000-0000-0000-0000000000a1', 'admin')$q$,
  'APPROVERS_NOT_CONFIGURED', 'DEC-027 default: approval gates closed until two approvers and a backup exist');
reset role;
update role_assignment set valid_to = null where role = 'backup_approver';
-- someone other than the requester passes the gate (the approver may: requester and approver are already two people)
select t.login('00000000-0000-0000-0000-0000000000a1');
select t.move('00000000-0000-0000-0000-0000000000f1', 'contacted', 'k-contact', '00000000-0000-0000-0000-0000000000a1', 'admin');
reset role;
select t.ok((select stage = 'contacted' from project where id = '00000000-0000-0000-0000-0000000000f1'),
  'gate passes on an approval by an allowed role, moved by someone other than the requester');

-- ---------- backward moves: Admin only, reason required, Issue + loud audit entry ----------
select t.login('00000000-0000-0000-0000-000000000051');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'k-back', '00000000-0000-0000-0000-000000000051', 'sales', 'oops')$q$,
  'ROLE_NOT_ALLOWED', 'non-admin cannot move backward');
reset role;
select t.login('00000000-0000-0000-0000-0000000000a1');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'k-back', '00000000-0000-0000-0000-0000000000a1', 'admin')$q$,
  'REASON_REQUIRED', 'T-098 backward move without reason refused');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'k-back', '00000000-0000-0000-0000-0000000000a1', 'admin', '   ')$q$,
  'REASON_REQUIRED', 'blank reason refused');
select public.apply_stage_transition('00000000-0000-0000-0000-0000000000f1', 'lead_verified', 'k-back',
  '00000000-0000-0000-0000-0000000000a1', 'admin', 'customer changed the requirement', '{}', '2026-10-27 10:00+05:30');
reset role;
select t.ok((select stage = 'lead_verified' from project where id = '00000000-0000-0000-0000-0000000000f1'), 'backward move with reason applied');
select t.ok((select reason = 'customer changed the requirement' and client_time = '2026-10-27 10:00+05:30'
             and from_stage = 'contacted' and detail->>'direction' = 'backward'
             from stage_event where idempotency_key = 'k-back'), 'T-121 backward event records reason and phone time');
select t.eq((select count(*) from issue where project_id = '00000000-0000-0000-0000-0000000000f1'
             and reason = 'customer changed the requirement' and stage_event_id = (select id from stage_event where idempotency_key = 'k-back')),
  1, 'T-098 backward move creates an Issue linked to the event');
select t.eq((select count(*) from audit_event where action = 'stage.backward' and entity_id = '00000000-0000-0000-0000-0000000000f1'),
  1, 'backward move is loud: audit entry written');
-- old approvals do not reopen the gate after a backward move
select t.login('00000000-0000-0000-0000-0000000000a2');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f1', 'contacted', 'k-again', '00000000-0000-0000-0000-0000000000a2', 'admin')$q$,
  'STAGE_GATE_BLOCKED', 'approval decided before the backward move no longer counts');
reset role;

-- ---------- side states ----------
select t.login('00000000-0000-0000-0000-000000000051');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f5', 'lead_verified', 'k-hold', '00000000-0000-0000-0000-000000000051', 'sales')$q$,
  'SIDE_STATE_BLOCKED', 'project on hold cannot move');
reset role;

-- ---------- money gate: agreement -> site readiness needs a webhook-confirmed token payment ----------
insert into approval (project_id, kind, requested_by, approved_by, status, decided_at) values
  ('00000000-0000-0000-0000-0000000000f3', 'agreement_signed', '00000000-0000-0000-0000-000000000091',
   '00000000-0000-0000-0000-0000000000a2', 'approved', now());
insert into payment (id, project_id, milestone, amount_paise, status) values
  ('00000000-0000-0000-0000-00000000bb01', '00000000-0000-0000-0000-0000000000f3', 'token', 1000000, 'pending');
select t.login('00000000-0000-0000-0000-0000000000a1');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f3', 'site_readiness', 'k-token', '00000000-0000-0000-0000-0000000000a1', 'admin')$q$,
  'STAGE_GATE_BLOCKED', 'pending token payment blocks the gate (invariant 2)');
reset role;
update payment set status = 'confirmed' where id = '00000000-0000-0000-0000-00000000bb01';  -- as the webhook processor would
select t.login('00000000-0000-0000-0000-0000000000a1');
select t.move('00000000-0000-0000-0000-0000000000f3', 'site_readiness', 'k-token', '00000000-0000-0000-0000-0000000000a1', 'admin');
reset role;
select t.ok((select stage = 'site_readiness' from project where id = '00000000-0000-0000-0000-0000000000f3'), 'confirmed token payment passes the gate');

-- ---------- QC clearance -> permit: approver must be on this project; DEC-005 licence holder ----------
insert into approval (project_id, kind, requested_by, approved_by, status, decided_at) values
  ('00000000-0000-0000-0000-0000000000f4', 'qc_clearance', '00000000-0000-0000-0000-000000000071',
   '00000000-0000-0000-0000-000000000083', 'approved', now());
update project set licence_holder = 'Partner contractor (placeholder)' where id = '00000000-0000-0000-0000-0000000000f4';
select t.login('00000000-0000-0000-0000-000000000081');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f4', 'permit_applied', 'k-permit', '00000000-0000-0000-0000-000000000081', 'qc')$q$,
  'STAGE_GATE_BLOCKED', 'approval by a QC not assigned to this project does not count');
reset role;
update project set licence_holder = null where id = '00000000-0000-0000-0000-0000000000f4';
insert into approval (project_id, kind, requested_by, approved_by, status, decided_at) values
  ('00000000-0000-0000-0000-0000000000f4', 'qc_clearance', '00000000-0000-0000-0000-000000000071',
   '00000000-0000-0000-0000-000000000081', 'approved', now());
select t.login('00000000-0000-0000-0000-000000000082');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f4', 'permit_applied', 'k-permit', '00000000-0000-0000-0000-000000000082', 'qc')$q$,
  'ROLE_NOT_HELD', 'QC whose role has expired cannot move the stage');
reset role;
select t.login('00000000-0000-0000-0000-000000000081');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f4', 'permit_applied', 'k-permit', '00000000-0000-0000-0000-000000000081', 'qc')$q$,
  'STAGE_GATE_BLOCKED', 'DEC-005 default: permit stage blocked until the licence holder is named');
reset role;
update project set licence_holder = 'Partner contractor (placeholder)' where id = '00000000-0000-0000-0000-0000000000f4';
select t.login('00000000-0000-0000-0000-000000000081');
select t.move('00000000-0000-0000-0000-0000000000f4', 'permit_applied', 'k-permit', '00000000-0000-0000-0000-000000000081', 'qc');
reset role;
select t.ok((select stage = 'permit_applied' from project where id = '00000000-0000-0000-0000-0000000000f4'),
  'assigned QC approval + licence holder named: permit stage reached');

-- ---------- nobody bypasses the function (invariant 4) ----------
select t.login('00000000-0000-0000-0000-0000000000a1');
select t.throws($q$update project set stage = 'handover'$q$, '42501', 'authenticated cannot update stage directly');
select t.throws($q$insert into stage_event (project_id, actor_id, actor_role, to_stage, idempotency_key) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000a1', 'admin', 'handover', 'forged')$q$,
  '42501', 'authenticated cannot insert stage events');
reset role;
-- server context: service key, no end-user JWT subject
select set_config('request.jwt.claim.sub', '', true);
set local role service_role;
select t.throws($q$update project set stage = 'handover'$q$, '42501', 'service_role cannot update stage directly');
select t.throws($q$update project set side_state = 'none'$q$, '42501', 'service_role cannot update side state directly');
select t.throws($q$insert into project (lift_id, stage) values ('00000000-0000-0000-0000-000000000016', 'handover')$q$,
  '42501', 'service_role cannot create a project at a later stage');
select t.throws($q$delete from project where id = '00000000-0000-0000-0000-0000000000f2'$q$, '42501', 'service_role cannot delete projects');
select t.throws($q$insert into stage_event (project_id, actor_id, actor_role, to_stage, idempotency_key) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000a1', 'admin', 'handover', 'forged')$q$,
  '42501', 'service_role cannot insert stage events');
select t.throws($q$insert into outbox (topic, payload) values ('stage.changed', '{}')$q$, '42501', 'service_role cannot forge outbox rows');
select t.throws($q$delete from stage_transition$q$, '42501', 'service_role cannot delete gate rules');
select t.throws($q$update stage_transition set required_proofs = '[]'$q$, '42501', 'service_role cannot weaken gate rules');
select t.throws($q$insert into approval (project_id, kind, requested_by, approved_by, status, decided_at) values
  ('00000000-0000-0000-0000-0000000000f1', 'lead_verification', '00000000-0000-0000-0000-000000000051',
   '00000000-0000-0000-0000-0000000000a2', 'approved', now())$q$, '42501', 'service_role cannot forge approvals');
select t.throws($q$update issue set reason = 'rewritten'$q$, '42501', 'service_role cannot rewrite an issue reason');
select t.throws($q$insert into issue (project_id, kind, reason, opened_by) values
  ('00000000-0000-0000-0000-0000000000f1', 'x', 'fake', '00000000-0000-0000-0000-0000000000a1')$q$, '42501', 'service_role cannot add issues directly');
-- the server calls the function on behalf of a user it authenticated; it still cannot forge roles
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f2', 'lead_verified', 'k-srv', '00000000-0000-0000-0000-0000000000ff', 'admin')$q$,
  'ROLE_NOT_HELD', 'server call with an actor lacking the role is refused');
select t.err($q$select t.move('00000000-0000-0000-0000-0000000000f2', 'lead_verified', 'k-srv', null, 'admin')$q$,
  'ACTOR_REQUIRED', 'server call without an actor is refused');
reset role;

rollback;
