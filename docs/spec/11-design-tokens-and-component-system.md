## 11. Design tokens and component system

**Brand identity:** no logo, brand colours or typefaces were supplied in the sources. The palette below is a **PROPOSED** starting point; logo placement is top-left of the splash screen and the top bar (24 dp height, never overlapping the voice/language controls). OWNER DECISION REQUIRED to supply brand assets.

### 11.1 Colour tokens (PROPOSED; contrast computed by script, WCAG relative-luminance formula)

```
color.light.bg=#F4F7FB  color.light.surface=#FFFFFF  color.light.text=#10202F  color.light.text2=#44546A
color.light.primary=#0B5CAD  color.light.onPrimary=#FFFFFF  color.light.success=#1B7A3A  color.light.warnBg=#FFE9A8  color.light.warnText=#4A3200
color.light.danger=#B3261E  color.light.info=#0B5CAD  color.light.border=#6B7A8D
color.colour.secondary=#5B3E9B  color.colour.accent=#B93A0A
color.outdoor.bg=#FFFFFF  color.outdoor.text=#000000  color.outdoor.primary=#003F7F  color.outdoor.success=#006B2D
color.outdoor.warnBg=#FFD23F  color.outdoor.danger=#A00000  color.outdoor.border=#000000 (2 px)
color.dark.bg=#0F1720  color.dark.surface=#18232F  color.dark.text=#E8EDF3  color.dark.text2=#AEBBCB  color.dark.accent=#E3B94F
color.dark.success=#4CC27A  color.dark.danger=#FF8A80
```

Semantic meaning is fixed across themes (SOURCE rule): **green = do/done, yellow = waiting, red = stopped/needs help, blue = information.** Light and Colour glass use translucency only on non-critical cards; critical status chips are opaque. **Outdoor high-contrast** is the default for Rider, Technician, QC. The **dark** variant is optional and Owner-only.

| Theme | Pair | Foreground | Background | Ratio | Required | Result |
|---|---|---|---|---:|---:|---|
| Light glass | Body text on background | `#10202F` | `#F4F7FB` | 15.39:1 | 4.5:1 | PASS |
| Light glass | Body text on surface | `#10202F` | `#FFFFFF` | 16.54:1 | 4.5:1 | PASS |
| Light glass | Secondary text on surface | `#44546A` | `#FFFFFF` | 7.71:1 | 4.5:1 | PASS |
| Light glass | Primary button label | `#FFFFFF` | `#0B5CAD` | 6.67:1 | 4.5:1 | PASS |
| Light glass | Success (done) label on white | `#1B7A3A` | `#FFFFFF` | 5.40:1 | 4.5:1 | PASS |
| Light glass | Waiting chip text on yellow | `#4A3200` | `#FFE9A8` | 10.00:1 | 4.5:1 | PASS |
| Light glass | Danger text on white | `#B3261E` | `#FFFFFF` | 6.54:1 | 4.5:1 | PASS |
| Light glass | Input border on surface (UI 3:1) | `#6B7A8D` | `#FFFFFF` | 4.38:1 | 3.0:1 | PASS |
| Light glass | Focus ring on surface (UI 3:1) | `#0B5CAD` | `#FFFFFF` | 6.67:1 | 3.0:1 | PASS |
| Colour glass | Label on secondary | `#FFFFFF` | `#5B3E9B` | 8.05:1 | 4.5:1 | PASS |
| Colour glass | Label on accent | `#FFFFFF` | `#B93A0A` | 5.72:1 | 4.5:1 | PASS |
| Outdoor high-contrast | Body text | `#000000` | `#FFFFFF` | 21.00:1 | 4.5:1 | PASS |
| Outdoor high-contrast | Primary button label | `#FFFFFF` | `#003F7F` | 10.41:1 | 4.5:1 | PASS |
| Outdoor high-contrast | Success label | `#FFFFFF` | `#006B2D` | 6.69:1 | 4.5:1 | PASS |
| Outdoor high-contrast | Danger label | `#FFFFFF` | `#A00000` | 8.42:1 | 4.5:1 | PASS |
| Outdoor high-contrast | Waiting chip text on yellow | `#000000` | `#FFD23F` | 14.54:1 | 4.5:1 | PASS |
| Owner dark | Body text | `#E8EDF3` | `#0F1720` | 15.33:1 | 4.5:1 | PASS |
| Owner dark | Secondary text | `#AEBBCB` | `#18232F` | 8.16:1 | 4.5:1 | PASS |
| Owner dark | Accent gold on surface | `#E3B94F` | `#18232F` | 8.57:1 | 4.5:1 | PASS |
| Owner dark | Success on surface | `#4CC27A` | `#18232F` | 7.05:1 | 4.5:1 | PASS |
| Owner dark | Danger on surface | `#FF8A80` | `#18232F` | 6.97:1 | 4.5:1 | PASS |

All 21 listed pairs: 21 pass. Glass blur/transparency must be tested over real backgrounds in sunlight; if a background reduces contrast, the opaque fallback is used.

### 11.2 Typography, spacing, shape, motion

| Token | Value |
|---|---|
| Font (PROPOSED, licence to confirm) | Noto Sans (English), Noto Sans Devanagari (Marathi/Hindi), bundled offline; system fallback stack |
| Scale (sp) | Display 28/36 · H1 24/32 · H2 20/28 · Body 16/24 · Label 14/20 · Caption 12/16 (never for critical info) · Money figure 32/40 |
| Devanagari | line-height ×1.5 minimum; no letter-spacing; test conjuncts, matras, numerals |
| Spacing (dp) | 4 · 8 · 12 · 16 · 24 · 32 · 48 |
| Grid | 4-column at 360 dp, 8-column at 600 dp, 12-column at 840 dp; 16 dp gutters |
| Radius | 8 (inputs) · 12 (chips) · 16 (cards) · 24 (sheets) · pill (buttons optional) |
| Elevation | 0 · 1 · 2 · 4 dp; outdoor theme uses borders instead of shadows |
| Touch targets | Field ≥48×48 dp, primary 56 dp; office ≥44 dp; never below WCAG 2.5.8 24 px |
| Icons | 24 dp outlined, 2 px stroke, filled variant for active tab; every icon has a text label |
| Illustration | Flat real-object photos for SOPs; line illustrations for empty states; no stock-photo faces |
| Data visualisation | ≤5 series, direct labels, patterns plus colour, table alternative |
| Motion | 120 ms (feedback), 200 ms (transition), 300 ms (sheet); ease-out; reduced motion → fade/no movement; no auto-playing animation on field screens |

### 11.3 Token naming convention
`{category}.{theme|role}.{name}` e.g. `space.4`, `radius.card`, `type.body`, `motion.fast`; theme tokens resolve at runtime; the scale slider multiplies `type.*` and non-critical `space.*` only, and clamps `target.min` and `button.primary.height`.

### 11.4 Component rules (summary)

| Component | Rule |
|---|---|
| Primary button | Full width, min height 56 dp (field) / 48 dp (office), 30% screen height on single-action field screens, icon + label, filled primary colour |
| Secondary / tertiary | Outline / text; never beside two other primaries |
| Form field | Visible label above, helper text, inline error with fix instruction; number pad for numbers; no hidden placeholder-only labels |
| Card | 16 dp radius, 16 dp padding, one primary action, status chip (icon + text) |
| List row | Min 56 dp; leading icon, title, status, trailing chevron; whole row tappable |
| Table | Scroll inside own container; sticky first column; card-list alternative below 480 px |
| Bottom sheet | Drag handle **plus** a visible Close button (WCAG 2.5.7 alternative to dragging) |
| Toast / banner | Toast ≤4 s non-critical; banners persist for offline, blocked, permission denied |
| Dialog | Only for irreversible or safety actions; max two buttons |
| Empty state | Illustration, one sentence, one action |
| Skeleton | Matches final layout; ≥2 s of waiting shows progress text |
| Offline indicator | Top banner (amber) with queue count and Retry |
| States | Success (green + check), waiting (yellow + clock), blocked (red + padlock + reason), info (blue + i) |
| Focus | 3 px outline, 3:1 contrast, never hidden under sticky bars |

### 11.5 ASCII wireframes (illustrative)

**Next-step card (all roles)**
```
┌─────────────────────────────┐
│ ≡ AIEC        [मराठी] [🔊]  │
├─────────────────────────────┤
│ NEXT STEP                   │
│ ▶ Capture shaft photo       │
│ Waiting: Sales  Earn: ₹xx   │
│ ┌─────────────────────────┐ │
│ │      📷  START          │ │  ← ≥30% height
│ └─────────────────────────┘ │
│ [Help]            [SOS]     │
├─────────────────────────────┤
│ Today Map Chat Money Me     │
└─────────────────────────────┘
```

**Safety gate (Technician)**
```
┌─────────────────────────────┐
│ Safety check  1 / 3         │
│ [photo of scaffolding]      │
│ ┌───────────┐ ┌───────────┐ │
│ │ 🎥 RECORD │ │ 📷 PHOTO  │ │
│ └───────────┘ └───────────┘ │
│ 🔒 Work locked until the    │
│ competent person certifies  │
│ [Help]            [SOS]     │
└─────────────────────────────┘
```

**Admin exceptions queue**
```
┌─────────────────────────────┐
│ Exceptions (7)  ● Red 2     │
│ ▌RED  Safety incident Site 4│
│ ▌RED  Payment mismatch P-19 │
│ ▌YEL  Approval: unlock #3   │
│ [Open]  owner: A.K. due 14:00│
└─────────────────────────────┘
```
