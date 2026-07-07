import FAQRepository from '../repositories/faq.repository.js';
import CategoryRepository from '../repositories/category.repository.js';
import ApiError from '../utils/ApiError.js';
import { APPROVAL_STATUS, VISIBILITY } from '../constants/knowledge.constants.js';

class FAQService {
  static async createFaq(data, userId) {
    const category = await CategoryRepository.findById(data.category);
    if (!category) {
      throw ApiError.badRequest('Invalid category ID');
    }

    const faqData = {
      ...data,
      createdBy: userId,
      approvalStatus: data.approvalStatus || APPROVAL_STATUS.DRAFT,
    };

    return await FAQRepository.create(faqData);
  }

  static async getFaqById(id) {
    const faq = await FAQRepository.findById(id);
    if (!faq) {
      throw ApiError.notFound('FAQ not found');
    }

    FAQRepository.incrementMetric(id, 'searchCount').catch(console.error);

    return faq;
  }

  static async getPublicFaq(id) {
    const faq = await FAQRepository.findById(id);
    if (!faq || faq.isDeleted) {
      throw ApiError.notFound('FAQ not found');
    }
    if (faq.approvalStatus !== APPROVAL_STATUS.APPROVED || faq.visibility !== VISIBILITY.PUBLIC) {
      throw ApiError.notFound('FAQ not found');
    }

    FAQRepository.incrementMetric(id, 'searchCount').catch(console.error);
    return faq;
  }

  static async listPublishedFaqs(options) {
    return await FAQRepository.findPublished(options);
  }

  static async getPopularFaqs(limit = 6) {
    return await FAQRepository.findPopular(limit);
  }

  static async getCategoriesWithCounts() {
    const [categories, counts] = await Promise.all([
      CategoryRepository.findAll(),
      FAQRepository.countByCategory(),
    ]);

    const countMap = counts.reduce((acc, item) => {
      acc[item._id?.toString()] = item.count;
      return acc;
    }, {});

    return categories.map((category) => ({
      ...category.toObject(),
      faqCount: countMap[category._id.toString()] || 0,
    }));
  }

  static async searchFaqs(query, filters) {
    return await FAQRepository.searchFaqs(query, filters);
  }

  static async updateFaq(id, data, userId) {
    const updateData = {
      ...data,
      updatedBy: userId,
    };

    const faq = await FAQRepository.updateById(id, updateData);
    if (!faq) throw ApiError.notFound('FAQ not found');
    return faq;
  }

  static async publishFaq(id, userId) {
    const faq = await FAQRepository.updateById(id, {
      approvalStatus: APPROVAL_STATUS.APPROVED,
      visibility: VISIBILITY.PUBLIC,
      publishedAt: new Date(),
      updatedBy: userId,
    });
    if (!faq) throw ApiError.notFound('FAQ not found');
    return faq;
  }

  static async softDeleteFaq(id, userId) {
    const faq = await FAQRepository.softDelete(id, userId);
    if (!faq) throw ApiError.notFound('FAQ not found');
    return faq;
  }

  static async submitFeedback(id, type) {
    if (!['helpful', 'unhelpful'].includes(type)) {
      throw ApiError.badRequest('Feedback type must be helpful or unhelpful');
    }

    const metric = type === 'helpful' ? 'helpfulCount' : 'unhelpfulCount';
    const faq = await FAQRepository.incrementMetric(id, metric);
    if (!faq) throw ApiError.notFound('FAQ not found');
    return faq;
  }
}

export default FAQService;

