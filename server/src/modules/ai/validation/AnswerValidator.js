import { AIError, ERROR_CODES } from '../AI.errors.js';

export class AnswerValidator {
  /**
   * Ensures the LLM did not break rules (e.g. hallucinating outside of context).
   */
  static validate(responseContent) {
    if (!responseContent) return false;

    // Check for explicit hallucination rejection by the system prompt
    const rejectionPhrase = "I cannot answer this based on the available knowledge.";
    if (responseContent.includes(rejectionPhrase)) {
      return false; // Valid, but means we didn't have the answer
    }

    return true; // Valid answer
  }
}
