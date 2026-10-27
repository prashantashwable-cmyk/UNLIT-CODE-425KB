-- 0005: structured approvals (§26, invariant 5, T-004) and project side states (§16.3).
-- Approvals are requested and decided only through request_approval / decide_approval; side states change only through
-- apply_side_state. Side-state rules are data (side_state_rule), editable later as settings; seeded rows follow §16.3.

-- ---------- approvals ----------
alter table approval add column idempotency_key text unique;
alter table approval add column requested_role text;
alter table approval add column decided_role text;
alter table approval add column created_at timestamptz not null default now();

-- DEC-027 default: approval features stay closed until two approvers (Admin/Owner) and a backup approver exist.
create function app.approvers_configured() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select (select count(distinct ra.user_id) from role_assignment ra where ra.role in ('admin', 'owner')
            and ra.valid_from <= now() and (ra.valid_to is null or ra.valid_to > now())) >= 2
     and exists (select 1 from role_assignment ra where ra.role = 'backup_approver'
                   and ra.valid_from <= now() and (ra.valid_to is null or ra.valid_to > now()));
$$;

-- Who may decide an approval of this kind: overrides need a second Admin or the Owner (T-004); gate kinds use the
-- approver_roles of the gate rules (matrix "Approve stage gate").
create function app.approver_roles(p_kind text) returns text[]
language sql stable security definer set search_path = public, pg_temp as $$
  select case when p_kind = 'override' then array['admin', 'owner']
         else coalesce((select array_agg(distinct r)
                        from stage_transition st,
                             jsonb_array_elements(st.required_proofs) pr,
                             jsonb_array_elements_text(pr->'approver_roles') r
                        where pr->>'type' = 'approval' and pr->>'kind' = p_kind), '{}') end;
$$;

-- The current user holds an approver role for this kind and, unless Admin/Owner, is assigned to the project in it.
create function app.may_decide(p_project uuid, p_kind text) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from role_assignment ra
                 where ra.user_id = auth.uid() and ra.role = any (app.approver_roles(p_kind))
                   and ra.valid_from <= now() and (ra.valid_to is null or ra.valid_to > now())
                   and (ra.role in ('admin', 'owner') or app.assigned_as(p_project, array[ra.role])));
$$;
revoke all on function app.approvers_configured(), app.approver_roles(text), app.may_decide(uuid, text) from public;
grant execute on function app.approvers_configured(), app.approver_roles(text), app.may_decide(uuid, text) to authenticated;

-- Approvers see the pending requests they may decide.
drop policy approval_read on approval;
create policy approval_read on approval for select to authenticated
  using (app.is_staff() or requested_by = auth.uid() or approved_by = auth.uid()
         or (status = 'requested' and app.may_decide(project_id, kind)));

-- Shared caller checks: the API caller acts only as itself; the server (no JWT) passes the user it authenticated.
create function app.check_actor(p_actor uuid, p_role text) returns void
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if p_actor is null then raise exception 'ACTOR_REQUIRED'; end if;
  if auth.uid() is not null and auth.uid() <> p_actor then raise exception 'ACTOR_MISMATCH'; end if;
  if not exists (select 1 from role_assignment ra where ra.user_id = p_actor and ra.role = p_role
                 and ra.valid_from <= now() and (ra.valid_to is null or ra.valid_to > now())) then
    raise exception 'ROLE_NOT_HELD';
  end if;
end $$;
revoke all on function app.check_actor(uuid, text) from public;

create function public.request_approval(p_project uuid, p_kind text, p_actor uuid, p_role text, p_idempotency text,
                                        p_reason text default null)
returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
  v_prev approval%rowtype;
  v_id uuid;
  v_override boolean := p_kind = 'override';
begin
  if p_idempotency is null or btrim(p_idempotency) = '' then raise exception 'IDEMPOTENCY_REQUIRED'; end if;
  perform app.check_actor(p_actor, p_role);
  if not v_override and cardinality(app.approver_roles(p_kind)) = 0 then
    raise exception 'APPROVAL_KIND_UNKNOWN: %', p_kind;
  end if;
  if not exists (select 1 from project where id = p_project) then raise exception 'PROJECT_NOT_FOUND'; end if;
  if v_override and p_role not in ('admin', 'owner') then raise exception 'ROLE_NOT_ALLOWED: overrides are requested by Admin or Owner'; end if;
  if p_role not in ('admin', 'owner') and not exists (
       select 1 from project_assignment pa where pa.project_id = p_project and pa.user_id = p_actor and pa.role = p_role
         and (pa.access_until is null or pa.access_until > now())) then
    raise exception 'ROLE_NOT_ALLOWED: not assigned to this project as %', p_role;
  end if;
  if v_override and v_reason is null then raise exception 'REASON_REQUIRED: an override needs a reason'; end if;

  select * into v_prev from approval where idempotency_key = p_idempotency;
  if found then
    if v_prev.project_id = p_project and v_prev.kind = p_kind and v_prev.requested_by = p_actor then return v_prev.id; end if;
    raise exception 'IDEMPOTENCY_CONFLICT';
  end if;

  insert into approval (project_id, kind, requested_by, requested_role, status, reason, idempotency_key)
    values (p_project, p_kind, p_actor, p_role, 'requested', v_reason, p_idempotency)
    returning id into v_id;
  insert into audit_event (actor_id, action, entity, entity_id, detail)
    values (p_actor, case when v_override then 'override.requested' else 'approval.requested' end, 'approval', v_id::text,
            jsonb_build_object('project_id', p_project, 'kind', p_kind, 'role', p_role, 'reason', v_reason,
                               'severity', case when v_override then 'red' else 'normal' end));
  insert into outbox (topic, payload)
    values ('approval.requested', jsonb_build_object('approval_id', v_id, 'project_id', p_project, 'kind', p_kind));
  return v_id;
end $$;

create function public.decide_approval(p_approval uuid, p_decision approval_status_t, p_actor uuid, p_role text,
                                       p_version int, p_reason text default null)
returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
  v_a approval%rowtype;
  v_override boolean;
begin
  perform app.check_actor(p_actor, p_role);
  if p_decision not in ('approved', 'rejected') then raise exception 'DECISION_INVALID: %', p_decision; end if;
  select * into v_a from approval where id = p_approval for update;
  if not found then raise exception 'APPROVAL_NOT_FOUND'; end if;
  if v_a.status <> 'requested' then raise exception 'APPROVAL_NOT_PENDING: %', v_a.status; end if;
  if p_version is distinct from v_a.version then raise exception 'VERSION_CONFLICT: approval is at version %', v_a.version; end if;
  if v_a.requested_by = p_actor then raise exception 'SELF_APPROVAL: the requester cannot decide their own request'; end if;
  if not (p_role = any (app.approver_roles(v_a.kind))) then
    raise exception 'ROLE_NOT_ALLOWED: % cannot decide %', p_role, v_a.kind;
  end if;
  if p_role not in ('admin', 'owner') and not exists (
       select 1 from project_assignment pa where pa.project_id = v_a.project_id and pa.user_id = p_actor and pa.role = p_role
         and (pa.access_until is null or pa.access_until > now())) then
    raise exception 'ROLE_NOT_ALLOWED: not assigned to this project as %', p_role;
  end if;
  if p_decision = 'rejected' and v_reason is null then raise exception 'REASON_REQUIRED: a rejection needs a reason'; end if;
  if not app.approvers_configured() then
    raise exception 'APPROVERS_NOT_CONFIGURED: two approvers and a backup approver must exist (DEC-027)';
  end if;

  v_override := v_a.kind = 'override';
  update approval set status = p_decision, approved_by = p_actor, decided_role = p_role, decided_at = now(),
                      version = v_a.version + 1, reason = coalesce(v_reason, v_a.reason)
    where id = p_approval;
  insert into audit_event (actor_id, action, entity, entity_id, detail)
    values (p_actor, case when v_override then 'override.' else 'approval.' end || p_decision::text, 'approval', p_approval::text,
            jsonb_build_object('project_id', v_a.project_id, 'kind', v_a.kind, 'role', p_role, 'reason', v_reason,
                               'requested_by', v_a.requested_by, 'version', v_a.version + 1,
                               'severity', case when v_override then 'red' else 'normal' end));
  insert into outbox (topic, payload)
    values ('approval.decided', jsonb_build_object('approval_id', p_approval, 'project_id', v_a.project_id,
                                                   'kind', v_a.kind, 'decision', p_decision));
end $$;

-- ---------- side states ----------
create table side_state_rule (
  from_side side_state_t not null, to_side side_state_t not null,
  allowed_roles text[] not null check (cardinality(allowed_roles) > 0),
  requires_reason boolean not null default true,
  causes text[] not null default '{}',              -- empty = no cause needed; else the cause must be one of these
  min_evidence int not null default 0 check (min_evidence >= 0),
  max_stage stage_t,                                -- null = any stage
  primary key (from_side, to_side),
  check (from_side <> to_side),
  check (from_side <> 'cancelled'));                -- Cancelled is final (§16.3)
alter table side_state_rule enable row level security;
revoke all on side_state_rule from anon, authenticated;
grant select on side_state_rule to authenticated;
create policy side_state_rule_read on side_state_rule for select to authenticated using (true);
revoke insert, update, delete, truncate on side_state_rule from service_role;

insert into side_state_rule (from_side, to_side, allowed_roles, causes, min_evidence, max_stage) values
  ('none', 'on_hold', '{admin}', '{customer,supplier,weather,permit,defect}', 1, null),
  ('on_hold', 'none', '{admin}', '{}', 0, null),
  ('none', 'disputed', '{admin}', '{payment,quality}', 0, null),
  ('on_hold', 'disputed', '{admin}', '{payment,quality}', 0, null),
  ('disputed', 'none', '{admin}', '{}', 0, null),
  ('none', 'cancelled', '{customer,admin}', '{}', 0, null),       -- refund engine (§21.4) consumes the outbox event
  ('on_hold', 'cancelled', '{customer,admin}', '{}', 0, null),
  ('disputed', 'cancelled', '{admin}', '{}', 0, null),
  ('none', 'lost', '{sales,negotiator,admin}', '{no_reply,declined}', 0, 'quoted'),  -- sales outcome, before agreement
  ('lost', 'none', '{rider,admin}', '{}', 1, null);                 -- revisit capture re-opens

create function public.apply_side_state(p_project uuid, p_to side_state_t, p_idempotency text, p_actor uuid, p_role text,
                                        p_reason text default null, p_cause text default null, p_evidence uuid[] default '{}')
returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
  v_cause text := nullif(btrim(coalesce(p_cause, '')), '');
  v_proj project%rowtype;
  v_rule side_state_rule%rowtype;
  v_prev stage_event%rowtype;
  v_n int;
  v_event uuid;
  v_ids uuid[];
  v_hashes jsonb;
begin
  if p_idempotency is null or btrim(p_idempotency) = '' then raise exception 'IDEMPOTENCY_REQUIRED'; end if;
  perform app.check_actor(p_actor, p_role);
  select * into v_proj from project where id = p_project for update;
  if not found then raise exception 'PROJECT_NOT_FOUND'; end if;
  if p_role <> 'admin' and not exists (
       select 1 from project_assignment pa where pa.project_id = p_project and pa.user_id = p_actor and pa.role = p_role
         and (pa.access_until is null or pa.access_until > now())) then
    raise exception 'ROLE_NOT_ALLOWED: not assigned to this project as %', p_role;
  end if;

  select * into v_prev from stage_event where idempotency_key = p_idempotency;
  if found then
    if v_prev.project_id = p_project and v_prev.detail->>'kind' = 'side_state' and v_prev.side_state = p_to
       and v_prev.actor_id = p_actor and v_prev.actor_role = p_role then
      return v_prev.id;
    end if;
    raise exception 'IDEMPOTENCY_CONFLICT';
  end if;

  if p_to = v_proj.side_state then raise exception 'SIDE_STATE_ILLEGAL: already %', p_to; end if;
  select * into v_rule from side_state_rule where from_side = v_proj.side_state and to_side = p_to;
  if not found then raise exception 'SIDE_STATE_ILLEGAL: % -> % is not an allowed move', v_proj.side_state, p_to; end if;
  if v_rule.max_stage is not null and v_proj.stage > v_rule.max_stage then
    raise exception 'SIDE_STATE_ILLEGAL: % is not allowed after %', p_to, v_rule.max_stage;
  end if;
  if not (p_role = any (v_rule.allowed_roles)) then
    raise exception 'ROLE_NOT_ALLOWED: % cannot move % -> %', p_role, v_proj.side_state, p_to;
  end if;
  if v_rule.requires_reason and v_reason is null then raise exception 'REASON_REQUIRED'; end if;
  if cardinality(v_rule.causes) > 0 and (v_cause is null or not (v_cause = any (v_rule.causes))) then
    raise exception 'SIDE_CAUSE_INVALID: cause must be one of %', v_rule.causes;
  end if;

  -- proof: captures of this project that passed checks
  v_ids := coalesce(array(select ea.id from evidence_asset ea where ea.id = any (coalesce(p_evidence, '{}'))
                            and ea.project_id = p_project and ea.risk in ('green', 'amber') order by ea.id), '{}');
  if cardinality(v_ids) < v_rule.min_evidence then
    raise exception 'SIDE_PROOF_REQUIRED: needs % checked capture(s) of this project, got %', v_rule.min_evidence, cardinality(v_ids);
  end if;
  select coalesce(jsonb_agg(encode(ea.sha256, 'hex') order by ea.id), '[]') into v_hashes
    from evidence_asset ea where ea.id = any (v_ids);

  begin
    insert into stage_event (project_id, actor_id, actor_role, from_stage, to_stage, side_state, reason,
                             idempotency_key, evidence_ids, detail)
    values (p_project, p_actor, p_role, v_proj.stage, v_proj.stage, p_to, v_reason, p_idempotency, v_ids,
            jsonb_build_object('kind', 'side_state', 'from_side', v_proj.side_state, 'to_side', p_to,
                               'cause', v_cause, 'evidence_sha256', v_hashes))
    returning id into v_event;
  exception when unique_violation then
    raise exception 'IDEMPOTENCY_CONFLICT';
  end;

  update project set side_state = p_to where id = p_project;
  insert into audit_event (actor_id, action, entity, entity_id, detail)
    values (p_actor, 'side_state.' || p_to::text, 'project', p_project::text,
            jsonb_build_object('from_side', v_proj.side_state, 'to_side', p_to, 'stage', v_proj.stage,
                               'reason', v_reason, 'cause', v_cause, 'event_id', v_event));
  insert into outbox (topic, payload)
    values ('project.side_state_changed', jsonb_build_object('project_id', p_project, 'event_id', v_event,
            'from_side', v_proj.side_state, 'to_side', p_to, 'stage', v_proj.stage));
  return v_event;
end $$;

revoke all on function public.request_approval(uuid, text, uuid, text, text, text) from public, anon;
revoke all on function public.decide_approval(uuid, approval_status_t, uuid, text, int, text) from public, anon;
revoke all on function public.apply_side_state(uuid, side_state_t, text, uuid, text, text, text, uuid[]) from public, anon;
grant execute on function public.request_approval(uuid, text, uuid, text, text, text) to authenticated, service_role;
grant execute on function public.decide_approval(uuid, approval_status_t, uuid, text, int, text) to authenticated, service_role;
grant execute on function public.apply_side_state(uuid, side_state_t, text, uuid, text, text, text, uuid[]) to authenticated, service_role;
