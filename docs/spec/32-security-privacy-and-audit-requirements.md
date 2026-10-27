## 32. Security, privacy and audit requirements

| Area | Requirement | Test |
|---|---|---|
| Baseline | OWASP ASVS 5.0.0 (web/API) and MASVS/MASTG (mobile, source BP), OWASP API Security Top 10 2023 (R-19) with tests for object-, property- and function-level authorisation; OWASP web Top 10 not re-fetched (R-16) | T-095, T-170, T-171 |
| AuthN | OTP rate limits, session expiry, device binding, suspicious-login alerts, lost-phone revocation | T-008, T-095 |
| AuthZ | RLS on every table; object-level checks (project assignment); admin actions need role + step-up | T-001, T-002 |
| Files | Pre-registered IDs, MIME/size checks, private storage, signed short-lived URLs, malware scan | T-063 |
| API abuse | Rate limits, idempotency, request size limits | T-095 |
| Audit | Append-only; reads of sensitive data logged; alerts on privilege change/export | T-069 |
| Secrets | Not in bundles/logs/screenshots/backups; separate dev/staging/demo/prod | review |
| Privacy | Notices in 3 languages; purpose-specific consent; withdrawal; data-subject requests; breach procedure; DPDP core duties from 13 May 2027 (R-07) | T-009, T-096 |
| Sensitive data | Precise location, face images, phone numbers, bank/KYC, recordings, CCTV, rescue incidents: minimise, restrict, retain by schedule | review |
| Backup/DR | Encrypted backups, restore drills before go-live, RPO/RTO set by owner | section 38 |
| Incident response | Documented, rehearsed, breach notification path | review |
| Supply chain | Dependency scanning; check licence/maintenance/CVEs of offline-sync libraries (e.g. WatermelonDB named in BP) before adoption | review |
