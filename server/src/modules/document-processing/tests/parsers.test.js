import { jest } from '@jest/globals';
import { TXTParser } from '../parsers/TXTParser.js';
import { HTMLParser } from '../parsers/HTMLParser.js';
import { ParserFactory } from '../parsers/ParserFactory.js';
import { DocumentError, ERROR_CODES } from '../Document.errors.js';

describe('Document Parsers', () => {
  describe('TXTParser', () => {
    it('should parse plain text buffers correctly', async () => {
      const parser = new TXTParser();
      const buffer = Buffer.from('Hello Enterprise Search');
      const text = await parser.parse(buffer);
      expect(text).toBe('Hello Enterprise Search');
    });

    it('should throw DocumentError on empty buffers', async () => {
      const parser = new TXTParser();
      const buffer = Buffer.from('   \n  ');
      await expect(parser.parse(buffer)).rejects.toThrow(DocumentError);
      await expect(parser.parse(buffer)).rejects.toMatchObject({
        code: ERROR_CODES.PARSE_FAILED
      });
    });
  });

  describe('HTMLParser', () => {
    it('should extract text and strip HTML tags', async () => {
      const parser = new HTMLParser();
      const html = '<html><body><h1>Title</h1><p>Some content here.</p><script>alert("hack");</script></body></html>';
      const buffer = Buffer.from(html);
      const text = await parser.parse(buffer);
      
      // Cheerio output
      expect(text).toContain('Title');
      expect(text).toContain('Some content here.');
      expect(text).not.toContain('alert("hack")'); // script tag stripped
    });
  });

  describe('ParserFactory', () => {
    it('should return correct parser based on mime type', () => {
      expect(ParserFactory.getParser('text/plain')).toBeInstanceOf(TXTParser);
      expect(ParserFactory.getParser('text/html')).toBeInstanceOf(HTMLParser);
    });

    it('should throw on unsupported mime types', () => {
      expect(() => ParserFactory.getParser('image/png')).toThrow('No parser implemented for mime type: image/png');
    });
  });
});
