import { KnowledgeError, ERROR_CODES } from '../Knowledge.errors.js';

export class EmbeddingValidator {
  /**
   * Validates that the generated embedding vector matches expected dimensions.
   */
  static validate(embeddingResult) {
    if (!embeddingResult || !embeddingResult.vector) {
      throw new KnowledgeError('Embedding result is empty', ERROR_CODES.VALIDATION_FAILED);
    }
    
    if (!Array.isArray(embeddingResult.vector)) {
      throw new KnowledgeError('Embedding vector must be an array', ERROR_CODES.VALIDATION_FAILED);
    }

    if (embeddingResult.vector.length !== embeddingResult.dimensions) {
      throw new KnowledgeError(
        `Dimension mismatch. Expected ${embeddingResult.dimensions}, got ${embeddingResult.vector.length}`,
        ERROR_CODES.VALIDATION_FAILED
      );
    }
    
    return true;
  }
}
