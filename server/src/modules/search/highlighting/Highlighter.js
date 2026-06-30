export class Highlighter {
  /**
   * Highlights keyword matches in a text block, wrapping them in <mark> tags.
   * Semantic matches are harder to highlight cleanly without LLM intervention, 
   * so this relies on exact/partial token matches.
   */
  static highlight(text, query) {
    if (!text || !query) return text;
    
    // Normalize and tokenize the query
    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    if (tokens.length === 0) return text;

    let highlightedText = text;
    
    for (const token of tokens) {
      // Escape regex chars just in case
      const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Case-insensitive global replace
      const regex = new RegExp(`(${escapedToken})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    }

    return highlightedText;
  }
}
