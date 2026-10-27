## 30. API and integration contracts

**Conventions (PROPOSED):**

| Topic | Rule |
|---|---|
| Auth | OTP → short-lived JWT + refresh; device-bound sessions; step-up face/PIN for money and unlock |
| Authorisation | Database RLS plus server checks for stage, assignment, proof; **service-role key server-only** (R-14) |
| Validation | Server-side schema validation; all quantities/amounts as integers in paise |
| Errors | `{ "error": { "code": "STAGE_GATE_BLOCKED", "message_key": "...", "details": {...}, "retryable": false, "correlation_id": "..." } }` with localisable `message_key` |
| Pagination | Cursor-based `?limit=&cursor=` |
| Rate limiting | Per-user/IP limits on OTP, quote, OCR, unlock, payout (initial values to be tuned in test; none invented here) |
| Idempotency | `Idempotency-Key` header required on POST that creates money, tasks, orders, commissions; stored with response |
| Transactions | Stage change + tasks + event + outbox rows in one transaction; external calls only via outbox worker |
| Events | Transactional outbox; consumers idempotent |
| Webhooks | Signature verified; payload stored raw; dedupe by provider event id; return 2xx only after durable write |
| Uploads | Pre-registered capture_id; resumable upload; checksum verify; antivirus/type check; no public bucket |
| Migrations | Forward-only, reviewed, tested on staging copy; rollback plan |
| Versioning | `/v1` URL prefix; breaking changes → new version |

**Integration table (nothing assumed selected or connected):**

| Capability | Candidate | Status |
|---|---|---|
| Payments/split/hold | Razorpay Route (R-10) or other | EXTERNAL INTEGRATION REQUIRED; escrow status unconfirmed |
| Payouts to contractors | Authorised payout API | EXTERNAL INTEGRATION REQUIRED; availability UNVERIFIED |
| WhatsApp | Approved business provider (R-11) | EXTERNAL INTEGRATION REQUIRED |
| SMS/voice/masked calling | Provider TBD | UNVERIFIED (TRAI and recording rules) |
| e-stamp + Aadhaar eSign | Provider TBD (V3 cites Setu) | UNVERIFIED |
| NBFC | Partner TBD | EXTERNAL INTEGRATION REQUIRED |
| Container lock/GPS/CCTV | Vendor TBD | EXTERNAL INTEGRATION REQUIRED |
| Maps/geocoding | Provider TBD (V3 suggests Google Maps) | UNVERIFIED |
| Speech (Marathi/Hindi) | Provider TBD | UNVERIFIED quality |
| Push | FCM/APNs equivalent | UNVERIFIED |
| Hosting, logging, monitoring, backups | TBD | UNVERIFIED |
