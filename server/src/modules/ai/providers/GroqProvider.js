import { LLMProvider } from './LLMProvider.js';
import { AIError, ERROR_CODES } from '../AI.errors.js';
import { OpenAI } from 'openai';
import { env } from '../../../config/env.js';

export class GroqProvider extends LLMProvider {
  constructor() {
    super();
    this.providerType = 'groq';
    this.defaultModel = 'llama-3.3-70b-versatile';
  }

  _getClient() {
    if (!env.groqApiKey) {
      throw new AIError('GROQ_API_KEY is not configured', ERROR_CODES.INVALID_CONFIGURATION);
    }
    return new OpenAI({
      apiKey: env.groqApiKey,
      baseURL: 'https://api.groq.com/openai/v1',
      timeout: 30000,
      maxRetries: 2,
    });
  }

  async generate(messages, options = {}) {
    try {
      const client = this._getClient();
      const response = await client.chat.completions.create({
        model: options.model || this.defaultModel,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 1000,
      });

      return {
        content: response.choices[0].message.content,
        usage: response.usage,
      };
    } catch (error) {
      console.error('[GroqProvider] generate() error:', {
        message: error.message,
        status: error.status,
        code: error.code,
      });
      throw new AIError(`Groq API Failed: ${error.message}`, ERROR_CODES.PROVIDER_FAILED);
    }
  }

  async *generateStream(messages, options = {}) {
    try {
      const client = this._getClient();
      const stream = await client.chat.completions.create({
        model: options.model || this.defaultModel,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 1000,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        yield { content };
      }
    } catch (error) {
      console.error('[GroqProvider Stream Error]', error);
      yield { content: '\n\n[System: The streaming connection failed.]' };
    }
  }
}
