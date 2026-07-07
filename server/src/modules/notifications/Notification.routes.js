import { Router } from 'express';
import { getUnreadCount, getNotifications, markAllAsRead } from './Notification.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/mark-all-read', markAllAsRead);

export default router;
