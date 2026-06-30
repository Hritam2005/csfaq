import { AtlasVectorStore } from './AtlasVectorStore.js';

export class VectorStoreFactory {
  static stores = new Map();

  /**
   * Get an instance of the specified vector store.
   * @param {string} storeName e.g., 'atlas', 'pinecone', 'qdrant'
   * @param {Object} config 
   * @returns {import('./BaseVectorStore.js').BaseVectorStore}
   */
  static getStore(storeName = 'atlas', config = {}) {
    const key = `${storeName}-${JSON.stringify(config)}`;
    
    if (this.stores.has(key)) {
      return this.stores.has(key);
    }

    let store;
    switch (storeName.toLowerCase()) {
      case 'atlas':
        store = new AtlasVectorStore(config);
        break;
      // Add 'pinecone', 'qdrant', 'chromadb', 'faiss' here as needed
      default:
        throw new Error(`Unsupported vector store: ${storeName}`);
    }

    this.stores.set(key, store);
    return store;
  }
}
