import KnowledgeDocument from '../models/KnowledgeDocument.js';

class DocumentRepository {
  static async create(data) {
    return await KnowledgeDocument.create(data);
  }

  static async findById(id) {
    return await KnowledgeDocument.findById(id)
      .populate('category', 'name slug')
      .populate('tags', 'name')
      .populate('uploadedBy', 'fullName avatar');
  }

  static async findByChecksum(checksum) {
    return await KnowledgeDocument.findOne({ checksum });
  }

  static async updateStatus(id, status, approvalStatus = null) {
    const updateData = { status };
    if (approvalStatus) updateData.approvalStatus = approvalStatus;
    
    return await KnowledgeDocument.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async softDelete(id) {
    return await KnowledgeDocument.findByIdAndUpdate(id, { isDeleted: true });
  }
}

export default DocumentRepository;
