import { KnowledgeGraph } from './graph/KnowledgeGraph.js';
import { ConfidenceEngine } from './ranking/ConfidenceEngine.js';
import { EmbeddingCache } from './embedding/EmbeddingCache.js';
import FAQ from '../../models/FAQ.js';
import { KnowledgeError, ERROR_CODES } from './Knowledge.errors.js';

export class KnowledgeService {

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
    const totalFaqs = await FAQ.countDocuments({ isDeleted: false });
    
    return {
      faqs: totalFaqs,
      cacheSize: EmbeddingCache.cache.size,
    };
  }


  /**
   * Calculates confidence for a simulated search hit.
   */
  static calculateConfidence(similarity, quality, freshness, popularity) {
    return ConfidenceEngine.calculate(similarity, quality, freshness, popularity);
  }
}
