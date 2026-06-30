export class RecursiveCharacterChunker {
  /**
   * Split by paragraphs, then sentences, then words, then characters
   */
  chunk(text, options = { maxTokens: 1000, overlap: 100 }) {
    // Basic approximation: 4 chars per token
    const maxChars = options.maxTokens * 4;
    const overlapChars = options.overlap * 4;
    
    // We'll use a simplified implementation: just sliding window by character on boundaries.
    // In production, we'd use Langchain's RecursiveCharacterTextSplitter.
    const chunks = [];
    let i = 0;
    while (i < text.length) {
      // Find a good breaking point near maxChars (like a newline or period)
      let end = i + maxChars;
      if (end >= text.length) {
        end = text.length;
      } else {
        // Try to break at a newline
        const newlineIndex = text.lastIndexOf('\n', end);
        if (newlineIndex > i + maxChars / 2) {
          end = newlineIndex;
        } else {
          // Try to break at a period
          const periodIndex = text.lastIndexOf('. ', end);
          if (periodIndex > i + maxChars / 2) {
            end = periodIndex + 1;
          } else {
            // Try space
            const spaceIndex = text.lastIndexOf(' ', end);
            if (spaceIndex > i + maxChars / 2) {
              end = spaceIndex;
            }
          }
        }
      }

      const chunkText = text.slice(i, end).trim();
      if (chunkText) {
        chunks.push({
          text: chunkText,
          metadata: { strategy: 'recursive_character' }
        });
      }

      i = end - overlapChars;
      if (i <= 0 || end >= text.length) {
        break; // Prevent infinite loop if overlap is too large
      }
      
      // Advance past whitespace if any
      while (i < text.length && /\s/.test(text[i])) {
        i++;
      }
      
      // Check if we're not advancing
      if (i >= end) i = end; 
    }

    return chunks;
  }
}
