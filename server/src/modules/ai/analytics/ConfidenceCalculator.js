export class ConfidenceCalculator {
  /**
   * Calculates overall confidence of an RAG response based on similarity scores and coverage.
   * @param {Array<{_score: number}>} retrievedChunks
   * @param {string} responseText
   * @returns {{ score: number, rating: 'High' | 'Medium' | 'Low' }}
   */
  static calculate(retrievedChunks, responseText) {
    if (!retrievedChunks || retrievedChunks.length === 0) {
      return { score: 0, rating: 'Low' };
    }

    // 1. Calculate Average Semantic Similarity Score (assuming normalized 0-1)
    const avgSimilarity = retrievedChunks.reduce((acc, c) => acc + (c._score || 0), 0) / retrievedChunks.length;

    // 2. Fallback Response Detection
    const isFallback = responseText.includes("I couldn't find this information");
    
    let finalScore = avgSimilarity;
    if (isFallback) {
      finalScore = 0.1; // Low confidence if we had to fallback
    }

    let rating = 'Low';
    if (finalScore >= 0.8) {
      rating = 'High';
    } else if (finalScore >= 0.5) {
      rating = 'Medium';
    }

    return {
      score: finalScore,
      rating
    };
  }
}
