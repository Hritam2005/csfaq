import mongoose from 'mongoose';

const documentChunkSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeDocument',
      required: true,
      index: true,
    },
    version: {
      type: Number, // Ties the chunk to a specific version of the document
      required: true,
      default: 1,
    },
    pageNumber: {
      type: Number,
      default: null,
    },
    section: {
      type: String,
      trim: true,
    },
    heading: {
      type: String,
      trim: true,
    },
    subheading: {
      type: String,
      trim: true,
    },
    chunkNumber: {
      type: Number,
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    tokenCount: {
      type: Number, // Important for fitting into LLM context windows
      required: true,
    },
    embeddingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Embedding',
      default: null,
      index: true,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    confidenceScore: {
      type: Number, // Extraction confidence
      default: 1.0,
    },
  },
  { timestamps: true }
);

// Compound index for fast retrieval of chunks belonging to a document sequentially
documentChunkSchema.index({ document: 1, version: 1, chunkNumber: 1 });
// Text index for keyword fallback
documentChunkSchema.index({ text: 'text', heading: 'text' });

const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema);
export default DocumentChunk;
