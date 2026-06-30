import mongoose from 'mongoose';
import { BaseVectorStore } from './BaseVectorStore.js';
import Embedding from '../../../models/Embedding.js';

export class AtlasVectorStore extends BaseVectorStore {
  constructor(config = {}) {
    super(config);
    this.indexName = config.indexName || 'vector_index';
    this.numCandidates = config.numCandidates || 100;
  }

  async insert(vectors) {
    // Vectors are typically inserted directly via EmbeddingService into the Embedding model.
    // In Atlas, as long as the document exists in the collection, the index updates automatically.
    // This method is provided for abstraction completeness.
    return vectors.length;
  }

  async search(queryVector, limit = 10, filters = {}) {
    // Using MongoDB Atlas $vectorSearch aggregation pipeline
    
    // Convert generic filters to MongoDB match conditions
    // e.g., filters: { document: "docId" } => $match: { document: ObjectId("docId") }
    const matchFilters = {};
    if (filters.documentId) {
      matchFilters['documentChunk.document'] = new mongoose.Types.ObjectId(filters.documentId);
    }
    // We can expand this mapping for category, permissions, etc.

    const pipeline = [
      {
        $vectorSearch: {
          index: this.indexName,
          path: 'vector',
          queryVector: queryVector,
          numCandidates: this.numCandidates,
          limit: limit,
        }
      },
      // Lookup the actual chunk to get text and metadata
      {
        $lookup: {
          from: 'documentchunks',
          localField: 'chunkReference',
          foreignField: '_id',
          as: 'documentChunk'
        }
      },
      {
        $unwind: '$documentChunk'
      }
    ];

    if (Object.keys(matchFilters).length > 0) {
      pipeline.push({ $match: matchFilters });
    }

    pipeline.push({
      $project: {
        _id: 0,
        id: '$chunkReference',
        score: { $meta: 'vectorSearchScore' },
        metadata: '$documentChunk.metadata',
        text: '$documentChunk.text',
        documentId: '$documentChunk.document',
        chunkNumber: '$documentChunk.chunkNumber',
        pageNumber: '$documentChunk.pageNumber',
        heading: '$documentChunk.heading',
      }
    });

    const results = await Embedding.aggregate(pipeline);
    
    return results.map(r => ({
      id: r.id.toString(),
      score: r.score,
      text: r.text,
      metadata: {
        documentId: r.documentId.toString(),
        chunkNumber: r.chunkNumber,
        pageNumber: r.pageNumber,
        heading: r.heading,
        ...r.metadata
      }
    }));
  }

  async delete(ids) {
    await Embedding.deleteMany({ _id: { $in: ids } });
  }
}
