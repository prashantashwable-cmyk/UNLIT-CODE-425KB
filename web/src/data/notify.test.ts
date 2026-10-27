import { describe, expect, it } from 'vitest';
import { deliver, inQuietHours, planDelivery, type Attempt } from './notify';

const quiet = { startHour: 21, endHour: 7, tzOffsetMinutes: 330 };   // IST
// 23:30 IST = 18:00 UTC; 12:00 IST = 06:30 UTC
const night = new Date('2026-10-27T18:00:00.000Z');
const noon = new Date('2026-10-27T06:30:00.000Z');

describe('quiet hours (NOTIFY_OUTBOX): times come from settings, local to the pilot', () => {
  it('wraps past midnight and respects the end hour', () => {
    expect(inQuietHours(night, quiet)).toBe(true);
    expect(inQuietHours(noon, quiet)).toBe(false);
    expect(inQuietHours(new Date('2026-10-27T01:29:00.000Z'), quiet)).toBe(true);   // 06:59 IST
    expect(inQuietHours(new Date('2026-10-27T01:30:00.000Z'), quiet)).toBe(false);  // 07:00 IST
  });

  it('a same-day window works, and start = end means no quiet hours', () => {
    const day = { startHour: 13, endHour: 15, tzOffsetMinutes: 330 };
    expect(inQuietHours(new Date('2026-10-27T08:00:00.000Z'), day)).toBe(true);     // 13:30 IST
    expect(inQuietHours(noon, day)).toBe(false);
    expect(inQuietHours(night, { ...quiet, endHour: 21 })).toBe(false);
  });
});

describe('delivery plan per event class (§33, AUT-031)', () => {
  it('T-087: an SOS during quiet hours is planned at once for push, SMS and the call route', () => {
    const p = planDelivery('sos', 'normal', night, quiet);
    expect(p).toMatchObject({ priority: 'critical', deferredUntil: null, channels: ['push', 'sms', 'call'] });
  });

  it('approvals bypass quiet hours; reminders and summaries wait until quiet hours end', () => {
    expect(planDelivery('approval', 'critical', night, quiet).deferredUntil).toBeNull();
    const r = planDelivery('reminder', 'normal', night, quiet);
    expect(r.deferredUntil).toBe('2026-10-28T01:30:00.000Z');          // 07:00 IST next morning
    expect(planDelivery('summary', 'normal', night, quiet).deferredUntil).not.toBeNull();
    expect(planDelivery('reminder', 'normal', noon, quiet).deferredUntil).toBeNull();
  });

  it('payment changes defer only when not critical', () => {
    expect(planDelivery('payment', 'normal', night, quiet).deferredUntil).not.toBeNull();
    expect(planDelivery('payment', 'critical', night, quiet).deferredUntil).toBeNull();
  });

  it('marketing goes only by WhatsApp template and only with opt-in', () => {
    expect(planDelivery('marketing', 'normal', noon, quiet, { marketingOptIn: false }).channels).toEqual([]);
    expect(planDelivery('marketing', 'normal', noon, quiet, { marketingOptIn: true }).channels).toEqual(['whatsapp']);
  });
});

describe('T-086: push fails, critical falls back, every attempt leaves a receipt', () => {
  const at = '2026-10-27T06:30:00.000Z';

  it('stops at the first channel that delivers, logging the failed ones', () => {
    const attempt: Attempt = (ch) => (ch === 'push' ? 'failed' : 'delivered');
    const out = deliver(planDelivery('approval', 'critical', noon, quiet), attempt, at);
    expect(out.receipts).toEqual([
      { channel: 'push', state: 'failed', at },
      { channel: 'sms', state: 'delivered', at },
    ]);
    expect(out.humanTask).toBe(false);
  });

  it('T-087/§33: an SOS goes out on every channel even when the first one works (push, SMS and the call route)', () => {
    const out = deliver(planDelivery('sos', 'critical', night, quiet), () => 'delivered', at);
    expect(out.receipts.map((r) => r.channel)).toEqual(['push', 'sms', 'call']);
    expect(out.humanTask).toBe(false);
  });

  it('when nothing reaches a critical item, it is flagged for a person to phone', () => {
    const out = deliver(planDelivery('sos', 'critical', noon, quiet), () => 'not_connected', at);
    expect(out.receipts.map((r) => r.state)).toEqual(['not_connected', 'not_connected', 'not_connected']);
    expect(out.humanTask).toBe(true);
  });

  it('a non-critical item that cannot be delivered does not create a human task', () => {
    const out = deliver(planDelivery('reminder', 'normal', noon, quiet), () => 'failed', at);
    expect(out.humanTask).toBe(false);
  });

  it('a deferred item is not attempted yet', () => {
    const out = deliver(planDelivery('reminder', 'normal', night, quiet), () => 'delivered', at);
    expect(out.receipts).toEqual([]);
    expect(out.humanTask).toBe(false);
  });
});
