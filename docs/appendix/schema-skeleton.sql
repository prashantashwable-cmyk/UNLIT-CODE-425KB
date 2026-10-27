-- AIEC ELEVATOR OS : SCHEMA SKELETON (PROPOSED). NOT EXECUTED, NOT SYNTAX-CHECKED, NOT A MIGRATION.
-- Purpose: shows constraints the build agent must enforce in the database. Money is bigint paise.
-- auth.uid() is a Supabase helper; replace if another host is chosen (DEC-012). Geography types need PostGIS.
create extension if not exists postgis;
create extension if not exists pgcrypto;

create type stage_t as enum ('lead_captured','lead_verified','contacted','quoted','agreement_token',
  'site_readiness','qc_clearance','permit_applied','production_order','dispatch','container_delivery',
  'cabin_delivery','installation','qc_inspector','licence','handover');       -- 16 stages; AMC is a separate profile
create type side_state_t as enum ('none','on_hold','disputed','cancelled','lost');
create type payment_status_t as enum ('pending','confirmed','failed','reversed','disputed');
create type evidence_risk_t as enum ('green','amber','red');
create type ticket_severity_t as enum ('trapped_person','unsafe_operation','breakdown','repeat_fault','routine');
create type approval_status_t as enum ('requested','approved','rejected','expired');

create table user_account (
  id uuid primary key default gen_random_uuid(),
  phone_e164 text not null unique,
  display_name text,
  language text not null default 'mr' check (language in ('mr','hi','en')),
  status text not null default 'invited',
  created_at timestamptz not null default now());

create table role_assignment (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_account(id),
  role text not null check (role in ('rider','sales','negotiator','customer','trainee','technician','senior_technician',
     'qc','supplier','nbfc','coordinator','admin','owner','applicant','rescue','backup_approver')),
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  invited_by uuid references user_account(id));

create table site (
  id uuid primary key default gen_random_uuid(),
  name text, address_text text, ward_area text,
  geom geography(point,4326) not null,
  geofence_m int not null default 50);                                       -- about 50 m (V3); basement tolerance is runtime logic
create index site_geom_gix on site using gist (geom);

create table lift (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references site(id),
  tower_label text not null default '', unit_label text not null default '',
  unique (site_id, tower_label, unit_label));

create table project (
  id uuid primary key default gen_random_uuid(),
  lift_id uuid not null unique references lift(id),                         -- one Project per Lift
  customer_id uuid,
  stage stage_t not null default 'lead_captured',
  side_state side_state_t not null default 'none',
  created_at timestamptz not null default now());

create table project_assignment (
  project_id uuid not null references project(id),
  user_id uuid not null references user_account(id),
  role text not null,
  access_until timestamptz,                                                 -- technician access ends at bond end
  primary key (project_id, user_id, role));

create table stage_transition (                                             -- server-side state machine table
  from_stage stage_t not null, to_stage stage_t not null,
  required_proofs jsonb not null default '[]', required_approver_roles text[] not null default '{}',
  primary key (from_stage, to_stage));

create table stage_event (                                                  -- append-only
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references project(id),
  actor_id uuid not null references user_account(id), actor_role text not null,
  from_stage stage_t, to_stage stage_t, side_state side_state_t, reason text,
  idempotency_key text not null unique,
  client_time timestamptz, server_time timestamptz not null default now(),
  evidence_ids uuid[] not null default '{}', detail jsonb not null default '{}');
create index stage_event_project_ix on stage_event (project_id, server_time);

create table evidence_asset (                                               -- append-only; id = capture_id created on the phone
  id uuid primary key,
  project_id uuid references project(id),
  captured_by uuid not null references user_account(id),
  kind text not null check (kind in ('photo','video','audio','document')),
  sha256 bytea not null, original_uri text not null, rendered_uri text,
  gps geography(point,4326), gps_accuracy_m numeric,
  client_time timestamptz not null, server_time timestamptz not null default now(),
  risk evidence_risk_t, device_signals jsonb not null default '{}');

create table evidence_check (
  id uuid primary key default gen_random_uuid(),
  evidence_id uuid not null references evidence_asset(id),
  check_type text not null, result evidence_risk_t not null, reason_code text,
  reviewer_id uuid references user_account(id), created_at timestamptz not null default now());

create table quote_version (                                                -- immutable once sent
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references project(id), version int not null,
  price_paise bigint not null check (price_paise > 0),
  valid_until timestamptz not null, rate_card_version text not null,
  created_by uuid not null, created_role text not null,
  unique (project_id, version));

create table ledger_journal (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references project(id), kind text not null,
  idempotency_key text not null unique, created_at timestamptz not null default now());

create table ledger_entry (                                                 -- append-only, double entry
  id uuid primary key default gen_random_uuid(),
  journal_id uuid not null references ledger_journal(id),
  account text not null,
  debit_paise bigint not null default 0, credit_paise bigint not null default 0,
  check (debit_paise >= 0 and credit_paise >= 0 and (debit_paise = 0 or credit_paise = 0)));

create table provider_webhook (
  id uuid primary key default gen_random_uuid(),
  provider text not null, provider_event_id text not null,
  raw_payload jsonb not null, signature_ok boolean not null,
  received_at timestamptz not null default now(), processed_at timestamptz,
  unique (provider, provider_event_id));                                    -- duplicate callbacks cannot double-post

create table payment (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references project(id), milestone text not null,
  amount_paise bigint not null check (amount_paise > 0),
  status payment_status_t not null default 'pending',
  provider_ref text unique);

create table payout (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references user_account(id), cycle date not null,
  amount_paise bigint not null check (amount_paise >= 0),
  status payment_status_t not null default 'pending',
  provider_ref text unique, idempotency_key text not null unique,
  unique (contractor_id, cycle));                                           -- one payout per contractor per cycle

create table approval (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references project(id), kind text not null,
  requested_by uuid not null references user_account(id),
  approved_by uuid references user_account(id),
  status approval_status_t not null default 'requested',
  version int not null default 1, reason text,
  check (approved_by is null or approved_by <> requested_by));              -- no self-approval

create table consent_record (
  id uuid primary key default gen_random_uuid(),
  subject_phone_hash bytea not null, purpose text not null, channel text,
  notice_version text not null, language text not null,
  granted boolean not null, authority_confirmed boolean,
  audio_uri text, created_at timestamptz not null default now());

create table audit_event (                                                  -- append-only
  id bigserial primary key, at timestamptz not null default now(),
  actor_id uuid, action text not null, entity text, entity_id text,
  is_read boolean not null default false, detail jsonb not null default '{}');

create table rule_config (
  key text not null, version int not null,
  value jsonb not null, effective_from timestamptz not null,
  approved_by uuid, locked boolean not null default false,
  primary key (key, version));                                              -- locked controls are never editable

-- Append-only enforcement
create function forbid_update_delete() returns trigger language plpgsql as $$
begin raise exception 'append-only table: %', tg_table_name; end $$;
create trigger stage_event_ro before update or delete on stage_event for each row execute function forbid_update_delete();
create trigger evidence_ro   before update or delete on evidence_asset for each row execute function forbid_update_delete();
create trigger ledger_ro     before update or delete on ledger_entry for each row execute function forbid_update_delete();
create trigger audit_ro      before update or delete on audit_event for each row execute function forbid_update_delete();

-- Balanced journals (checked at commit)
create function check_journal_balanced() returns trigger language plpgsql as $$
declare d bigint; c bigint;
begin
  select coalesce(sum(debit_paise),0), coalesce(sum(credit_paise),0) into d, c
    from ledger_entry where journal_id = new.journal_id;
  if d <> c then raise exception 'unbalanced journal %', new.journal_id; end if;
  return null;
end $$;
create constraint trigger ledger_balanced after insert on ledger_entry
  deferrable initially deferred for each row execute function check_journal_balanced();

-- Row-level security: enable on EVERY table in an exposed schema (R-14); service key stays server-side
alter table project enable row level security;
alter table stage_event enable row level security;
alter table evidence_asset enable row level security;
alter table ledger_entry enable row level security;
alter table payout enable row level security;
-- ...repeat for every table above.

create policy project_read on project for select to authenticated using (
  exists (select 1 from project_assignment pa
          where pa.project_id = project.id and pa.user_id = auth.uid()
            and (pa.access_until is null or pa.access_until > now())));     -- time-boxed technician access

-- Stage changes must go through ONE server function (not direct updates):
--   apply_stage_transition(p_project uuid, p_to stage_t, p_idempotency text, p_actor uuid, p_role text, p_reason text)
--   1) look up (project.stage, p_to) in stage_transition, else raise;  2) check required proofs and approver roles;
--   3) refuse if actor = requester of a needed approval;  4) insert stage_event with idempotency key (replay returns same row);
--   5) update project.stage;  6) insert tasks and outbox rows in the same transaction.
-- Not shown: customer, supplier, purchase_order, bom, container, lock_event, custody_event, permit, licence, inspection,
-- task, sla_clock, escalation, issue, defect, contractor profile, skill, rating, trust_snapshot, appeal, xp_event,
-- chat_thread, chat_message, notification, amc_contract, service_ticket, incident, retention_rule (see section 29.1).
