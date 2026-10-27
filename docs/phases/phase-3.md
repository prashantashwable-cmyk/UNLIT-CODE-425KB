# Phase 3 context pack (generated; mapping PROPOSED)

Workflows: WF-02, WF-03

Read first: `python3 scripts/spec.py sec 16.2` (stage rules). Screens are read one at a time, never whole modules:
- `15.1` (modules/15.01-rider.md): preamble `spec.py sec 15.1`; screens SCR-021, SCR-022, SCR-023, SCR-024, SCR-025, SCR-026, SCR-028 via `spec.py sec SCR-nnn`
- `15.2` (modules/15.02-technician.md): preamble `spec.py sec 15.2`; screens SCR-051 via `spec.py sec SCR-nnn`
- `15.5` (modules/15.05-admin-owner.md): preamble `spec.py sec 15.5`; screens SCR-075 via `spec.py sec SCR-nnn`
- `15.8` (modules/15.08-coordinator.md): preamble `spec.py sec 15.8`; screens SCR-068 via `spec.py sec SCR-nnn`

## Requirements (17)
- AIEC-SAFE-0001 [BG_TRACK] On-duty tracking uses a native Android foreground service with a visible on-duty notification. The app must NOT claim it cannot be killed: it shows a paused/limited-track… (S · conflicting DE)
- AIEC-UX-0004 [ZERO_TYPE] Field roles need zero typing: camera, tap, number pad, voice note. Names/addresses come from GPS, OCR or the Coordinator. (S · confirmed)
- AIEC-DATA-0002 [SINGLE_RECORD] One Project record per Lift, created at lead capture and living until the last AMC visit. Every screen is a filtered view of it. Quote, agreement, payments, permit, conta… (S · confirmed)
- AIEC-DATA-0003 [SITE_LIFT] Site (building/society/tower cluster) holds geofence (about 50 m) and photos and one or more Lifts. Multi-tower orders: each Lift has its own Project, quote, status, lice… (S · confirmed)
- AIEC-REQ-0003 [LEAD_CAPTURE] Rider captures at least 3 in-app photos (site, shaft, site board) with GPS stamp, contact number, auto address, ward/area. Lead is created as a Project file the same day. (S · confirmed)
- AIEC-REQ-0004 [RIDER_ROUTINE] Rider with sports-bike icon: Start day (selfie face check, route tracking), ride, capture, End day summary (leads, km, area, earnings, rank, tomorrow's suggested area). (S · confirmed)
- AIEC-SAFE-0003 [STOP_CAPTURE] Camera for lead capture opens only when speed is near zero (GPS-error tolerance) and shows 'Stop safely to capture'. Voice command 'Naya lead' available. Hands-free where… (S · confirmed)
- AIEC-REQ-0005 [OCR_NUMBER] OCR reads phone number from site-board photo and proposes it; the rider confirms by voice or keypad. Number is then masked. (S · confirmed)
- AIEC-REQ-0006 [AUTO_ADDRESS] Site address auto-detected from GPS (reverse geocoding provider to be selected). (S · confirmed E)
- AIEC-REQ-0007 [RIDER_MAP] Rider map layers: today's path, all lead pins with photos, covered area (shaded), suggested areas, other riders' covered zones without their pins. Tap a pin for site deta… (S · confirmed)
- AIEC-REQ-0008 [SUGGEST_AREAS] Suggested areas from lawful public project data, verified conversion history and lead density. App never implies public registry coverage is complete. (P · proposed)
- AIEC-REQ-0010 [DUP_LEAD] A capture inside an existing site geofence becomes an update on the original Project (never forks). Attribution window 60 days (proposed). New rider gets 10% of the main … (S · conflicting D)
- AIEC-REQ-0011 [GPS_DRIFT] If GPS drifts (e.g. basement tolerance 100 m, last good fix accepted) the capture goes to one-tap human review rather than automatic rejection. (S · confirmed)
- AIEC-REQ-0012 [LEAD_CONSENT] Rider asks an authorised site contact, with the business name stated, whether AIEC may WhatsApp a free quote; the yes is recorded. Consent is stored per channel (WhatsApp… (S · confirmed L)
- AIEC-UX-0015 [LEAD_STATUS_VIEW] Rider sees lead status: captured, verified, contacted, quoted, won (token paid), installed. (S · confirmed)
- AIEC-SAFE-0004 [RIDER_COVER] Rider accident/insurance cover is set up at onboarding. Location stored only during declared on-duty periods; tracking pause alert shown. (S · confirmed DL)
- AIEC-REQ-0014 [LEAD_VERIFY] Stage 2 verification: not a duplicate (or attached as update), photos pass AI check (real shaft, not screen photo), inside geofence or sent to manual review. Time limit 2… (S · confirmed)

## Tests (27) — `python3 scripts/spec.py test N`
- Device: 7, 10, 176, 178, 182, 184
- Integration: 9, 14, 127, 242
- E2E: 11, 12, 16, 123, 125, 174, 175, 177
- API: 13, 15, 120, 126, 168, 179, 210
- Review: 112, 124

## Decisions to check (tier 3) — `python3 scripts/spec.py dec N`
- AIEC-DEC-007: default → 60 days and 10% of the main commission, only if the update adds something new
- AIEC-DEC-009: default → 5% on the full-cost baseline
- AIEC-DEC-015: default → NOC cannot be issued or used as a lever until defined
- AIEC-DEC-024: default → Slider kept; critical controls clamped
- AIEC-DEC-025: default → Permission-based only
- AIEC-DEC-026: default → Chat first; no recording until provider, notice and retention are approved
- AIEC-DEC-028: default → Earnings screen shows Amount not set yet
- AIEC-DEC-029: default → Job offers cannot show a rate until set
- AIEC-DEC-032: default → Kept separate
