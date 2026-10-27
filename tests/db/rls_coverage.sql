-- Lists public tables WITHOUT row level security. Phase 1 exit requires this to return zero rows.
-- Tables owned by an extension (PostGIS spatial_ref_sys) are excluded; 0002_rls.sql revokes client access to them instead.
select c.relname as table_without_rls
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind in ('r','p') and not c.relrowsecurity
  and not exists (select 1 from pg_depend d where d.classid='pg_class'::regclass and d.objid=c.oid and d.deptype='e')
order by 1;
