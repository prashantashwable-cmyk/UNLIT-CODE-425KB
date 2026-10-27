#!/usr/bin/env bash
# LOCAL terminal loop: re-run Claude Code headless until work is done or attempts run out, waiting out usage limits.
# Usage: scripts/auto-resume.sh [max_attempts=6] [wait_minutes=300]
# Needs the `claude` CLI. Headless (-p) usage may be billed differently from interactive use: check your plan.
set -u
max=${1:-6}; wait_min=${2:-300}; prompt="/resume-work"; tries=0; log=.claude/auto-resume.log
mkdir -p .claude; touch .claude/autopilot
while [ $tries -lt "$max" ]; do
  tries=$((tries+1)); echo "[$(date -u +%FT%TZ)] attempt $tries/$max" | tee -a "$log"
  out=$(claude -p "$prompt" --continue 2>&1); rc=$?
  if [ $rc -ne 0 ] && echo "$out" | grep -qi "no conversation"; then out=$(claude -p "$prompt" 2>&1); rc=$?; fi
  echo "$out" | tail -20 >> "$log"
  bash scripts/checkpoint.sh --force
  nxt=$(grep -m1 '^NEXT:' STATE.md 2>/dev/null | tr 'A-Z' 'a-z')
  case "$nxt" in "next: none"*|"next: done"*|"next: blocked"*|"next: needs"*) echo "stopping: $nxt" | tee -a "$log"; exit 0;; esac
  if echo "$out" | grep -qiE 'usage limit|rate limit|limit reached|resets? (at|in)|try again later|quota'; then
    echo "limit hit; sleeping ${wait_min} min" | tee -a "$log"; sleep $((wait_min*60))
  elif [ $rc -ne 0 ]; then echo "non-limit error rc=$rc; stopping" | tee -a "$log"; exit $rc
  else sleep 5; fi
done
echo "max attempts reached; resume manually with /resume-work" | tee -a "$log"
