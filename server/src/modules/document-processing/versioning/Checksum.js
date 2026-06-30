import crypto from 'crypto';

export class Checksum {
  /**
   * Generates a SHA-256 hash of the file buffer to uniquely identify content
   * @param {Buffer} buffer
   * @returns {string} hex hash
   */
  static generate(buffer) {
    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    return hash.digest('hex');
  }
}
