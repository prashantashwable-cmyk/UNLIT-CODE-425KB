import { describe, expect, it } from 'vitest';
import { allKeys, LANGS, translate } from './i18n';
import { webStrings } from './webStrings';
import { STAGES } from '../data/stages';

describe('i18n', () => {
  it('Marathi is the first language', () => {
    expect(LANGS[0]).toBe('mr');
  });

  it('every web string has text in all three languages', () => {
    for (const [key, e] of Object.entries(webStrings)) {
      for (const l of LANGS) expect(e[l]?.trim(), `${key}.${l}`).toBeTruthy();
    }
  });

  it('includes the spec draft strings', () => {
    expect(translate('shared.help', 'mr')).toBe('मदत');
    expect(translate('admin.all_clear', 'en')).toBe('All clear. Nothing needs you');
  });

  it('a missing key is visible, not blank', () => {
    expect(translate('no.such.key', 'mr')).toBe('⟦no.such.key⟧');
  });

  it('fills placeholders', () => {
    expect(translate('project.stage_of', 'en', { n: 7 })).toBe('Stage 7 of 16');
  });

  it('every stage has a name in all three languages', () => {
    for (const s of STAGES) {
      for (const l of LANGS) expect(translate(`stage.${s}`, l)).not.toMatch(/^⟦/);
    }
  });

  it('has no duplicate keys between web strings and spec strings with different English', () => {
    expect(new Set(allKeys()).size).toBe(allKeys().length);
  });
});
