-- 0002: row level security on every table (invariant 6, spec §8 permission matrix, R-14).
-- Model: API roles (anon, authenticated) get SELECT only, row-filtered by policies below. Every write goes through the
-- server (service_role) or a security-definer function (apply_stage_transition, upload pipeline, webhook receiver), so
-- clients cannot set stage, payment status, ledger rows, roles, assignments, rules or evidence directly.
-- Inferred roles (senior_technician, rescue, backup_approver) and Supplier get no project rows here until the owner confirms their rows (§8).
-- Narrowest-row defaults where the matrix has no cell for a table: noted per policy.

-- ---------- grants: deny by default ----------
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
-- New functions are not callable by API roles unless granted (a future security-definer function must opt in).
alter default privileges in schema public revoke execute on functions from anon, authenticated;
alter default privileges revoke execute on functions from public;
-- PostGIS reference table is extension-owned (cannot carry our RLS); keep it out of the API.
revoke all on table spatial_ref_sys from anon, authenticated;

-- ---------- helpers (security definer: read role/assignment tables without recursive RLS) ----------
create schema app;
revoke all on schema app from public;
grant usage on schema app to authenticated;

create function app.has_role(r text) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from role_assignment ra
                 where ra.user_id = auth.uid() and ra.role = r
                   and ra.valid_from <= now() and (ra.valid_to is null or ra.valid_to > now()));
$$;

create function app.is_admin() returns boolean language sql stable as $$ select app.has_role('admin') $$;
create function app.is_staff() returns boolean language sql stable as $$ select app.has_role('admin') or app.has_role('owner') $$;

-- Active assignment to the project in one of the given roles, and the user still holds that role.
-- access_until carries the time box (technician access ends 90 days after handover; set by the server).
create function app.assigned_as(p uuid, roles text[]) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from project_assignment pa
                 join role_assignment ra on ra.user_id = pa.user_id and ra.role = pa.role
                 where pa.project_id = p and pa.user_id = auth.uid() and pa.role = any (roles)
                   and (pa.access_until is null or pa.access_until > now())
                   and ra.valid_from <= now() and (ra.valid_to is null or ra.valid_to > now()));
$$;

-- Supplier is left out: matrix gives it the delivery point and own orders only (dedicated views later).
create function app.can_see_project(p uuid) returns boolean language sql stable as $$
  select app.is_staff()
      or app.assigned_as(p, array['rider','technician','trainee','qc','customer','negotiator','nbfc','coordinator']);
$$;

create function app.can_see_lift(l uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from project p where p.lift_id = l and app.can_see_project(p.id));
$$;

-- Matrix "Site location/photos": assigned field roles, Customer own, Negotiator/NBFC S, Coordinator assigned sites.
-- Supplier gets the delivery point only, Owner a summary (dedicated views later), so no full site row for either.
create function app.can_see_site(s uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select app.is_admin() or exists (
    select 1 from lift l join project p on p.lift_id = l.id
    where l.site_id = s
      and app.assigned_as(p.id, array['technician','trainee','qc','customer','negotiator','nbfc','coordinator']));
$$;

-- Evidence: matrix "Capture evidence" = assigned field roles. Captures on a project follow the project's time box
-- (T-002), even for the capturer; a capture with no project yet (rider lead) is visible to its capturer.
-- Customer sees only own readiness photos (captured_by while assigned), not technician evidence.
create function app.can_see_evidence(e uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select app.is_admin() or exists (
    select 1 from evidence_asset ea
    where ea.id = e and (
      (ea.project_id is null and ea.captured_by = auth.uid())
      or app.assigned_as(ea.project_id, array['technician','trainee','qc'])
      or (ea.captured_by = auth.uid() and app.assigned_as(ea.project_id, array['customer']))));
$$;

revoke all on all functions in schema app from public;
grant execute on all functions in schema app to authenticated;

-- ---------- enable RLS on every table ----------
do $$ declare r record; begin
  for r in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'public' and c.relkind = 'r'
             and not exists (select 1 from pg_depend d where d.classid = 'pg_class'::regclass
                             and d.objid = c.oid and d.deptype = 'e') loop
    execute format('alter table public.%I enable row level security', r.relname);
  end loop;
end $$;

-- ---------- per-table SELECT grants and policies (authenticated only; anon gets nothing) ----------

-- user_account: phone_e164 is never exposed to API roles (masked contact, T-001); the server reads it and audits.
grant select (id, display_name, language, status, created_at) on user_account to authenticated;
create policy user_account_read on user_account for select to authenticated
  using (id = auth.uid() or app.is_staff());

grant select on role_assignment to authenticated;
create policy role_assignment_read on role_assignment for select to authenticated
  using (user_id = auth.uid() or app.is_staff());

grant select on site to authenticated;
create policy site_read on site for select to authenticated using (app.can_see_site(id));

grant select on lift to authenticated;
create policy lift_read on lift for select to authenticated using (app.can_see_lift(id));

grant select on project to authenticated;
create policy project_read on project for select to authenticated using (app.can_see_project(id));

-- Own assignment rows only; same-project team map comes with the map feature (Phase 3/9).
grant select on project_assignment to authenticated;
create policy project_assignment_read on project_assignment for select to authenticated
  using (user_id = auth.uid() or app.is_staff());

-- Transition rules hold no personal or money data.
grant select on stage_transition to authenticated;
create policy stage_transition_read on stage_transition for select to authenticated using (true);

grant select on stage_event to authenticated;
create policy stage_event_read on stage_event for select to authenticated using (app.can_see_project(project_id));

grant select on evidence_asset to authenticated;
create policy evidence_asset_read on evidence_asset for select to authenticated using (app.can_see_evidence(id));

grant select on evidence_check to authenticated;
create policy evidence_check_read on evidence_check for select to authenticated using (app.can_see_evidence(evidence_id));

-- Matrix "Quoted price": Customer S, Negotiator S/D, NBFC S, Admin/Owner; never Rider/Technician/QC/Supplier.
grant select on quote_version to authenticated;
create policy quote_version_read on quote_version for select to authenticated
  using (app.is_staff() or app.assigned_as(project_id, array['customer','negotiator','nbfc']));

-- Ledger rows: Admin only. Owner "totals" and worker "own earnings" come as aggregate views later.
grant select on ledger_journal to authenticated;
create policy ledger_journal_read on ledger_journal for select to authenticated using (app.is_admin());
grant select on ledger_entry to authenticated;
create policy ledger_entry_read on ledger_entry for select to authenticated using (app.is_admin());

-- provider_webhook: server only (no grant, no policy).

-- Matrix "Payment status": Customer own, Negotiator S, Admin/Owner. Technician/QC "paid/not paid" needs a status-only view later.
grant select on payment to authenticated;
create policy payment_read on payment for select to authenticated
  using (app.is_staff() or app.assigned_as(project_id, array['customer','negotiator']));

-- Matrix "Earnings": own; Admin all; Owner totals only (aggregate view later).
grant select on payout to authenticated;
create policy payout_read on payout for select to authenticated
  using (contractor_id = auth.uid() or app.is_admin());

grant select on approval to authenticated;
create policy approval_read on approval for select to authenticated
  using (app.is_staff() or requested_by = auth.uid() or approved_by = auth.uid());

-- Consent holds phone hashes: Admin only (Owner "—" on customer phone).
grant select on consent_record to authenticated;
create policy consent_record_read on consent_record for select to authenticated using (app.is_admin());

-- Owner reviews overrides weekly (§8 hard rules).
grant select on audit_event to authenticated;
create policy audit_event_read on audit_event for select to authenticated using (app.is_staff());

-- Matrix "Change rules": Admin propose, Owner approve; rule values include base cost and margin.
grant select on rule_config to authenticated;
create policy rule_config_read on rule_config for select to authenticated using (app.is_staff());
