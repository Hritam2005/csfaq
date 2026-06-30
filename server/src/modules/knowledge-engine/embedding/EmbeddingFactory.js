import { OpenAIProvider } from './providers/OpenAIProvider.js';
import { KnowledgeError, ERROR_CODES } from '../Knowledge.errors.js';

export class EmbeddingFactory {
  static getProvider(providerType = 'openai') {
    switch (providerType.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider();
      // case 'cohere':
      //   return new CohereProvider();
      // case 'local':
      //   return new TransformersJSProvider();
      default:
        throw new KnowledgeError(`Unsupported embedding provider: ${providerType}`, ERROR_CODES.EMBEDDING_API_ERROR);
    }
  }
}
