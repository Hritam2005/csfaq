import { IndexBuilder } from './indexing/IndexBuilder.js';
import { KnowledgeGraph } from './graph/KnowledgeGraph.js';
import { CitationBuilder } from './citations/CitationBuilder.js';
import { ConfidenceEngine } from './ranking/ConfidenceEngine.js';
import { EmbeddingCache } from './embedding/EmbeddingCache.js';
import DocumentChunk from '../../models/DocumentChunk.js';
import KnowledgeDocument from '../../models/KnowledgeDocument.js';
import FAQ from '../../models/FAQ.js';
import { KnowledgeError, ERROR_CODES } from './Knowledge.errors.js';

export class KnowledgeService {
  /**
   * Rebuilds the vector index for a specific document.
   */
  static async reindexDocument(documentId) {
    // Background job for heavy processing
    // In production, queue this instead of awaiting
    await IndexBuilder.buildIndexForDocument(documentId);
    return { message: `Reindexing started for document ${documentId}` };
  }

  /**
   * Clears the embedding cache.
   */
  static clearCache() {
    EmbeddingCache.cache.clear();
    return { message: 'Knowledge embedding cache cleared' };
  }

  /**
   * Retrieves aggregated statistics about the knowledge base.
   */
  static async getStatistics() {
    const totalDocs = await KnowledgeDocument.countDocuments({ isDeleted: false });
    const totalFaqs = await FAQ.countDocuments({ isDeleted: false });
    const totalChunks = await DocumentChunk.countDocuments();
    
    return {
      documents: totalDocs,
      faqs: totalFaqs,
      chunks: totalChunks,
      cacheSize: EmbeddingCache.cache.size,
    };
  }

  /**
   * Generates citations for a specific chunk.
   */
  static async getCitation(chunkId) {
    const chunk = await DocumentChunk.findById(chunkId);
    if (!chunk) throw new KnowledgeError('Chunk not found', ERROR_CODES.NODE_NOT_FOUND);

    const doc = await KnowledgeDocument.findById(chunk.document);
    if (!doc) throw new KnowledgeError('Source document not found', ERROR_CODES.NODE_NOT_FOUND);

    return CitationBuilder.build(chunk, doc);
  }

  /**
   * Calculates confidence for a simulated search hit.
   */
  static calculateConfidence(similarity, quality, freshness, popularity) {
    return ConfidenceEngine.calculate(similarity, quality, freshness, popularity);
  }
}
