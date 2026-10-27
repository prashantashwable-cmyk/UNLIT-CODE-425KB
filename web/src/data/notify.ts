// Notification outbox rules (NOTIFY_OUTBOX, §33, AUT-031). Pure functions shared by the demo adapter
// and, later, the server outbox worker. Quiet-hour times come from versioned settings, never from here.

export type EventClass = 'sos' | 'approval' | 'payment' | 'reminder' | 'marketing' | 'summary';
export type Priority = 'critical' | 'normal';
export type Channel = 'push' | 'sms' | 'whatsapp' | 'email' | 'call';
export type DeliveryState = 'delivered' | 'failed' | 'not_connected';
export type Attempt = (channel: Channel) => DeliveryState;

export interface QuietHours { startHour: number; endHour: number; tzOffsetMinutes: number }
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

/** §33 "Bypass" classes. Approvals: "bypass during delivery window" (INFERENCE: treated as bypass until the window is set). */
const BYPASS: readonly EventClass[] = ['sos', 'approval'];

function localMinutes(now: Date, tzOffsetMinutes: number): number {
  return (((now.getUTCHours() * 60 + now.getUTCMinutes() + tzOffsetMinutes) % 1440) + 1440) % 1440;
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
                             opts: { marketingOptIn?: boolean } = {}): DeliveryPlan {
  const p: Priority = cls === 'sos' ? 'critical' : priority;   // SOS is always critical
  const channels = cls === 'marketing' && !opts.marketingOptIn ? [] : [...CHANNELS[cls]];
  const bypass = BYPASS.includes(cls) || (cls === 'payment' && p === 'critical');
  return { cls, priority: p, channels, deferredUntil: !bypass && inQuietHours(now, q) ? quietEnd(now, q) : null };
}

/** Try channels in order until one delivers; every attempt is logged. A critical item nobody received becomes a human task. */
export function deliver(plan: DeliveryPlan, attempt: Attempt, at: string): { receipts: Receipt[]; humanTask: boolean } {
  if (plan.deferredUntil) return { receipts: [], humanTask: false };
  const receipts: Receipt[] = [];
  for (const channel of plan.channels) {
    const state = attempt(channel);
    receipts.push({ channel, state, at });
    if (state === 'delivered') return { receipts, humanTask: false };
  }
  return { receipts, humanTask: plan.priority === 'critical' && plan.channels.length > 0 };
}
