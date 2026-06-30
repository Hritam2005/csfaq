import { Router } from 'express';
import {
  sendMessage,
  streamMessage,
  getConversations,
  getHistory,
  renameConversation,
  deleteConversation,
  addBookmark,
  submitFeedback
} from './Chat.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// All chat routes require an authenticated user
router.use(authenticate);

// Messaging
router.post('/', sendMessage);
router.post('/stream', streamMessage);

// Conversations UX
router.get('/conversations', getConversations);
router.get('/conversations/:id', getHistory);
router.put('/conversations/:id', renameConversation);
router.delete('/conversations/:id', deleteConversation);

// Bookmarks & Feedback
router.post('/conversations/:id/bookmark', addBookmark);
router.post('/messages/:messageId/feedback', submitFeedback);

export default router;
