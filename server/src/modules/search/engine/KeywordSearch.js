import FAQ from '../../../models/FAQ.js';
import DocumentChunk from '../../../models/DocumentChunk.js';

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

    const [faqs, chunks] = await Promise.all([
      FAQ.find(
        {
          $text: { $search: mongoQueryString },
          isDeleted: false,
          approvalStatus: 'approved',
          visibility: 'public',
        },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean(),

      DocumentChunk.find(
        { $text: { $search: mongoQueryString } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .populate('document', 'title status isDeleted')
      .lean()
    ]);

    // Filter out chunks belonging to deleted documents
    const validChunks = chunks.filter(c => c.document && !c.document.isDeleted);

    return {
      faqs: faqs.map(f => ({ ...f, _type: 'faq', _score: f.score })),
      chunks: validChunks.map(c => ({ ...c, _type: 'chunk', _score: c.score })),
    };
  }
}
