// =============================================================================
// Query Triage Constants
// =============================================================================

export const DECISION_REASONS = {
  // Hard Human Gates
  USER_REQUESTED_HUMAN: 'USER_REQUESTED_HUMAN',
  PRIVILEGED_DATA_REQUIRED: 'PRIVILEGED_DATA_REQUIRED',
  POLICY_APPEAL: 'POLICY_APPEAL',
  SAFETY_EMERGENCY: 'SAFETY_EMERGENCY',
  SYSTEM_WIDE_OUTAGE: 'SYSTEM_WIDE_OUTAGE',
  HARASSMENT: 'HARASSMENT',
  DATA_LEAK: 'DATA_LEAK',
  LEGAL_RISK: 'LEGAL_RISK',
  NEAR_DEADLINE: 'NEAR_DEADLINE',
  
  // High Risk
  BLOCKED_SUBMISSION: 'BLOCKED_SUBMISSION',
  OUTAGE_REPORTED: 'OUTAGE_REPORTED',
  
  // RAG Related
  HIGH_CONFIDENCE_RAG: 'HIGH_CONFIDENCE_RAG',
  MEDIUM_CONFIDENCE_RAG: 'MEDIUM_CONFIDENCE_RAG',
  LOW_CONFIDENCE_RAG: 'LOW_CONFIDENCE_RAG',
  CROSS_PROGRAM_SOURCE: 'CROSS_PROGRAM_SOURCE',
  STALE_SOURCE: 'STALE_SOURCE',
  
  // Resolution
  USER_SATISFIED: 'USER_SATISFIED',
  USER_UNSATISFIED: 'USER_UNSATISFIED',
  DUPLICATE_DETECTED: 'DUPLICATE_DETECTED',
};

export const RISK_TAGS = {
  PRIVATE_DATA: 'private_data',
  PRIVILEGED_ACTION: 'privileged_action',
  FINANCIAL: 'financial',
  GRADE: 'grade',
  ATTENDANCE: 'attendance',
  POLICY: 'policy',
  EMERGENCY: 'emergency',
  HARASSMENT: 'harassment',
  MENTAL_HEALTH: 'mental_health',
};

export const EVENT_TYPES = {
  // Lifecycle Events
  CREATED: 'query_created',
  UPDATED: 'query_updated',
  DELETED: 'query_deleted',
  TRIAGE_STARTED: 'triage_started',
  TRIAGE_COMPLETED: 'triage_completed',
  
  // Decision Events
  DECISION_AI_ANSWER: 'decision_ai_answer',
  DECISION_HUMAN_REQUIRED: 'decision_human_required',
  DECISION_DUPLICATE: 'decision_duplicate',
  
  // Assignment Events
  CLAIMED: 'case_claimed',
  UNCLAIMED: 'case_unclaimed',
  
  // Resolution Events
  ANSWERED: 'answered',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  PROMOTED_TO_FAQ: 'promoted_to_faq',
  
  // User Interaction
  USER_FEEDBACK: 'user_feedback',
  USER_REQUESTED_HUMAN: 'user_requested_human',
  
  // System Events
  SLA_WARNING: 'sla_warning',
  SLA_BREACHED: 'sla_breached',
  CLUSTERED: 'clustered',
};

export const CAPACITY_STATUS = {
  NORMAL: 'normal',
  WATCH: 'watch',
  WARNING: 'warning',
  OVERLOAD: 'overload',
};

export default {
  DECISION_REASONS,
  RISK_TAGS,
  EVENT_TYPES,
  CAPACITY_STATUS,
};