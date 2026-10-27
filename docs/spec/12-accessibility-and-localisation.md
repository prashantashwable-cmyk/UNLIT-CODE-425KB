## 12. Accessibility and localisation

| Requirement | Specification | Test |
|---|---|---|
| WCAG 2.2 AA design target (R-13) | Contrast ≥4.5:1 text, ≥3:1 large text/icons/focus; targets ≥24×24 CSS px minimum, 48 dp for field controls | T-090, T-091 |
| Touch targets under scale | Slider 20–130% retained for non-critical content; critical controls and primary buttons clamp to ≥48 dp and 30% height rule (DEC-024) | T-091 |
| Text resize | Respect OS font scale up to 200% on office screens; field screens reflow, never clip | T-092 |
| Screen readers | Every control has a label in the active language; status chips announced as "state, reason" | T-090 |
| Keyboard/focus (web) | Logical order, visible focus, no keyboard trap, focus not obscured by sticky headers (2.4.11) | T-093 |
| Not colour alone | Icon + text + voice on every state | T-090 |
| Errors | Say what happened and the next action, in the active language; link error to field | T-097 |
| Motion | Honour reduced-motion; no motion needed to understand state | T-090 |
| Authentication | OTP + face/PIN; no puzzle or memory test (3.3.8); alternative human recovery | T-008 |
| Marathi/Hindi | Bundle Noto Sans Devanagari (PROPOSED; licence to be confirmed) so offline text renders; line-height ≥1.5; test conjuncts and numerals; voice lines human-reviewed | T-092 |
| Charts | Every chart has a data table alternative and text summary | T-083 |
| Known exceptions | Camera viewfinder and map canvas cannot be fully screen-reader-accessible; alternative: captions, list view of pins, voice guidance | recorded |
