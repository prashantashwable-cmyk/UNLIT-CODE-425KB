## 31. Offline operation and synchronisation

**PWA vs native (R-12 and BP):**

| Capability | PWA | Native Android |
|---|---|---|
| Camera + in-app-only capture | Possible via browser camera, harder to block gallery/enforce stamp | Full control |
| Continuous background GPS | Not reliable; OS may suspend | Foreground service with visible notification (still killable; show limited state) |
| Offline storage & queue | IndexedDB, quota/eviction risk | SQLite/encrypted store |
| Background sync | Best-effort, browser-dependent | WorkManager-style jobs, still best-effort |
| Push | Android OK; iPhone needs installation | FCM |
| Device integrity signals | Limited | Better |
| **Recommendation** | Customer, Supplier, NBFC, Admin, Owner, demo | Rider, Technician, QC (PROPOSED; DEC-012) |

**Queue design:** every record has a client-generated UUID (capture_id), phone time, last GPS + accuracy, payload hash, and encrypted body; states `captured → queued → uploading → server_received → checked → accepted/rejected`.

**Sync triggers:** app foreground, network return, End day, manual Retry.

**Conflict rules:**

| Case | Rule |
|---|---|
| Duplicate upload | Dedupe by capture_id/hash; no second record |
| Two edits to same editable field | Last server-accepted wins for non-safety fields; both versions stored; flagged if safety-related |
| Offline approval vs server-state change | Approval rejected with reason; user told; evidence retained |
| Clock gap >6 h | Admin review flag (OFFLINE_QUEUE) |
| Stage moved while offline | Evidence attaches to its original stage; new stage may require re-check |
| Never | Silently discard evidence or financial events |
