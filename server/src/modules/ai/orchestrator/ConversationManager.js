import { Conversation } from '../AI.model.js';
import { AIError, ERROR_CODES } from '../AI.errors.js';

export class ConversationManager {
  /**
   * Retrieves or creates a conversation state.
   */
  static async getConversation(conversationId, userId) {
    if (!conversationId) {
      return await Conversation.create({ user: userId, messages: [] });
    }

    const conversation = await Conversation.findOne({ _id: conversationId, user: userId });
    if (!conversation) {
      throw new AIError('Conversation not found or unauthorized', ERROR_CODES.INVALID_CONFIGURATION);
    }
    return conversation;
  }

  /**
   * Compresses message history to fit context windows.
   */
  static getRecentHistory(conversation, limit = 5) {
    if (!conversation || !conversation.messages) return [];
    
    // Return last X messages to maintain memory without exceeding token limits
    return conversation.messages.slice(-limit).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Appends interaction to persistent memory.
   */
  static async appendTurn(conversation, userMessage, assistantMessage, citations = []) {
    conversation.messages.push({
      role: 'user',
      content: userMessage,
    });
    
    conversation.messages.push({
      role: 'assistant',
      content: assistantMessage,
      citations,
    });

    await conversation.save();
    return conversation;
  }
}
