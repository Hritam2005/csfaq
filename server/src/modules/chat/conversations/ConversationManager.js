import { Conversation } from '../../ai/AI.model.js';
import { ChatError, ERROR_CODES } from '../Chat.errors.js';

export class ConversationUXManager {
  /**
   * Retrieves user conversations with pagination.
   */
  static async getConversations(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    // Using the AI module's conversation model, but we omit the heavy messages array
    return await Conversation.find({ user: userId })
      .select('-messages')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  /**
   * Fetches a single conversation with full message history.
   */
  static async getConversationHistory(conversationId, userId) {
    const conv = await Conversation.findOne({ _id: conversationId, user: userId });
    if (!conv) throw new ChatError('Conversation not found', ERROR_CODES.CONVERSATION_NOT_FOUND);
    return conv;
  }

  static async renameConversation(conversationId, userId, newTitle) {
    const conv = await Conversation.findOneAndUpdate(
      { _id: conversationId, user: userId },
      { title: newTitle },
      { new: true }
    ).select('-messages');
    
    if (!conv) throw new ChatError('Conversation not found', ERROR_CODES.CONVERSATION_NOT_FOUND);
    return conv;
  }

  static async deleteConversation(conversationId, userId) {
    // Hard delete for compliance
    const result = await Conversation.deleteOne({ _id: conversationId, user: userId });
    if (result.deletedCount === 0) {
      throw new ChatError('Conversation not found', ERROR_CODES.CONVERSATION_NOT_FOUND);
    }
    return true;
  }
}
