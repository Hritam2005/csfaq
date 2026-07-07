import mongoose from 'mongoose';

// =============================================================================
// Domain Type Definitions
// =============================================================================

export const QueryChannel = {
  UNIFIED_INTAKE: 'unified_intake',
  COMMUNITY: 'community',
  SUPPORT: 'support',
  FAQ_SEARCH: 'faq_search',
  ASK_AI: 'ask_ai',
};

export const QueryDecision = {
  AI_ANSWER: 'ai_answer',
  HUMAN_REQUIRED: 'human_required',
  HUMAN_REVIEW_AI_DRAFT: 'human_review_ai_draft',
  NEEDS_INFORMATION: 'needs_information',
  DUPLICATE_REDIRECT: 'duplicate_redirect',
  SPAM_REJECTED: 'spam_rejected',
};

export const QueryStatus = {
  RECEIVED: 'received',
  TRIAGING: 'triaging',
  AWAITING_HUMAN: 'awaiting_human',
  ASSIGNED: 'assigned',
  WAITING_FOR_USER: 'waiting_for_user',
  ANSWERED: 'answered',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const PriorityLevel = {
  P0: 'P0',
  P1: 'P1',
  P2: 'P2',
  P3: 'P3',
};

export const ActorType = {
  USER: 'user',
  ADMIN: 'admin',
  SYSTEM: 'system',
  AI: 'ai',
};

export const AffectedUsers = {
  ONE: 'one',
  SEVERAL: 'several',
  MANY: 'many',
  UNKNOWN: 'unknown',
};

// =============================================================================
// QueryCase Schema
// =============================================================================

const attachmentRefSchema = new mongoose.Schema({
  fileId: { type: String },
  url: { type: String },
  mimeType: { type: String },
  sizeBytes: { type: Number },
}, { _id: false });

const externalRefSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['CommunityPost', 'SupportRequest', 'UnresolvedSearch'],
  },
  id: { type: String },
}, { _id: false });

const evidenceRefSchema = new mongoose.Schema({
  sourceType: {
    type: String,
    enum: ['faq', 'community', 'transcript', 'policy'],
    required: true,
  },
  sourceId: { type: String, required: true },
  sourceVersion: { type: String },
  score: { type: Number, default: 0 },
  approved: { type: Boolean, default: false },
  programId: { type: String, required: true },
}, { _id: false });

const classificationMetadataSchema = new mongoose.Schema({
  intent: { type: String, default: 'unknown' },
  categories: [{ type: String }],
  riskTags: [{ type: String }],
  requiresPrivateData: { type: Boolean, default: false },
  requiresPrivilegedAction: { type: Boolean, default: false },
  commonalityScore: { type: Number, default: 0 },
  retrievalConfidence: { type: Number, default: 0 },
  answerConfidence: { type: Number, default: 0 },
}, { _id: false });

const aiDraftSchema = new mongoose.Schema({
  text: { type: String },
  model: { type: String },
  promptVersion: { type: String },
  visibleToUser: { type: Boolean, default: false },
}, { _id: false });

const finalAnswerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  actorType: {
    type: String,
    enum: Object.values(ActorType),
    required: true,
  },
  actorId: { type: String },
  answeredAt: { type: Date, default: Date.now },
}, { _id: false });

const queryCaseSchema = new mongoose.Schema(
  {
    // Unique idempotency key to prevent duplicate submissions
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    // User identification
    userId: {
      type: String,
      index: true,
    },
    programId: {
      type: String,
      required: true,
      index: true,
    },
    
    // Channel metadata
    channel: {
      type: String,
      enum: Object.values(QueryChannel),
      default: QueryChannel.UNIFIED_INTAKE,
      index: true,
    },
    externalRef: externalRefSchema,
    
    // Query content
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    attachments: [attachmentRefSchema],
    language: {
      type: String,
      default: 'en',
    },
    
    // Human override flag
    humanRequested: {
      type: Boolean,
      default: false,
    },
    humanRequestReason: {
      type: String,
    },
    
    // Impact assessment
    affectedUsers: {
      type: String,
      enum: Object.values(AffectedUsers),
      default: AffectedUsers.ONE,
    },
    deadlineAt: {
      type: Date,
    },
    userUrgencyReason: {
      type: String,
    },
    
    // Classification & Decision
    classification: {
      type: classificationMetadataSchema,
      default: () => ({}),
    },
    decision: {
      type: String,
      enum: Object.values(QueryDecision),
      default: QueryDecision.HUMAN_REQUIRED,
    },
    decisionReasons: [{
      type: String,
    }],
    policyVersion: {
      type: String,
      default: '1.0',
    },
    
    // Priority & SLA
    priority: {
      type: String,
      enum: Object.values(PriorityLevel),
      default: PriorityLevel.P3,
      index: true,
    },
    slaDueAt: {
      type: Date,
      index: true,
    },
    
    // Status & Assignment
    status: {
      type: String,
      enum: Object.values(QueryStatus),
      default: QueryStatus.RECEIVED,
      index: true,
    },
    assignedTeam: {
      type: String,
    },
    assignedTo: {
      type: String,
      index: true,
    },
    claimedAt: {
      type: Date,
    },
    
    // Clustering for duplicate detection
    parentIncidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QueryCase',
      index: true,
    },
    isParentIncident: {
      type: Boolean,
      default: false,
    },
    linkedCaseCount: {
      type: Number,
      default: 0,
    },
    
    // Evidence for RAG verification
    evidence: [evidenceRefSchema],
    
    // AI Draft (private, not shown to user unless approved)
    aiDraft: aiDraftSchema,
    
    // Final Resolution
    finalAnswer: finalAnswerSchema,
    
    // Timestamps
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
    
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    
    // User feedback
    userSatisfaction: {
      type: String,
      enum: ['satisfied', 'unsatisfied', 'no_feedback', null],
      default: null,
    },
    userFeedback: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// =============================================================================
// Indexes for Performance
// =============================================================================

queryCaseSchema.index({ status: 1, priority: 1, slaDueAt: 1 });
queryCaseSchema.index({ assignedTo: 1, status: 1 });
queryCaseSchema.index({ programId: 1, status: 1 });
queryCaseSchema.index({ createdAt: -1 });
queryCaseSchema.index({ title: 'text', body: 'text' });

// =============================================================================
// Instance Methods
// =============================================================================

/**
 * Check if transition to a new status is valid
 */
queryCaseSchema.methods.canTransitionTo = function (nextStatus) {
  const validTransitions = {
    [QueryStatus.RECEIVED]: [QueryStatus.TRIAGING],
    [QueryStatus.TRIAGING]: [QueryStatus.AWAITING_HUMAN, QueryStatus.ANSWERED],
    [QueryStatus.AWAITING_HUMAN]: [QueryStatus.ASSIGNED],
    [QueryStatus.ASSIGNED]: [QueryStatus.WAITING_FOR_USER, QueryStatus.RESOLVED],
    [QueryStatus.WAITING_FOR_USER]: [QueryStatus.ASSIGNED],
    [QueryStatus.ANSWERED]: [QueryStatus.CLOSED, QueryStatus.AWAITING_HUMAN],
    [QueryStatus.RESOLVED]: [QueryStatus.CLOSED],
    [QueryStatus.CLOSED]: [],
  };
  
  return validTransitions[this.status]?.includes(nextStatus) || false;
};

/**
 * Check if SLA is breached
 */
queryCaseSchema.methods.isSlaBreached = function () {
  if (!this.slaDueAt) return false;
  return new Date() > new Date(this.slaDueAt);
};

/**
 * Get age in hours
 */
queryCaseSchema.methods.getAgeHours = function () {
  return (Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60);
};

// =============================================================================
// Static Methods
// =============================================================================

/**
 * Calculate priority based on various factors
 */
queryCaseSchema.statics.calculatePriority = function (queryData) {
  const {
    humanRequested,
    affectedUsers,
    deadlineAt,
    classification,
    decisionReasons = [],
  } = queryData;
  
  // P0: Safety/security, system-wide outage
  if (decisionReasons.some(r => 
    ['SAFETY_EMERGENCY', 'SYSTEM_WIDE_OUTAGE', 'HARASSMENT', 'DATA_LEAK'].includes(r)
  )) {
    return PriorityLevel.P0;
  }
  
  // Check for imminient deadline (within 24h) with impact
  if (deadlineAt) {
    const hoursUntilDeadline = (new Date(deadlineAt) - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilDeadline <= 24 && hoursUntilDeadline > 0) {
      return PriorityLevel.P1;
    }
  }
  
  // P1: Blocked submission, outage affecting many
  if (
    decisionReasons.includes('BLOCKED_SUBMISSION') ||
    decisionReasons.includes('OUTAGE_REPORTED') ||
    affectedUsers === AffectedUsers.MANY
  ) {
    return PriorityLevel.P1;
  }
  
  // P2: Individual account issues, payment disputes
  if (
    classification?.requiresPrivateData ||
    classification?.requiresPrivilegedAction ||
    decisionReasons.includes('PRIVILEGED_DATA_REQUIRED')
  ) {
    return PriorityLevel.P2;
  }
  
  // Human requested goes to P2 minimum
  if (humanRequested) {
    return PriorityLevel.P2;
  }
  
  return PriorityLevel.P3;
};

const QueryCase = mongoose.model('QueryCase', queryCaseSchema);

export default QueryCase;