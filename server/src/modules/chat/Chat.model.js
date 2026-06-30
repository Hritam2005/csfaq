import mongoose from 'mongoose';
import { CHAT_FEEDBACK, CONVERSATION_STATE } from './Chat.constants.js';

/**
 * Chat-specific extensions to the Conversation model. 
 * While the AI module handles token counts, the Chat module handles UX states (Pins, Bookmarks, UI Metadata).
 */
const chatMetadataSchema = new mongoose.Schema({
  isPinned: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  tags: [String],
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  state: {
    type: String,
    enum: Object.values(CONVERSATION_STATE),
    default: CONVERSATION_STATE.ACTIVE,
  },
});

const feedbackSchema = new mongoose.Schema({
  messageId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Links to embedded message array in AI model
  type: {
    type: String,
    enum: Object.values(CHAT_FEEDBACK),
    required: true,
  },
  comment: { type: String, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const bookmarkSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  messageId: { type: mongoose.Schema.Types.ObjectId, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

export const ChatMetadata = mongoose.model('ChatMetadata', chatMetadataSchema);
export const Feedback = mongoose.model('Feedback', feedbackSchema);
export const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
