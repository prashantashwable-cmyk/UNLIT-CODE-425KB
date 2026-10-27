#!/usr/bin/env bash
# Stop hook (OPT-IN: only when .claude/autopilot exists). Keeps Claude working while STATE.md has a real "NEXT:" task.
# Bounded by AUTOPILOT_MAX (default 6) continues per session; stops on blocked/none/done, or if no progress is possible.
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
[ -f .claude/autopilot ] || exit 0
in=$(cat); max=${AUTOPILOT_MAX:-6}; cf=.claude/.autopilot-count
cnt=$(cat "$cf" 2>/dev/null || echo 0)
[ "$cnt" -ge "$max" ] && exit 0
next=$(grep -m1 '^NEXT:' STATE.md 2>/dev/null | sed 's/^NEXT:[[:space:]]*//')
case "$(echo "$next" | tr 'A-Z' 'a-z')" in ""|none*|done*|blocked*|"needs owner"*|"needs_device"*|"needs_provider"*) exit 0;; esac
echo $((cnt+1)) > "$cf"
bash "$(dirname "$0")/checkpoint.sh" >/dev/null 2>&1
python3 - "$next" "$((cnt+1))" "$max" <<'PY'
import json,sys
print(json.dumps({"decision":"block","reason":f"Autopilot {sys.argv[2]}/{sys.argv[3]}: continue with the next task from STATE.md: {sys.argv[1]}. Follow CLAUDE.md invariants, tests first. When done, update STATE.md and set NEXT: to the following task, or 'NEXT: blocked - <why>' / 'NEXT: none' if you must stop. Do not make owner decisions."}))
PY
exit 0
