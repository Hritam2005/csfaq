export class QueryNormalizer {
  /**
   * Normalizes search strings: trims whitespace, lowers case, removes punctuation.
   */
  static normalize(query) {
    if (!query || typeof query !== 'string') return '';

    return query
      .trim()
      .toLowerCase()
      // Remove basic punctuation but keep alphanumerics and spaces
      .replace(/[^\w\s]|_/g, '')
      // Collapse multiple spaces
      .replace(/\s+/g, ' ');
  }
}
