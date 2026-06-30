import FAQ from '../models/FAQ.js';

class FAQRepository {
  static async create(data) {
    return await FAQ.create(data);
  }

  static async findById(id) {
    return await FAQ.findById(id)
      .populate('category', 'name slug')
      .populate('tags', 'name slug color')
      .populate('relatedFaqs', 'question slug')
      .populate('createdBy', 'fullName avatar');
  }

  static async findBySlug(slug) {
    return await FAQ.findOne({ slug })
      .populate('category')
      .populate('tags')
      .populate('relatedFaqs');
  }

  static async searchFaqs(query, filters = {}) {
    // Initial Text Search via MongoDB Text Index
    const searchFilter = query ? { $text: { $search: query } } : {};
    const finalQuery = { ...searchFilter, ...filters };

    return await FAQ.find(finalQuery, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .populate('category', 'name')
      .populate('tags', 'name');
  }

  static async updateById(id, updateData) {
    return await FAQ.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  static async softDelete(id, userId) {
    return await FAQ.findByIdAndUpdate(id, {
      isDeleted: true,
      updatedBy: userId,
      archivedAt: new Date(),
      approvalStatus: 'archived',
    });
  }

  static async incrementMetric(id, metric) {
    // metric can be 'helpfulCount', 'unhelpfulCount', 'viewCount', 'searchCount'
    const incQuery = {};
    incQuery[metric] = 1;
    return await FAQ.findByIdAndUpdate(id, { $inc: incQuery });
  }
}

export default FAQRepository;
