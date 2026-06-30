import KnowledgeDocument from '../../models/KnowledgeDocument.js';
import { StorageFactory } from './storage/StorageFactory.js';
import { Checksum } from './versioning/Checksum.js';
import { QueueService } from './queue/QueueService.js';
import { documentEvents } from './Document.events.js';
import { DOCUMENT_EVENTS, PROCESSING_STATUS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './Document.constants.js';
import { DocumentError, ERROR_CODES } from './Document.errors.js';

export class DocumentService {
  /**
   * Main entrypoint for the Document Pipeline.
   * Handles Upload -> Store -> Parse -> Chunk -> Queue Embeddings
   */
  static async processUpload(file, body, userId) {
    // 1. Validate
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new DocumentError(`Unsupported file type: ${file.mimetype}`, ERROR_CODES.INVALID_MIME_TYPE);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new DocumentError(`File too large`, ERROR_CODES.FILE_TOO_LARGE);
    }

    // 2. Generate Checksum & Detect Duplicates
    const checksum = Checksum.generate(file.buffer);
    const existingDoc = await KnowledgeDocument.findOne({ checksum });
    if (existingDoc) {
      return { document: existingDoc, message: 'Document already exists (Duplicate Checksum)' };
    }

    // 3. Store File
    const storage = StorageFactory.getProvider('local');
    const storagePath = await storage.save(file.buffer, file.originalname);

    // 4. Create Document DB Record (Status: UPLOADING -> PROCESSING)
    const document = await KnowledgeDocument.create({
      title: body.title || file.originalname,
      description: body.description || '',
      category: body.category || null,
      mimeType: file.mimetype,
      storagePath,
      checksum,
      uploadedBy: userId,
      status: PROCESSING_STATUS.PROCESSING,
    });

    documentEvents.emit(DOCUMENT_EVENTS.UPLOADED, { documentId: document._id });

    // 5. Fire background job for Heavy Processing (Parse, Chunk, Embed)
    await QueueService.add('document-process', {
      documentId: document._id,
      filePath: storagePath,
      mimeType: file.mimetype,
      userId,
    });

    return { document, message: 'Document uploaded and queued for processing' };
  }
}
