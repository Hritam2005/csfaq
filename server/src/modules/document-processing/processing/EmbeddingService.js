import crypto from 'crypto';
import Embedding from '../../../models/Embedding.js';
import DocumentChunk from '../../../models/DocumentChunk.js';
import { EmbeddingFactory } from '../../ai/embeddings/EmbeddingFactory.js';
import { documentEvents } from '../Document.events.js';
import { DOCUMENT_EVENTS } from '../Document.constants.js';

export class EmbeddingService {
  /**
   * Process embeddings for all chunks of a document that don't have them yet.
   */
  static async processDocumentEmbeddings(documentId) {
    const chunks = await DocumentChunk.find({ document: documentId, embeddingId: null }).sort({ chunkNumber: 1 });
    
    if (!chunks || chunks.length === 0) {
      return 0;
    }

    const provider = EmbeddingFactory.getProvider('openai'); // Configurable later
    await provider.initialize();

    const BATCH_SIZE = 50;
    let embeddingsGenerated = 0;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const texts = batch.map(chunk => chunk.text);
      
      try {
        const vectors = await provider.generateEmbeddings(texts);

        for (let j = 0; j < batch.length; j++) {
          const chunk = batch[j];
          const vector = vectors[j];
          
          const textHash = crypto.createHash('sha256').update(chunk.text).digest('hex');

          const embeddingDoc = await Embedding.create({
            chunkReference: chunk._id,
            vector: vector,
            dimensions: provider.dimension,
            provider: 'openai',
            model: provider.modelName,
            textHash: textHash
          });

          chunk.embeddingId = embeddingDoc._id;
          await chunk.save();
          embeddingsGenerated++;
        }
      } catch (error) {
        console.error(`[EmbeddingService] Error embedding batch for document ${documentId}:`, error);
        throw error;
      }
    }

    return embeddingsGenerated;
  }
}
