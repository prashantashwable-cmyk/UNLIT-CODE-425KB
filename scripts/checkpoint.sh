#!/usr/bin/env bash
# Safe auto-checkpoint: WIP commit (and push on remote sessions) so work survives a limit or crash.
# Never runs on main/master. Throttled (default 10 min). Never fails the hook.
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0
br=$(git symbolic-ref --short HEAD 2>/dev/null) || exit 0
case "$br" in main|master|"") exit 0;; esac
mark=.claude/.last-checkpoint; now=$(date +%s); gap=${CHECKPOINT_MIN_SECONDS:-600}
if [ "${1:-}" != "--force" ] && [ -f "$mark" ] && [ $((now-$(cat "$mark" 2>/dev/null || echo 0))) -lt "$gap" ]; then exit 0; fi
git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ] && exit 0
echo "$now" > "$mark"
git add -A >/dev/null 2>&1
git commit -q -m "wip(checkpoint): $(date -u +%Y-%m-%dT%H:%MZ) auto-save" >/dev/null 2>&1 || exit 0
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] && git push -q -u origin HEAD >/dev/null 2>&1
exit 0
