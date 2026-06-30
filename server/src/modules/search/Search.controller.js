import asyncHandler from '../../utils/asyncHandler.js';
import { SearchService } from './Search.service.js';
import { Autocomplete } from './autocomplete/Autocomplete.js';
import { SearchAnalytics } from './analytics/SearchAnalytics.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const searchHybrid = asyncHandler(async (req, res) => {
  const { q, ...filters } = req.query;
  const user = req.user || null;
  
  if (!q) {
    return res.status(400).json(ApiResponse.error('Query parameter "q" is required'));
  }

  const result = await SearchService.executeHybridSearch(q, filters, user);
  res.status(200).json(ApiResponse.success(result, 'Search completed'));
});

export const autocomplete = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const suggestions = await Autocomplete.suggest(q, 5);
  res.status(200).json(ApiResponse.success(suggestions, 'Autocomplete generated'));
});

export const getTrending = asyncHandler(async (req, res) => {
  const trending = await SearchAnalytics.getTrendingQueries(24, 10);
  res.status(200).json(ApiResponse.success(trending, 'Trending queries retrieved'));
});

export const getKnowledgeGaps = asyncHandler(async (req, res) => {
  const gaps = await SearchAnalytics.getZeroResultQueries(20);
  res.status(200).json(ApiResponse.success(gaps, 'Knowledge gaps retrieved'));
});
