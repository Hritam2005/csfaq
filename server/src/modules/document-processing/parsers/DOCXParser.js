import { BaseParser } from './BaseParser.js';
import { DocumentError, ERROR_CODES } from '../Document.errors.js';
import mammoth from 'mammoth';

export class DOCXParser extends BaseParser {
  async parse(fileBuffer, metadata = {}) {
    try {
      // NOTE: In production, you would run 'npm install mammoth'
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      const text = result.value;
      
      if (!text || text.trim() === '') {
        throw new DocumentError('Could not extract text from DOCX', ERROR_CODES.PARSE_FAILED);
      }
      
      return text.trim();
    } catch (error) {
      if (error instanceof DocumentError) throw error;
      throw new DocumentError(`Failed to parse DOCX: ${error.message}`, ERROR_CODES.PARSE_FAILED);
    }
  }
}
