import { BaseParser } from './BaseParser.js';
import { DocumentError, ERROR_CODES } from '../Document.errors.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export class PDFParser extends BaseParser {
  async parse(fileBuffer, metadata = {}) {
    try {
      // NOTE: In production, you would run 'npm install pdf-parse'
      const data = await pdfParse(fileBuffer);
      if (!data.text || data.text.trim() === '') {
        throw new DocumentError('Could not extract text from PDF (might be image-based/scanned)', ERROR_CODES.PARSE_FAILED);
      }
      
      // Basic cleanup of multiple newlines and weird PDF spacing
      let cleanText = data.text.replace(/\n\s*\n/g, '\n\n').trim();
      
      return cleanText;
    } catch (error) {
      if (error instanceof DocumentError) throw error;
      throw new DocumentError(`Failed to parse PDF: ${error.message}`, ERROR_CODES.PARSE_FAILED);
    }
  }
}
