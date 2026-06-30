import { BaseParser } from './BaseParser.js';
import { DocumentError, ERROR_CODES } from '../Document.errors.js';
import * as cheerio from 'cheerio';

export class HTMLParser extends BaseParser {
  async parse(fileBuffer, metadata = {}) {
    try {
      // NOTE: In production, you would run 'npm install cheerio'
      const html = fileBuffer.toString('utf-8');
      const $ = cheerio.load(html);
      
      // Remove scripts, styles, and other non-content tags
      $('script, style, noscript, iframe, svg, nav, footer, header').remove();
      
      const text = $('body').text();
      
      if (!text || text.trim() === '') {
        throw new DocumentError('Could not extract text from HTML', ERROR_CODES.PARSE_FAILED);
      }
      
      // Clean up whitespace
      const cleanText = text.replace(/\s+/g, ' ').trim();
      
      return cleanText;
    } catch (error) {
      if (error instanceof DocumentError) throw error;
      throw new DocumentError(`Failed to parse HTML: ${error.message}`, ERROR_CODES.PARSE_FAILED);
    }
  }
}
