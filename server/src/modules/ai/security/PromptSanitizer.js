import { AIError, ERROR_CODES } from '../AI.errors.js';

export class PromptSanitizer {
  /**
   * Cleans input and blocks rudimentary Prompt Injection / Jailbreak attempts.
   */
  static sanitize(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      throw new AIError('Invalid prompt format', ERROR_CODES.PROMPT_INJECTION);
    }

    const lower = prompt.toLowerCase();

    // Rudimentary heuristic blocklist
    const blocklist = [
      'ignore all previous instructions',
      'system prompt',
      'you are an unfiltered',
      'bypass the rules',
      'forget the rules',
    ];

    for (const pattern of blocklist) {
      if (lower.includes(pattern)) {
        throw new AIError('Security violation: Prompt injection detected', ERROR_CODES.PROMPT_INJECTION);
      }
    }

    // Strip problematic control characters
    return prompt.replace(/[\x00-\x1F\x7F]/g, '').trim();
  }
}
