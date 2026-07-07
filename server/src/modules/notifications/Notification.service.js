import Notification from './Notification.model.js';
import { getIO } from '../../config/socket.js';
import { logger } from '../../config/logger.js';

class NotificationService {
  /**
   * Send a real-time notification to a specific user and persist it to DB.
   */
  async notifyUser(userId, payload) {
    try {
      const notification = await Notification.create({
        userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        priority: payload.priority || 'medium',
        metadata: payload.metadata || {},
      });

      // Emit to user's personal room via Socket.IO
      try {
        const io = getIO();
        io.to(userId.toString()).emit('notification', notification);
      } catch (e) {
        // Socket not initialized or user offline, it's fine, it's in DB
      }

      return notification;
    } catch (error) {
      logger.error('Failed to notify user:', error);
    }
  }

  /**
   * Send a system-wide notification to all admins via /admin namespace
   */
  async notifyAdmins(payload) {
    try {
      // In a real system, you'd fetch all users with Role=Admin, and create Notification records.
      // For performance in this demo, we'll just emit to the /admin namespace
      try {
        const io = getIO();
        io.of('/admin').emit('system_alert', {
          title: payload.title,
          message: payload.message,
          type: payload.type,
          priority: payload.priority || 'high',
          metadata: payload.metadata,
          timestamp: new Date(),
        });
      } catch (e) {
        // Ignored
      }
    } catch (error) {
      logger.error('Failed to notify admins:', error);
    }
  }

  async getUserNotifications(userId, limit = 10) {
    return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  }

  async getUnreadCount(userId) {
    return await Notification.countDocuments({ userId, isRead: false });
  }

  async markAsRead(userId, notificationId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  }
}

export const notificationService = new NotificationService();
