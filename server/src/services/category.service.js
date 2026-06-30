import CategoryRepository from '../repositories/category.repository.js';
import ApiError from '../utils/ApiError.js';

class CategoryService {
  static async createCategory(data) {
    // If a parent is provided, ensure it exists
    if (data.parent) {
      const parentCat = await CategoryRepository.findById(data.parent);
      if (!parentCat) {
        throw ApiError.badRequest('Parent category does not exist');
      }
    }

    const category = await CategoryRepository.create(data);

    // If it has a parent, push this category into the parent's children array
    if (data.parent) {
      const parentCat = await CategoryRepository.findById(data.parent);
      parentCat.children.push(category._id);
      await parentCat.save();
    }

    return category;
  }

  static async getCategoryTree() {
    return await CategoryRepository.getTree();
  }

  static async updateCategory(id, data) {
    const category = await CategoryRepository.updateById(id, data);
    if (!category) throw ApiError.notFound('Category not found');
    return category;
  }
}

export default CategoryService;
