import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { ChatService } from './Chat.service.js';

export const sendMessage = asyncHandler(async (req, res) => {
  const { prompt, conversationId, filters } = req.body;
  const user = req.user; // populated by auth middleware

  if (!prompt) return res.status(400).json(ApiResponse.error('Prompt is required'));

  const result = await ChatService.processMessage(prompt, conversationId, user, filters);
  res.status(200).json(ApiResponse.success(result, 'Message processed successfully'));
});

export const streamMessage = asyncHandler(async (req, res) => {
  const { prompt, conversationId, filters } = req.body;
  const user = req.user;

  if (!prompt) return res.status(400).json(ApiResponse.error('Prompt is required'));

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    await ChatService.streamMessage(prompt, conversationId, user, filters, res);
  } catch (error) {
    console.error('Streaming error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

export const getConversations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const convs = await ChatService.getConversations(req.user._id, page);
  res.status(200).json(ApiResponse.success(convs, 'Conversations retrieved'));
});

export const getHistory = asyncHandler(async (req, res) => {
  const history = await ChatService.getHistory(req.params.id, req.user._id);
  res.status(200).json(ApiResponse.success(history, 'Conversation history retrieved'));
});

export const renameConversation = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const conv = await ChatService.renameConversation(req.params.id, req.user._id, title);
  res.status(200).json(ApiResponse.success(conv, 'Conversation renamed'));
});

export const deleteConversation = asyncHandler(async (req, res) => {
  await ChatService.deleteConversation(req.params.id, req.user._id);
  res.status(200).json(ApiResponse.success({}, 'Conversation deleted'));
});

export const addBookmark = asyncHandler(async (req, res) => {
  const { messageId, note } = req.body;
  const bookmark = await ChatService.addBookmark(req.params.id, messageId, req.user._id, note);
  res.status(201).json(ApiResponse.success(bookmark, 'Bookmark added'));
});

export const submitFeedback = asyncHandler(async (req, res) => {
  const { type, comment } = req.body;
  const feedback = await ChatService.submitFeedback(req.params.messageId, req.user._id, type, comment);
  res.status(201).json(ApiResponse.success(feedback, 'Feedback submitted'));
});
