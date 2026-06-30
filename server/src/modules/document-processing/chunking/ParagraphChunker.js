import { ChunkStrategy } from './ChunkStrategy.js';

export class ParagraphChunker extends ChunkStrategy {
  chunk(text, options = {}) {
    const maxTokens = options.maxTokens || 1000;
    const overlap = options.overlap || 100;
    
    // Very simple approximation: 1 token ~= 4 characters
    const maxChars = maxTokens * 4; 
    const overlapChars = overlap * 4;

    // Split by double newline (paragraphs)
    const paragraphs = text.split(/\n\s*\n/);
    
    const chunks = [];
    let currentChunkText = '';
    let currentChunkParagraphs = [];

    for (const p of paragraphs) {
      if (p.trim() === '') continue;

      if ((currentChunkText.length + p.length) > maxChars && currentChunkText.length > 0) {
        // Current chunk is full, push it
        chunks.push({
          text: currentChunkText.trim(),
          metadata: { type: 'paragraph' }
        });
        
        // Start new chunk, incorporating overlap
        // Take the last paragraph(s) of the current chunk as overlap
        let overlapText = '';
        for (let i = currentChunkParagraphs.length - 1; i >= 0; i--) {
          if (overlapText.length + currentChunkParagraphs[i].length <= overlapChars) {
            overlapText = currentChunkParagraphs[i] + '\n\n' + overlapText;
          } else {
            break;
          }
        }
        
        currentChunkText = overlapText + p + '\n\n';
        currentChunkParagraphs = [p]; // Reset tracking
      } else {
        currentChunkText += p + '\n\n';
        currentChunkParagraphs.push(p);
      }
    }

    // Push the remaining
    if (currentChunkText.trim().length > 0) {
      chunks.push({
        text: currentChunkText.trim(),
        metadata: { type: 'paragraph' }
      });
    }

    return chunks;
  }
}
