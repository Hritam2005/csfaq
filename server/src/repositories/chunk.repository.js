import DocumentChunk from '../models/DocumentChunk.js';

class ChunkRepository {
  static async createBatch(chunks) {
    // Insert many chunks at once for performance
    return await DocumentChunk.insertMany(chunks);
  }

  static async findByDocumentId(documentId, version = 1) {
    return await DocumentChunk.find({ document: documentId, version })
      .sort({ chunkNumber: 1 });
  }

  static async deleteByDocumentId(documentId) {
    return await DocumentChunk.deleteMany({ document: documentId });
  }

  static async attachEmbedding(chunkId, embeddingId) {
    return await DocumentChunk.findByIdAndUpdate(chunkId, { embeddingId });
  }
}

export default ChunkRepository;
