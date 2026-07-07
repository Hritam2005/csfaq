// =============================================================================
// Query Triage Microservice – shared TypeScript types & enums
// Mirrors constants on the microservice side (apps/query-triage/src/constants
// and src/models/QueryCase.model.js).
// =============================================================================

/** Mirrors QueryChannel on the microservice. */
export type QueryChannel =
  | 'unified_intake'
  | 'community'
  | 'support'
  | 'faq_search'
  | 'ask_ai';

export const QUERY_CHANNELS: { value: QueryChannel; label: string }[] = [
  { value: 'unified_intake', label: 'Unified Intake' },
  { value: 'community', label: 'Community' },
  { value: 'support', label: 'Support' },
  { value: 'faq_search', label: 'FAQ Search' },
  { value: 'ask_ai', label: 'Ask AI' },
];

/** Mirrors QueryStatus. */
export type QueryStatus =
  | 'received'
  | 'triaging'
  | 'awaiting_human'
  | 'assigned'
  | 'waiting_for_user'
  | 'answered'
  | 'resolved'
  | 'closed';

export const QUERY_STATUSES: QueryStatus[] = [
  'received',
  'triaging',
  'awaiting_human',
  'assigned',
  'waiting_for_user',
  'answered',
  'resolved',
  'closed',
];

export const QUERY_STATUS_LABELS: Record<QueryStatus, string> = {
  received: 'Received',
  triaging: 'Triaging',
  awaiting_human: 'Awaiting Human',
  assigned: 'Assigned',
  waiting_for_user: 'Waiting for You',
  answered: 'Answered',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const QUERY_STATUS_COLORS: Record<QueryStatus, string> = {
  received: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  triaging: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  awaiting_human: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  assigned: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  waiting_for_user: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  answered: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

/** Mirrors PriorityLevel. */
export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3';

export const PRIORITY_LEVELS: PriorityLevel[] = ['P0', 'P1', 'P2', 'P3'];

export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  P0: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800',
  P1: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800',
  P2: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800',
  P3: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800',
};

export const PRIORITY_DESCRIPTIONS: Record<PriorityLevel, string> = {
  P0: 'Critical – Safety / Outage (15m response / 2h resolve)',
  P1: 'High – Blocker / many users affected (1h / 4h)',
  P2: 'Medium – Human / deadline (8h / 48h)',
  P3: 'Routine – Informational (48h / 120h)',
};

/** Mirrors QueryDecision. */
export type QueryDecision =
  | 'ai_answer'
  | 'human_required'
  | 'human_review_ai_draft'
  | 'needs_information'
  | 'duplicate_redirect'
  | 'spam_rejected';

export const QUERY_DECISION_LABELS: Record<QueryDecision, string> = {
  ai_answer: 'AI Answer',
  human_required: 'Needs Human',
  human_review_ai_draft: 'Human Review AI Draft',
  needs_information: 'Needs Information',
  duplicate_redirect: 'Duplicate',
  spam_rejected: 'Spam',
};

/** Mirrors AffectedUsers. */
export type AffectedUsers = 'one' | 'several' | 'many' | 'unknown';

export const AFFECTED_USERS_OPTIONS: { value: AffectedUsers; label: string }[] = [
  { value: 'one', label: 'Just me' },
  { value: 'several', label: 'A few users' },
  { value: 'many', label: 'Many users' },
  { value: 'unknown', label: 'Unknown' },
];

/** Mirrors CAPACITY_STATUS. */
export type CapacityStatus = 'normal' | 'watch' | 'warning' | 'overload';

export const CAPACITY_STATUS_COLORS: Record<CapacityStatus, string> = {
  normal: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  watch: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  overload: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

// -----------------------------------------------------------------------------
// Payload interfaces (input to the microservice)
// -----------------------------------------------------------------------------

export interface AttachmentRef {
  fileId?: string;
  url?: string;
  mimeType?: string;
  sizeBytes?: number;
  name?: string;
}

export interface SubmitQueryPayload {
  programId: string;
  channel?: QueryChannel;
  title: string;
  body: string;
  humanRequested?: boolean;
  humanRequestReason?: string;
  affectedUsers?: AffectedUsers;
  deadlineAt?: string | null;
  userUrgencyReason?: string;
  attachments?: AttachmentRef[];
  language?: string;
  idempotencyKey?: string;
}

export interface RequestHumanPayload {
  reason: string;
}

export interface CloseCasePayload {
  satisfied: boolean;
  comment?: string;
}

export interface AnswerQueryPayload {
  answerText: string;
  resolveImmediately?: boolean;
  nominateForKnowledge?: boolean;
  status?: 'waiting_for_user' | 'resolved';
}

// -----------------------------------------------------------------------------
// Response models from the microservice
// -----------------------------------------------------------------------------

export interface SlaStatus {
  status: 'ok' | 'warning' | 'breached' | 'unknown';
  text: string;
  remainingMs?: number;
}

export interface ClassificationMetadata {
  intent?: string;
  categories?: string[];
  riskTags?: string[];
  requiresPrivateData?: boolean;
  requiresPrivilegedAction?: boolean;
  commonalityScore?: number;
  retrievalConfidence?: number;
  answerConfidence?: number;
}

export interface FinalAnswer {
  text: string;
  actorType: 'user' | 'admin' | 'system' | 'ai';
  actorId?: string;
  answeredAt?: string;
}

export interface QueryCase {
  _id: string;
  idempotencyKey?: string;
  userId?: string;
  programId: string;
  channel: QueryChannel;
  title: string;
  body: string;
  attachments?: AttachmentRef[];
  language?: string;
  humanRequested?: boolean;
  humanRequestReason?: string;
  affectedUsers?: AffectedUsers;
  deadlineAt?: string | null;
  userUrgencyReason?: string;
  classification?: ClassificationMetadata;
  decision?: QueryDecision;
  decisionReasons?: string[];
  priority?: PriorityLevel;
  slaDueAt?: string;
  status: QueryStatus;
  assignedTeam?: string;
  assignedTo?: string | null;
  claimedAt?: string | null;
  parentIncidentId?: string | null;
  isParentIncident?: boolean;
  linkedCaseCount?: number;
  finalAnswer?: FinalAnswer;
  userSatisfaction?: 'satisfied' | 'unsatisfied' | 'no_feedback' | null;
  userFeedback?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
  /** Computed by /inbox endpoint */
  queueScore?: number;
  slaStatus?: SlaStatus;
}

export interface InboxQuery extends QueryCase {
  queueScore: number;
  slaStatus: SlaStatus;
}

export interface CapacityInfo {
  status: CapacityStatus | string;
  activeCases: number;
  maxCases: number;
  utilisation: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  overloadRatio?: number;
  /** Free-form extras returned by the microservice. */
  [key: string]: any;
}

export interface InboxResponse {
  queries: InboxQuery[];
  total: number;
  limit?: number;
  skip?: number;
  capacity?: CapacityInfo;
}

export interface ResolverWorkload {
  resolverId: string;
  resolverName?: string;
  /** Alias used by some payload versions of the workload endpoint. */
  name?: string;
  activeCases: number;
  maxCases: number;
  utilisation?: number;
  /** optional p0/p1 breakdown */
  byPriority?: Partial<Record<PriorityLevel, number>>;
  /** P0 SLA timing (optional) */
  p0DueInMinutes?: number;
  p0Breached?: boolean;
  [key: string]: any;
}

export interface AuditEvent {
  _id: string;
  queryCaseId: string;
  eventType: string;
  actorType: 'user' | 'admin' | 'system' | 'ai';
  actorId?: string;
  fromStatus?: QueryStatus;
  toStatus?: QueryStatus;
  reasonCodes?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface IncidentResponse {
  /** The primary case that started the incident. */
  parent: QueryCase;
  /** Alias used by some payload versions of the endpoint. */
  parentCase?: QueryCase;
  linkedCases: QueryCase[];
  totalAffected: number;
  /** AI-generated summary of the incident cluster (optional). */
  aiSummary?: string;
  /** Overall severity tag (optional). */
  severity?: string;
  [key: string]: any;
}

export interface SubmitQueryResponse {
  queryId: string;
  status: 'received' | string;
  decision?: QueryDecision;
  priority?: PriorityLevel;
  canRequestHuman?: boolean;
  slaDueAt?: string;
  /** true when an idempotent record was returned */
  isIdempotent?: boolean;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

export const getPriorityColor = (p?: PriorityLevel | string | null) => {
  if (!p) return 'bg-gray-100 text-gray-700';
  return PRIORITY_COLORS[p as PriorityLevel] ?? 'bg-gray-100 text-gray-700';
};

export const getStatusColor = (s?: QueryStatus | string | null) => {
  if (!s) return 'bg-gray-100 text-gray-700';
  return QUERY_STATUS_COLORS[s as QueryStatus] ?? 'bg-gray-100 text-gray-700';
};