export const APPROVAL_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
};

export const VISIBILITY = {
  PUBLIC: 'public',
  INTERNAL: 'internal',
  RESTRICTED: 'restricted',
};

export const DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
};

export const CONTENT_TYPE = {
  ARTICLE: 'article',
  VIDEO: 'video',
  GUIDE: 'guide',
  POLICY: 'policy',
};

export const DOCUMENT_STATUS = {
  UPLOADING: 'uploading',
  VALIDATING: 'validating',
  PARSING: 'parsing',
  PROCESSING: 'processing',
  CHUNKING: 'chunking',
  EMBEDDING: 'embedding',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const RELATIONSHIP_TYPES = {
  PARENT: 'parent',
  CHILD: 'child',
  RELATED: 'related',
  PREREQUISITE: 'prerequisite',
  ALTERNATIVE: 'alternative',
  DUPLICATE: 'duplicate',
  CONFLICT: 'conflict',
  RECOMMENDATION: 'recommendation',
  DEPENDENCY: 'dependency',
  SUPPORTS: 'supports',
};

export const FEEDBACK_TYPES = {
  HELPFUL: 'helpful',
  UNHELPFUL: 'unhelpful',
  INCORRECT: 'incorrect',
  INCOMPLETE: 'incomplete',
  DUPLICATE: 'duplicate',
  SUGGESTION: 'suggestion',
};

export const LANGUAGES = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'hi'];
