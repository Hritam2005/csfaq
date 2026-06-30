import { SearchService } from '../../search/Search.service.js';

export class KnowledgeRetriever {
  /**
   * Wrapper around the Hybrid Search Engine specifically tuned for RAG extraction.
   * Forces intent, overrides standard limits to fetch deep context.
   */
  static async retrieve(query, filters = {}) {
    // We request more results than a UI search because ContextBuilder will trim based on token count
    const searchResponse = await SearchService.executeHybridSearch(query, filters, null);
    
    // Additional RAG specific filtering could happen here (e.g., removing low confidence hits early)
    const validResults = searchResponse.results.filter(r => r._hybridScore > 0.3);

    return validResults;
  }
}
