import { OpenAIProvider } from './OpenAIProvider.js';
import { PROVIDER_TYPES } from '../AI.constants.js';
import { AIError, ERROR_CODES } from '../AI.errors.js';

export class ProviderFactory {
  static getProvider(type = PROVIDER_TYPES.OPENAI) {
    switch (type.toLowerCase()) {
      case PROVIDER_TYPES.OPENAI:
        return new OpenAIProvider();
      // case PROVIDER_TYPES.GEMINI:
      //   return new GeminiProvider();
      // case PROVIDER_TYPES.ANTHROPIC:
      //   return new AnthropicProvider();
      default:
        throw new AIError(`Unsupported Provider: ${type}`, ERROR_CODES.INVALID_CONFIGURATION);
    }
  }
}
