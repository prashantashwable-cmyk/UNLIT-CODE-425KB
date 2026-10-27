import tokens from '../../../docs/appendix/design-tokens.json';

export const THEMES = ['light', 'dark', 'outdoor'] as const;
export type ThemeName = (typeof THEMES)[number];

export interface ThemeColors {
  bg: string; surface: string; text: string; text2: string;
  primary: string; onPrimary: string; success: string;
  warnBg: string; warnText: string; danger: string; border: string;
  borderWidthPx: number;
}

const light = tokens.color.light;

// The token file gives full light colours and partial dark/outdoor sets. Missing roles are filled here with values
// chosen to keep WCAG AA contrast (checked in theme.test.ts); they are PROPOSED until the designer confirms them.
const darkFill = { primary: '#7CB8F5', onPrimary: '#0F1720', warnBg: '#4A3A0A', warnText: '#FFE9A8', border: '#8A99AB' };
const outdoorFill = { surface: '#FFFFFF', text2: '#1A1A1A' };

export function themeColors(name: ThemeName): ThemeColors {
  if (name === 'dark') {
    const d = tokens.color.dark;
    return { ...light, ...darkFill, bg: d.bg, surface: d.surface, text: d.text, text2: d.text2,
             success: d.success, danger: d.danger, borderWidthPx: 1 };
  }
  if (name === 'outdoor') {
    const o = tokens.color.outdoor;
    return { ...light, ...outdoorFill, bg: o.bg, text: o.text, primary: o.primary, onPrimary: o.onPrimary,
             success: o.success, warnBg: o.warnBg, warnText: o.warnText, danger: o.danger, border: o.border,
             borderWidthPx: o.borderWidthPx };
  }
  return { ...light, borderWidthPx: 1 };
}

/** CSS custom properties for a theme, applied on <html>. */
export function themeVars(name: ThemeName): Record<string, string> {
  const c = themeColors(name);
  const vars: Record<string, string> = { '--border-width': `${c.borderWidthPx}px` };
  for (const [k, v] of Object.entries(c)) if (typeof v === 'string') vars[`--c-${k}`] = v;
  tokens.space.forEach((s, i) => (vars[`--space-${i}`] = `${s}px`));
  for (const [k, v] of Object.entries(tokens.radius)) vars[`--radius-${k}`] = `${v}px`;
  vars['--motion-feedback'] = `${tokens.motionMs.feedback}ms`;
  vars['--motion-transition'] = `${tokens.motionMs.transition}ms`;
  return vars;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export function contrastRatio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const [SCALE_MIN, SCALE_MAX] = tokens.scale.sliderPercent;
export const SCALE_RANGE = { min: SCALE_MIN, max: SCALE_MAX } as const;

export function scaleFactor(percent: number): number {
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, percent)) / 100;
}

/** Critical controls keep their minimum target whatever the scale (tokens.scale.clamp). */
export function controlSize(basePx: number, percent: number, kind: 'field' | 'office'): number {
  const min = kind === 'field' ? tokens.target.fieldMinDp : tokens.target.officeMinDp;
  return Math.max(min, basePx * scaleFactor(percent));
}

export const typeScale = tokens.type.scaleSp;
export const fonts = { en: tokens.type.fontEn, devanagari: tokens.type.fontDevanagari };
export const devanagariLineHeightMin = tokens.type.devanagariLineHeightMin;
