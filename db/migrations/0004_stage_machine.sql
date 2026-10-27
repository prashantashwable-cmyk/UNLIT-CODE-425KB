-- 0004: project state machine (spec §16.2, §16.3; invariants 4, 5; T-098, T-121).
-- Stage changes happen only in apply_stage_transition. The gates live in stage_transition as data: the seeded rows are
-- generic defaults derived from §16.2 and the decision defaults (§40). They are data, not code; until the audited,
-- versioned rule-change flow exists (Admin proposes, Owner approves) they change only by migration.
--
-- required_proofs entries:
--   {"type":"evidence","kind":"photo","min":3}            captures of this project listed in the call that passed checks
--                                                        (risk green or amber; unchecked or red never count)
--   {"type":"approval","kind":"x","approver_roles":[..]}  an approved approval of that kind, decided after the project's last
--                                                        backward move, by someone holding one of the roles and (unless Admin)
--                                                        assigned to this project; approver_roles follow the matrix row
--                                                        "Approve stage gate"; the Sales bot can never be an approver
--   {"type":"payment","milestone":"token"}                payment confirmed (status is set only by the webhook processor)
--   {"type":"project_field","field":"licence_holder"}     field on project must be non-blank
--   {"type":"quote"}                                      at least one quote version exists
-- required_approver_roles: roles allowed to perform the move (Admin needs no assignment; others need an active one).

-- DEC-005 default: the licence holder is stored per project; no permit stage without one.
alter table project add column licence_holder text;

-- When an approval was decided; approvals decided before a backward move do not reopen gates.
alter table approval add column decided_at timestamptz;
alter table approval add constraint approval_decided_at
  check (status not in ('approved', 'rejected') or decided_at is not null);

-- Invariant 3: the Sales bot (system actor) may never approve a gate, including via later settings edits.
alter table stage_transition add constraint stage_transition_no_bot_approver
  check (not jsonb_path_exists(required_proofs, '$[*].approver_roles[*] ? (@ == "sales")'));

-- Issues: a backward move opens one (§16.3). Status changes later; rows are never deleted.
create table issue (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references project(id),
  kind text not null, reason text not null check (btrim(reason) <> ''),
  opened_by uuid not null references user_account(id),
  stage_event_id uuid references stage_event(id),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now());

-- Transactional outbox (§30): external calls happen only from the outbox worker.
create table outbox (
  id bigserial primary key,
  topic text not null, payload jsonb not null,
  created_at timestamptz not null default now(), processed_at timestamptz);

alter table issue enable row level security;
alter table outbox enable row level security;
grant select on issue to authenticated;
create policy issue_read on issue for select to authenticated using (app.can_see_project(project_id));
-- outbox: server only. The worker reads rows and stamps processed_at; inserts come only from security-definer functions.
revoke all on issue, outbox from anon, authenticated;
grant select on issue to authenticated;
revoke insert, delete, truncate on outbox from service_role;
revoke update on outbox from service_role;
grant update (processed_at) on outbox to service_role;
-- Issues are opened by functions; the server may only change their status.
revoke insert, update, delete, truncate on issue from service_role;
grant update (status) on issue to service_role;

-- Nobody writes stage or side state, or stage events, except the function (owned by the migration role).
-- The server creates projects only at the first stage (stage/side_state take their defaults) and never deletes them.
revoke insert, update, delete, truncate on project from service_role;
grant insert (lift_id, customer_id, licence_holder) on project to service_role;
grant update (customer_id, licence_holder) on project to service_role;
revoke insert on stage_event from service_role;
-- Gate rules and approvals change only through audited functions (rule change: Admin proposes, Owner approves; approval
-- request/decide functions). Until those exist the server key cannot edit them.
revoke insert, update, delete, truncate on stage_transition, approval from service_role;

-- ---------- default gates (generic; editable via settings) ----------
-- Approvers per matrix "Approve stage gate": Customer readiness/handover, Technician site start + peer check, QC QC gates,
-- Supplier dispatch, Admin all. Sales and Negotiator move early stages but never approve.
insert into stage_transition (from_stage, to_stage, required_approver_roles, required_proofs) values
  ('lead_captured', 'lead_verified', '{sales,admin}',
   '[{"type":"evidence","kind":"photo","min":3}]'),
  ('lead_verified', 'contacted', '{sales,admin}',
   '[{"type":"approval","kind":"lead_verification","approver_roles":["admin"]}]'),
  ('contacted', 'quoted', '{sales,negotiator,admin}',
   '[{"type":"approval","kind":"requirement_captured","approver_roles":["admin"]}]'),
  ('quoted', 'agreement_token', '{negotiator,admin}',
   '[{"type":"quote"},{"type":"approval","kind":"quote_accepted","approver_roles":["admin"]}]'),
  ('agreement_token', 'site_readiness', '{admin}',
   '[{"type":"payment","milestone":"token"},{"type":"approval","kind":"agreement_signed","approver_roles":["admin"]}]'),
  -- readiness photo count "per SOP" is not set in the spec: default 1, raise it in settings
  ('site_readiness', 'qc_clearance', '{qc,admin}',
   '[{"type":"evidence","kind":"photo","min":1},{"type":"approval","kind":"readiness","approver_roles":["customer","admin"]}]'),
  ('qc_clearance', 'permit_applied', '{qc,admin}',
   '[{"type":"approval","kind":"qc_clearance","approver_roles":["qc","admin"]},{"type":"project_field","field":"licence_holder"}]'),
  -- DEC-019 default: the 20% cabin payment is due before production
  ('permit_applied', 'production_order', '{admin}',
   '[{"type":"approval","kind":"permit_filed","approver_roles":["admin"]},{"type":"payment","milestone":"cabin_20"}]'),
  ('production_order', 'dispatch', '{supplier,admin}',
   '[{"type":"approval","kind":"po_accepted","approver_roles":["admin"]}]'),
  -- DEC-004 default: the customer's 70% is confirmed before dispatch completes
  ('dispatch', 'container_delivery', '{supplier,admin}',
   '[{"type":"payment","milestone":"pre_dispatch_70"},{"type":"approval","kind":"dispatch_sealed","approver_roles":["supplier","admin"]}]'),
  ('container_delivery', 'cabin_delivery', '{admin}',
   '[{"type":"approval","kind":"container_custody","approver_roles":["admin"]}]'),
  ('cabin_delivery', 'installation', '{technician,admin}',
   '[{"type":"approval","kind":"cabin_delivered","approver_roles":["admin"]}]'),
  ('installation', 'qc_inspector', '{qc,admin}',
   -- Technician of another team joins as approver once teams exist (T-055); until then QC only
   '[{"type":"approval","kind":"installation_peer_check","approver_roles":["qc"]}]'),
  -- safety-critical sign-off is human-only: both are approvals by people, never AI
  ('qc_inspector', 'licence', '{qc,admin}',
   '[{"type":"approval","kind":"qc_pass","approver_roles":["qc"]},{"type":"approval","kind":"inspector_passed","approver_roles":["admin"]}]'),
  -- DEC-013 default: handover only after the licence is recorded
  ('licence', 'handover', '{admin}',
   '[{"type":"approval","kind":"licence_recorded","approver_roles":["admin"]}]');

-- DEC-027 default: approval features stay closed until two approvers (Admin/Owner) and a backup approver who is a
-- third person exist (the backup cannot be one of the two).
create function app.approvers_configured() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from role_assignment b
    where b.role = 'backup_approver' and b.valid_from <= now() and (b.valid_to is null or b.valid_to > now())
      and (select count(distinct ra.user_id) from role_assignment ra
           where ra.role in ('admin', 'owner') and ra.user_id <> b.user_id
             and ra.valid_from <= now() and (ra.valid_to is null or ra.valid_to > now())) >= 2);
$$;
revoke all on function app.approvers_configured() from public;
grant execute on function app.approvers_configured() to authenticated;

-- ---------- the one function that changes stage ----------
create function public.apply_stage_transition(
  p_project uuid, p_to stage_t, p_idempotency text, p_actor uuid, p_role text,
  p_reason text default null, p_evidence uuid[] default '{}', p_client_time timestamptz default null)
returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_caller uuid := auth.uid();
  v_prev stage_event%rowtype;
  v_proj project%rowtype;
  v_rule stage_transition%rowtype;
  v_backward boolean;
  v_proof jsonb;
  v_n int;
  v_other int;
  v_event uuid;
  v_hashes jsonb;
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
  v_since timestamptz;
begin
  if p_idempotency is null or btrim(p_idempotency) = '' then raise exception 'IDEMPOTENCY_REQUIRED'; end if;
  if p_actor is null then raise exception 'ACTOR_REQUIRED'; end if;
  -- An API caller acts only as itself; the server (no JWT) passes the user it authenticated.
  if v_caller is not null and v_caller <> p_actor then raise exception 'ACTOR_MISMATCH'; end if;

  if not exists (select 1 from role_assignment ra where ra.user_id = p_actor and ra.role = p_role
                 and ra.valid_from <= now() and (ra.valid_to is null or ra.valid_to > now())) then
    raise exception 'ROLE_NOT_HELD';
  end if;

  select * into v_proj from project where id = p_project for update;
  if not found then raise exception 'PROJECT_NOT_FOUND'; end if;

  if p_role <> 'admin' and not exists (
       select 1 from project_assignment pa where pa.project_id = p_project and pa.user_id = p_actor and pa.role = p_role
         and (pa.access_until is null or pa.access_until > now())) then
    raise exception 'ROLE_NOT_ALLOWED: not assigned to this project as %', p_role;
  end if;

  -- Replay (checked after authorisation, so keys cannot be probed): the same key returns the same event; a different
  -- move under that key is refused.
  select * into v_prev from stage_event where idempotency_key = p_idempotency;
  if found then
    if v_prev.project_id = p_project and v_prev.to_stage = p_to and v_prev.actor_id = p_actor and v_prev.actor_role = p_role then
      return v_prev.id;
    end if;
    raise exception 'IDEMPOTENCY_CONFLICT';
  end if;

  if v_proj.side_state <> 'none' then raise exception 'SIDE_STATE_BLOCKED: project is %', v_proj.side_state; end if;

  if p_to = v_proj.stage then raise exception 'STAGE_ILLEGAL: already at %', p_to; end if;
  v_backward := p_to < v_proj.stage;   -- enum order is stage order

  if v_backward then
    if p_role <> 'admin' then raise exception 'ROLE_NOT_ALLOWED: only Admin moves a project backward'; end if;
    if v_reason is null then raise exception 'REASON_REQUIRED: backward move needs a reason'; end if;
  else
    select * into v_rule from stage_transition where from_stage = v_proj.stage and to_stage = p_to;
    if not found then raise exception 'STAGE_ILLEGAL: % -> % is not an allowed move', v_proj.stage, p_to; end if;
    if not (p_role = any (v_rule.required_approver_roles)) then
      raise exception 'ROLE_NOT_ALLOWED: % cannot move % -> %', p_role, v_proj.stage, p_to;
    end if;

    select coalesce(max(se.server_time), '-infinity') into v_since from stage_event se
      where se.project_id = p_project and se.detail->>'direction' = 'backward';
    for v_proof in select value from jsonb_array_elements(v_rule.required_proofs) loop
      case v_proof->>'type'
      when 'evidence' then
        select count(distinct ea.id) into v_n from evidence_asset ea
          where ea.id = any (coalesce(p_evidence, '{}')) and ea.project_id = p_project
            and ea.kind = v_proof->>'kind' and ea.risk in ('green', 'amber');
        if v_n < (v_proof->>'min')::int then
          raise exception 'STAGE_GATE_BLOCKED: needs % % evidence, got %', v_proof->>'min', v_proof->>'kind', v_n;
        end if;
      when 'approval' then
        -- DEC-027 default: approval-based gates stay closed until two approvers and a separate backup exist.
        if not app.approvers_configured() then
          raise exception 'APPROVERS_NOT_CONFIGURED: two approvers and a backup approver must exist (DEC-027)';
        end if;
        -- valid = decided after the last backward move, by someone who now holds an allowed approver role and,
        -- unless Admin, is actively assigned to this project in that role
        select count(*), count(*) filter (where a.requested_by <> p_actor) into v_n, v_other
          from approval a
          where a.project_id = p_project and a.kind = v_proof->>'kind' and a.status = 'approved' and a.approved_by is not null
            and a.decided_at > v_since
            and exists (select 1 from role_assignment ra where ra.user_id = a.approved_by
                          and ra.role in (select jsonb_array_elements_text(v_proof->'approver_roles'))
                          and ra.valid_from <= now() and (ra.valid_to is null or ra.valid_to > now())
                          and (ra.role = 'admin' or exists (
                                select 1 from project_assignment pa where pa.project_id = p_project
                                  and pa.user_id = a.approved_by and pa.role = ra.role
                                  and (pa.access_until is null or pa.access_until > now()))));
        if v_n = 0 then raise exception 'STAGE_GATE_BLOCKED: needs approval %', v_proof->>'kind'; end if;
        -- No self-approval: the requester never passes the gate on their own request (approver <> requester is a table
        -- constraint). The approver may move the stage: requester and approver are already two people (DEC-027 default).
        if v_other = 0 then raise exception 'SELF_APPROVAL: requester of approval % cannot pass this gate', v_proof->>'kind'; end if;
      when 'payment' then
        if not exists (select 1 from payment where project_id = p_project and milestone = v_proof->>'milestone'
                       and status = 'confirmed') then
          raise exception 'STAGE_GATE_BLOCKED: payment % not confirmed', v_proof->>'milestone';
        end if;
      when 'project_field' then
        if nullif(btrim(coalesce(to_jsonb(v_proj)->>(v_proof->>'field'), '')), '') is null then
          raise exception 'STAGE_GATE_BLOCKED: project % not set', v_proof->>'field';
        end if;
      when 'quote' then
        if not exists (select 1 from quote_version where project_id = p_project) then
          raise exception 'STAGE_GATE_BLOCKED: no quote';
        end if;
      else
        raise exception 'RULE_INVALID: unknown proof type %', v_proof->>'type';
      end case;
    end loop;
  end if;

  select coalesce(jsonb_agg(encode(ea.sha256, 'hex') order by ea.id), '[]') into v_hashes
    from evidence_asset ea where ea.id = any (coalesce(p_evidence, '{}')) and ea.project_id = p_project;

  begin
    insert into stage_event (project_id, actor_id, actor_role, from_stage, to_stage, side_state, reason,
                             idempotency_key, client_time, evidence_ids, detail)
    values (p_project, p_actor, p_role, v_proj.stage, p_to, v_proj.side_state, v_reason, p_idempotency, p_client_time,
            coalesce(array(select ea.id from evidence_asset ea where ea.id = any (coalesce(p_evidence, '{}'))
                           and ea.project_id = p_project order by ea.id), '{}'),
            jsonb_build_object('evidence_sha256', v_hashes, 'direction', case when v_backward then 'backward' else 'forward' end))
    returning id into v_event;
  exception when unique_violation then
    -- a concurrent call with the same key won: treat as replay
    select * into v_prev from stage_event where idempotency_key = p_idempotency;
    if v_prev.project_id = p_project and v_prev.to_stage = p_to and v_prev.actor_id = p_actor and v_prev.actor_role = p_role then
      return v_prev.id;
    end if;
    raise exception 'IDEMPOTENCY_CONFLICT';
  end;

  update project set stage = p_to where id = p_project;

  insert into outbox (topic, payload) values ('stage.changed', jsonb_build_object(
    'project_id', p_project, 'event_id', v_event, 'from', v_proj.stage, 'to', p_to, 'actor_role', p_role));

  if v_backward then
    insert into issue (project_id, kind, reason, opened_by, stage_event_id)
      values (p_project, 'stage_backward', v_reason, p_actor, v_event);
    insert into audit_event (actor_id, action, entity, entity_id, detail)
      values (p_actor, 'stage.backward', 'project', p_project::text,
              jsonb_build_object('from', v_proj.stage, 'to', p_to, 'reason', v_reason, 'event_id', v_event));
  end if;

  return v_event;
end $$;

revoke all on function public.apply_stage_transition(uuid, stage_t, text, uuid, text, text, uuid[], timestamptz) from public, anon;
grant execute on function public.apply_stage_transition(uuid, stage_t, text, uuid, text, text, uuid[], timestamptz)
  to authenticated, service_role;
