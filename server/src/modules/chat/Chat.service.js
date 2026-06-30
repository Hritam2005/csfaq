import { AIOrchestrator } from '../ai/orchestrator/AIOrchestrator.js';
import { ConversationUXManager } from './conversations/ConversationManager.js';
import { BookmarkService } from './bookmarks/BookmarkService.js';
import { FeedbackService } from './feedback/FeedbackService.js';
import { SuggestedQuestions } from './suggestions/SuggestedQuestions.js';

export class ChatService {
  /**
   * Primary entry point for a user message.
   * Wraps the strict AI Orchestrator and decorates it with Chat UX features (suggestions).
   */
  static async processMessage(prompt, conversationId, user, filters = {}) {
    // 1. Let the AI Orchestrator handle security, retrieval, LLM, and DB persistence
    const aiResult = await AIOrchestrator.chat(prompt, conversationId, user, filters);

    // 2. Generate UX Enhancements (Suggestions based on the response)
    const suggestions = SuggestedQuestions.generate(aiResult.response);

    return {
      conversationId: aiResult.conversationId,
      response: aiResult.response,
      citations: aiResult.citations,
      suggestions,
    };
  }

  static async streamMessage(prompt, conversationId, user, filters = {}, res) {
    // 1. Hook the Orchestrator into streaming mode
    // The Orchestrator will write SSE events to `res`.
    await AIOrchestrator.streamChat(prompt, conversationId, user, filters, res);
    
    // Suggestion logic could optionally be emitted as a final SSE event from within Orchestrator,
    // or appended here. For simplicity, we'll let Orchestrator emit a `[DONE]` event.
  }
  static async streamMessageSocket(prompt, conversationId, user, filters = {}, socket) {
    // Hook the Orchestrator into WebSocket streaming mode
    await AIOrchestrator.streamChatSocket(prompt, conversationId, user, filters, socket);
    // Suggestion logic could optionally be emitted as a final socket event from within Orchestrator
  }
  static async getConversations(userId, page) {
    return await ConversationUXManager.getConversations(userId, page);
  }

  static async getHistory(conversationId, userId) {
    return await ConversationUXManager.getConversationHistory(conversationId, userId);
  }

  static async renameConversation(conversationId, userId, newTitle) {
    return await ConversationUXManager.renameConversation(conversationId, userId, newTitle);
  }

  static async deleteConversation(conversationId, userId) {
    return await ConversationUXManager.deleteConversation(conversationId, userId);
  }

  static async addBookmark(conversationId, messageId, userId, note) {
    return await BookmarkService.addBookmark(conversationId, messageId, userId, note);
  }

  static async submitFeedback(messageId, userId, type, comment) {
    return await FeedbackService.submitFeedback(messageId, userId, type, comment);
  }
}
