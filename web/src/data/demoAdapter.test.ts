import { describe, expect, it } from 'vitest';
import { createDemoApi } from './demoAdapter';
import { ApiError } from './types';

const api = () => createDemoApi();
async function user(phone: string) {
  return api().login(phone, '123456');
}
async function code(p: Promise<unknown>) {
  try { await p; return 'OK'; } catch (e) { return (e as ApiError).code; }
}

describe('demo adapter mirrors the database rules', () => {
  it('is marked as demo', () => expect(api().demo).toBe(true));

  it('rejects a wrong code and an uninvited number', async () => {
    expect(await code(api().login('9800000001', '000000'))).toBe('OTP_WRONG');
    expect(await code(api().login('9999999999', '123456'))).toBe('NOT_INVITED');
  });

  it('customer sees only own project', async () => {
    const a = api();
    const c = await a.login('9800000021', '123456');
    const ps = await a.listProjects(c, 'customer');
    expect(ps.map((p) => p.id)).toEqual(['p3']);
    expect(await code(a.getProject(c, 'customer', 'p1'))).toBe('NOT_FOUND');
  });

  it('cannot act under a role not held', async () => {
    const c = await user('9800000021');
    expect(await code(api().listProjects(c, 'admin'))).toBe('ROLE_NOT_HELD');
  });

  it('no self-approval (T-004)', async () => {
    const a = api();
    const admin = await a.login('9800000001', '123456');
    expect(await code(a.decideApproval(admin, 'admin', 'a2', 'approved', 1))).toBe('SELF_APPROVAL');
    const admin2 = await a.login('9800000002', '123456');
    expect(await code(a.decideApproval(admin2, 'admin', 'a2', 'approved', 1))).toBe('OK');
  });

  it('stale version, missing reject reason, wrong role and re-decide are refused', async () => {
    const a = api();
    const admin2 = await a.login('9800000002', '123456');
    expect(await code(a.decideApproval(admin2, 'admin', 'a3', 'approved', 9))).toBe('VERSION_CONFLICT');
    expect(await code(a.decideApproval(admin2, 'admin', 'a3', 'rejected', 1, '  '))).toBe('REASON_REQUIRED');
    const owner = await a.login('9800000009', '123456');
    expect(await code(a.decideApproval(owner, 'owner', 'a3', 'approved', 1))).toBe('ROLE_NOT_ALLOWED');
    expect(await code(a.decideApproval(admin2, 'admin', 'a3', 'rejected', 1, 'not now'))).toBe('OK');
    expect(await code(a.decideApproval(admin2, 'admin', 'a3', 'approved', 2))).toBe('APPROVAL_NOT_PENDING');
  });

  it('every text key the demo data uses has a translation', async () => {
    const { hasKey } = await import('../i18n/i18n');
    const a = api();
    const admin = await a.login('9800000001', '123456');
    for (const p of await a.listProjects(admin, 'admin')) expect(hasKey(p.nextKey), p.nextKey).toBe(true);
    for (const ap of await a.listApprovals(admin, 'admin')) expect(hasKey(`approvalkind.${ap.kind}`), ap.kind).toBe(true);
    for (const k of ['error.ROLE_NOT_HELD', 'error.NOT_FOUND', 'error.APPROVAL_NOT_PENDING', 'error.VERSION_CONFLICT',
                     'error.ROLE_NOT_ALLOWED', 'approval.own_request', 'approval.reject_reason', 'shared.otp_wrong',
                     'shared.not_invited']) expect(hasKey(k), k).toBe(true);
  });

  it('exceptions list puts stopped items first', async () => {
    const a = api();
    const admin = await a.login('9800000001', '123456');
    const xs = await a.listExceptions(admin, 'admin');
    expect(xs.length).toBeGreaterThan(0);
    expect(xs[0].severity).toBe('red');
  });
});

describe('owner visibility', () => {
  it('owner gets no project rows, only the summary', async () => {
    const a = createDemoApi();
    const o = await a.login('9800000009', '123456');
    expect(await a.listProjects(o, 'owner')).toEqual([]);
    expect((await a.ownerSummary(o, 'owner')).active).toBeGreaterThan(0);
  });
});

describe('overrides are loud (T-004 / T-160)', () => {
  it('deciding an override records who decided, when, and adds a red timeline entry with the reason', async () => {
    const a = createDemoApi();
    const admin2 = await a.login('9800000002', '123456');
    const decided = await a.decideApproval(admin2, 'admin', 'a2', 'approved', 1);
    expect(decided.decidedByName).toBe('Rahul Deshmukh');
    expect(decided.decidedRole).toBe('admin');
    expect(decided.decidedAt).toBeTruthy();
    expect(decided.version).toBe(2);
    const { timeline } = await a.getProject(admin2, 'admin', 'p6');
    const red = timeline.find((e) => e.kind === 'approval' && e.red);
    expect(red?.reason).toBe('Permit office closed; proceed on scanned receipt');
    expect(red?.textKey).toBe('timeline.override_approved');
    expect(timeline[0]).toBe(red);   // newest first
  });

  it('a normal approval decision is not red', async () => {
    const a = createDemoApi();
    const admin2 = await a.login('9800000002', '123456');
    await a.decideApproval(admin2, 'admin', 'a1', 'approved', 1);
    const { timeline } = await a.getProject(admin2, 'admin', 'p4');
    const e = timeline.find((x) => x.kind === 'approval');
    expect(e).toBeDefined();
    expect(e?.red).toBeFalsy();
    expect(e?.textKey).toBe('timeline.approval_approved');
  });

  it("the Owner's weekly summary lists overrides with their reason", async () => {
    const a = createDemoApi();
    const o = await a.login('9800000009', '123456');
    const s = await a.ownerSummary(o, 'owner');
    expect(s.overrides.map((x) => x.reason)).toContain('Permit office closed; proceed on scanned receipt');
    expect(s.overrides[0].projectCode).toBe('PUN-0006');
  });
});

describe('rules and settings: Admin proposes, Owner approves, every version kept (SCR-079, invariant 8)', () => {
  async function setup() {
    const a = createDemoApi();
    return { a, admin: await a.login('9800000002', '123456'), owner: await a.login('9800000009', '123456'),
             both: await a.login('9800000001', '123456') };
  }

  it('starts from the decision defaults and names where each came from', async () => {
    const { a, owner } = await setup();
    const rules = await a.listRules(owner, 'owner');
    const floor = rules.find((r) => r.key === 'price_floor_ratio')!;
    expect(floor.value).toBe(1.2);
    expect(floor.source).toBe('AIEC-DEC-008');
    expect(floor.version).toBe(1);
    expect(rules.find((r) => r.key === 'install_target_days')!.value).toBe(14);
  });

  it('only Admin proposes; a reason and an in-range value are required', async () => {
    const { a, admin, owner } = await setup();
    expect(await code(a.proposeRule(owner, 'owner', 'install_target_days', 21, 'monsoon'))).toBe('ROLE_NOT_ALLOWED');
    expect(await code(a.proposeRule(admin, 'admin', 'install_target_days', 21, ' '))).toBe('REASON_REQUIRED');
    expect(await code(a.proposeRule(admin, 'admin', 'install_target_days', 0, 'x'))).toBe('VALUE_OUT_OF_RANGE');
    expect(await code(a.proposeRule(admin, 'admin', 'no_such_rule', 1, 'x'))).toBe('RULE_NOT_FOUND');
    expect(await code(a.proposeRule(admin, 'admin', 'install_target_days', 21, 'monsoon season'))).toBe('OK');
  });

  it('a proposal changes nothing until the Owner approves; then the version goes up', async () => {
    const { a, admin, owner } = await setup();
    const p = await a.proposeRule(admin, 'admin', 'install_target_days', 21, 'monsoon season');
    expect((await a.listRules(owner, 'owner')).find((r) => r.key === 'install_target_days')!.value).toBe(14);
    expect(await code(a.decideRuleProposal(admin, 'admin', p.id, 'approved', 1))).toBe('ROLE_NOT_ALLOWED');
    await a.decideRuleProposal(owner, 'owner', p.id, 'approved', 1);
    const r = (await a.listRules(owner, 'owner')).find((x) => x.key === 'install_target_days')!;
    expect(r.value).toBe(21);
    expect(r.version).toBe(2);
    expect(r.history.map((h) => h.value)).toEqual([14, 21]);
  });

  it('only one open proposal per setting', async () => {
    const { a, admin } = await setup();
    await a.proposeRule(admin, 'admin', 'install_target_days', 21, 'monsoon');
    expect(await code(a.proposeRule(admin, 'admin', 'install_target_days', 18, 'compromise'))).toBe('RULE_PENDING');
  });

  it('someone who is Admin and Owner cannot approve their own proposal', async () => {
    const { a, both } = await setup();
    const p = await a.proposeRule(both, 'admin', 'lead_photos_min', 4, 'blurry leads');
    expect(await code(a.decideRuleProposal(both, 'owner', p.id, 'approved', 1))).toBe('SELF_APPROVAL');
  });

  it('a rejected proposal keeps the old value and needs a reason', async () => {
    const { a, admin, owner } = await setup();
    const p = await a.proposeRule(admin, 'admin', 'price_floor_ratio', 1.1, 'match competitor');
    expect(await code(a.decideRuleProposal(owner, 'owner', p.id, 'rejected', 1))).toBe('REASON_REQUIRED');
    await a.decideRuleProposal(owner, 'owner', p.id, 'rejected', 1, 'margin too thin');
    expect((await a.listRules(owner, 'owner')).find((r) => r.key === 'price_floor_ratio')!.value).toBe(1.2);
  });

  it('risky features stay locked and cannot be switched on here', async () => {
    const { a, owner } = await setup();
    const flags = await a.listFlags(owner, 'owner');
    expect(flags.every((f) => f.on === false)).toBe(true);
    expect(flags.find((f) => f.key === 'remote_lift_lock')!.until).toMatch(/never/);
    expect(flags.find((f) => f.key === 'live_payouts')).toBeDefined();
  });

  it('customers cannot see rules', async () => {
    const a = createDemoApi();
    const c = await a.login('9800000021', '123456');
    expect(await code(a.listRules(c, 'customer'))).toBe('ROLE_NOT_ALLOWED');
  });
});

describe('help always reaches a person (SCR-018)', () => {
  it('a help request lands with Admin, who marks it contacted', async () => {
    const a = createDemoApi();
    const c = await a.login('9800000021', '123456');
    const h = await a.requestHelp(c, 'customer', 'callback', 'payment', 'Which account do I pay into?');
    expect(h.status).toBe('open');
    const admin = await a.login('9800000002', '123456');
    const s = await a.listSupport(admin, 'admin');
    expect(s.help[0]).toMatchObject({ id: h.id, userName: 'Meera Patil', kind: 'callback', topic: 'payment' });
    await a.markHelpContacted(admin, 'admin', h.id);
    expect((await a.listSupport(admin, 'admin')).help[0].status).toBe('contacted');
  });

  it('only Admin sees support requests', async () => {
    const a = createDemoApi();
    const c = await a.login('9800000021', '123456');
    expect(await code(a.listSupport(c, 'customer'))).toBe('ROLE_NOT_ALLOWED');
  });
});

describe('account recovery is human-reviewed (SCR-019; part of T-008 and T-259: device binding needs the backend)', () => {
  it('starting recovery signs out open sessions and blocks logins until a person verifies; unknown numbers get the same answer', async () => {
    const a = createDemoApi();
    const thief = await a.login('9800000021', '123456');          // whoever holds the lost phone
    expect(await a.startRecovery('9800000021', 'lost_phone')).toBe('received');
    expect(await a.startRecovery('9123456789', 'lost_phone')).toBe('received');
    expect(await code(a.listProjects(thief, 'customer'))).toBe('SESSION_REVOKED');
    expect(await code(a.login('9800000021', '123456'))).toBe('RECOVERY_PENDING');
    const admin = await a.login('9800000002', '123456');
    const r = (await a.listSupport(admin, 'admin')).recoveries.find((x) => x.userName === 'Meera Patil')!;
    expect(r.reviewersNeeded).toBe(1);
    await a.verifyRecovery(admin, 'admin', r.id);
    expect(await code(a.login('9800000021', '123456'))).toBe('OK');
  });

  it('an Admin account needs two different reviewers (Admin, Owner or backup), never the person themselves', async () => {
    const a = createDemoApi();
    const asha = await a.login('9800000001', '123456');            // admin + owner
    const vikram = await a.login('9800000009', '123456');          // owner
    const rahul = await a.login('9800000002', '123456');
    await a.startRecovery('9800000002', 'lost_phone');             // Rahul's account
    const r = (await a.listSupport(asha, 'admin')).recoveries[0];
    expect(r.reviewersNeeded).toBe(2);
    expect(await code(a.verifyRecovery(rahul, 'admin', r.id))).toBe('SESSION_REVOKED');
    await a.verifyRecovery(asha, 'admin', r.id);
    expect(await code(a.verifyRecovery(asha, 'owner', r.id))).toBe('ALREADY_REVIEWED');
    expect(await code(a.login('9800000002', '123456'))).toBe('RECOVERY_PENDING');
    await a.verifyRecovery(vikram, 'owner', r.id);
    expect(await code(a.login('9800000002', '123456'))).toBe('OK');
  });

  it('a request that is not genuine can be closed with a reason, which lifts the block at once', async () => {
    const a = createDemoApi();
    await a.startRecovery('9800000021', 'no_code');                // e.g. a stranger typed her number
    const admin = await a.login('9800000002', '123456');
    const r = (await a.listSupport(admin, 'admin')).recoveries[0];
    expect(await code(a.closeRecovery(admin, 'admin', r.id, ' '))).toBe('REASON_REQUIRED');
    await a.closeRecovery(admin, 'admin', r.id, 'Customer called from her own phone; she did not ask for this');
    const closed = (await a.listSupport(admin, 'admin')).recoveries[0];
    expect(closed).toMatchObject({ status: 'closed', closedByName: 'Rahul Deshmukh' });
    expect(await code(a.login('9800000021', '123456'))).toBe('OK');
  });

  it('nobody can close their own recovery', async () => {
    const a = createDemoApi();
    const asha = await a.login('9800000001', '123456');
    await a.startRecovery('9800000001', 'lost_phone');
    const rahul = await a.login('9800000002', '123456');
    const r = (await a.listSupport(rahul, 'admin')).recoveries[0];
    const asha2 = { ...asha, sessionId: undefined };              // even with a fresh server session
    expect(await code(a.closeRecovery(asha2, 'admin', r.id, 'mine'))).toBe('SELF_APPROVAL');
  });
});

describe('notification centre (SCR-013, NOTIFY_OUTBOX; T-256)', () => {
  it('lists only your own notifications for the role you are in, newest first', async () => {
    const a = createDemoApi();
    const rahul = await a.login('9800000002', '123456');
    const list = await a.listNotifications(rahul, 'admin');
    expect(list.length).toBeGreaterThan(0);
    expect([...list].sort((x, y) => y.at.localeCompare(x.at)).map((n) => n.id)).toEqual(list.map((n) => n.id));
    const meera = await a.login('9800000021', '123456');
    const mine = await a.listNotifications(meera, 'customer');
    expect(mine.some((n) => list.some((m) => m.id === n.id))).toBe(false);
    expect(await code(a.acknowledgeNotification(meera, 'customer', list[0].id))).toBe('NOT_FOUND');
    const asha = await a.login('9800000001', '123456');            // Admin and Owner: separate lists per role
    const asAdmin = await a.listNotifications(asha, 'admin');
    const asOwner = await a.listNotifications(asha, 'owner');
    expect(asOwner.some((n) => n.textKey === 'notif.weekly_summary')).toBe(true);
    expect(asAdmin.some((n) => n.textKey === 'notif.weekly_summary')).toBe(false);
    expect(await code(a.deleteNotification(asha, 'admin', asOwner[0].id))).toBe('NOT_FOUND');
  });

  it('T-256: a critical item stays until acknowledged; deleted items remain in the audit', async () => {
    const a = createDemoApi();
    const rahul = await a.login('9800000002', '123456');
    const crit = (await a.listNotifications(rahul, 'admin')).find((n) => n.priority === 'critical')!;
    expect(crit.acknowledgedAt).toBeNull();
    expect(await code(a.deleteNotification(rahul, 'admin', crit.id))).toBe('ACK_REQUIRED');
    await a.acknowledgeNotification(rahul, 'admin', crit.id);
    await a.deleteNotification(rahul, 'admin', crit.id);
    expect((await a.listNotifications(rahul, 'admin')).some((n) => n.id === crit.id)).toBe(false);
    const audit = await a.notificationAudit(rahul, 'admin');
    expect([...audit].sort((x, y) => y.at.localeCompare(x.at)).map((r) => r.id)).toEqual(audit.map((r) => r.id));
    expect(audit.find((r) => r.id === crit.id)).toMatchObject({ userName: 'Rahul Deshmukh', priority: 'critical' });
    expect(audit.find((r) => r.id === crit.id)!.deletedAt).not.toBeNull();
    expect(audit.find((r) => r.id === crit.id)!.acknowledgedAt).not.toBeNull();
    const meera = await a.login('9800000021', '123456');
    expect(await code(a.notificationAudit(meera, 'customer'))).toBe('ROLE_NOT_ALLOWED');
  });

  it('a normal item can be deleted without acknowledging', async () => {
    const a = createDemoApi();
    const meera = await a.login('9800000021', '123456');
    const n = (await a.listNotifications(meera, 'customer')).find((x) => x.priority === 'normal')!;
    await a.deleteNotification(meera, 'customer', n.id);
    expect((await a.listNotifications(meera, 'customer')).some((x) => x.id === n.id)).toBe(false);
  });

  it('delivery state is honest: no provider is connected, so a critical item becomes a call task for a person', async () => {
    const a = createDemoApi();
    const rahul = await a.login('9800000002', '123456');
    const list = await a.listNotifications(rahul, 'admin');
    const crit = list.find((n) => n.priority === 'critical')!;
    expect(crit.receipts.length).toBeGreaterThan(0);
    expect(crit.receipts.every((r) => r.state === 'not_connected')).toBe(true);
    expect(crit.humanTask).toBe(true);
    const held = list.find((n) => n.heldUntil !== null)!;          // a reminder raised at night
    expect(held.cls).toBe('reminder');
    expect(held.receipts.every((r) => r.at === held.heldUntil)).toBe(true);   // tried when quiet hours ended
  });

  it('quiet hours are settings with a placeholder source, whole hours only', async () => {
    const a = createDemoApi();
    const asha = await a.login('9800000001', '123456');
    const rules = await a.listRules(asha, 'admin');
    expect(rules.find((r) => r.key === 'quiet_hours_start')).toMatchObject({ value: 21, unit: 'hour', min: 0, max: 23 });
    expect(rules.find((r) => r.key === 'quiet_hours_end')).toMatchObject({ value: 7, unit: 'hour' });
    expect(rules.find((r) => r.key === 'quiet_hours_start')!.source).toMatch(/placeholder/i);
    expect(await code(a.proposeRule(asha, 'admin', 'quiet_hours_start', 21.5, 'half past'))).toBe('VALUE_OUT_OF_RANGE');
    expect(await code(a.proposeRule(asha, 'admin', 'duplicate_window_days', 30.5, 'half day'))).toBe('VALUE_OUT_OF_RANGE');
  });
});

describe('call tasks for undelivered critical notifications (§33 "critical items: a human task"; T-086 follow-up)', () => {
  it('each critical item nobody received becomes an open call task for the Admin team', async () => {
    const a = createDemoApi();
    const rahul = await a.login('9800000002', '123456');
    const tasks = await a.listCallTasks(rahul, 'admin');
    expect(tasks.map((x) => x.recipientName).sort()).toEqual(['Rahul Deshmukh', 'Vikram Joshi']);
    expect(tasks.every((x) => x.status === 'open' && x.textKey === 'notif.override_needed')).toBe(true);
    expect(tasks[0].phoneMasked).toMatch(/••/);                       // masked, never the full number
    expect(tasks.find((x) => x.recipientName === 'Rahul Deshmukh')!.isMine).toBe(true);
    expect(tasks.find((x) => x.recipientName === 'Vikram Joshi')!.isMine).toBe(false);
    const meera = await a.login('9800000021', '123456');
    expect(await code(a.listCallTasks(meera, 'customer'))).toBe('ROLE_NOT_ALLOWED');
  });

  it('no answer keeps it open with the attempt logged; reached closes it; nobody closes the call to themselves', async () => {
    const a = createDemoApi();
    const rahul = await a.login('9800000002', '123456');
    const asha = await a.login('9800000001', '123456');
    const tasks = await a.listCallTasks(rahul, 'admin');
    const own = tasks.find((x) => x.recipientName === 'Rahul Deshmukh')!;
    const vik = tasks.find((x) => x.recipientName === 'Vikram Joshi')!;
    expect(await code(a.logCallAttempt(rahul, 'admin', own.id, 'reached', ''))).toBe('OWN_TASK');
    const t1 = await a.logCallAttempt(rahul, 'admin', vik.id, 'no_answer', '');
    expect(t1).toMatchObject({ status: 'open' });
    expect(t1.attempts).toEqual([expect.objectContaining({ byName: 'Rahul Deshmukh', outcome: 'no_answer' })]);
    const t2 = await a.logCallAttempt(asha, 'admin', vik.id, 'reached', 'Told him about PUN-0006');
    expect(t2).toMatchObject({ status: 'done' });
    expect(t2.attempts).toHaveLength(2);
    expect(await code(a.logCallAttempt(asha, 'admin', vik.id, 'reached', ''))).toBe('TASK_DONE');
    await a.logCallAttempt(asha, 'admin', own.id, 'reached', '');
    expect((await a.listCallTasks(asha, 'admin')).every((x) => x.status === 'done')).toBe(true);
  });
});

describe('call tasks never deadlock (same reviewer set as recovery: Admin, Owner, backup approver)', () => {
  it("the Owner can see and close the Admin's own call task, and every attempt records who and in which role", async () => {
    const a = createDemoApi();
    const vikram = await a.login('9800000009', '123456');            // Owner only
    const tasks = await a.listCallTasks(vikram, 'owner');
    const rahulsTask = tasks.find((x) => x.recipientName === 'Rahul Deshmukh')!;
    const own = tasks.find((x) => x.recipientName === 'Vikram Joshi')!;
    expect(own.isMine).toBe(true);
    expect(await code(a.logCallAttempt(vikram, 'owner', own.id, 'reached', ''))).toBe('OWN_TASK');
    const done = await a.logCallAttempt(vikram, 'owner', rahulsTask.id, 'reached', '');
    expect(done.status).toBe('done');
    expect(done.attempts[0]).toMatchObject({ byName: 'Vikram Joshi', byRole: 'owner' });
  });
});

