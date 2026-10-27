import type { SideState, Stage } from './stages';

export type Role = 'admin' | 'owner' | 'customer' | 'technician' | 'qc' | 'rider' | 'sales' | 'backup_approver';
/** Field roles use the Android app; the browser refuses real use (T-006), demo only. */
export const FIELD_ROLES: readonly Role[] = ['rider', 'technician', 'qc'];
export const WEB_ROLES: readonly Role[] = ['admin', 'owner', 'customer', 'backup_approver'];

export type Severity = 'red' | 'amber' | 'green';

export interface User {
  id: string;
  name: string;
  phoneMasked: string;
  roles: Role[];
}

export interface Project {
  id: string;
  code: string;
  site: string;
  lift: string;
  stage: Stage;
  sideState: SideState;
  licenceHolder: string | null;
  customerId: string;
  severity: Severity;
  /** i18n key of the next action and the role it waits on */
  nextKey: string;
  waitingOn: Role;
}

export type TimelineKind = 'stage' | 'side_state' | 'approval' | 'evidence' | 'payment';

export interface TimelineEvent {
  id: string;
  at: string;              // ISO time
  actorName: string;
  actorRole: Role;
  kind: TimelineKind;
  from?: Stage;
  to?: Stage;
  side?: SideState;
  reason?: string;
  evidenceCount?: number;
  red?: boolean;           // overrides and backward moves are loud
  textKey?: string;
}

export type ApprovalStatus = 'requested' | 'approved' | 'rejected';

export interface Approval {
  id: string;
  projectId: string;
  projectCode: string;
  kind: string;
  requestedBy: string;
  requestedByName: string;
  requestedRole: Role;
  reason: string | null;
  status: ApprovalStatus;
  version: number;
  createdAt: string;
  decidedByName?: string;
  decisionReason?: string;
}

export interface ExceptionItem {
  id: string;
  projectId: string;
  severity: Exclude<Severity, 'green'>;
  kindKey: string;         // i18n key
}

export interface OwnerSummary {
  active: number;
  stopped: number;
  overridesThisWeek: number;
  byStage: Record<Stage, number>;
}

/** Error shape mirrors spec §30: a code plus a localisable message key. */
export class ApiError extends Error {
  constructor(public code: string, public messageKey: string, public retryable = false) {
    super(code);
  }
}

export interface Api {
  readonly demo: boolean;
  demoAccounts(): User[];
  login(phone: string, code: string): Promise<User>;
  listProjects(user: User, role: Role): Promise<Project[]>;
  getProject(user: User, role: Role, id: string): Promise<{ project: Project; timeline: TimelineEvent[] }>;
  listExceptions(user: User, role: Role): Promise<ExceptionItem[]>;
  listApprovals(user: User, role: Role): Promise<Approval[]>;
  decideApproval(user: User, role: Role, id: string, decision: 'approved' | 'rejected', version: number,
                 reason?: string): Promise<Approval>;
  ownerSummary(user: User, role: Role): Promise<OwnerSummary>;
}
