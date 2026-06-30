import DocumentVersion from '../../../models/DocumentVersion.js';
import KnowledgeDocument from '../../../models/KnowledgeDocument.js';

export class VersionService {
  /**
   * Creates a new version for a document
   * @param {string} documentId
   * @param {string} checksum
   * @param {string} storagePath
   * @param {string} userId
   * @returns {Promise<number>} The new version number
   */
  static async createNewVersion(documentId, checksum, storagePath, userId) {
    const doc = await KnowledgeDocument.findById(documentId);
    if (!doc) throw new Error('Document not found');

    const newVersionNumber = doc.version + 1;

    await DocumentVersion.create({
      document: documentId,
      versionNumber: newVersionNumber,
      checksum,
      storagePath,
      createdBy: userId,
      changeSummary: 'Automated version creation on upload',
    });

    doc.version = newVersionNumber;
    doc.checksum = checksum;
    doc.storagePath = storagePath;
    await doc.save();

    return newVersionNumber;
  }
}
