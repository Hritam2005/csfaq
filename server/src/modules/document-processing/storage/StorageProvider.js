/**
 * Abstract interface for Storage Providers
 */
export class StorageProvider {
  /**
   * @param {Buffer} fileBuffer
   * @param {string} fileName
   * @returns {Promise<string>} The storage path/URL
   */
  async save(fileBuffer, fileName) {
    throw new Error('Method not implemented.');
  }

  /**
   * @param {string} path
   * @returns {Promise<Buffer>}
   */
  async get(path) {
    throw new Error('Method not implemented.');
  }

  /**
   * @param {string} path
   * @returns {Promise<void>}
   */
  async delete(path) {
    throw new Error('Method not implemented.');
  }
}
