export class SentenceChunker {
  chunk(text, options = { maxTokens: 1000, overlap: 100 }) {
    // Basic sentence splitting by punctuation
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const maxChars = options.maxTokens * 4;
    const chunks = [];
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk.length + sentence.length) > maxChars && currentChunk.length > 0) {
        chunks.push({ text: currentChunk.trim(), metadata: { strategy: 'sentence' } });
        // We could implement overlap here by carrying over the last N sentences,
        // but for simplicity, we just reset.
        currentChunk = sentence;
      } else {
        currentChunk += ' ' + sentence;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push({ text: currentChunk.trim(), metadata: { strategy: 'sentence' } });
    }
    
    return chunks;
  }
}
