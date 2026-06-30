import FAQ from '../../../models/FAQ.js';
import { QueryNormalizer } from '../query/QueryNormalizer.js';

export class Autocomplete {
  /**
   * Fast text-based autocomplete hitting indexes directly.
   * Usually powered by Edge NGrams or simple Regex matching for exact prefixes.
   */
  static async suggest(rawQuery, limit = 5) {
    const normalized = QueryNormalizer.normalize(rawQuery);
    if (!normalized || normalized.length < 2) return [];

    // Simple prefix Regex match against FAQ questions for fast suggestions
    const regex = new RegExp(`^${normalized}`, 'i');

    const suggestions = await FAQ.find(
      { question: regex, isDeleted: false },
      { question: 1 }
    )
    .limit(limit)
    .lean();

    return suggestions.map(s => s.question);
  }
}
