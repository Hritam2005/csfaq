import Category from '../models/Category.js';

class CategoryRepository {
  static async create(data) {
    return await Category.create(data);
  }

  static async findById(id) {
    return await Category.findById(id).populate('parent').populate('children');
  }

  static async findBySlug(slug) {
    return await Category.findOne({ slug }).populate('parent').populate('children');
  }

  static async findAll() {
    return await Category.find().sort({ order: 1 });
  }

  static async getTree() {
    // Return categories that have no parent (roots), and populate children deeply
    return await Category.find({ parent: null })
      .populate({
        path: 'children',
        populate: {
          path: 'children',
        },
      })
      .sort({ order: 1 });
  }

  static async updateById(id, updateData) {
    return await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  static async deleteById(id) {
    return await Category.findByIdAndDelete(id);
  }
}

export default CategoryRepository;
