#!/usr/bin/env bash
# Local throwaway Postgres for tests. Usage: test-db.sh start|reset|schema|rls|psql
set -uo pipefail
case "${1:-start}" in
  start)
    (service postgresql start || pg_ctlcluster "$(ls /etc/postgresql | head -1)" main start) >/dev/null 2>&1
    su postgres -c "psql -tAc \"select 1 from pg_database where datname='aiec_test'\"" 2>/dev/null | grep -q 1 \
      || su postgres -c "createdb aiec_test" 2>/dev/null
    su postgres -c "psql -d aiec_test -c 'create extension if not exists postgis; create extension if not exists pgcrypto;'" >/dev/null 2>&1
    echo "aiec_test ready" ;;
  reset) su postgres -c "dropdb --if-exists aiec_test && createdb aiec_test" && bash "$0" start ;;
  schema) bash "$0" reset >/dev/null 2>&1; D="$(cd "$(dirname "$0")/.." && pwd)"
    su postgres -c "psql -q -d aiec_test -v ON_ERROR_STOP=1 -f $D/scripts/db-shim.sql -f $D/docs/appendix/schema-skeleton.sql" ;;
  rls) D="$(cd "$(dirname "$0")/.." && pwd)"; su postgres -c "psql -d aiec_test -f $D/tests/db/rls_coverage.sql" ;;
  psql)  shift; su postgres -c "psql -d aiec_test $*" ;;
esac
