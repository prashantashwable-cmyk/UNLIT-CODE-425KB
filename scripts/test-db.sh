#!/usr/bin/env bash
# Local throwaway Postgres for tests. Usage: test-db.sh start|reset|schema|rls|test|psql
# Database: $AIEC_TEST_DB (default aiec_test); use a different name to run suites side by side without clobbering.
# schema: shim + db/migrations/*.sql in order, stops on first error, non-zero exit on failure.
# rls:    lists app tables without RLS; non-zero exit if any, or if the schema is missing (no vacuous pass).
# test:   rebuilds the schema, then runs tests/db/*_test.sql; non-zero exit on any failure.
set -uo pipefail
D="$(cd "$(dirname "$0")/.." && pwd)"
DB="${AIEC_TEST_DB:-aiec_test}"
case "$DB" in *[!a-z0-9_]*|"") echo "AIEC_TEST_DB must be lowercase letters, digits or _"; exit 2;; esac
q() { su postgres -c "psql -X -q -d $DB -v ON_ERROR_STOP=1 $*"; }
case "${1:-start}" in
  start)
    (service postgresql start || pg_ctlcluster "$(ls /etc/postgresql | head -1)" main start) >/dev/null 2>&1
    su postgres -c "psql -tAc \"select 1 from pg_database where datname='$DB'\"" 2>/dev/null | grep -q 1 \
      || su postgres -c "createdb $DB" 2>/dev/null
    echo "$DB ready" ;;
  reset) su postgres -c "dropdb --if-exists $DB && createdb $DB" && bash "$0" start >/dev/null ;;
  schema)
    bash "$0" reset || exit 1
    args="-f $D/scripts/db-shim.sql"; for f in "$D"/db/migrations/*.sql; do args="$args -f $f"; done
    q "$args" || { echo "SCHEMA FAILED"; exit 1; }
    echo "schema applied" ;;
  rls)
    n=$(su postgres -c "psql -X -tA -d $DB -c \"select count(*) from pg_tables where schemaname='public' and tablename='project'\"" 2>/dev/null)
    [ "$n" = "1" ] || { echo "FAIL: schema not applied (run: test-db.sh schema)"; exit 1; }
    out=$(su postgres -c "psql -X -tA -d $DB -f $D/tests/db/rls_coverage.sql") || exit 1
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
  psql)  shift; su postgres -c "psql -d $DB $*" ;;
esac
