import asyncHandler from '../../utils/asyncHandler.js';
import { KnowledgeService } from './Knowledge.service.js';
import ApiResponse from '../../utils/ApiResponse.js';


export const getStatistics = asyncHandler(async (req, res) => {
  const stats = await KnowledgeService.getStatistics();
  res.status(200).json(ApiResponse.success(stats, 'Knowledge statistics retrieved'));
});

export const clearCache = asyncHandler(async (req, res) => {
  const result = KnowledgeService.clearCache();
  res.status(200).json(ApiResponse.success(result, 'Cache cleared'));
});


export const getConfidence = asyncHandler(async (req, res) => {
  // Utility endpoint to test confidence scoring
  const { similarity = 0.8, quality = 1.0, freshness = 1.0, popularity = 0.5 } = req.body;
  const score = KnowledgeService.calculateConfidence(similarity, quality, freshness, popularity);
  res.status(200).json(ApiResponse.success({ confidenceScore: score }, 'Confidence calculated'));
});
