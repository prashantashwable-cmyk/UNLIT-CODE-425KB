#!/usr/bin/env bash
# SessionStart hook: prints what a fresh or resumed session needs to continue without re-explaining. Fast, never fails.
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
echo "AIEC Elevator OS. Read CLAUDE.md. Lookups: python3 scripts/spec.py. Remote: ${CLAUDE_CODE_REMOTE:-false}"
echo "--- STATE.md (head) ---"; sed -n '1,14p' STATE.md 2>/dev/null
n=$(grep -m1 '^NEXT:' STATE.md 2>/dev/null); [ -n "$n" ] && echo "*** RESUME HERE -> $n"
if git rev-parse --git-dir >/dev/null 2>&1; then
  echo "--- git ---"; echo "branch: $(git symbolic-ref --short HEAD 2>/dev/null)"; git log --oneline -5 2>/dev/null
  c=$(git status --porcelain 2>/dev/null | wc -l); echo "uncommitted files: $c"
  git log -1 --format=%s 2>/dev/null | grep -q '^wip(checkpoint)' && echo "NOTE: last commit is an auto-checkpoint; verify tests before continuing."
fi
[ -f .claude/autopilot ] && echo "autopilot: ON (bounded; see docs/AUTO_RESUME.md)"
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then (pg_isready -q 2>/dev/null && echo "Postgres: up") || echo "Postgres: down (bash scripts/test-db.sh start)"; fi
rm -f .claude/.autopilot-count 2>/dev/null
exit 0
