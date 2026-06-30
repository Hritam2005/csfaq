import { QueryParser } from './query/QueryParser.js';
import { KeywordSearch } from './engine/KeywordSearch.js';
import { SemanticSearch } from './engine/SemanticSearch.js';
import { SearchRanker } from './ranking/SearchRanker.js';
import { Highlighter } from './highlighting/Highlighter.js';
import { SearchCache } from './cache/SearchCache.js';
import { SearchLog } from './Search.model.js';
import { CACHE_TTL } from './Search.constants.js';

export class SearchService {
  /**
   * Main Hybrid Search Orchestrator.
   * Parses query -> Checks Cache -> Runs Keyword + Semantic -> Merges -> Ranks -> Highlights -> Logs Analytics.
   */
  static async executeHybridSearch(rawQuery, filters = {}, user = null) {
    const startTime = Date.now();
    const parsedQuery = QueryParser.parse(rawQuery);

    if (!parsedQuery.normalized) {
      return { results: [], query: parsedQuery, timeMs: 0 };
    }

    // 1. Check Cache
    const cached = SearchCache.get('hybrid', parsedQuery.normalized, filters);
    if (cached) {
      this._logAnalytics(parsedQuery, user, filters, cached.length, true, Date.now() - startTime);
      return { results: cached, query: parsedQuery, timeMs: Date.now() - startTime, cached: true };
    }

    // 2. Parallel Execution of Search Engines
    const [keywordResults, semanticResults] = await Promise.all([
      KeywordSearch.search(parsedQuery, 20),
      SemanticSearch.search(parsedQuery, 20)
    ]);

    // 3. Re-ranking (Hybrid Merge)
    let rankedResults = SearchRanker.rank(keywordResults, semanticResults, 15);

    // 4. Highlighting
    rankedResults = rankedResults.map(res => {
      // Highlight question/answer for FAQs, or text for chunks
      if (res._type === 'faq') {
        res._highlightedQuestion = Highlighter.highlight(res.question, parsedQuery.normalized);
      } else if (res._type === 'chunk') {
        res._highlightedText = Highlighter.highlight(res.text, parsedQuery.normalized);
      }
      return res;
    });

    // 5. Cache Results
    SearchCache.set('hybrid', parsedQuery.normalized, filters, rankedResults, CACHE_TTL.STANDARD_QUERY);

    const responseTime = Date.now() - startTime;

    // 6. Asynchronous Analytics Logging (Don't block response)
    this._logAnalytics(parsedQuery, user, filters, rankedResults.length, false, responseTime).catch(console.error);

    return {
      results: rankedResults,
      query: parsedQuery,
      timeMs: responseTime,
      cached: false
    };
  }

  static async _logAnalytics(parsedQuery, user, filters, resultCount, cacheHit, responseTimeMs) {
    await SearchLog.create({
      query: parsedQuery.raw,
      normalizedQuery: parsedQuery.normalized,
      user: user ? user._id : null,
      intent: parsedQuery.intent,
      filtersUsed: filters,
      resultCount,
      zeroResults: resultCount === 0,
      responseTimeMs,
      cacheHit,
    });
  }
}
