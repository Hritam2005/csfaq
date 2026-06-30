import { EmbeddingFactory } from './EmbeddingFactory.js';
import { EmbeddingValidator } from './EmbeddingValidator.js';
import { EmbeddingCache } from './EmbeddingCache.js';
import { KnowledgeError, ERROR_CODES } from '../Knowledge.errors.js';

export class EmbeddingService {
  constructor(providerType = 'openai') {
    this.provider = EmbeddingFactory.getProvider(providerType);
  }

  /**
   * Generates embedding for a single text, utilizing the cache.
   * @param {string} text 
   */
  async generateEmbedding(text) {
    if (!text || text.trim() === '') {
      throw new KnowledgeError('Empty text provided for embedding', ERROR_CODES.VALIDATION_FAILED);
    }

    const cached = EmbeddingCache.get(text);
    if (cached) return cached;

    const result = await this.provider.embedSingle(text);
    EmbeddingValidator.validate(result);
    
    EmbeddingCache.set(text, result);
    return result;
  }

  /**
   * Batch processes embeddings, highly optimized for cache hits.
   * @param {string[]} texts 
   */
  async generateBatch(texts) {
    const results = new Array(texts.length);
    const uncachedIndices = [];
    const uncachedTexts = [];

    // Check cache first
    texts.forEach((text, i) => {
      const cached = EmbeddingCache.get(text);
      if (cached) {
        results[i] = cached;
      } else {
        uncachedIndices.push(i);
        uncachedTexts.push(text);
      }
    });

    // Process uncached in batch
    if (uncachedTexts.length > 0) {
      const apiResults = await this.provider.embedBatch(uncachedTexts);
      
      apiResults.forEach((res, i) => {
        EmbeddingValidator.validate(res);
        const originalIndex = uncachedIndices[i];
        const originalText = uncachedTexts[i];
        
        results[originalIndex] = res;
        EmbeddingCache.set(originalText, res);
      });
    }

    return results;
  }
}
