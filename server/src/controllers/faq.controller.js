import asyncHandler from '../utils/asyncHandler.js';
import FAQService from '../services/faq.service.js';
import CategoryService from '../services/category.service.js';
import FAQRepository from '../repositories/faq.repository.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

export const getAllFaqs = asyncHandler(async (req, res) => {
  const { q, category } = req.query;
  const filters = {
    isDeleted: false,
    // Note: To show seeded FAQs, we will check their approval status.
    // If they are seeded as 'approved' and 'public', filter for that.
    approvalStatus: 'approved',
    visibility: 'public'
  };
  
  if (category) {
    filters.category = category;
  }

  const faqs = await FAQService.searchFaqs(q, filters);
  res.status(200).json(ApiResponse.success(faqs, 'FAQs retrieved successfully'));
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await CategoryService.getCategoryTree();
  res.status(200).json(ApiResponse.success(categories, 'Categories retrieved successfully'));
});

export const getFaqById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const faq = await FAQService.getFaqById(id);
  res.status(200).json(ApiResponse.success(faq, 'FAQ retrieved successfully'));
});

export const voteFaqHelpfulness = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { vote } = req.body; // 'helpful' or 'unhelpful'
  
  if (!['helpful', 'unhelpful'].includes(vote)) {
    throw ApiError.badRequest('Invalid vote type. Must be "helpful" or "unhelpful"');
  }
  
  const metric = vote === 'helpful' ? 'helpfulCount' : 'unhelpfulCount';
  const faq = await FAQRepository.incrementMetric(id, metric);
  
  if (!faq) {
    throw ApiError.notFound('FAQ not found');
  }
  
  res.status(200).json(ApiResponse.success(faq, 'Vote recorded successfully'));
});
