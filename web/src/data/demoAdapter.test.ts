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
