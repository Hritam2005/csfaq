import { Feedback } from '../Chat.model.js';

export class FeedbackService {
  /**
   * Submits user feedback (thumbs up/down + categorization) for a specific AI message.
   */
  static async submitFeedback(messageId, userId, type, comment = '') {
    // Upsert feedback so a user can change their mind (e.g. Helpful -> Not Helpful)
    return await Feedback.findOneAndUpdate(
      { messageId, user: userId },
      { type, comment },
      { upsert: true, new: true }
    );
  }

  /**
   * Retrieves aggregated feedback analytics for admin dashboards.
   */
  static async getFeedbackStats() {
    return await Feedback.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
  }
}
