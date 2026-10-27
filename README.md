# AIEC Elevator OS — Claude Code package

Spec, split for agentic building. Original: one 409 KB file (~100k tokens), too large to load every session.

## Start in Claude Code on the web
1. Create a **private GitHub repo**, commit this folder's contents, push.
2. claude.ai/code → connect repo → environment settings:
   - Network access: start with **Trusted**; use **Full/custom** only if installs fail (apt, npm, pip, crates need reachable registries).
   - Setup script: `bash scripts/cloud-setup.sh`
   - Env vars (`.env` format; visible to anyone using the environment, so **test/sandbox keys only**): `DATABASE_URL=postgres://postgres@localhost/aiec_test`
3. Ready-made prompts: `docs/FIRST_PROMPTS.md`. Record your decisions with `python3 scripts/decide.py <n> "answer" --by "name"`. First prompt: `/phase 0` (decision tracker + ADR), then `/phase 1`.
4. Move between web and terminal with `claude --cloud` / `--teleport` as needed.

## Layout
- `CLAUDE.md` rules read every session (short on purpose) · `STATE.md` progress memory
- `docs/BUILD_PLAN.md` phase checklists · `docs/phases/phase-N.md` generated context packs · `docs/spec/` spec by section · `docs/data/` structured tests, requirements, screens, stages, permissions, decisions · `docs/appendix/` tokens, schema draft, strings · `docs/reference/` archived long reference
- `scripts/spec.py` token-cheap lookups (`req`, `test`, `screen`, `dec`, `stage`, `perm`, `phase`, `sec`, `toc`) · `docs/TOKEN_GUIDE.md` saving tokens safely · `scripts/extract-data.py` + `gen-phase-packs.py` regenerate data · `config/flags.defaults.json` risky features OFF
- Auto-checkpoint + resume hooks, opt-in autopilot, `scripts/auto-resume.sh` (see `docs/AUTO_RESUME.md`)
- `.claude/` settings, hooks, slash commands (`/phase`, `/decision`, `/check-invariants`), subagents

## Integrity check
`python3 scripts/check-coverage.py` verifies every requirement appears in a phase pack and has tests, and every test key resolves. Run it after editing spec tables and regenerating data.
