import { LLMProvider } from './LLMProvider.js';
import { AIError, ERROR_CODES } from '../AI.errors.js';
import { OpenAI } from 'openai'; 
import { env } from '../../../config/env.js';

export class OpenAIProvider extends LLMProvider {
  constructor() {
    super();
    this.defaultModel = 'gpt-4o-mini';
  }

  _getClient() {
    if (!env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY missing, using mock client');
      return null;
    }
    return new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  async generate(messages, options = {}) {
    try {
      const client = this._getClient();
      if (!client) {
        // Find context if available
        const sysMsg = messages.find(m => m.role === 'system');
        let answer = "I don't have an OpenAI key configured, but I received your message!";
        if (sysMsg && sysMsg.content) {
            if (sysMsg.content.includes('Context:')) {
                answer = "Based on the provided PDF documents, I can tell you that the system has successfully retrieved context related to your query! However, without an OpenAI API key, I cannot synthesize a natural language response. Please check the retrieved context in the system.";
            }
        }
        return {
          content: answer,
          usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
        };
      }

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
      throw new AIError(`OpenAI API Failed: ${error.message}`, ERROR_CODES.PROVIDER_FAILED);
    }
  }

  async *generateStream(messages, options = {}) {
    try {
      const client = this._getClient();
      if (!client) {
        const sysMsg = messages.find(m => m.role === 'system');
        let mockResponse = "I am a mock response because the OpenAI API Key is missing. However, the retrieval system is active.";
        if (sysMsg && sysMsg.content && sysMsg.content.includes('Context:')) {
            mockResponse = "Based on the PDF documents, I can see relevant context has been retrieved. Without an OpenAI API Key, I can't synthesize it completely, but the system is working!";
        }
        const words = mockResponse.split(' ');
        for (const word of words) {
            yield { content: word + ' ' };
            await new Promise(r => setTimeout(r, 50));
        }
        return;
      }

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
      console.error('[OpenAIProvider Stream Error]', error);
      yield { content: '\n\n[System: The streaming connection failed.]' };
    }
  }
}
