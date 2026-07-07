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

    return await FAQ.find(finalQuery, query ? { score: { $meta: 'textScore' } } : {})
      .sort(query ? { score: { $meta: 'textScore' } } : { publishedAt: -1 })
      .limit(20)
      .populate('category', 'name slug color')
      .populate('tags', 'name');
  }

  static async findPublished({ query, category, limit = 50, skip = 0 } = {}) {
    const filters = {
      isDeleted: false,
      approvalStatus: 'approved',
      visibility: 'public',
    };

    if (category) {
      filters.category = category;
    }

    if (query) {
      return this.searchFaqs(query, filters);
    }

    return await FAQ.find(filters)
      .sort({ popularityScore: -1, publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug color')
      .select('question summary slug category popularityScore helpfulCount publishedAt difficultyLevel');
  }

  static async findPopular(limit = 6) {
    return await FAQ.find({
      isDeleted: false,
      approvalStatus: 'approved',
      visibility: 'public',
    })
      .sort({ popularityScore: -1, helpfulCount: -1 })
      .limit(limit)
      .select('question summary category')
      .populate('category', 'name slug');
  }

  static async countByCategory() {
    return await FAQ.aggregate([
      { $match: { isDeleted: false, approvalStatus: 'approved', visibility: 'public' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
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
