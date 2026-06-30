import { EmbeddingFactory } from '../../ai/embeddings/EmbeddingFactory.js';
import { VectorStoreFactory } from '../../ai/vector-store/VectorStoreFactory.js';

export class SemanticSearch {
  /**
   * Executes a vector similarity search (k-NN) using the Embedding Pipeline.
   */
  static async search(parsedQuery, limit = 10) {
    if (!parsedQuery.normalized) return { chunks: [] };

    try {
      const embeddingProvider = EmbeddingFactory.getProvider('openai');
      const queryVector = await embeddingProvider.generateEmbedding(parsedQuery.normalized);

      const vectorStore = VectorStoreFactory.getStore('atlas');
      const results = await vectorStore.search(queryVector, limit);

      // Map back to the legacy Search structure so SearchRanker understands it
      return {
        chunks: results.map(r => ({
          _id: r.id,
          document: { _id: r.metadata.documentId, isDeleted: false }, // Mocking document struct for SearchRanker if needed
          text: r.text,
          chunkNumber: r.metadata.chunkNumber,
          pageNumber: r.metadata.pageNumber,
          heading: r.metadata.heading,
          _type: 'chunk',
          _score: r.score
        }))
      };
    } catch (error) {
      console.warn('Vector Search failed:', error);
      return { chunks: [] };
    }
  }
}
