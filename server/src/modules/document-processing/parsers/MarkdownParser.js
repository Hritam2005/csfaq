import { BaseParser } from './BaseParser.js';
import { DocumentError, ERROR_CODES } from '../Document.errors.js';

export class MarkdownParser extends BaseParser {
  async parse(fileBuffer, metadata = {}) {
    try {
      const text = fileBuffer.toString('utf-8');
      if (!text || text.trim() === '') {
        throw new DocumentError('Empty markdown document', ERROR_CODES.PARSE_FAILED);
      }
      // For basic RAG, we can keep the markdown formatting as it provides good semantic structure (headings #, lists -, etc)
      // If we wanted pure text, we would strip markdown symbols here using something like marked or remove-markdown.
      return text.trim();
    } catch (error) {
      if (error instanceof DocumentError) throw error;
      throw new DocumentError(`Failed to parse Markdown: ${error.message}`, ERROR_CODES.PARSE_FAILED);
    }
  }
}
