// In-memory demo adapter (SCR-020: isolated demo data). It mirrors the database functions' rules and error codes
// (db/migrations/0004, 0005) so the UI behaves the same once the Supabase adapter replaces it. The database remains
// the authority: these checks are for display only.
import { STAGES, type Stage } from './stages';
import {
  ApiError, type Api, type Approval, type ExceptionItem, type OwnerSummary, type Project, type Role,
  type TimelineEvent, type User,
} from './types';

const DEMO_CODE = '123456';

const users: User[] = [
  { id: 'u-admin', name: 'Asha Kulkarni', phoneMasked: '+91 98•• ••01', roles: ['admin', 'owner'] },
  { id: 'u-admin2', name: 'Rahul Deshmukh', phoneMasked: '+91 98•• ••02', roles: ['admin'] },
  { id: 'u-owner', name: 'Vikram Joshi', phoneMasked: '+91 98•• ••09', roles: ['owner'] },
  { id: 'u-cust', name: 'Meera Patil', phoneMasked: '+91 98•• ••21', roles: ['customer'] },
  { id: 'u-tech', name: 'Sunil Pawar', phoneMasked: '+91 98•• ••31', roles: ['technician'] },
];
const phones: Record<string, string> = {
  '9800000001': 'u-admin', '9800000002': 'u-admin2', '9800000009': 'u-owner', '9800000021': 'u-cust', '9800000031': 'u-tech',
};

function project(id: string, code: string, site: string, stage: Stage, extra: Partial<Project> = {}): Project {
  return { id, code, site, lift: 'Lift A', stage, sideState: 'none', licenceHolder: null, customerId: 'u-other',
           severity: 'green', nextKey: 'today.open', waitingOn: 'admin', ...extra };
}

function seed() {
  const projects: Project[] = [
    project('p1', 'PUN-0001', 'Sai Residency, Kothrud', 'installation',
      { licenceHolder: 'Partner contractor (demo)', severity: 'green', waitingOn: 'technician' }),
    project('p2', 'PUN-0002', 'Green Park, Baner', 'agreement_token',
      { severity: 'red', nextKey: 'cust.not_paid_locked', waitingOn: 'customer' }),
    project('p3', 'PUN-0003', 'Shanti Nagar, Hadapsar', 'site_readiness',
      { customerId: 'u-cust', severity: 'amber', nextKey: 'cust.wait_bank', waitingOn: 'customer' }),
    project('p4', 'PUN-0004', 'Lake View, Wakad', 'qc_clearance',
      { severity: 'red', nextKey: 'exc.licence_holder_missing', waitingOn: 'admin' }),
    project('p5', 'PUN-0005', 'Orchid Towers, Aundh', 'quoted', { severity: 'green', waitingOn: 'sales' }),
    project('p6', 'PUN-0006', 'Ganesh Heights, Pimpri', 'dispatch',
      { sideState: 'on_hold', severity: 'amber', nextKey: 'exc.on_hold', waitingOn: 'admin',
        licenceHolder: 'AIEC (demo)' }),
    project('p7', 'PUN-0007', 'Riverfront, Kharadi', 'licence', { licenceHolder: 'AIEC (demo)', severity: 'amber',
      nextKey: 'cust.wait_licence', waitingOn: 'admin' }),
    project('p8', 'PUN-0008', 'Sunrise Apartments, Katraj', 'lead_verified', { severity: 'green', waitingOn: 'sales' }),
  ];
  const approvals: Approval[] = [
    { id: 'a1', projectId: 'p4', projectCode: 'PUN-0004', kind: 'qc_clearance', requestedBy: 'u-tech', requestedByName: 'Sunil Pawar',
      requestedRole: 'technician', reason: 'Pit and shaft measured; photos attached', status: 'requested', version: 1,
      createdAt: '2026-10-27T08:10:00+05:30' },
    { id: 'a2', projectId: 'p6', projectCode: 'PUN-0006', kind: 'override', requestedBy: 'u-admin', requestedByName: 'Asha Kulkarni',
      requestedRole: 'admin', reason: 'Permit office closed; proceed on scanned receipt', status: 'requested', version: 1,
      createdAt: '2026-10-27T09:40:00+05:30' },
    { id: 'a3', projectId: 'p3', projectCode: 'PUN-0003', kind: 'cancellation', requestedBy: 'u-cust', requestedByName: 'Meera Patil',
      requestedRole: 'customer', reason: 'Society meeting postponed the decision', status: 'requested', version: 1,
      createdAt: '2026-10-26T18:05:00+05:30' },
  ];
  const timelines: Record<string, TimelineEvent[]> = {};
  for (const p of projects) {
    const n = STAGES.indexOf(p.stage);
    const events: TimelineEvent[] = [];
    for (let i = 1; i <= n; i++) {
      events.push({ id: `${p.id}-s${i}`, at: new Date(Date.UTC(2026, 8, 1 + i * 3, 5, 30)).toISOString(),
        actorName: i < 4 ? 'Sales desk' : 'Asha Kulkarni', actorRole: i < 4 ? 'sales' : 'admin', kind: 'stage',
        from: STAGES[i - 1], to: STAGES[i], evidenceCount: i === 1 ? 3 : undefined });
    }
    timelines[p.id] = events.reverse();
  }
  timelines.p6.unshift({ id: 'p6-h', at: '2026-10-25T06:00:00.000Z', actorName: 'Asha Kulkarni', actorRole: 'admin',
    kind: 'side_state', side: 'on_hold', reason: 'Heavy rain, shaft flooded', evidenceCount: 1 });
  timelines.p4.unshift({ id: 'p4-b', at: '2026-10-20T07:00:00.000Z', actorName: 'Rahul Deshmukh', actorRole: 'admin',
    kind: 'stage', from: 'permit_applied', to: 'qc_clearance', reason: 'Licence holder not confirmed', red: true });
  return { projects, approvals, timelines };
}

function canSee(user: User, role: Role, p: Project): boolean {
  if (role === 'admin') return true;   // Owner: summary only (matrix), no project rows
  if (role === 'customer') return p.customerId === user.id;
  return false;
}

function hold(user: User, role: Role) {
  if (!user.roles.includes(role)) throw new ApiError('ROLE_NOT_HELD', 'error.ROLE_NOT_HELD');
}

const approverRoles: Record<string, Role[]> = {
  override: ['admin', 'owner', 'backup_approver'],
  cancellation: ['admin'],
  qc_clearance: ['qc', 'admin'],
};

export function createDemoApi(): Api {
  const db = seed();
  return {
    demo: true,
    demoAccounts: () => users,
    async login(phone, code) {
      const id = phones[phone.replace(/\D/g, '').slice(-10)];
      if (!id) throw new ApiError('NOT_INVITED', 'shared.not_invited');
      if (code !== DEMO_CODE) throw new ApiError('OTP_WRONG', 'shared.otp_wrong', true);
      return users.find((u) => u.id === id)!;
    },
    async listProjects(user, role) {
      hold(user, role);
      return db.projects.filter((p) => canSee(user, role, p));
    },
    async getProject(user, role, id) {
      hold(user, role);
      const p = db.projects.find((x) => x.id === id);
      if (!p || !canSee(user, role, p)) throw new ApiError('NOT_FOUND', 'error.NOT_FOUND');
      return { project: p, timeline: db.timelines[id] ?? [] };
    },
    async listExceptions(user, role) {
      hold(user, role);
      if (role !== 'admin') return [];
      const order = { red: 0, amber: 1 };
      return db.projects
        .filter((p) => p.severity !== 'green')
        .map<ExceptionItem>((p) => ({ id: `x-${p.id}`, projectId: p.id, severity: p.severity as 'red' | 'amber', kindKey: p.nextKey }))
        .sort((a, b) => order[a.severity] - order[b.severity]);
    },
    async listApprovals(user, role) {
      hold(user, role);
      return db.approvals.filter((a) => a.requestedBy === user.id || (approverRoles[a.kind] ?? []).includes(role));
    },
    async decideApproval(user, role, id, decision, version, reason) {
      hold(user, role);
      const a = db.approvals.find((x) => x.id === id);
      if (!a) throw new ApiError('APPROVAL_NOT_FOUND', 'error.NOT_FOUND');
      if (a.status !== 'requested') throw new ApiError('APPROVAL_NOT_PENDING', 'error.APPROVAL_NOT_PENDING');
      if (a.version !== version) throw new ApiError('VERSION_CONFLICT', 'error.VERSION_CONFLICT', true);
      if (a.requestedBy === user.id) throw new ApiError('SELF_APPROVAL', 'approval.own_request');
      if (!(approverRoles[a.kind] ?? []).includes(role)) throw new ApiError('ROLE_NOT_ALLOWED', 'error.ROLE_NOT_ALLOWED');
      if (decision === 'rejected' && !reason?.trim()) throw new ApiError('REASON_REQUIRED', 'approval.reject_reason');
      a.status = decision;
      a.version += 1;
      a.decidedByName = user.name;
      a.decisionReason = reason?.trim() || undefined;
      return { ...a };
    },
    async ownerSummary(user, role): Promise<OwnerSummary> {
      hold(user, role);
      if (role !== 'owner' && role !== 'admin') throw new ApiError('ROLE_NOT_ALLOWED', 'error.ROLE_NOT_ALLOWED');
      const byStage = Object.fromEntries(STAGES.map((s) => [s, 0])) as Record<Stage, number>;
      for (const p of db.projects) byStage[p.stage] += 1;
      return {
        active: db.projects.filter((p) => p.sideState !== 'cancelled' && p.sideState !== 'lost').length,
        stopped: db.projects.filter((p) => p.severity === 'red').length,
        overridesThisWeek: db.approvals.filter((a) => a.kind === 'override'
          && Date.now() - new Date(a.createdAt).getTime() <= 7 * 24 * 3600 * 1000).length,
        byStage,
      };
    },
  };
}
