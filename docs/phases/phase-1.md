# Phase 1 context pack (generated; mapping PROPOSED)

Workflows: WF-01, WF-16, WF-18

Read first: `python3 scripts/spec.py sec 16.2` (stage rules). Screens are read one at a time, never whole modules:
- `15.2` (modules/15.02-technician.md): preamble `spec.py sec 15.2`; screens SCR-057 via `spec.py sec SCR-nnn`
- `15.8` (modules/15.08-coordinator.md): preamble `spec.py sec 15.8`; screens SCR-067, SCR-068 via `spec.py sec SCR-nnn`
- `15.9` (modules/15.09-shared-core.md): preamble `spec.py sec 15.9`; screens SCR-001, SCR-002, SCR-003, SCR-004, SCR-005, SCR-006, SCR-007, SCR-008, SCR-009, SCR-010, SCR-012, SCR-013, SCR-014, SCR-018, SCR-019, SCR-020 via `spec.py sec SCR-nnn`
- `15.10` (modules/15.10-evidence-camera.md): preamble `spec.py sec 15.10`; screens SCR-015, SCR-016 via `spec.py sec SCR-nnn`

## Requirements (39)
- AIEC-UX-0001 [ROLE_LOGIN] Role-based login and role-specific interface. Mobile OTP once, then face unlock or 4-digit PIN. Roles are assigned by invitation. Face matching is never the only recovery… (S · confirmed)
- AIEC-SEC-0001 [ROLE_MULTI] A person may hold several roles (e.g. Technician who is also Rider) and switch from the top bar. Switching re-checks server permissions. Multi-role only for accounts expl… (S · confirmed)
- AIEC-REQ-0001 [DEMO] Demo mode is available in any browser, uses a separate database with fake identities, fake payments, no real tracking, no real messages. Real use is not allowed in demo. (S · confirmed)
- AIEC-REQ-0002 [FORCE_INSTALL] App starts full-screen and shows a download/install prompt at first launch. Rider, Technician and QC can log in for real use only from the installed Android app. Coordina… (S · confirmed E)
- AIEC-UX-0002 [PERM_WIZARD] Illustrated permission wizard explains each permission before the OS prompt. Location is requested when the user starts an on-duty shift, with a visible tracking-active i… (P · proposed)
- AIEC-SEC-0002 [ACCOUNT_RECOVERY] Account recovery with human review, lost-phone session revocation, session expiry, suspicious-login alerts, emergency access procedure. (P · proposed)
- AIEC-DATA-0001 [CONSENT_REC] Every consent records purpose, notice version, language, timestamp, channel and withdrawal/opt-out state. Notices exist in Marathi, Hindi, English. (S · confirmed L)
- AIEC-UX-0003 [ASSISTED] Assisted mode: a Coordinator or senior worker runs a step on the worker's phone; the worker's own face/identity check is still required; the record shows assisted-by. Coo… (S · confirmed)
- AIEC-UX-0005 [SCREEN_GRAMMAR] Twelve screen rules apply to all roles: 1 one screen one job (big button >=30% height, thumb level); 2 app speaks first; 3 fixed colours; 4 picture before word; 5 zero ty… (S · confirmed)
- AIEC-UX-0006 [NEXT_CARD] A Next-step card is always on top of Today: what to do now, who is waiting, what you earn when done. (S · confirmed)
- AIEC-UX-0007 [VOICE_ASSIST] Each screen plays a short voice line in the chosen language with a repeat icon. Text-to-speech and speech-to-text use a lift vocabulary glossary. Audio is human-reviewed.… (S · confirmed E)
- AIEC-VIS-0001 [COLOUR_RULES] Green = do/done, yellow = waiting, red = stopped/needs help, blue = information. Colour is never the only indicator: pair with icon, label and spoken text. (S · confirmed)
- AIEC-UX-0008 [UNDO10] Every action shows a 10-second Undo bar before sending. Container unlock, payment confirmation and SOS are exempt and act at once. (S · confirmed)
- AIEC-UX-0009 [SOUNDS] Distinct premium sounds and vibration patterns for success, waiting, error, money received, SOS. SOS never depends on a premium sound. Haptics work in native app; not rel… (S · confirmed)
- AIEC-UX-0010 [LANG3] All pages, voice lines, PDFs, WhatsApp templates (approved per language) and SOP videos exist in Marathi, Hindi and English with a language toggle on the top bar and in S… (S · confirmed L)
- AIEC-VIS-0002 [THEMES] Settings switch among Light glass (iOS-2026 style white), Colour glass, and Outdoor high-contrast; icons, progress bars and cards follow the theme. (S · confirmed)
- AIEC-UX-0011 [SCALE] Scale slider 20%-130% in Settings. Field screens keep the 30% button height and minimum touch sizes even at low scale; critical controls are never shrunk below usable siz… (S · conflicting D)
- AIEC-VIS-0003 [ADAPTIVE] All screens adapt to screen size, mobile-first, minimum width 360 CSS px, low-end Android. (S · confirmed)
- AIEC-UX-0013 [FIVE_TABS] Every role has the same five tabs: Today, Map, Chat, Money, Me. Admin and Owner add Analytics. (S · confirmed)
- AIEC-UX-0014 [A11Y] Design target WCAG 2.2 AA: contrast, targets at least 24x24 CSS px (AA) with 48 dp field target, labels for screen readers, keyboard focus on web, non-colour status, acce… (P · proposed)
- AIEC-DATA-0005 [APPEND_ONLY] Evidence, approvals, payments and ledger lines are append-only. Corrections are new linked entries. (S · confirmed)
- AIEC-DATA-0010 [OFFLINE_QUEUE] Offline writes are queued, signed, sent later. Server records phone time and arrival time and flags gaps over 6 hours for Admin review. (S · confirmed)
- AIEC-SEC-0007 [MASK_CONTACT] Customer and worker phone numbers are masked. Rider sees only masked number after capture. Builder-worker communication only through in-app chat and masked calls recorded… (S · confirmed LE)
- AIEC-SEC-0014 [CAMERA_ONLY] All proof captured in the in-app camera; multi-shot (2-5 photos or 10-second video) with ghost outline; no gallery or file-manager upload for proof-required tasks. (S · confirmed)
- AIEC-DATA-0014 [EVID_STAMP] Each file is burned-in stamped with GPS coordinates, small map, address, date/time, user name, role, device, project ID; permanent capture ID created before upload; origi… (S · confirmed)
- AIEC-SEC-0015 [EVID_CHECKS] Per-file checks: geofence with drift tolerance, mock-location/root signals, screen-photo and reuse detection, face match at start and random, AI step check, human review.… (S · confirmed)
- AIEC-REQ-0063 [AI_HUMAN] AI assists; humans judge where life is at risk. Random 10% of non-critical steps get human review; first 30 jobs get full human review. (P · proposed D)
- AIEC-REQ-0064 [AI_FAIRNESS] AI rejection shows a picture reason and allows one-tap human review; a wrongly rejected worker is never penalised or loses pay. (S · confirmed)
- AIEC-REQ-0065 [OFFLINE_SYNC] Encrypted offline queue with secure key storage, resumable upload, retry with backoff, checksums, deduplication; sync also on foreground, network return and End day; visi… (S · confirmed)
- AIEC-SEC-0016 [EVID_ACCESS] Evidence viewing restricted by role and access to sensitive images logged. (S · confirmed)
- AIEC-REQ-0066 [VIDEO10] 10-second verification videos (e.g. plumb-line alignment) with burned-in timestamp and GPS. (S · confirmed)
- AIEC-REQ-0096 [CHAT] Chat tab for every role: one thread per project plus stage threads; voice notes; questions, decisions, approvals, evidence, payment events, stage changes and system remin… (S · confirmed)
- AIEC-REQ-0097 [NOTIFY_OUTBOX] Durable notification outbox with retry and delivery receipts; push is not guaranteed so approved SMS/email/WhatsApp fallback for important events; quiet hours for non-eme… (S · confirmed E)
- AIEC-REQ-0101 [PWA_NATIVE] Native Android app for Rider, Technician, QC (camera, GPS, offline, background reliability); web/PWA for Customer, Supplier, NBFC, Admin, Owner, demo; iPhone shows instal… (S · awaiting approval D)
- AIEC-REQ-0102 [STACK] Suggested stack: Flutter (V3) or React Native/Expo (master brief) for field app, Next.js web, Postgres with row-level security (e.g. Supabase) with PostGIS, payment aggre… (S · awaiting approval DE)
- AIEC-REQ-0103 [PUSH_FALLBACK] Time-critical approvals reach iPhone users via SMS or WhatsApp link as fallback because web push there needs installation. (S · confirmed E)
- AIEC-REQ-0104 [USABILITY_TEST] Each field task is tested unaided by five target users including low-literacy users; at least 4 of 5 complete each without help and with no safety misunderstanding; test … (S · confirmed)
- AIEC-REQ-0111 [PERF_TARGETS] Performance and reliability targets (proposed, to be confirmed on pilot hardware): usable on 3G-class networks with offline-first capture, no blocking spinner over 2 seco… (P · proposed D)
- AIEC-VIS-0004 [VISUAL_SYSTEM] Unified design system: tokens (colour, type, spacing, radius, elevation, motion), components (buttons, forms, cards, lists, tables, bottom sheets, toasts, banners, dialog… (P · proposed)

## Tests (81) — `python3 scripts/spec.py test N`
- API: 1, 2, 4, 69, 85, 98, 120, 180, 198, 218, 240, 243
- E2E: 3, 5, 6, 8, 12, 65, 66, 109, 111, 114, 116, 119, 160, 196, 241, 244, 245, 246, 250, 251, 252, 256, 259, 260, 263
- Device: 7, 62, 67, 91, 94, 110, 115, 117, 141, 176, 182, 247, 248, 257, 262
- Integration: 9, 63, 64, 68, 86, 87, 101, 140, 153, 158, 161, 166, 191, 242, 249, 253, 261
- Visual: 90, 92, 93, 118, 157, 159, 255
- Field: 100
- Review: 113, 167, 258
- Security: 152

## Decisions to check (tier 1) — `python3 scripts/spec.py dec N`
- AIEC-DEC-012: default → Native Android for field roles, web for others; framework chosen by the builder before Phase 1
- AIEC-DEC-014: default → Phases in section 39; Pune pilot
- AIEC-DEC-005: default → The app stores the licence holder per project; a job cannot reach the permit stage without one named
- AIEC-DEC-016: default → Live contractor onboarding stays off until a legal review is recorded; demo mode works
- AIEC-DEC-017: default → Ledger only (no wallet)
- AIEC-DEC-027: default → Approval features cannot go live until two named approvers and a backup exist
- AIEC-DEC-031: default → Authority names and forms are configuration, nothing is hardcoded
