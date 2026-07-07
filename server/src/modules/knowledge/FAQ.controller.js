import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import FAQService from '../../services/faq.service.js';
import FAQ from '../../models/FAQ.js';

export const listFaqs = asyncHandler(async (req, res) => {
  const { q, category, limit, skip } = req.query;
  const faqs = await FAQService.listPublishedFaqs({
    query: q,
    category,
    limit: limit ? Number(limit) : 50,
    skip: skip ? Number(skip) : 0,
  });
  res.status(200).json(ApiResponse.success(faqs, 'FAQs retrieved'));
});

export const getPopularFaqs = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 6;
  const faqs = await FAQService.getPopularFaqs(limit);
  res.status(200).json(ApiResponse.success(faqs, 'Popular FAQs retrieved'));
});

export const getFaq = asyncHandler(async (req, res) => {
  const faq = await FAQService.getPublicFaq(req.params.id);
  res.status(200).json(ApiResponse.success(faq, 'FAQ retrieved'));
});

export const submitFaqFeedback = asyncHandler(async (req, res) => {
  const { type } = req.body;
  const faq = await FAQService.submitFeedback(req.params.id, type);
  res.status(200).json(ApiResponse.success(faq, 'Feedback recorded'));
});

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await FAQService.getCategoriesWithCounts();
  res.status(200).json(ApiResponse.success(categories, 'Categories retrieved'));
});

export const createFaq = asyncHandler(async (req, res) => {
  const faq = await FAQService.createFaq(req.body, req.user._id);
  res.status(201).json(ApiResponse.success(faq, 'FAQ created', 201));
});

export const updateFaq = asyncHandler(async (req, res) => {
  const faq = await FAQService.updateFaq(req.params.id, req.body, req.user._id);
  res.status(200).json(ApiResponse.success(faq, 'FAQ updated'));
});

export const deleteFaq = asyncHandler(async (req, res) => {
  await FAQService.softDeleteFaq(req.params.id, req.user._id);
  res.status(200).json(ApiResponse.success(null, 'FAQ deleted'));
});

export const publishFaq = asyncHandler(async (req, res) => {
  const faq = await FAQService.publishFaq(req.params.id, req.user._id);
  res.status(200).json(ApiResponse.success(faq, 'FAQ published'));
});

export const listAllFaqsAdmin = asyncHandler(async (req, res) => {
  const faqs = await FAQ.find({ isDeleted: false })
    .sort({ updatedAt: -1 })
    .populate('category', 'name slug')
    .select('question approvalStatus visibility publishedAt helpfulCount category updatedAt');
  res.status(200).json(ApiResponse.success(faqs, 'All FAQs retrieved'));
});
