import fs from 'fs/promises';
import path from 'path';
import { StorageProvider } from './StorageProvider.js';

export class LocalStorage extends StorageProvider {
  constructor(baseDir = 'uploads') {
    super();
    this.baseDir = path.resolve(process.cwd(), baseDir);
    this._ensureDirectory();
  }

  async _ensureDirectory() {
    try {
      await fs.access(this.baseDir);
    } catch {
      await fs.mkdir(this.baseDir, { recursive: true });
    }
  }

  async save(fileBuffer, fileName) {
    await this._ensureDirectory();
    // Sanitize filename
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fullPath = path.join(this.baseDir, safeFileName);
    await fs.writeFile(fullPath, fileBuffer);
    return fullPath; // In production this would be a relative URL or S3 URI
  }

  async get(filePath) {
    return await fs.readFile(filePath);
  }

  async delete(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
}
