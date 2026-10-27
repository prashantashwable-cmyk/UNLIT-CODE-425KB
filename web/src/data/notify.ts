// Notification outbox rules (NOTIFY_OUTBOX, §33, AUT-031). Pure functions shared by the demo adapter
// and, later, the server outbox worker. Quiet-hour times come from versioned settings, never from here.

export type EventClass = 'sos' | 'approval' | 'payment' | 'reminder' | 'marketing' | 'summary';
export type Priority = 'critical' | 'normal';
export type Channel = 'push' | 'sms' | 'whatsapp' | 'email' | 'call';
export type DeliveryState = 'delivered' | 'failed' | 'not_connected';
export type Attempt = (channel: Channel) => DeliveryState;

export interface QuietHours { startHour: number; endHour: number; tzOffsetMinutes: number }
/** Local hours [start, end) in which approval notices may skip quiet hours; 0-24 = all day, start = end = never. */
export interface HourWindow { startHour: number; endHour: number }
export interface Receipt { channel: Channel; state: DeliveryState; at: string }
export interface DeliveryPlan { cls: EventClass; priority: Priority; channels: Channel[]; deferredUntil: string | null }

/** §33 channel order per event class. */
const CHANNELS: Record<EventClass, Channel[]> = {
  sos: ['push', 'sms', 'call'],
  approval: ['push', 'sms', 'whatsapp'],
  payment: ['push', 'whatsapp', 'sms'],
  reminder: ['push', 'sms'],
  marketing: ['whatsapp'],
  summary: ['whatsapp', 'email'],
};

/** §33 "Native push + SMS + call route": every channel at once, never stopping at the first that works. */
const ALL_CHANNELS: readonly EventClass[] = ['sos'];

/** §33: SOS always bypasses quiet hours; approvals bypass "during delivery window" (a setting; see planDelivery). */
const BYPASS: readonly EventClass[] = ['sos'];
const ALL_DAY: HourWindow = { startHour: 0, endHour: 24 };

function localMinutes(now: Date, tzOffsetMinutes: number): number {
  return (((now.getUTCHours() * 60 + now.getUTCMinutes() + tzOffsetMinutes) % 1440) + 1440) % 1440;
}

function inWindow(m: number, w: HourWindow): boolean {
  const s = w.startHour * 60;
  const e = w.endHour * 60;
  if (s === e) return false;
  return s < e ? m >= s && m < e : m >= s || m < e;
}

export function inQuietHours(now: Date, q: QuietHours): boolean {
  if (q.startHour === q.endHour) return false;
  const m = localMinutes(now, q.tzOffsetMinutes);
  const s = q.startHour * 60;
  const e = q.endHour * 60;
  return s < e ? m >= s && m < e : m >= s || m < e;
}

function quietEnd(now: Date, q: QuietHours): string {
  const m = localMinutes(now, q.tzOffsetMinutes);
  let wait = q.endHour * 60 - m;
  if (wait <= 0) wait += 1440;
  const end = new Date(now.getTime() + wait * 60_000);
  end.setUTCSeconds(0, 0);
  return end.toISOString();
}

export function planDelivery(cls: EventClass, priority: Priority, now: Date, q: QuietHours,
                             opts: { marketingOptIn?: boolean; approvalWindow?: HourWindow } = {}): DeliveryPlan {
  const p: Priority = cls === 'sos' ? 'critical' : priority;   // SOS is always critical
  const channels = cls === 'marketing' && !opts.marketingOptIn ? [] : [...CHANNELS[cls]];
  const inApprovalWindow = cls === 'approval' && inWindow(localMinutes(now, q.tzOffsetMinutes), opts.approvalWindow ?? ALL_DAY);
  const bypass = BYPASS.includes(cls) || inApprovalWindow || (cls === 'payment' && p === 'critical');
  return { cls, priority: p, channels, deferredUntil: !bypass && inQuietHours(now, q) ? quietEnd(now, q) : null };
}

/** Try channels in order until one delivers (SOS: all of them); every attempt is logged. A critical item nobody
 *  received needs a person to phone. 'delivered' from a provider means accepted, not proof the person read it. */
export function deliver(plan: DeliveryPlan, attempt: Attempt, at: string): { receipts: Receipt[]; humanTask: boolean } {
  if (plan.deferredUntil) return { receipts: [], humanTask: false };
  const receipts: Receipt[] = [];
  for (const channel of plan.channels) {
    const state = attempt(channel);
    receipts.push({ channel, state, at });
    if (state === 'delivered' && !ALL_CHANNELS.includes(plan.cls)) return { receipts, humanTask: false };
  }
  const reached = receipts.some((r) => r.state === 'delivered');
  return { receipts, humanTask: !reached && plan.priority === 'critical' && plan.channels.length > 0 };
}
