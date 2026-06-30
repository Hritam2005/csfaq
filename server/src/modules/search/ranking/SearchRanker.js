import { SEARCH_WEIGHTS } from '../Search.constants.js';

export class SearchRanker {
  /**
   * Merges Keyword and Semantic search results, normalizes their scores, 
   * and produces a final ranked array utilizing Hybrid Search weights.
   */
  static rank(keywordResults, semanticResults, limit = 10) {
    const combinedMap = new Map();

    // 1. Process Keyword Results (BM25)
    // Normalize BM25 scores (which can be > 1) to an approximate 0-1 range based on max score
    const maxKeywordScore = Math.max(
      ...keywordResults.faqs.map(f => f._score),
      ...keywordResults.chunks.map(c => c._score),
      1 // Prevent division by zero
    );

    const processKeyword = (item) => {
      const id = item._id.toString();
      const normalizedScore = item._score / maxKeywordScore;
      combinedMap.set(id, {
        item,
        keywordScore: normalizedScore,
        semanticScore: 0,
      });
    };

    keywordResults.faqs.forEach(processKeyword);
    keywordResults.chunks.forEach(processKeyword);

    // 2. Process Semantic Results (Cosine Similarity is naturally 0-1 usually, but let's assume raw dot product or cosine)
    semanticResults.chunks.forEach(item => {
      const id = item._id.toString();
      if (combinedMap.has(id)) {
        const existing = combinedMap.get(id);
        existing.semanticScore = item._score;
      } else {
        combinedMap.set(id, {
          item,
          keywordScore: 0,
          semanticScore: item._score,
        });
      }
    });

    // 3. Compute Hybrid Score using Weights
    const finalResults = Array.from(combinedMap.values()).map(entry => {
      const finalScore = (entry.keywordScore * SEARCH_WEIGHTS.KEYWORD) + (entry.semanticScore * SEARCH_WEIGHTS.SEMANTIC);
      return {
        ...entry.item,
        _hybridScore: finalScore,
        _scores: {
          keyword: entry.keywordScore,
          semantic: entry.semanticScore
        }
      };
    });

    // 4. Sort and Limit
    finalResults.sort((a, b) => b._hybridScore - a._hybridScore);
    
    return finalResults.slice(0, limit);
  }
}
