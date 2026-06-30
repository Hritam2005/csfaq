export class CitationBuilder {
  /**
   * Formats a raw database chunk into a user-friendly citation for the LLM or UI.
   * @param {Object} chunkDoc - Mongoose DocumentChunk
   * @param {Object} knowledgeDoc - Mongoose KnowledgeDocument
   * @returns {Object} Structured citation
   */
  static build(chunkDoc, knowledgeDoc) {
    return {
      citationId: chunkDoc._id,
      source: knowledgeDoc.title,
      documentId: knowledgeDoc._id,
      version: chunkDoc.version,
      location: {
        page: chunkDoc.pageNumber || null,
        section: chunkDoc.section || null,
        heading: chunkDoc.heading || null,
        chunkNumber: chunkDoc.chunkNumber,
      },
      textSnippet: chunkDoc.text.substring(0, 150) + '...', // Short preview for UI
      fullText: chunkDoc.text, // Full text sent to LLM context
      confidence: chunkDoc.confidenceScore,
      url: `/documents/${knowledgeDoc._id}?chunk=${chunkDoc.chunkNumber}`, // Deep link
    };
  }
}
