// In-memory demo adapter (SCR-020: isolated demo data). It mirrors the database functions' rules and error codes
// (db/migrations/0004, 0005) so the UI behaves the same once the Supabase adapter replaces it. The database remains
// the authority: these checks are for display only.
import flagDefaults from '../../../config/flags.defaults.json';
import { deliver, planDelivery, type Attempt, type EventClass, type HourWindow, type Priority, type QuietHours } from './notify';
import { STAGES, type Stage } from './stages';
import {
  ApiError, type Api, type AppNotification, type Approval, type CallTask, type ChatMessage, type ExceptionItem, type OwnerSummary, type Payment,
  type FeatureFlag, type HelpRequest, type Project, type RecoveryRequest, type Role, type RuleProposal, type RuleSetting,
  type TimelineEvent, type User,
} from './types';

const DEMO_CODE = '123456';
/** No SMS, WhatsApp, email, push or call provider is connected in the demo (NEEDS_PROVIDER). */
const noProvider: Attempt = () => 'not_connected';

type StoredNotification = AppNotification & { userId: string; role: Role; deletedAt: string | null; sent: boolean; dedupeKey: string };
type StoredCallTask = Omit<CallTask, 'isMine' | 'attempts'> & { userId: string; attempts: (CallTask['attempts'][number] & { byUserId: string })[] };

function callTaskFor(n: StoredNotification, id: string, at: string): StoredCallTask {
  const u = users.find((x) => x.id === n.userId)!;
  return { id, userId: n.userId, notificationId: n.id, recipientName: u.name, recipientRole: n.role, phoneMasked: u.phoneMasked,
           textKey: n.textKey, vars: n.vars, at, status: 'open', attempts: [] };
}

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
  // Demo schedule rows: sample figures, not rates (rates are configuration, invariant 8). They follow the DEC-003
  // default (token credited to the 70%, pending the CA), so the four rows add up to the contract value.
  const pay = (id: string, projectId: string, projectCode: string, milestone: string, amountPaise: number,
               status: Payment['status']): Payment => ({ id, projectId, projectCode, milestone, amountPaise, status });
  const payments: Payment[] = [
    pay('pay1', 'p1', 'PUN-0001', 'token', 1000000, 'confirmed'),
    pay('pay2', 'p1', 'PUN-0001', 'material', 69000000, 'confirmed'),
    pay('pay3', 'p1', 'PUN-0001', 'cabin', 20000000, 'confirmed'),
    pay('pay4', 'p1', 'PUN-0001', 'handover', 10000000, 'pending'),
    pay('pay5', 'p2', 'PUN-0002', 'token', 1000000, 'pending'),
    pay('pay6', 'p3', 'PUN-0003', 'token', 1000000, 'confirmed'),
    pay('pay7', 'p3', 'PUN-0003', 'material', 69000000, 'pending'),
    pay('pay8', 'p3', 'PUN-0003', 'cabin', 20000000, 'pending'),
    pay('pay9', 'p3', 'PUN-0003', 'handover', 10000000, 'pending'),
  ];
  const messages: ChatMessage[] = [
    { id: 'm1', projectId: 'p3', at: '2026-10-26T05:30:00.000Z', kind: 'message', authorName: 'Asha Kulkarni', authorRole: 'admin',
      text: 'Please upload the readiness photos of the pit and machine room when ready.' },
    { id: 'm2', projectId: 'p3', at: '2026-10-26T07:10:00.000Z', kind: 'message', authorName: 'Meera Patil', authorRole: 'customer',
      text: 'The bank loan is still pending. We will update you this week.' },
  ];
  // Rule values start at the stated decision defaults (§40) or spec gates. min/max are PROPOSED input guards, not spec values.
  const rule = (key: string, value: number, unit: RuleSetting['unit'], min: number, max: number, source: string): RuleSetting =>
    ({ key, value, unit, min, max, version: 1, source,
       history: [{ version: 1, value, at: '2026-10-27T00:00:00.000Z', byName: 'Spec default', reason: source }] });
  const rules: RuleSetting[] = [
    rule('price_floor_ratio', 1.2, 'ratio', 1, 3, 'AIEC-DEC-008'),
    rule('variation_threshold_percent', 5, 'percent', 0, 100, 'AIEC-DEC-009'),
    rule('duplicate_window_days', 60, 'days', 1, 365, 'AIEC-DEC-007'),
    rule('duplicate_share_percent', 10, 'percent', 0, 50, 'AIEC-DEC-007'),
    rule('install_target_days', 14, 'days', 1, 120, 'AIEC-DEC-022'),
    rule('lead_photos_min', 3, 'count', 1, 20, '§16.2 stage 1'),
    // §16.2 says 'per SOP' with no number: generic placeholder the owner asked for, to be set in settings.
    rule('readiness_photos_min', 1, 'count', 1, 30, 'Generic placeholder (§16.2: per SOP)'),
    // §33 has quiet hours but no times: generic placeholder, changeable in settings.
    rule('quiet_hours_start', 21, 'hour', 0, 23, 'Generic placeholder (§33: quiet hours, no times set)'),
    rule('quiet_hours_end', 7, 'hour', 0, 23, 'Generic placeholder (§33: quiet hours, no times set)'),
    // Quiet hours and windows are local to the pilot: India Standard Time, UTC+5:30 (AIEC-DEC-014 Pune pilot).
    rule('pilot_utc_offset_minutes', 330, 'utc_offset', -720, 840, 'INFERENCE from AIEC-DEC-014 (Pune pilot, so India Standard Time UTC+5:30)'),
    // §33 "bypass during delivery window" with no window given: all day keeps approvals flowing; owner can narrow it.
    rule('approval_window_start', 0, 'hour', 0, 23, 'Generic placeholder (§33: delivery window not defined; all day)'),
    rule('approval_window_end', 24, 'hour', 1, 24, 'Generic placeholder (§33: delivery window not defined; all day)'),
  ];
  const notifications: StoredNotification[] = [];
  const callTasks: StoredCallTask[] = [];
  const notify = (id: string, userId: string, role: Role, cls: EventClass, priority: Priority, at: string, textKey: string,
                  target: string, vars?: Record<string, string | number>) =>
    enqueue({ notifications, callTasks, rules }, { userId, role, cls, priority, at, textKey, target, vars, dedupeKey: `seed:${id}` }, id);
  // Approvers other than the requester (Asha asked for a2, so she is not told to decide it).
  notify('n1', 'u-admin2', 'admin', 'approval', 'critical', '2026-10-27T04:10:00.000Z', 'notif.override_needed', '/admin/approvals', { code: 'PUN-0006' });
  notify('n2', 'u-owner', 'owner', 'approval', 'critical', '2026-10-27T04:10:00.000Z', 'notif.override_needed', '/admin/approvals', { code: 'PUN-0006' });
  for (const [i, uid] of ['u-admin', 'u-admin2'].entries()) {
    notify(`n3${i}`, uid, 'admin', 'payment', 'normal', '2026-10-27T04:30:00.000Z', 'notif.payment_updated', '/money', { code: 'PUN-0002' });
    notify(`n4${i}`, uid, 'admin', 'reminder', 'normal', '2026-10-26T17:00:00.000Z', 'notif.readiness_pending', '/project/p3', { code: 'PUN-0003' });
  }
  for (const [i, uid] of ['u-admin', 'u-owner'].entries()) {
    notify(`n5${i}`, uid, 'owner', 'summary', 'normal', '2026-10-26T16:00:00.000Z', 'notif.weekly_summary', '/analytics');
  }
  notify('n6', 'u-cust', 'customer', 'payment', 'normal', '2026-10-27T03:00:00.000Z', 'notif.payment_due', '/money', { code: 'PUN-0003' });
  notify('n7', 'u-cust', 'customer', 'reminder', 'normal', '2026-10-26T18:30:00.000Z', 'notif.site_ready', '/c/progress');
  const proposals: RuleProposal[] = [];
  const help: HelpRequest[] = [];
  const recoveries: (RecoveryRequest & { userId: string | null; reviewerIds: string[] })[] = [];
  return { projects, approvals, timelines, payments, messages, rules, proposals, help, recoveries, notifications, callTasks };
}

interface Outbox { notifications: StoredNotification[]; callTasks: StoredCallTask[]; rules: RuleSetting[] }
interface NotificationEvent {
  userId: string; role: Role; cls: EventClass; priority: Priority; at: string; textKey: string; target: string;
  vars?: Record<string, string | number>;
  /** AUT-031 dedupe: the same event for the same person and role is queued once */
  dedupeKey: string;
}

/** Outbox write (WF-18): plan against quiet hours, try channels, keep receipts, raise a call task when nobody was reached. */
// Live ids use their own prefix and only grow (rows are never removed), so they cannot collide with seed ids.
function enqueue(o: Outbox, e: NotificationEvent, id = `nl${o.notifications.length + 1}`): boolean {
  if (o.notifications.some((n) => n.userId === e.userId && n.role === e.role && n.dedupeKey === e.dedupeKey)) return false;
  const plan = planDelivery(e.cls, e.priority, new Date(e.at), quietHours(o.rules), { approvalWindow: approvalWindow(o.rules) });
  const out = deliver(plan, noProvider, e.at);
  const n: StoredNotification = { id, userId: e.userId, role: e.role, cls: e.cls, priority: plan.priority, at: e.at, textKey: e.textKey,
    vars: e.vars, target: e.target, heldUntil: plan.deferredUntil, receipts: out.receipts, humanTask: out.humanTask,
    acknowledgedAt: null, deletedAt: null, sent: !plan.deferredUntil, dedupeKey: e.dedupeKey };
  o.notifications.push(n);
  if (out.humanTask) o.callTasks.push(callTaskFor(n, `ct${o.callTasks.length + 1}`, e.at));
  return true;
}

/** Everyone holding one of the roles, as (user, role) pairs, minus the excluded person. */
function holders(roles: readonly Role[], exceptUserId: string | null): { userId: string; role: Role }[] {
  return users.flatMap((u) => u.id === exceptUserId ? [] : roles.filter((r) => u.roles.includes(r)).map((role) => ({ userId: u.id, role })));
}

/** A screen the requester's role can open: approvers see the inbox, customers their lift, field roles their own home. */
function targetForRequester(role: Role): string {
  if (role === 'admin' || role === 'owner' || role === 'backup_approver') return '/admin/approvals';
  return role === 'customer' ? '/c/progress' : '/today';
}

function quietHours(rules: RuleSetting[]): QuietHours {
  const v = (key: string) => rules.find((r) => r.key === key)!.value;
  return { startHour: v('quiet_hours_start'), endHour: v('quiet_hours_end'), tzOffsetMinutes: v('pilot_utc_offset_minutes') };
}

function approvalWindow(rules: RuleSetting[]): HourWindow {
  const v = (key: string) => rules.find((r) => r.key === key)!.value;
  return { startHour: v('approval_window_start'), endHour: v('approval_window_end') };
}

function publicCallTask({ userId, ...rest }: StoredCallTask, viewer: User): CallTask {
  return { ...rest, isMine: userId === viewer.id, attempts: rest.attempts.map(({ byUserId: _b, ...x }) => ({ ...x })) };
}

const WHOLE_UNITS: readonly RuleSetting['unit'][] = ['days', 'count', 'hour', 'utc_offset'];

function canSee(user: User, role: Role, p: Project): boolean {
  if (role === 'admin') return true;   // Owner: summary only (matrix), no project rows
  if (role === 'customer') return p.customerId === user.id;
  return false;
}

function holdRole(user: User, role: Role) {
  if (!user.roles.includes(role)) throw new ApiError('ROLE_NOT_HELD', 'error.ROLE_NOT_HELD');
}

const approverRoles: Record<string, Role[]> = {
  override: ['admin', 'owner', 'backup_approver'],
  cancellation: ['admin'],
  qc_clearance: ['qc', 'admin'],
};

function systemMessages(projectId: string, events: TimelineEvent[]): ChatMessage[] {
  return events.map((e) => ({
    id: `sys-${e.id}`, projectId, at: e.at, kind: 'system' as const,
    textKey: e.kind === 'stage' && e.to ? 'chat.stage_moved' : e.kind === 'side_state' && e.side ? `project.${e.side}` : e.textKey ?? 'chat.update',
    vars: e.kind === 'stage' && e.to ? { stage: e.to } : undefined,
  }));
}

const RECOVERY_REVIEWERS: readonly Role[] = ['admin', 'owner', 'backup_approver'];

export function createDemoApi(opts: { now?: () => Date } = {}): Api {
  const db = seed();
  const now = opts.now ?? (() => new Date());
  const emit = (e: Omit<NotificationEvent, 'at'>) => enqueue(db, { ...e, at: now().toISOString() });
  const sessions = new Map<string, string>();   // sessionId -> userId
  let sessionSeq = 0;
  function hold(user: User, role: Role) {
    holdRole(user, role);
    if (user.sessionId !== undefined && sessions.get(user.sessionId) !== user.id) throw new ApiError('SESSION_REVOKED', 'session.revoked');
  }
  function recoveryNotice(h: { userId: string; role: Role }, r: { id: string; userName: string | null }): Omit<NotificationEvent, 'at'> {
    // INFERENCE: recovery notices follow the approval delivery window (Owner can stop night pings, which anyone knowing
    // a registered number could otherwise trigger without logging in); no response time is promised (DEC-011 default).
    return { ...h, cls: 'approval', priority: 'normal', textKey: 'notif.recovery_started', target: h.role === 'admin' ? '/admin' : '/admin/approvals',
             dedupeKey: `recovery:${r.id}`, vars: { name: r.userName ?? '' } };
  }
  function publicRecovery(r: (typeof db.recoveries)[number]): RecoveryRequest {
    const { userId: _u, reviewerIds: _r, ...rest } = r;
    return { ...rest, reviewerNames: [...rest.reviewerNames] };
  }
  return {
    demo: true,
    demoAccounts: () => users,
    async login(phone, code) {
      const id = phones[phone.replace(/\D/g, '').slice(-10)];
      if (!id) throw new ApiError('NOT_INVITED', 'shared.not_invited');
      if (code !== DEMO_CODE) throw new ApiError('OTP_WRONG', 'shared.otp_wrong', true);
      // Recovery started: old sessions are revoked and nobody logs in until a person verifies (T-008).
      if (db.recoveries.some((r) => r.userId === id && r.status === 'waiting')) throw new ApiError('RECOVERY_PENDING', 'recovery.pending');
      const sessionId = `s${++sessionSeq}`;
      sessions.set(sessionId, id);
      return { ...users.find((u) => u.id === id)!, sessionId };
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
      a.decidedRole = role;
      a.decidedAt = now().toISOString();
      a.decisionReason = reason?.trim() || undefined;
      // Every decision is on the project timeline; an override is loud (red, with its reason).
      const red = a.kind === 'override';
      (db.timelines[a.projectId] ??= []).unshift({
        id: `${a.id}-v${a.version}`, at: a.decidedAt, actorName: user.name, actorRole: role, kind: 'approval',
        textKey: `timeline.${red ? 'override' : 'approval'}_${decision}`, reason: a.reason ?? undefined, red,
      });
      emit({ userId: a.requestedBy, role: a.requestedRole, cls: 'approval', priority: 'normal', textKey: 'notif.approval_decided',
             target: targetForRequester(a.requestedRole), dedupeKey: `approval:${a.id}:v${a.version}`,
             vars: { code: a.projectCode, decision, by: user.name } });
      return { ...a };
    },
    async listThreads(user, role) {
      hold(user, role);
      return db.projects.filter((p) => canSee(user, role, p)).map((p) => {
        const msgs = [...systemMessages(p.id, db.timelines[p.id] ?? []), ...db.messages.filter((m) => m.projectId === p.id)]
          .sort((a, b) => a.at.localeCompare(b.at));
        return { projectId: p.id, code: p.code, site: p.site, last: msgs[msgs.length - 1] ?? null };
      });
    },
    async getThread(user, role, projectId) {
      hold(user, role);
      const p = db.projects.find((x) => x.id === projectId);
      if (!p || !canSee(user, role, p)) throw new ApiError('NOT_FOUND', 'error.NOT_FOUND');
      const messages = [...systemMessages(p.id, db.timelines[p.id] ?? []), ...db.messages.filter((m) => m.projectId === p.id)]
        .sort((a, b) => a.at.localeCompare(b.at));
      return { code: p.code, site: p.site, messages };
    },
    async sendMessage(user, role, projectId, text) {
      hold(user, role);
      const p = db.projects.find((x) => x.id === projectId);
      if (!p || !canSee(user, role, p)) throw new ApiError('NOT_FOUND', 'error.NOT_FOUND');
      if (!text.trim()) throw new ApiError('MESSAGE_EMPTY', 'chat.empty');
      const m: ChatMessage = { id: `m${db.messages.length + 1}`, projectId, at: now().toISOString(), kind: 'message',
        authorName: user.name, authorRole: role, text: text.trim() };
      db.messages.push(m);
      return m;
    },
    async listPayments(user, role) {
      hold(user, role);
      return db.payments.filter((pm) => {
        const p = db.projects.find((x) => x.id === pm.projectId)!;
        return canSee(user, role, p);
      });
    },
    async listRules(user, role) {
      hold(user, role);
      if (role !== 'admin' && role !== 'owner') throw new ApiError('ROLE_NOT_ALLOWED', 'error.ROLE_NOT_ALLOWED');
      return db.rules.map((r) => ({ ...r, history: [...r.history] }));
    },
    async listRuleProposals(user, role) {
      hold(user, role);
      if (role !== 'admin' && role !== 'owner') throw new ApiError('ROLE_NOT_ALLOWED', 'error.ROLE_NOT_ALLOWED');
      return db.proposals.map((p) => ({ ...p }));
    },
    // Matrix "Change rules": Admin proposes, Owner approves; never the same person.
    async proposeRule(user, role, key, value, reason) {
      hold(user, role);
      if (role !== 'admin') throw new ApiError('ROLE_NOT_ALLOWED', 'error.ROLE_NOT_ALLOWED');
      const r = db.rules.find((x) => x.key === key);
      if (!r) throw new ApiError('RULE_NOT_FOUND', 'error.NOT_FOUND');
      if (!reason.trim()) throw new ApiError('REASON_REQUIRED', 'rules.reason_needed');
      if (!Number.isFinite(value) || value < r.min || value > r.max
          || (WHOLE_UNITS.includes(r.unit) && !Number.isInteger(value))) throw new ApiError('VALUE_OUT_OF_RANGE', 'rules.out_of_range');
      // One open proposal per setting, so approving an old one cannot overwrite a newer one.
      if (db.proposals.some((x) => x.key === key && x.status === 'requested')) throw new ApiError('RULE_PENDING', 'rules.pending_exists');
      const p: RuleProposal = { id: `rp${db.proposals.length + 1}`, key, from: r.value, to: value, reason: reason.trim(),
        proposedBy: user.id, proposedByName: user.name, status: 'requested', version: 1, createdAt: now().toISOString() };
      db.proposals.unshift(p);
      for (const h of holders(['owner'], user.id)) {
        emit({ ...h, cls: 'approval', priority: 'normal', textKey: 'notif.rule_proposed', target: '/admin/rules',
               dedupeKey: `rule:${p.id}:requested`, vars: { by: user.name } });
      }
      return { ...p };
    },
    async decideRuleProposal(user, role, id, decision, version, reason) {
      hold(user, role);
      if (role !== 'owner') throw new ApiError('ROLE_NOT_ALLOWED', 'error.ROLE_NOT_ALLOWED');
      const p = db.proposals.find((x) => x.id === id);
      if (!p) throw new ApiError('NOT_FOUND', 'error.NOT_FOUND');
      if (p.status !== 'requested') throw new ApiError('APPROVAL_NOT_PENDING', 'error.APPROVAL_NOT_PENDING');
      if (p.version !== version) throw new ApiError('VERSION_CONFLICT', 'error.VERSION_CONFLICT', true);
      if (p.proposedBy === user.id) throw new ApiError('SELF_APPROVAL', 'approval.own_request');
      if (decision === 'rejected' && !reason?.trim()) throw new ApiError('REASON_REQUIRED', 'approval.reject_reason');
      p.status = decision;
      p.version += 1;
      p.decidedByName = user.name;
      p.decisionReason = reason?.trim() || undefined;
      if (decision === 'approved') {
        const r = db.rules.find((x) => x.key === p.key)!;
        r.value = p.to;
        r.version += 1;
        r.history.push({ version: r.version, value: p.to, at: now().toISOString(), byName: `${p.proposedByName} → ${user.name}`, reason: p.reason });
      }
      emit({ userId: p.proposedBy, role: 'admin', cls: 'approval', priority: 'normal', textKey: 'notif.rule_decided', target: '/admin/rules',
             dedupeKey: `rule:${p.id}:v${p.version}`, vars: { decision, by: user.name } });
      return { ...p };
    },
    async listFlags(user, role): Promise<FeatureFlag[]> {
      hold(user, role);
      if (role !== 'admin' && role !== 'owner') throw new ApiError('ROLE_NOT_ALLOWED', 'error.ROLE_NOT_ALLOWED');
      return Object.entries(flagDefaults)
        .filter(([k]) => !k.startsWith('_'))
        .map(([key, v]) => ({ key, on: (v as { default: boolean }).default, until: (v as { until: string }).until }));
    },
    async requestHelp(user, role, kind, topic, note) {
      hold(user, role);
      const h: HelpRequest = { id: `h${db.help.length + 1}`, userName: user.name, role, kind, topic,
        note: note?.trim() || null, at: now().toISOString(), status: 'open' };
      db.help.unshift(h);
      // INFERENCE: §33 has no row for help requests; treated as a reminder (held during quiet hours, no time promise).
      for (const a of holders(['admin'], user.id)) {
        emit({ ...a, cls: 'reminder', priority: 'normal', textKey: 'notif.help_requested', target: '/admin',
               dedupeKey: `help:${h.id}`, vars: { name: user.name } });
      }
      return { ...h };
    },
    async startRecovery(phone, reason) {
      const digits = phone.replace(/\D/g, '').slice(-10);
      const userId = phones[digits] ?? null;
      const target = users.find((u) => u.id === userId);
      // T-008: whoever holds the lost phone is signed out everywhere at once
      for (const [sid, uid] of sessions) if (uid === userId) sessions.delete(sid);
      // a repeat request while one is waiting is the same request: same answer, nothing new queued
      const waiting = userId ? db.recoveries.find((r) => r.userId === userId && r.status === 'waiting') : undefined;
      if (waiting) {
        for (const h of holders(RECOVERY_REVIEWERS, userId)) emit(recoveryNotice(h, waiting));
        return 'received';
      }
      db.recoveries.unshift({ id: `r${db.recoveries.length + 1}`, userId, userName: target?.name ?? null,
        phoneMasked: digits.length === 10 ? `+91 ${digits.slice(0, 2)}•• ••${digits.slice(-2)}` : '—', reason,
        at: now().toISOString(), status: 'waiting',
        reviewersNeeded: target?.roles.some((r) => r === 'admin' || r === 'owner') ? 2 : 1,   // SCR-019: Admin/Owner accounts need two reviewers
        reviewerNames: [], reviewerIds: [] });
      if (userId) for (const h of holders(RECOVERY_REVIEWERS, userId)) emit(recoveryNotice(h, db.recoveries[0]));
      return 'received';
    },
    async listSupport(user, role) {
      hold(user, role);
      if (!RECOVERY_REVIEWERS.includes(role)) throw new ApiError('ROLE_NOT_ALLOWED', 'error.ROLE_NOT_ALLOWED');
      // help requests are Admin work; recoveries are also reviewed by Owner and the backup approver
      return { help: role === 'admin' ? db.help.map((h) => ({ ...h })) : [],
               recoveries: db.recoveries.map(publicRecovery) };
    },
    async markHelpContacted(user, role, id) {
      hold(user, role);
      if (role !== 'admin') throw new ApiError('ROLE_NOT_ALLOWED', 'error.ROLE_NOT_ALLOWED');
      const h = db.help.find((x) => x.id === id);
      if (!h) throw new ApiError('NOT_FOUND', 'error.NOT_FOUND');
      h.status = 'contacted';
      h.handledByName = user.name;
    },
    async verifyRecovery(user, role, id) {
      hold(user, role);
      if (!RECOVERY_REVIEWERS.includes(role)) throw new ApiError('ROLE_NOT_ALLOWED', 'error.ROLE_NOT_ALLOWED');
      const r = db.recoveries.find((x) => x.id === id);
      if (!r) throw new ApiError('NOT_FOUND', 'error.NOT_FOUND');
      if (r.userId === user.id) throw new ApiError('SELF_APPROVAL', 'approval.own_request');
      if (!r.userId) throw new ApiError('NOT_FOUND', 'recovery.unknown_number');
      if (r.status !== 'waiting') throw new ApiError('APPROVAL_NOT_PENDING', 'error.APPROVAL_NOT_PENDING');
      if (r.reviewerIds.includes(user.id)) throw new ApiError('ALREADY_REVIEWED', 'recovery.already_reviewed');
      r.reviewerIds.push(user.id);
      r.reviewerNames.push(user.name);
      if (r.reviewerIds.length >= r.reviewersNeeded) r.status = 'verified';
      return publicRecovery(r);
    },
    async closeRecovery(user, role, id, reason) {
      hold(user, role);
      if (role !== 'admin') throw new ApiError('ROLE_NOT_ALLOWED', 'error.ROLE_NOT_ALLOWED');
      const r = db.recoveries.find((x) => x.id === id);
      if (!r) throw new ApiError('NOT_FOUND', 'error.NOT_FOUND');
      if (r.userId === user.id) throw new ApiError('SELF_APPROVAL', 'approval.own_request');
      if (r.status !== 'waiting') throw new ApiError('APPROVAL_NOT_PENDING', 'error.APPROVAL_NOT_PENDING');
      if (!reason.trim()) throw new ApiError('REASON_REQUIRED', 'recovery.close_reason_needed');
      r.status = 'closed';
      r.closedByName = user.name;
      r.closeReason = reason.trim();
      return publicRecovery(r);
    },
    async displaySettings() {
      return { utcOffsetMinutes: db.rules.find((r) => r.key === 'pilot_utc_offset_minutes')!.value };
    },
    async listNotifications(user, role) {
      hold(user, role);
      const nowMs = now().getTime();
      const mine = db.notifications.filter((n) => n.userId === user.id && n.role === role && !n.deletedAt);
      for (const n of mine) {
        // Outbox worker stand-in: a held item goes out once quiet hours end.
        if (!n.sent && n.heldUntil && new Date(n.heldUntil).getTime() <= nowMs) {
          const out = deliver({ cls: n.cls, priority: n.priority, channels: planDelivery(n.cls, n.priority, new Date(n.heldUntil),
            quietHours(db.rules)).channels, deferredUntil: null }, noProvider, n.heldUntil);
          n.receipts = out.receipts;
          n.humanTask = out.humanTask;
          n.sent = true;
          if (out.humanTask) db.callTasks.push(callTaskFor(n, `ct${db.callTasks.length + 1}`, n.heldUntil));
        }
      }
      return mine.sort((x, y) => y.at.localeCompare(x.at))
        .map(({ userId: _u, role: _r, deletedAt: _d, sent: _s, ...rest }) => ({ ...rest, receipts: rest.receipts.map((r) => ({ ...r })) }));
    },
    async acknowledgeNotification(user, role, id) {
      hold(user, role);
      const n = db.notifications.find((x) => x.id === id && x.userId === user.id && x.role === role && !x.deletedAt);
      if (!n) throw new ApiError('NOT_FOUND', 'error.NOT_FOUND');
      n.acknowledgedAt ??= now().toISOString();
    },
    async deleteNotification(user, role, id) {
      hold(user, role);
      const n = db.notifications.find((x) => x.id === id && x.userId === user.id && x.role === role && !x.deletedAt);
      if (!n) throw new ApiError('NOT_FOUND', 'error.NOT_FOUND');
      if (n.priority === 'critical' && !n.acknowledgedAt) throw new ApiError('ACK_REQUIRED', 'notif.ack_first');
      n.deletedAt = now().toISOString();
    },
    async notificationAudit(user, role) {
      hold(user, role);
      if (role !== 'admin') throw new ApiError('ROLE_NOT_ALLOWED', 'error.ROLE_NOT_ALLOWED');
      return db.notifications.map((n) => ({ id: n.id, userName: users.find((u) => u.id === n.userId)!.name, role: n.role, cls: n.cls,
        priority: n.priority, at: n.at, acknowledgedAt: n.acknowledgedAt, deletedAt: n.deletedAt }))
        .sort((x, y) => y.at.localeCompare(x.at));
    },
    async listCallTasks(user, role) {
      hold(user, role);
      if (!RECOVERY_REVIEWERS.includes(role)) throw new ApiError('ROLE_NOT_ALLOWED', 'error.ROLE_NOT_ALLOWED');
      return db.callTasks.map((c) => publicCallTask(c, user)).sort((x, y) => (x.status === y.status ? y.at.localeCompare(x.at) : x.status === 'open' ? -1 : 1));
    },
    async logCallAttempt(user, role, id, outcome, note) {
      hold(user, role);
      // same people as recovery reviewers, so a call to the only Admin can still be made by the Owner or backup
      if (!RECOVERY_REVIEWERS.includes(role)) throw new ApiError('ROLE_NOT_ALLOWED', 'error.ROLE_NOT_ALLOWED');
      const c = db.callTasks.find((x) => x.id === id);
      if (!c) throw new ApiError('NOT_FOUND', 'error.NOT_FOUND');
      // someone else must reach you: closing the call to yourself would hide that nobody reached you
      if (c.userId === user.id) throw new ApiError('OWN_TASK', 'calls.own_task');
      if (c.status === 'done') throw new ApiError('TASK_DONE', 'calls.already_done');
      // append-only attempt log with who (id + role) and when
      c.attempts.push({ at: now().toISOString(), byUserId: user.id, byName: user.name, byRole: role, outcome, note: note.trim() || null });
      if (outcome === 'reached') c.status = 'done';
      return publicCallTask(c, user);
    },
    async ownerSummary(user, role): Promise<OwnerSummary> {
      hold(user, role);
      if (role !== 'owner' && role !== 'admin') throw new ApiError('ROLE_NOT_ALLOWED', 'error.ROLE_NOT_ALLOWED');
      const byStage = Object.fromEntries(STAGES.map((s) => [s, 0])) as Record<Stage, number>;
      for (const p of db.projects) byStage[p.stage] += 1;
      const weekOverrides = db.approvals.filter((a) => a.kind === 'override'
        && Date.now() - new Date(a.createdAt).getTime() <= 7 * 24 * 3600 * 1000);
      return {
        active: db.projects.filter((p) => p.sideState !== 'cancelled' && p.sideState !== 'lost').length,
        stopped: db.projects.filter((p) => p.severity === 'red').length,
        overridesThisWeek: weekOverrides.length,
        overrides: weekOverrides.map((a) => ({ id: a.id, projectCode: a.projectCode, reason: a.reason ?? '',
          requestedByName: a.requestedByName, status: a.status, createdAt: a.createdAt })),
        byStage,
      };
    },
  };
}
