## 33. Notifications and messaging

| Event class | Channels (order) | Quiet hours |
|---|---|---|
| SOS / entrapment | Native push + SMS + call route | Bypass |
| Approvals needed (unlock key) | Push → SMS/WhatsApp link | Bypass during delivery window |
| Payment/gate changes | Push → WhatsApp/SMS | Defer non-critical |
| Reminders (readiness, follow-up) | Push → SMS | Defer |
| Marketing outreach | WhatsApp templates only with opt-in | Defer; stop on opt-out |
| Owner weekly summary | WhatsApp/email | Defer |

Each notification is an outbox row with priority, template/language, dedupe key, attempts, receipts. Sound/vibration patterns per meaning (SOUNDS). Failure of a channel triggers fallback and, for critical items, a human task.
