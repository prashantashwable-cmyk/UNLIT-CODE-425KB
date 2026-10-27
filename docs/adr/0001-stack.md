# ADR 0001 — Technology stack

- **Status:** ACCEPTED in part (2026-10-27, Owner): field app = native Kotlin, Android-only at launch; hosting = Supabase; release 1 = §39 phases, Pune pilot (DEC-014). The rest of the proposal (TypeScript server, React web, own sync protocol, rules in Postgres) is accepted as the builder default. Still open: section 5 Q4–Q7 and the other tier 1 decisions.
- **Decision:** AIEC-DEC-012 (tier 1). Related tier 1 decisions: DEC-014, 005, 016, 017, 027, 031.
- **Date proposed:** 2026-10-27
- **Approval needed from:** Owner + builder (per DEC-012 record)

## 1. Context

What the spec forces on the stack, with sources. These are constraints, not preferences.

| Constraint | Source | Stack consequence |
|---|---|---|
| Field roles (Rider, Technician, QC) on ₹8,000-class Android phones; ≥48 dp targets; Marathi-first; voice + icons | CLAUDE.md, §12, §37 | Small memory footprint, bundled Noto Sans Devanagari, offline TTS/voice assets, fast cold start |
| In-app-only camera, stamp, hash; no gallery upload | Invariant 1, §31 table | Needs full camera control; PWA "harder to block gallery/enforce stamp" |
| Continuous GPS during the working day; foreground service started from a visible "Start day" | §6 (R-12), §31 | Android foreground service with `location` type; PWA "not reliable" |
| Offline queue survives kill and reboot; client UUID per capture; states `captured → queued → uploading → server_received → checked → accepted/rejected`; never discard evidence or money events | Invariant 7, §31 | Durable on-device store (SQLite, encrypted) + background retry job |
| Customer, Supplier, NBFC, Admin, Owner on web (customers may use iPhone) | §31 recommendation | Web app / PWA for non-field roles |
| RLS on every table; service key server-only; object-level checks | Invariant 6, §6 (R-14, R-19), §30 | PostgreSQL with RLS as the authorisation floor; schema draft assumes Supabase `auth.uid()` |
| Stage change only via `apply_stage_transition`, in one transaction with tasks, event, outbox | Invariant 4, §30 | Core rules live in Postgres functions; external calls only from an outbox worker |
| Money as `bigint` paise, double-entry, signed webhooks, durable before 2xx, idempotency keys | Invariant 2, §30 | Server process that owns webhook receipt; never trust the client |
| Geography (duplicate leads, site location) | Schema draft, Phase 3 | PostGIS |
| Personal data of Indian residents; DPDP core duties from 13 May 2027 | §6 (R-07) | Hosting region is a legal question (see Q7); India region preferred by default |
| Cloud sessions have no device, camera, GPS or live providers | CLAUDE.md | Backend and shared logic must be testable headless; device work tagged NEEDS_DEVICE |

## 2. Proposal (one stack, with the alternatives that remain open)

| Layer | Proposed default | Main alternatives |
|---|---|---|
| Database | PostgreSQL 16 + PostGIS, RLS on every table | — (fixed by the schema draft and §30) |
| DB hosting | **Supabase** (managed Postgres, Auth, Storage, RLS conventions the draft already uses), India region if available on the chosen plan | Self-managed Postgres on AWS RDS / GCP Cloud SQL in Mumbai, with own auth and object storage |
| Business rules | Postgres functions for stage transitions, ledger postings, approval checks (`security definer`, tested with SQL tests in CI) | Same rules in the app server only (weaker: any other DB writer bypasses them) |
| Server | **TypeScript on Node 22**: `/v1` API, webhook receiver, outbox worker, reconciliation job | Kotlin (shares a language with the Android app); Go |
| Web (non-field roles) | **TypeScript + React** (Vite SPA, installable PWA for customers) | Next.js (adds server rendering we do not need yet) |
| Field app | **Native Android, Kotlin + Jetpack Compose**; CameraX; foreground service for tracking; Room over SQLCipher for the queue; WorkManager for retries | React Native / Expo (shares TypeScript with web); Flutter (named in source V3); PWA (rejected for field roles by §31) |
| Offline sync | **Own protocol**: append-only upload queue keyed by `capture_id` + idempotent server endpoints; read-down sync of the user's assigned projects by cursor | A sync engine (PowerSync, ElectricSQL, WatermelonDB sync) |
| Evidence files | Private object storage (Supabase Storage or S3), pre-registered `capture_id`, resumable upload, checksum verified server-side | — |
| Auth | Phone OTP → short-lived JWT + refresh (Supabase Auth phone provider, SMS provider TBD) | Custom OTP service |
| Tests | SQL tests run by `scripts/test-db.sh` in CI (pgTAP optional); Vitest for TS; JVM unit tests for Kotlin logic | — |

## 3. Trade-offs

### 3.1 Field app framework (the real choice in DEC-012)

| | Native Kotlin | React Native / Expo | Flutter | PWA |
|---|---|---|---|---|
| Foreground-service tracking | Full control | Via native module / config plugin; works, more moving parts | Via plugin; works, more moving parts | Not reliable (§31) |
| Camera lock-down + stamp + hash | CameraX, full control | VisionCamera; good, native code needed for stamping | `camera` plugin; good | Weak (§31) |
| Encrypted durable queue | Room + SQLCipher | SQLite + encryption lib | sqflite/drift + encryption | IndexedDB, eviction risk |
| Low-end phone (RAM, APK size, cold start) | Best | Extra JS runtime; acceptable with Hermes | Larger base APK; good rendering | Depends on browser |
| Devanagari rendering | Platform text stack, bundled font | Platform text stack | Own engine; test conjuncts carefully (§12, T-092) | Browser |
| Code shared with web/server | None (separate language) | High (TypeScript, validation, i18n strings) | None | Full |
| Builder effort for 3 field roles | Highest | Lower | Medium | Lowest, but fails invariants |
| Testable in cloud sessions | JVM unit tests if Android SDK downloads; no emulator | JS logic tests easily; native parts NEEDS_DEVICE | Dart tests easily; native parts NEEDS_DEVICE | Browser tests easily |
| Hiring in Pune | Common | Common | Common | — |

**Builder recommendation:** native Kotlin, because the three hardest invariants (evidence lock, offline never loses data, tracking) all sit in the field app, and Kotlin gives the most direct control on cheap phones. **Choose React Native/Expo instead** if one small team must ship field and web and you value shared TypeScript more than the last bit of device control. Flutter is reasonable but gives neither benefit fully. PWA is out for field roles.

### 3.2 Supabase vs self-managed Postgres

- **Supabase:** the schema draft already uses `auth.uid()` and the `authenticated` role; RLS + Auth + Storage come together; fewer things to operate for a small team. Risks: vendor coupling (mitigated: it is plain Postgres, policies are portable), plan limits, region availability and data-processing terms must be checked for DPDP (Q7), service-role key must stay server-only (R-14).
- **Self-managed (RDS/Cloud SQL Mumbai):** full control of region, backups, extensions. Cost: we build auth, storage signing and the `auth.uid()` equivalent ourselves; more ops work (§38 backups, restore drills).

### 3.3 Rules in the database vs in the app server

Putting `apply_stage_transition`, ledger postings and approval checks in Postgres means every writer (API, admin tools, jobs) passes the same checks, and RLS + function tests run headless in cloud sessions. Cost: PL/pgSQL is less pleasant to write and needs disciplined migrations and tests. The server still does validation, idempotency storage, and all external calls (via the outbox).

### 3.4 Own sync protocol vs a sync engine

Evidence and money events are **append-only**, and §31 conflict rules are domain-specific (safety fields flagged, offline approvals rejected against server state, evidence attached to its original stage). A generic bidirectional sync engine would need these rules bolted on and can hide data loss. An own protocol is more code but each rule maps to a test (T-062–T-069, T-097). A read-down engine (e.g. PowerSync) could still be added later for the assigned-project view only.

## 4. Consequences if accepted

- Phase 1 starts with migrations from the schema draft, RLS on every table, and `apply_stage_transition` as SQL — independent of the field framework, so it can start once Postgres + host are confirmed.
- Repo layout proposal: `db/` (migrations, SQL tests), `server/` (TS), `web/` (TS/React), `android/` (Kotlin), `packages/shared/` (TS types, error codes, i18n keys; Android consumes generated JSON).
- Field work beyond pure logic is `NEEDS_DEVICE`; provider adapters are `NEEDS_PROVIDER` with recorded-fixture adapters.
- No live payouts, no wallet, no contractor onboarding, no rescue page: the flags in `config/flags.defaults.json` stay off whatever stack is chosen.

## 5. What I need from you (owner)

Answered 2026-10-27: Q1 (native Kotlin), Q2 (Android-only), Q3 (Supabase), DEC-014 (§39 phases, Pune). Still open: Q4–Q7, DEC-005, 016, 017, 027, 031.

Answer in writing; record each with `python3 scripts/decide.py <n> "<answer>" --by "<name>"`.

**Stack (DEC-012):**
1. Field app: native Kotlin (recommended), React Native/Expo, or Flutter?
2. Android-only at launch for field roles? (If any Rider/Technician/QC uses an iPhone, Kotlin is the wrong choice.)
3. Hosting: Supabase (recommended) or self-managed Postgres? Any existing cloud account or credits?
4. Who maintains this after the build? Their language skills should weigh on Q1 and Q3.
5. Minimum phone: confirm the "₹8,000-class" target and give one or two real models the field team uses (for Android version, RAM, storage).
6. Monthly hosting budget ceiling for the pilot (no number is assumed here).
7. Must personal data stay in India? (Needs the lawyer's DPDP reading; until then I will assume an India region.)

**Other tier 1 decisions (the build follows the default until you answer):**

| Decision | Question | Default the build uses until answered |
|---|---|---|
| DEC-014 | What is in release 1; Pune-only pilot? | Phases in §39; Pune pilot |
| DEC-005 | Who holds the lift contractor licence per job? | Licence holder stored per project; no permit stage without one named |
| DEC-016 | Workers as independent contractors; lawyer-approved terms? | Live contractor onboarding off; demo mode only |
| DEC-017 | Confirm: no wallet, ledger + authorised payout partner only? | Ledger only |
| DEC-027 | Names of the two approvers and the backup approver? | Approval features cannot go live until named |
| DEC-031 | Who checks the 2026 Amendment and current Rules at go-live? | Authority names and forms are configuration |

Phase 0 exit also needs the written opinions (lawyer, CA, licensed lift engineer, payment provider) and T-099 (cash-flow table filled, CA opinion recorded).
