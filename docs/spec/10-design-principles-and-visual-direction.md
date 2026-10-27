## 10. Design principles and visual direction

1. **Field first, premium where it counts.** Field roles (Rider, Technician, QC, Supplier) get a practical, high-contrast, large-control interface. Customer, Admin and Owner screens may carry more text and tables, with an optional dark Owner Command Center — not dark graphite-and-gold everywhere (MP§7.2).
2. **One screen, one job; one obvious next action** (SCREEN_GRAMMAR, NEXT_CARD).
3. **Picture, voice, tap.** Photo of the real object plus a word; the screen speaks in the chosen language.
4. **Honest status.** Colour + icon + label + spoken line; locked steps explain why; offline state always visible; never show invented live data.
5. **Trust cues.** Show who is waiting, what you earn, who approved, with a timeline link; money as digits plus a coin-stack picture.
6. **Low cognitive load.** ≤3 choices on field screens; progressive disclosure for advanced options; smart defaults; draft saving; duplicate prevention.

**Visual patterns adopted** (patterns only; no proprietary layout copied; designer to validate):

| Pattern | Where | Benefit |
|---|---|---|
| Single-action task queue | Today (all roles), Admin exceptions | Removes choice overload; supports "one next action" |
| Bottom navigation with 5 fixed tabs | All roles | Same grammar across roles; one-handed reach |
| Bottom sheets for details | Map pin, site card, approval | Keeps map visible; tap target close to thumb |
| Evidence timeline | Project file, chat, safety log | One truth with who/what/when/where/proof |
| Stepper / pizza tracker | Customer progress, installation | Progress without reading |
| Approval inbox with diff and reason | Admin, Owner | Fast, auditable decisions |
| Ledger table with bucket chips | Technician money, Admin ledger | Readable financial state; earned/paid/outstanding/disputed separated |
| Camera with ghost outline and counter | Evidence camera | Correct angles, fewer retakes |
| Skeleton loaders and offline banners | All | Honest loading on weak networks |

*Reference sources:* Android accessibility guidance (48 dp targets) was retrieved (R-18); the Material Design 3 site (m3.material.io) was **not** retrieved (R-16); the patterns above are common practice and must be checked against those documents by the designer.
