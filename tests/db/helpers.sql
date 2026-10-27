-- Shared test helpers. Include inside the test's transaction with: \ir helpers.sql
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

-- Runs sql as the current role; passes only if it raises an error whose message starts with code (e.g. STAGE_ILLEGAL).
create function t.err(sql text, code text, label text) returns void language plpgsql as $$
begin
  execute sql;
  raise exception 'FAIL % (as %): expected %, statement succeeded', label, current_user, code;
exception when others then
  if sqlstate = 'P0001' and sqlerrm like 'FAIL %' then raise; end if;
  if sqlerrm not like code || '%' then
    raise exception 'FAIL % (as %): expected %, got % %', label, current_user, code, sqlstate, sqlerrm;
  end if;
  raise notice 'ok - %', label;
end $$;

-- Asserts a boolean condition.
create function t.ok(cond boolean, label text) returns void language plpgsql as $$
begin
  if cond is not true then raise exception 'FAIL % (as %)', label, current_user; end if;
  raise notice 'ok - %', label;
end $$;
grant execute on all functions in schema t to anon, authenticated, service_role;
