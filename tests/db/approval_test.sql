-- request_approval / decide_approval tests: §26 (approvals are structured records), invariant 5, DEC-027 default.
-- Covers T-004 at the database level (Admin A's override: A cannot approve it; a second Admin or the Owner can; the
-- override is recorded red in the audit log). The timeline UI that shows the red entry is not built.
-- Run with: bash scripts/test-db.sh test. One transaction, rolled back.
\set QUIET on
\o /dev/null
begin;
\ir helpers.sql

create function t.req(p uuid, kind text, actor uuid, r text, k text, reason text default null)
returns uuid language sql as $$ select public.request_approval(p, kind, actor, r, k, reason) $$;
create function t.decide(a uuid, d approval_status_t, actor uuid, r text, ver int, reason text default null)
returns void language sql as $$ select public.decide_approval(a, d, actor, r, ver, reason) $$;
grant execute on function t.req, t.decide to anon, authenticated, service_role;

-- ---------- fixtures ----------
insert into user_account (id, phone_e164, display_name) values
  ('00000000-0000-0000-0000-0000000000a1', '+919800000001', 'admin 1'),
  ('00000000-0000-0000-0000-0000000000a2', '+919800000002', 'admin 2'),
  ('00000000-0000-0000-0000-0000000000a3', '+919800000003', 'backup approver'),
  ('00000000-0000-0000-0000-0000000000a9', '+919800000009', 'owner'),
  ('00000000-0000-0000-0000-000000000051', '+919800000051', 'sales'),
  ('00000000-0000-0000-0000-000000000071', '+919800000071', 'technician'),
  ('00000000-0000-0000-0000-000000000081', '+919800000081', 'qc assigned'),
  ('00000000-0000-0000-0000-000000000083', '+919800000083', 'qc elsewhere'),
  ('00000000-0000-0000-0000-000000000091', '+919800000091', 'customer'),
  ('00000000-0000-0000-0000-0000000000ff', '+919800000099', 'no roles');
insert into role_assignment (user_id, role) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin'),
  ('00000000-0000-0000-0000-0000000000a2', 'admin'),
  ('00000000-0000-0000-0000-0000000000a3', 'backup_approver'),
  ('00000000-0000-0000-0000-0000000000a9', 'owner'),
  ('00000000-0000-0000-0000-000000000051', 'sales'),
  ('00000000-0000-0000-0000-000000000071', 'technician'),
  ('00000000-0000-0000-0000-000000000081', 'qc'),
  ('00000000-0000-0000-0000-000000000083', 'qc'),
  ('00000000-0000-0000-0000-000000000091', 'customer');
insert into site (id, geom) values ('00000000-0000-0000-0000-00000000005a', 'SRID=4326;POINT(73.85 18.52)');
insert into lift (id, site_id) values ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-00000000005a');
insert into project (id, lift_id, stage, licence_holder) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000011', 'qc_clearance', 'Partner contractor (placeholder)');
insert into project_assignment (project_id, user_id, role) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000051', 'sales'),
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000071', 'technician'),
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000081', 'qc'),
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-000000000091', 'customer');

-- ---------- request ----------
select t.login(null);
select t.throws($q$select t.req('00000000-0000-0000-0000-0000000000f1', 'qc_clearance', '00000000-0000-0000-0000-000000000071', 'technician', 'r0')$q$,
  '42501', 'anon cannot request approvals');
reset role;

select t.login('00000000-0000-0000-0000-000000000071');
select t.err($q$select t.req('00000000-0000-0000-0000-0000000000f1', 'qc_clearance', '00000000-0000-0000-0000-000000000081', 'qc', 'r0')$q$,
  'ACTOR_MISMATCH', 'cannot request as someone else');
select t.err($q$select t.req('00000000-0000-0000-0000-0000000000f1', 'qc_clearance', '00000000-0000-0000-0000-000000000071', 'qc', 'r0')$q$,
  'ROLE_NOT_HELD', 'cannot request under a role not held');
select t.err($q$select t.req('00000000-0000-0000-0000-0000000000f1', 'pay_me_now', '00000000-0000-0000-0000-000000000071', 'technician', 'r0')$q$,
  'APPROVAL_KIND_UNKNOWN', 'only gate kinds and override can be requested');
select t.err($q$select t.req('00000000-0000-0000-0000-0000000000f1', 'qc_clearance', '00000000-0000-0000-0000-000000000071', 'technician', '')$q$,
  'IDEMPOTENCY_REQUIRED', 'idempotency key required');
select t.req('00000000-0000-0000-0000-0000000000f1', 'qc_clearance', '00000000-0000-0000-0000-000000000071', 'technician', 'r1');
select t.ok((select t.req('00000000-0000-0000-0000-0000000000f1', 'qc_clearance', '00000000-0000-0000-0000-000000000071', 'technician', 'r1')
             = (select id from approval where idempotency_key = 'r1')), 'replayed request returns the same approval');
select t.err($q$select t.req('00000000-0000-0000-0000-0000000000f1', 'readiness', '00000000-0000-0000-0000-000000000071', 'technician', 'r1')$q$,
  'IDEMPOTENCY_CONFLICT', 'same key for a different request is refused');
select t.eq((select count(*) from approval), 1, 'requester sees own request');
reset role;
select t.ok((select status = 'requested' and requested_by = '00000000-0000-0000-0000-000000000071' and version = 1
                and approved_by is null and decided_at is null and kind = 'qc_clearance'
             from approval where idempotency_key = 'r1'), 'request stored as a structured record');
select t.eq((select count(*) from audit_event where action = 'approval.requested'), 1, 'request audited once');

select t.login('00000000-0000-0000-0000-000000000083');
select t.err($q$select t.req('00000000-0000-0000-0000-0000000000f1', 'qc_clearance', '00000000-0000-0000-0000-000000000083', 'qc', 'r2')$q$,
  'ROLE_NOT_ALLOWED', 'cannot request on a project you are not assigned to');
reset role;

-- visibility of the pending request
select t.login('00000000-0000-0000-0000-000000000081');
select t.eq((select count(*) from approval), 1, 'assigned QC sees the pending qc_clearance request it may decide');
reset role;
select t.login('00000000-0000-0000-0000-000000000091');
select t.eq((select count(*) from approval), 0, 'customer does not see a QC request it cannot decide');
reset role;
select t.login('00000000-0000-0000-0000-000000000083');
select t.eq((select count(*) from approval), 0, 'QC on another project does not see it');
reset role;

-- ---------- decide ----------
select t.login('00000000-0000-0000-0000-000000000071');
select t.err($q$select t.decide((select id from approval where idempotency_key = 'r1'), 'approved', '00000000-0000-0000-0000-000000000071', 'technician', 1)$q$,
  'SELF_APPROVAL', 'requester cannot decide own request');
reset role;
select t.login('00000000-0000-0000-0000-000000000091');
select t.err($q$select t.decide('00000000-0000-0000-0000-000000000000'::uuid, 'approved', '00000000-0000-0000-0000-000000000091', 'customer', 1)$q$,
  'APPROVAL_NOT_FOUND', 'unknown approval refused');
reset role;
-- ids are passed as literals from here on (the decider may not be able to read the row)
create temp table ids as select id from approval where idempotency_key = 'r1';
grant select on ids to authenticated, service_role;
select t.login('00000000-0000-0000-0000-000000000091');
select t.err($q$select t.decide((select id from ids), 'approved', '00000000-0000-0000-0000-000000000091', 'customer', 1)$q$,
  'ROLE_NOT_ALLOWED', 'customer is not an approver for qc_clearance');
reset role;
select t.login('00000000-0000-0000-0000-000000000051');
select t.err($q$select t.decide((select id from ids), 'approved', '00000000-0000-0000-0000-000000000051', 'sales', 1)$q$,
  'ROLE_NOT_ALLOWED', 'Sales never approves a gate');
reset role;
select t.login('00000000-0000-0000-0000-0000000000a9');
select t.err($q$select t.decide((select id from ids), 'approved', '00000000-0000-0000-0000-0000000000a9', 'owner', 1)$q$,
  'ROLE_NOT_ALLOWED', 'Owner does not approve stage gates (matrix: —)');
reset role;
select t.login('00000000-0000-0000-0000-000000000083');
select t.err($q$select t.decide((select id from ids), 'approved', '00000000-0000-0000-0000-000000000083', 'qc', 1)$q$,
  'ROLE_NOT_ALLOWED', 'QC not assigned to the project cannot decide');
reset role;
select t.login('00000000-0000-0000-0000-000000000081');
select t.err($q$select t.decide((select id from ids), 'rejected', '00000000-0000-0000-0000-000000000081', 'qc', 1)$q$,
  'REASON_REQUIRED', 'rejection needs a reason');
select t.err($q$select t.decide((select id from ids), 'requested', '00000000-0000-0000-0000-000000000081', 'qc', 1)$q$,
  'DECISION_INVALID', 'decision must be approved or rejected');
select t.err($q$select t.decide((select id from ids), 'approved', '00000000-0000-0000-0000-000000000081', 'qc', 7)$q$,
  'VERSION_CONFLICT', 'stale version refused (two approvers at once)');
reset role;
-- DEC-027 default
update role_assignment set valid_to = now() - interval '1 second' where role = 'backup_approver';
select t.login('00000000-0000-0000-0000-000000000081');
select t.err($q$select t.decide((select id from ids), 'approved', '00000000-0000-0000-0000-000000000081', 'qc', 1)$q$,
  'APPROVERS_NOT_CONFIGURED', 'DEC-027 default: no decisions until two approvers and a backup exist');
reset role;
update role_assignment set valid_to = null where role = 'backup_approver';
select t.login('00000000-0000-0000-0000-000000000081');
select t.decide((select id from ids), 'approved', '00000000-0000-0000-0000-000000000081', 'qc', 1);
select t.err($q$select t.decide((select id from ids), 'rejected', '00000000-0000-0000-0000-000000000081', 'qc', 2, 'changed mind')$q$,
  'APPROVAL_NOT_PENDING', 'a decided approval cannot be decided again');
reset role;
select t.ok((select status = 'approved' and approved_by = '00000000-0000-0000-0000-000000000081' and decided_at is not null and version = 2
             from approval where idempotency_key = 'r1'), 'decision recorded: who, when, version');
select t.eq((select count(*) from audit_event where action = 'approval.approved'), 1, 'decision audited');

-- the approval opens the gate; the approving QC may move it (requester was the technician)
select t.login('00000000-0000-0000-0000-000000000081');
select public.apply_stage_transition('00000000-0000-0000-0000-0000000000f1', 'permit_applied', 'm1', '00000000-0000-0000-0000-000000000081', 'qc');
reset role;
select t.ok((select stage = 'permit_applied' from project where id = '00000000-0000-0000-0000-0000000000f1'),
  'approval made through decide_approval satisfies the stage gate');

-- ---------- T-004: overrides are loud and need a second Admin or the Owner ----------
select t.login('00000000-0000-0000-0000-0000000000a1');
select t.err($q$select t.req('00000000-0000-0000-0000-0000000000f1', 'override', '00000000-0000-0000-0000-0000000000a1', 'admin', 'o1')$q$,
  'REASON_REQUIRED', 'override needs a reason');
select t.req('00000000-0000-0000-0000-0000000000f1', 'override', '00000000-0000-0000-0000-0000000000a1', 'admin', 'o1', 'permit office closed; proceed on scanned receipt');
select t.err($q$select t.decide((select id from approval where idempotency_key = 'o1'), 'approved', '00000000-0000-0000-0000-0000000000a1', 'admin', 1)$q$,
  'SELF_APPROVAL', 'T-004 Admin A cannot approve own override');
select t.req('00000000-0000-0000-0000-0000000000f1', 'override', '00000000-0000-0000-0000-0000000000a1', 'admin', 'o2', 'second override');
reset role;
select t.login('00000000-0000-0000-0000-000000000081');
select t.err($q$select t.decide((select id from ids), 'approved', '00000000-0000-0000-0000-000000000081', 'qc', 2)$q$,
  'APPROVAL_NOT_PENDING', 'already-decided approval stays decided');
reset role;
truncate ids; insert into ids select id from approval where idempotency_key = 'o1';
select t.login('00000000-0000-0000-0000-000000000081');
select t.err($q$select t.decide((select id from ids), 'approved', '00000000-0000-0000-0000-000000000081', 'qc', 1)$q$,
  'ROLE_NOT_ALLOWED', 'QC cannot approve an override');
reset role;
select t.login('00000000-0000-0000-0000-0000000000a2');
select t.decide((select id from approval where idempotency_key = 'o1'), 'approved', '00000000-0000-0000-0000-0000000000a2', 'admin', 1);
reset role;
select t.login('00000000-0000-0000-0000-0000000000a9');
select t.decide((select id from approval where idempotency_key = 'o2'), 'approved', '00000000-0000-0000-0000-0000000000a9', 'owner', 1);
reset role;
select t.eq((select count(*) from approval where kind = 'override' and status = 'approved'), 2, 'T-004 second Admin or Owner approves an override');
select t.eq((select count(*) from audit_event where action in ('override.requested', 'override.approved') and detail->>'severity' = 'red'),
  4, 'T-004 override request and approval are red audit entries');

-- ---------- nobody writes approvals around the functions ----------
select set_config('request.jwt.claim.sub', '', true);
set local role service_role;
select t.throws($q$update approval set status = 'approved'$q$, '42501', 'service_role cannot set approval status directly');
select t.err($q$select t.decide((select id from approval where idempotency_key = 'o2'), 'approved', null, 'admin', 1)$q$,
  'ACTOR_REQUIRED', 'server call needs an actor');
reset role;
select t.login('00000000-0000-0000-0000-0000000000a1');
select t.throws($q$update approval set status = 'approved'$q$, '42501', 'authenticated cannot set approval status directly');
reset role;

rollback;
