import { QueryNormalizer } from './QueryNormalizer.js';
import { SEARCH_INTENTS } from '../Search.constants.js';

export class QueryParser {
  /**
   * Parses the raw input into a structured query object.
   * Detects intent via simple heuristics (or passes to an LLM in a more advanced pipeline).
   */
  static parse(rawQuery) {
    const normalized = QueryNormalizer.normalize(rawQuery);
    
    const parsed = {
      raw: rawQuery,
      normalized,
      tokens: normalized.split(' ').filter(t => t.length > 0),
      intent: SEARCH_INTENTS.UNKNOWN,
      isQuestion: false,
    };

    // Very basic Intent Detection Heuristics
    const questionWords = ['how', 'what', 'why', 'when', 'where', 'who', 'is', 'can', 'does'];
    if (parsed.tokens.some(t => questionWords.includes(t)) || rawQuery.includes('?')) {
      parsed.isQuestion = true;
      parsed.intent = SEARCH_INTENTS.FAQ_LOOKUP;
    } else if (parsed.tokens.includes('document') || parsed.tokens.includes('file') || parsed.tokens.includes('pdf')) {
      parsed.intent = SEARCH_INTENTS.DOCUMENT_SEARCH;
    } else {
      parsed.intent = SEARCH_INTENTS.CONCEPT_EXPLORATION;
    }

    return parsed;
  }
}
