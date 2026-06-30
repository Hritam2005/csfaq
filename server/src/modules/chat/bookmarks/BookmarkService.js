import { Bookmark } from '../Chat.model.js';
import { Conversation } from '../../ai/AI.model.js';
import { ChatError, ERROR_CODES } from '../Chat.errors.js';

export class BookmarkService {
  /**
   * Saves a specific message from a conversation to the user's bookmarks.
   */
  static async addBookmark(conversationId, messageId, userId, note = '') {
    // Verify conversation exists and user owns it (or it's shared)
    const conv = await Conversation.findOne({ _id: conversationId, user: userId });
    if (!conv) throw new ChatError('Conversation not found', ERROR_CODES.CONVERSATION_NOT_FOUND);

    const messageExists = conv.messages.id(messageId);
    if (!messageExists) throw new ChatError('Message not found in conversation', ERROR_CODES.VALIDATION_ERROR);

    return await Bookmark.create({
      conversationId,
      messageId,
      user: userId,
      note
    });
  }

  static async getUserBookmarks(userId) {
    return await Bookmark.find({ user: userId })
      .populate('conversationId', 'title')
      .sort({ createdAt: -1 });
  }

  static async removeBookmark(bookmarkId, userId) {
    return await Bookmark.findOneAndDelete({ _id: bookmarkId, user: userId });
  }
}
