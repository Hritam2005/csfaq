import { OpenAIEmbeddingProvider } from './OpenAIEmbeddingProvider.js';

export class EmbeddingFactory {
  static providers = new Map();

  /**
   * Get an instance of the specified embedding provider.
   * @param {string} providerName e.g., 'openai', 'google', 'ollama'
   * @param {Object} config 
   * @returns {import('./BaseEmbeddingProvider.js').BaseEmbeddingProvider}
   */
  static getProvider(providerName = 'openai', config = {}) {
    const key = `${providerName}-${JSON.stringify(config)}`;
    
    if (this.providers.has(key)) {
      return this.providers.get(key);
    }

    let provider;
    switch (providerName.toLowerCase()) {
      case 'openai':
        provider = new OpenAIEmbeddingProvider(config);
        break;
      // Add 'google', 'ollama', etc. here later as needed
      default:
        throw new Error(`Unsupported embedding provider: ${providerName}`);
    }

    this.providers.set(key, provider);
    return provider;
  }
}
