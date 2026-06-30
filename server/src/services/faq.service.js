import FAQRepository from '../repositories/faq.repository.js';
import CategoryRepository from '../repositories/category.repository.js';
import ApiError from '../utils/ApiError.js';

class FAQService {
  static async createFaq(data, userId) {
    // Ensure category exists
    const category = await CategoryRepository.findById(data.category);
    if (!category) {
      throw ApiError.badRequest('Invalid category ID');
    }

    const faqData = {
      ...data,
      createdBy: userId,
      approvalStatus: 'draft', // By default, requires review
    };

    return await FAQRepository.create(faqData);
  }

  static async getFaqById(id) {
    const faq = await FAQRepository.findById(id);
    if (!faq) {
      throw ApiError.notFound('FAQ not found');
    }
    
    // Async fire-and-forget metric increment
    FAQRepository.incrementMetric(id, 'searchCount').catch(console.error);
    
    return faq;
  }

  static async searchFaqs(query, filters) {
    return await FAQRepository.searchFaqs(query, filters);
  }

  static async updateFaq(id, data, userId) {
    const updateData = {
      ...data,
      updatedBy: userId,
      version: data.version ? data.version + 1 : undefined, // simple version bump logic could be moved to pre-save hook
    };

    const faq = await FAQRepository.updateById(id, updateData);
    if (!faq) throw ApiError.notFound('FAQ not found');
    return faq;
  }

  static async softDeleteFaq(id, userId) {
    const faq = await FAQRepository.softDelete(id, userId);
    if (!faq) throw ApiError.notFound('FAQ not found');
    return faq;
  }
}

export default FAQService;
