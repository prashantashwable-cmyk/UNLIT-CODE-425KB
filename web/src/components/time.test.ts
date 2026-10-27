import { afterEach, describe, expect, it } from 'vitest';
import { formatTime, setDisplayOffset } from './ui';

afterEach(() => setDisplayOffset(330));

describe('displayed times follow the pilot time-zone setting (invariant 8)', () => {
  it('shows IST by default and moves with the setting', () => {
    const iso = '2026-10-27T04:10:00.000Z';
    expect(formatTime(iso, 'en')).toMatch(/09:40/);                 // 04:10 UTC = 09:40 IST
    setDisplayOffset(0);
    expect(formatTime(iso, 'en')).toMatch(/04:10/);
    setDisplayOffset(-210);
    expect(formatTime(iso, 'en')).toMatch(/12:40\s*am/i);           // 04:10 - 3:30 = 00:40, shown as 12:40 am
  });
});
