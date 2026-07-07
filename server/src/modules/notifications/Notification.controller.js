import { notificationService } from './Notification.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  res.status(200).json(ApiResponse.success({ count }, 'Fetched unread count successfully'));
});

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getUserNotifications(req.user._id);
  res.status(200).json(ApiResponse.success(notifications, 'Fetched notifications successfully'));
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  res.status(200).json(ApiResponse.success(null, 'All notifications marked as read'));
});
