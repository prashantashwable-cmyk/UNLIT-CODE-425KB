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
