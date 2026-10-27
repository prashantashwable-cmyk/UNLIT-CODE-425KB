import { describe, expect, it } from 'vitest';
import { contrastRatio, controlSize, scaleFactor, themeColors, THEMES } from './theme';

describe('themes from design tokens', () => {
  it.each(THEMES)('%s theme defines every colour role', (name) => {
    const c = themeColors(name);
    for (const key of ['bg', 'surface', 'text', 'text2', 'primary', 'onPrimary', 'success', 'warnBg', 'warnText', 'danger', 'border']) {
      expect(c[key as keyof typeof c], `${name}.${key}`).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  // WCAG 2.2 AA: body text 4.5:1 (spec §12). Checked for every theme, not just the light one.
  it.each(THEMES)('%s theme text pairs meet 4.5:1', (name) => {
    const c = themeColors(name);
    const pairs: [string, string, string][] = [
      ['text on bg', c.text, c.bg],
      ['text on surface', c.text, c.surface],
      ['text2 on surface', c.text2, c.surface],
      ['onPrimary on primary', c.onPrimary, c.primary],
      ['warnText on warnBg', c.warnText, c.warnBg],
      ['danger on surface', c.danger, c.surface],
      ['success on surface', c.success, c.surface],
    ];
    for (const [label, fg, bg] of pairs) {
      expect(contrastRatio(fg, bg), `${name}: ${label}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('outdoor theme uses thicker borders', () => {
    expect(themeColors('outdoor').borderWidthPx).toBe(2);
    expect(themeColors('light').borderWidthPx).toBe(1);
  });
});

describe('scale slider (DEC-024 default: 20-130%, critical controls clamped)', () => {
  it('clamps the slider to 20..130%', () => {
    expect(scaleFactor(5)).toBe(0.2);
    expect(scaleFactor(200)).toBe(1.3);
    expect(scaleFactor(100)).toBe(1);
  });
  it('never shrinks a critical control below its minimum target', () => {
    expect(controlSize(56, 20, 'field')).toBe(48);
    expect(controlSize(48, 20, 'office')).toBe(44);
    expect(controlSize(48, 130, 'office')).toBeCloseTo(62.4);
  });
});
