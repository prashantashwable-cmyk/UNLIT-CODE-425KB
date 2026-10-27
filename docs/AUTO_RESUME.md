# Resuming automatically after a limit

## What is automatic (via `.claude/settings.json` hooks)
| Event | What happens |
|---|---|
| Every turn end (Stop) | WIP checkpoint commit (throttled to every 10 min; never on main/master; pushes on cloud sessions; never commits `.env`) |
| Before context compaction, session end | Forced checkpoint |
| Session start / resume / clear / compact | `scripts/resume-brief.sh` prints STATE.md head, the `NEXT:` task, branch, last commits, uncommitted count |
| Opt-in autopilot (`touch .claude/autopilot`) | At turn end, if STATE.md has a real `NEXT:` task, the Stop hook tells Claude to continue. Max 6 continues per session (`AUTOPILOT_MAX`). Stops on `NEXT: none`, `blocked`, `needs owner/device/provider` |

Nothing is lost when a limit hits: code is in git, the plan and `NEXT:` line are in STATE.md.

## What is NOT automatic
A session cannot wake itself after a usage limit resets. Pick one:
1. **Manual, one command:** open a new session (or `claude --continue`) and run `/resume-work`.
2. **Local terminal loop:** `bash scripts/auto-resume.sh 6 300` runs `claude -p "/resume-work" --continue`, detects limit messages, sleeps (default 5 h), retries up to 6 times, stops when `NEXT:` is none or blocked. Logs to `.claude/auto-resume.log`. Tested here only against a fake `claude`; limit-message wording may differ, so check the log the first time. Headless (`-p`) usage may count against a different allowance than interactive use: check your plan.
3. **Scheduler:** run option 2 from cron or a CI schedule. Community tools for re-waking sessions also exist; I have not vetted any, so review code before trusting one with your repo.

## Rules that keep it safe
- Autopilot never answers owner decisions, never flips `config/flags.defaults.json`, and stops when blocked.
- A checkpoint commit is not a finished commit: after a resume, run the tests before trusting it (the brief says so).
- Autopilot spends tokens faster; it is off by default. Use it for well-specified tasks (schema, RLS, ledger tests), not open design.
- Claude must keep one `NEXT:` line in STATE.md current (CLAUDE.md requires it).
