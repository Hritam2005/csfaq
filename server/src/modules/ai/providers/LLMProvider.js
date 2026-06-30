/**
 * Abstract interface for LLM Providers
 */
export class LLMProvider {
  /**
   * Generates a single synchronous response.
   * @param {Array<{role: string, content: string}>} messages 
   * @param {Object} options (temperature, maxTokens, model)
   * @returns {Promise<{content: string, usage: Object}>}
   */
  async generate(messages, options = {}) {
    throw new Error('Method not implemented.');
  }

  /**
   * Returns an async iterable for streaming responses.
   * @param {Array<{role: string, content: string}>} messages 
   * @param {Object} options 
   * @returns {AsyncGenerator<string, void, unknown>}
   */
  async *stream(messages, options = {}) {
    throw new Error('Method not implemented.');
  }
}
