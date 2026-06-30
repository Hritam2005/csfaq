import mongoose from 'mongoose';

const embeddingSchema = new mongoose.Schema(
  {
    chunkReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DocumentChunk',
      required: true,
      index: true,
    },
    vector: {
      type: [Number], // Array of floats
      required: true,
    },
    dimensions: {
      type: Number,
      required: true, // e.g., 1536 for OpenAI text-embedding-ada-002 or text-embedding-3-small
    },
    provider: {
      type: String,
      required: true,
      default: 'openai',
    },
    model: {
      type: String,
      required: true,
      default: 'text-embedding-3-small',
    },
    textHash: {
      type: String,
      required: true,
      index: true,
      description: 'Hash of the source text to prevent regenerating identical vectors',
    },
  },
  { timestamps: true }
);

// We don't define Atlas Vector Search indexes natively in the Mongoose schema.
// Vector indexes must be defined in the MongoDB Atlas UI/JSON configuration.
// But we keep track of the text hash to save money on redundant embeddings.

const Embedding = mongoose.model('Embedding', embeddingSchema);
export default Embedding;
