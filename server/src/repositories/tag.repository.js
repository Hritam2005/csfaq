import Tag from '../models/Tag.js';

class TagRepository {
  static async create(data) {
    return await Tag.create(data);
  }

  static async findById(id) {
    return await Tag.findById(id).populate('relationships');
  }

  static async searchTags(query) {
    // Utilize text index for fast synonym/alias matching
    return await Tag.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
  }

  static async incrementPopularity(id) {
    return await Tag.findByIdAndUpdate(id, { $inc: { popularity: 1 } });
  }

  static async updateById(id, updateData) {
    return await Tag.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  static async deleteById(id) {
    return await Tag.findByIdAndDelete(id);
  }
}

export default TagRepository;
