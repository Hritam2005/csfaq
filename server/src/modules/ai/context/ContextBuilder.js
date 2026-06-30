import { AI_LIMITS } from '../AI.constants.js';

export class ContextBuilder {
  /**
   * Compresses and merges Hybrid Search results into a single context string
   * formatted for the LLM prompt, staying strictly within Token Budget limits.
   */
  static build(rankedResults) {
    let contextString = '';
    let currentTokens = 0; // Simple char estimation in absence of tiktoken

    const usedResults = [];

    for (const result of rankedResults) {
      // Estimate tokens: roughly 4 chars per token
      const text = result._type === 'faq' ? `Q: ${result.question}\nA: ${result.answer}` : result.text;
      const estimatedTokens = Math.ceil(text.length / 4);

      if (currentTokens + estimatedTokens > AI_LIMITS.MAX_RETRIEVAL_TOKENS) {
        break; // Context window full
      }

      contextString += `\n\n--- SOURCE ID: ${result._id} ---\n${text}`;
      currentTokens += estimatedTokens;
      usedResults.push(result);
    }

    return {
      text: contextString.trim(),
      tokens: currentTokens,
      sources: usedResults,
    };
  }
}
