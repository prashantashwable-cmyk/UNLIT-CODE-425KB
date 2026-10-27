#!/usr/bin/env bash
# Local throwaway Postgres for tests. Usage: test-db.sh start|reset|schema|rls|test|psql
# schema: shim + db/migrations/*.sql in order, stops on first error, non-zero exit on failure.
# rls:    lists app tables without RLS; non-zero exit if any, or if the schema is missing (no vacuous pass).
# test:   rebuilds the schema, then runs tests/db/*_test.sql; non-zero exit on any failure.
set -uo pipefail
D="$(cd "$(dirname "$0")/.." && pwd)"
q() { su postgres -c "psql -X -q -d aiec_test -v ON_ERROR_STOP=1 $*"; }
case "${1:-start}" in
  start)
    (service postgresql start || pg_ctlcluster "$(ls /etc/postgresql | head -1)" main start) >/dev/null 2>&1
    su postgres -c "psql -tAc \"select 1 from pg_database where datname='aiec_test'\"" 2>/dev/null | grep -q 1 \
      || su postgres -c "createdb aiec_test" 2>/dev/null
    echo "aiec_test ready" ;;
  reset) su postgres -c "dropdb --if-exists aiec_test && createdb aiec_test" && bash "$0" start >/dev/null ;;
  schema)
    bash "$0" reset || exit 1
    args="-f $D/scripts/db-shim.sql"; for f in "$D"/db/migrations/*.sql; do args="$args -f $f"; done
    q "$args" || { echo "SCHEMA FAILED"; exit 1; }
    echo "schema applied" ;;
  rls)
    n=$(su postgres -c "psql -X -tA -d aiec_test -c \"select count(*) from pg_tables where schemaname='public' and tablename='project'\"" 2>/dev/null)
    [ "$n" = "1" ] || { echo "FAIL: schema not applied (run: test-db.sh schema)"; exit 1; }
    out=$(su postgres -c "psql -X -tA -d aiec_test -f $D/tests/db/rls_coverage.sql") || exit 1
    if [ -n "$out" ]; then echo "FAIL: tables without RLS:"; echo "$out"; exit 1; fi
    echo "OK: every app table has RLS" ;;
  test)
    bash "$0" schema >/dev/null || { echo "SCHEMA FAILED"; exit 1; }
    rc=0
    for f in "$D"/tests/db/*_test.sql; do
      if q "-f $f" 2>&1 | sed 's/^psql:[^ ]* //'; [ "${PIPESTATUS[0]}" = 0 ]; then echo "PASS $(basename "$f")"
      else echo "FAIL $(basename "$f")"; rc=1; fi
    done
    exit $rc ;;
  psql)  shift; su postgres -c "psql -d aiec_test $*" ;;
esac
