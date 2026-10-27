## 34. Failure states and recovery

| Failure | Normal behaviour | What the user can do | Never |
|---|---|---|---|
| No network | Save to encrypted queue; banner | Continue, Retry sync | Discard |
| GPS unavailable | Use last good fix within tolerance; else manual review | Ask Coordinator | Auto-reject without review |
| Camera permission denied | Explain, deep link to settings | Request assisted help | Allow gallery upload |
| Location permission denied | No on-duty tracking; Rider cannot start day | Fix permission, call Coordinator | Hidden tracking |
| Invalid/duplicate lead | Attach update or cancel | Manual review | Fork project |
| Expired/invalid quote | Re-quote from current rate card | Request update | Honour below-floor price |
| Payment pending/failed | Gate stays closed | Retry, change method, Help | Treat success page as paid |
| Duplicate callback | Dedupe | — | Double credit |
| Supplier delay | Exception to Admin | Escalate/replace | Silent slip |
| Material mismatch | Claim with photo vs BOM | Continue safe sub-stages | Block emergency human decision |
| Missing evidence | Gate blocked with reason | Retake, ask human review | Tick-only completion |
| Failed QC | Defect → rework → reinspection | Appeal evidence | Penalise AI false reject |
| Missing approval / absent approver | Backup approver | Delegate | Self-approve |
| Expired certificate/contract | Block dependent actions; alert | Renew | Proceed |
| Sync conflict / concurrent edit | Keep both, flag | Review | Overwrite silently |
| Invalid role / unauthorised action | 403 + audit | Request role | Show hidden data |
| Provider outage | Queue, fallback channel, human task | Retry later | Duplicate sends |
| Notification delivery failure | Fallback channel | Open app | Lose critical alert |
| Worker cancellation | Replacement offered; earnings by verified work | Coordinator | Cash penalty |
| Customer dispute | Disputed state; confirmed worker pay continues | Mediation | Freeze all pay |
| Emergency escalation failure | Re-route to backup, call fallback | Call 112 | Rely on chatbot |
