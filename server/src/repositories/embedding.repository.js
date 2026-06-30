import Embedding from '../models/Embedding.js';

class EmbeddingRepository {
  static async createBatch(embeddings) {
    return await Embedding.insertMany(embeddings);
  }

  static async findByTextHash(hash) {
    return await Embedding.findOne({ textHash: hash });
  }

  static async getEmbeddingForChunk(chunkId) {
    return await Embedding.findOne({ chunkReference: chunkId });
  }

  static async deleteByChunkIds(chunkIds) {
    return await Embedding.deleteMany({ chunkReference: { $in: chunkIds } });
  }
}

export default EmbeddingRepository;
