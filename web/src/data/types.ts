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
  decidedRole?: Role;
  decidedAt?: string;
  decisionReason?: string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  at: string;
  kind: 'message' | 'system';
  authorName?: string;
  authorRole?: Role;
  text?: string;          // human message (data, not translated)
  textKey?: string;       // system event: i18n key
  vars?: Record<string, string>;
}

export interface ChatThread {
  projectId: string;
  code: string;
  site: string;
  last: ChatMessage | null;
}

export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'reversed' | 'disputed';

export interface Payment {
  id: string;
  projectId: string;
  projectCode: string;
  milestone: string;      // i18n key suffix: milestone.<name>
  amountPaise: number;    // integer paise (invariant 2)
  status: PaymentStatus;  // set only by the provider webhook processor
}

/** Adjustable rule value (RuleConfig): starts at a decision default, changes only by Admin proposal + Owner approval. */
export interface RuleSetting {
  key: string;
  value: number;
  unit: 'days' | 'percent' | 'count' | 'ratio';
  min: number;
  max: number;
  version: number;
  source: string;           // where the default came from: a decision id or a spec section
  history: { version: number; value: number; at: string; byName: string; reason: string }[];
}

export interface RuleProposal {
  id: string;
  key: string;
  from: number;
  to: number;
  reason: string;
  proposedBy: string;
  proposedByName: string;
  status: ApprovalStatus;
  version: number;
  createdAt: string;
  decidedByName?: string;
  decisionReason?: string;
}

/** Risky feature switch (config/flags.defaults.json): off until the named decision or review exists. */
export interface FeatureFlag {
  key: string;
  on: boolean;
  until: string;
}

export type HelpKind = 'callback' | 'chat';
export type HelpTopic = 'app' | 'project' | 'payment';

/** A request for a person (SCR-018). No response time is promised (DEC-011 default). */
export interface HelpRequest {
  id: string;
  userName: string;
  role: Role;
  kind: HelpKind;
  topic: HelpTopic;
  note: string | null;
  at: string;
  status: 'open' | 'contacted';
  handledByName?: string;
}

export type RecoveryReason = 'lost_phone' | 'new_number' | 'no_code';

/** Human-reviewed account recovery (SCR-019): logins stay blocked until enough different people verify. */
export interface RecoveryRequest {
  id: string;
  phoneMasked: string;
  userName: string | null;     // null when the number is not on file
  reason: RecoveryReason;
  at: string;
  status: 'waiting' | 'verified';
  reviewersNeeded: number;
  reviewerNames: string[];
}

export interface ExceptionItem {
  id: string;
  projectId: string;
  severity: Exclude<Severity, 'green'>;
  kindKey: string;         // i18n key
}

export interface OverrideItem {
  id: string;
  projectCode: string;
  reason: string;
  requestedByName: string;
  status: ApprovalStatus;
  createdAt: string;
}

export interface OwnerSummary {
  active: number;
  stopped: number;
  overridesThisWeek: number;
  /** T-160: every override of the last 7 days, with its reason, for the weekly review */
  overrides: OverrideItem[];
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
  listThreads(user: User, role: Role): Promise<ChatThread[]>;
  getThread(user: User, role: Role, projectId: string): Promise<{ code: string; site: string; messages: ChatMessage[] }>;
  sendMessage(user: User, role: Role, projectId: string, text: string): Promise<ChatMessage>;
  listPayments(user: User, role: Role): Promise<Payment[]>;
  listRules(user: User, role: Role): Promise<RuleSetting[]>;
  listRuleProposals(user: User, role: Role): Promise<RuleProposal[]>;
  proposeRule(user: User, role: Role, key: string, value: number, reason: string): Promise<RuleProposal>;
  decideRuleProposal(user: User, role: Role, id: string, decision: 'approved' | 'rejected', version: number,
                     reason?: string): Promise<RuleProposal>;
  listFlags(user: User, role: Role): Promise<FeatureFlag[]>;
  requestHelp(user: User, role: Role, kind: HelpKind, topic: HelpTopic, note?: string): Promise<HelpRequest>;
  /** Always answers 'received', whether or not the number is on file (no account discovery). */
  startRecovery(phone: string, reason: RecoveryReason): Promise<'received'>;
  listSupport(user: User, role: Role): Promise<{ help: HelpRequest[]; recoveries: RecoveryRequest[] }>;
  markHelpContacted(user: User, role: Role, id: string): Promise<void>;
  verifyRecovery(user: User, role: Role, id: string): Promise<RecoveryRequest>;
}
