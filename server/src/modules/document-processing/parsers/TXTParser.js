import { BaseParser } from './BaseParser.js';
import { DocumentError, ERROR_CODES } from '../Document.errors.js';

export class TXTParser extends BaseParser {
  async parse(fileBuffer, metadata = {}) {
    try {
      // Decode buffer to string (assuming UTF-8 for TXT)
      const text = fileBuffer.toString('utf-8');
      if (!text || text.trim() === '') {
        throw new DocumentError('Empty text document', ERROR_CODES.PARSE_FAILED);
      }
      return text.trim();
    } catch (error) {
      if (error instanceof DocumentError) throw error;
      throw new DocumentError(`Failed to parse TXT: ${error.message}`, ERROR_CODES.PARSE_FAILED);
    }
  }
}
