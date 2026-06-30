import KnowledgeDocument from '../../../models/KnowledgeDocument.js';
import DocumentChunk from '../../../models/DocumentChunk.js';
import { StorageFactory } from '../storage/StorageFactory.js';
import { ParserFactory } from '../parsers/ParserFactory.js';
import { ChunkService } from '../chunking/ChunkService.js';
import { documentEvents } from '../Document.events.js';
import { DOCUMENT_EVENTS, PROCESSING_STATUS } from '../Document.constants.js';

export class DocumentProcessor {
  /**
   * Heavy background task that executes Parse -> Chunk -> Save
   */
  static async processJob(jobData) {
    const { documentId, filePath, mimeType } = jobData;
    const document = await KnowledgeDocument.findById(documentId);
    
    if (!document) throw new Error('Document not found for processing');

    try {
      // 1. Get file from storage
      const storage = StorageFactory.getProvider('local');
      const fileBuffer = await storage.get(filePath);

      // 2. Parse (Status: PARSING)
      document.status = PROCESSING_STATUS.PARSING;
      await document.save();
      const parser = ParserFactory.getParser(mimeType);
      const plainText = await parser.parse(fileBuffer);
      
      documentEvents.emit(DOCUMENT_EVENTS.PARSED, { documentId });

      // 3. Chunk (Status: CHUNKING)
      document.status = PROCESSING_STATUS.CHUNKING;
      await document.save();

      const { SystemConfig } = await import('../../../models/Admin.model.js');
      const chunkSizeConfig = await SystemConfig.findOne({ key: 'rag_chunk_size' });
      const chunkOverlapConfig = await SystemConfig.findOne({ key: 'rag_chunk_overlap' });
      const chunkStrategyConfig = await SystemConfig.findOne({ key: 'rag_chunk_strategy' });

      const maxTokens = chunkSizeConfig ? Number(chunkSizeConfig.value) : 1000;
      const overlap = chunkOverlapConfig ? Number(chunkOverlapConfig.value) : 100;
      const strategy = chunkStrategyConfig ? String(chunkStrategyConfig.value) : 'recursive';

      const chunkService = new ChunkService(strategy, { maxTokens, overlap });
      const chunks = chunkService.process(plainText);

      // 4. Save Chunks
      const chunkDocs = chunks.map((chunk, index) => ({
        document: documentId,
        version: document.version,
        chunkNumber: index + 1,
        text: chunk.text,
        tokenCount: Math.ceil(chunk.text.length / 4), // estimation
        metadata: chunk.metadata,
      }));
      await DocumentChunk.insertMany(chunkDocs);

      documentEvents.emit(DOCUMENT_EVENTS.CHUNKED, { documentId, totalChunks: chunks.length });

      // 5. Generate Embeddings
      document.status = PROCESSING_STATUS.EMBEDDING || 'EMBEDDING';
      await document.save();
      const { EmbeddingService } = await import('./EmbeddingService.js');
      const embeddingsCount = await EmbeddingService.processDocumentEmbeddings(documentId);
      console.log(`[DocumentProcessor] Generated ${embeddingsCount} embeddings for document ${documentId}`);

      // 6. Complete (Status: COMPLETED)
      document.status = PROCESSING_STATUS.COMPLETED;
      document.wordCount = plainText.split(/\s+/).length;
      await document.save();

      documentEvents.emit(DOCUMENT_EVENTS.INDEXED, { documentId, embeddingsCount });

    } catch (error) {
      document.status = PROCESSING_STATUS.FAILED;
      await document.save();
      throw error;
    }
  }
}
