import FAQ from '../../../models/FAQ.js';

export class KeywordSearch {
  /**
   * Executes a native MongoDB Text Search against indexed text fields.
   * Leverages TF-IDF / BM25 built into Mongo.
   */
  static async search(parsedQuery, limit = 10) {
    if (!parsedQuery.tokens.length) return { faqs: [], chunks: [] };
    
    // Convert tokens to MongoDB phrase search or word search
    // "hello world" -> "\"hello world\"" for exact phrase, but we want broad for now
    const mongoQueryString = parsedQuery.tokens.join(' ');

    const faqs = await FAQ.find(
        { $text: { $search: mongoQueryString }, isDeleted: false },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();

    return {
      faqs: faqs.map(f => ({ ...f, _type: 'faq', _score: f.score })),
      chunks: [],
    };
  }
}
