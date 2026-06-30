import { ChunkStrategy } from './ChunkStrategy.js';

export class TokenChunker extends ChunkStrategy {
  chunk(text, options = {}) {
    const maxTokens = options.maxTokens || 512;
    const overlap = options.overlap || 50;
    
    // Basic approximation (4 chars per token)
    const chunkSize = maxTokens * 4;
    const overlapSize = overlap * 4;

    const chunks = [];
    let i = 0;
    
    while (i < text.length) {
      const end = Math.min(i + chunkSize, text.length);
      const chunkText = text.substring(i, end);
      
      chunks.push({
        text: chunkText,
        metadata: { type: 'token', maxTokens }
      });
      
      i += (chunkSize - overlapSize);
    }

    return chunks;
  }
}
