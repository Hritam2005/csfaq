import { OpenAIProvider } from './OpenAIProvider.js';
import { GroqProvider } from './GroqProvider.js';
import { PROVIDER_TYPES } from '../AI.constants.js';
import { AIError, ERROR_CODES } from '../AI.errors.js';
import { env } from '../../../config/env.js';

export class ProviderFactory {
  static getProvider(type = PROVIDER_TYPES.OPENAI) {
    switch (type.toLowerCase()) {
      case PROVIDER_TYPES.OPENAI:
        return new OpenAIProvider();
      case PROVIDER_TYPES.GROQ:
        return new GroqProvider();
      // case PROVIDER_TYPES.GEMINI:
      //   return new GeminiProvider();
      // case PROVIDER_TYPES.ANTHROPIC:
      //   return new AnthropicProvider();
      default:
        throw new AIError(`Unsupported Provider: ${type}`, ERROR_CODES.INVALID_CONFIGURATION);
    }
  }

  /** Prefer OpenAI when configured; otherwise fall back to Groq. */
  static getActiveProvider() {
    if (env.OPENAI_API_KEY) {
      return this.getProvider(PROVIDER_TYPES.OPENAI);
    }
    if (env.groqApiKey) {
      return this.getProvider(PROVIDER_TYPES.GROQ);
    }
    return this.getProvider(PROVIDER_TYPES.OPENAI);
  }
}
