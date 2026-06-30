export const CHAT_EVENTS = {
  MESSAGE_RECEIVED: 'chat.message.received',
  MESSAGE_SENT: 'chat.message.sent',
  STREAM_STARTED: 'chat.stream.started',
  STREAM_CHUNK: 'chat.stream.chunk',
  STREAM_ENDED: 'chat.stream.ended',
  CONVERSATION_CREATED: 'chat.conversation.created',
  CONVERSATION_ARCHIVED: 'chat.conversation.archived',
  FEEDBACK_SUBMITTED: 'chat.feedback.submitted',
  BOOKMARK_CREATED: 'chat.bookmark.created',
  EXPORT_REQUESTED: 'chat.export.requested',
};

export const CHAT_FEEDBACK = {
  HELPFUL: 'helpful',
  NOT_HELPFUL: 'not_helpful',
  INCORRECT: 'incorrect',
  INCOMPLETE: 'incomplete',
  HALLUCINATION: 'hallucination',
  MISSING_INFO: 'missing_info',
  OTHER: 'other',
};

export const CONVERSATION_STATE = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  TRASHED: 'trashed', // Soft delete
};
