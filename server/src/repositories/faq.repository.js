import mongoose from 'mongoose';
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
    const finalQuery = { ...filters };
    if (query) {
      const tokens = query.split(/\s+/).filter(Boolean);
      if (tokens.length > 0) {
        const regexes = tokens.map(t => new RegExp(t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'));
        
        // Find matching tag IDs
        let tagIds = [];
        try {
          const Tag = mongoose.model('Tag');
          const matchedTags = await Tag.find({
            $or: regexes.map(regex => ({
              $or: [{ name: regex }, { synonyms: regex }, { aliases: regex }]
            }))
          }).select('_id');
          tagIds = matchedTags.map(t => t._id);
        } catch (e) {
          console.error("Error finding matching tags:", e);
        }

        // Find matching category IDs
        let categoryIds = [];
        try {
          const Category = mongoose.model('Category');
          const matchedCategories = await Category.find({
            $or: regexes.map(regex => ({
              $or: [{ name: regex }, { description: regex }]
            }))
          }).select('_id');
          categoryIds = matchedCategories.map(c => c._id);
        } catch (e) {
          console.error("Error finding matching categories:", e);
        }

        // Search criteria: match by question/answer text OR linked category OR linked tag
        finalQuery.$or = [
          {
            $and: regexes.map(regex => ({
              $or: [
                { question: regex },
                { answer: regex },
                { keywords: regex }
              ]
            }))
          }
        ];

        if (categoryIds.length > 0) {
          finalQuery.$or.push({ category: { $in: categoryIds } });
        }
        if (tagIds.length > 0) {
          finalQuery.$or.push({ tags: { $in: tagIds } });
        }
      }
    }
    return await FAQ.find(finalQuery)
      .sort({ helpfulCount: -1, popularityScore: -1 })
      .limit(100)
      .populate('category', 'name slug color icon')
      .populate('tags', 'name slug color');
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
