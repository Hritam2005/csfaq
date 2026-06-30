import { TXTParser } from './TXTParser.js';
import { MarkdownParser } from './MarkdownParser.js';
import { PDFParser } from './PDFParser.js';
import { DOCXParser } from './DOCXParser.js';
import { HTMLParser } from './HTMLParser.js';

export class ParserFactory {
  /**
   * Returns the appropriate parser based on MIME type
   * @param {string} mimeType
   */
  static getParser(mimeType) {
    switch (mimeType) {
      case 'text/plain':
        return new TXTParser();
      case 'text/markdown':
        return new MarkdownParser();
      case 'application/pdf':
        return new PDFParser();
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return new DOCXParser();
      case 'text/html':
        return new HTMLParser();
      default:
        throw new Error(`No parser implemented for mime type: ${mimeType}`);
    }
  }
}
