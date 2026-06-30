import DocumentChunk from '../../../models/DocumentChunk.js';
import Embedding from '../../../models/Embedding.js';
import KnowledgeDocument from '../../../models/KnowledgeDocument.js';
import { EmbeddingService } from '../embedding/EmbeddingService.js';
import { knowledgeEvents } from '../Knowledge.events.js';
import { KNOWLEDGE_EVENTS, INDEX_STATUS } from '../Knowledge.constants.js';
import crypto from 'crypto';

export class IndexBuilder {
  /**
   * Takes a document, retrieves its chunks, generates embeddings, and saves them to the DB.
   * This bridges the Document Processing Engine and the Knowledge Engine.
   */
  static async buildIndexForDocument(documentId) {
    const document = await KnowledgeDocument.findById(documentId);
    if (!document) throw new Error('Document not found');

    document.status = INDEX_STATUS.PROCESSING; // Now in embedding/indexing phase
    await document.save();

    try {
      // 1. Fetch chunks that don't have embeddings yet
      const chunks = await DocumentChunk.find({ document: documentId, embeddingId: null });
      if (chunks.length === 0) {
        document.status = INDEX_STATUS.COMPLETED;
        await document.save();
        return;
      }

      const texts = chunks.map(c => c.text);
      const embeddingService = new EmbeddingService();
      
      // 2. Generate Embeddings (Batched)
      const embeddingResults = await embeddingService.generateBatch(texts);

      // 3. Save Embeddings and Link to Chunks
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const result = embeddingResults[i];
        
        const textHash = crypto.createHash('sha256').update(chunk.text).digest('hex');

        // Create embedding record
        const embeddingDoc = await Embedding.create({
          chunkReference: chunk._id,
          vector: result.vector,
          dimensions: result.dimensions,
          provider: result.provider,
          model: result.model,
          textHash,
        });

        // Link chunk to embedding
        chunk.embeddingId = embeddingDoc._id;
        await chunk.save();
      }

      // 4. Update Document Status
      document.status = INDEX_STATUS.COMPLETED;
      await document.save();

      // Emit Event
      // knowledgeEvents.emit(KNOWLEDGE_EVENTS.INDEXED, { documentId }); // Assuming knowledgeEvents is defined

    } catch (error) {
      document.status = INDEX_STATUS.FAILED;
      await document.save();
      throw error;
    }
  }
}
