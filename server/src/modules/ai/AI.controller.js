import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { AIOrchestrator } from './orchestrator/AIOrchestrator.js';
import { AIAnalytics } from './analytics/AIAnalytics.js';
import { ConversationManager } from './orchestrator/ConversationManager.js';
import { ProviderFactory } from './providers/ProviderFactory.js';
import { TokenStreamer } from './streaming/TokenStreamer.js';

export const chat = asyncHandler(async (req, res) => {
  const { prompt, conversationId, filters } = req.body;
  const user = req.user; // from auth middleware

  if (!prompt) return res.status(400).json(ApiResponse.error('Prompt is required'));

  const result = await AIOrchestrator.chat(prompt, conversationId, user, filters);
  res.status(200).json(ApiResponse.success(result, 'AI response generated'));
});

export const streamChat = asyncHandler(async (req, res) => {
  // Simplified implementation just demonstrating streaming binding
  const { prompt } = req.body;
  const provider = ProviderFactory.getProvider('openai');
  const generator = provider.stream([{ role: 'user', content: prompt }]);
  
  await TokenStreamer.streamResponse(res, generator);
});

export const getStatistics = asyncHandler(async (req, res) => {
  const stats = await AIAnalytics.getUsageStatistics(30);
  res.status(200).json(ApiResponse.success(stats || {}, 'AI statistics retrieved'));
});
