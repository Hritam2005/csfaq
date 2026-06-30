import { RANKING_WEIGHTS } from '../Knowledge.constants.js';

export class ConfidenceEngine {
  /**
   * Calculates a final confidence score for a retrieved chunk or FAQ.
   * @param {number} vectorSimilarity - Cosine similarity from Vector Search (0 to 1)
   * @param {number} chunkQuality - Baseline quality of the chunk (0 to 1)
   * @param {number} freshnessScore - How recent is this knowledge (0 to 1)
   * @param {number} popularityScore - How often is this viewed/used (0 to 1)
   * @returns {number} Final Confidence Score (0 to 1)
   */
  static calculate(vectorSimilarity, chunkQuality = 1.0, freshnessScore = 1.0, popularityScore = 0.5) {
    
    // Weighted algorithm
    const rawScore = (
      (vectorSimilarity * RANKING_WEIGHTS.SIMILARITY) +
      (freshnessScore * RANKING_WEIGHTS.FRESHNESS) +
      (popularityScore * RANKING_WEIGHTS.POPULARITY) +
      (chunkQuality * RANKING_WEIGHTS.AUTHORITY)
    );

    // Normalize safely to 0-1
    return Math.min(Math.max(rawScore, 0), 1);
  }
}
