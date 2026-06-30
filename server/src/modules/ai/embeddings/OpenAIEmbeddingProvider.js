import { BaseEmbeddingProvider } from './BaseEmbeddingProvider.js';
import { OpenAI } from 'openai';
import { env } from '../../../config/env.js';

export class OpenAIEmbeddingProvider extends BaseEmbeddingProvider {
  constructor(config = {}) {
    super({
      modelName: config.modelName || 'text-embedding-3-small',
      dimension: config.dimension || 1536,
      ...config
    });
    this.client = null;
  }

  async initialize() {
    if (!env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY is missing in environment variables. Falling back to zero-embeddings.');
      this.client = null;
      return;
    }
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async generateEmbeddings(texts) {
    if (!this.client) {
      await this.initialize();
    }

    if (!this.client) {
      // Mock deterministic embeddings if no API key
      return texts.map(text => Array(this.dimension).fill(0.01));
    }

    try {
      const response = await this.client.embeddings.create({
        model: this.modelName,
        input: texts,
        dimensions: this.modelName.includes('text-embedding-3') ? this.dimension : undefined,
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('[OpenAIEmbeddingProvider] Error generating embeddings:', error);
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }
}
