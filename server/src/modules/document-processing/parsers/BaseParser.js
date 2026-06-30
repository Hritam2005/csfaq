import { DocumentError, ERROR_CODES } from '../Document.errors.js';

export class BaseParser {
  /**
   * @param {Buffer} fileBuffer
   * @param {Object} metadata
   * @returns {Promise<string>} Parsed plain text content
   */
  async parse(fileBuffer, metadata = {}) {
    throw new Error('Method not implemented.');
  }
}
