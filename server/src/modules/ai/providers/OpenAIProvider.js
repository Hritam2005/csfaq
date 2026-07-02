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
    return new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      timeout: 30000,   // 30s timeout
      maxRetries: 2,    // retry transient errors
    });
  }

  async generate(messages, options = {}) {
    try {
      const client = this._getClient();
      if (!client) {
        const userMessage = messages.findLast(m => m.role === 'user')?.content || '';
        const systemMessage = messages.find(m => m.role === 'system')?.content || '';
        const contextMatch = systemMessage.match(/--- SOURCE ID: (.+?) ---([\s\S]*)/g) || [];
        const contextEntries = (contextMatch || []).map(entry => entry.replace(/^--- SOURCE ID: .*? ---\s*/s, '').trim()).filter(Boolean);

        let answer = `I don't have an OpenAI key configured, but I can still help from the available knowledge sources.\n\nYour question was: ${userMessage}\n\nI recommend checking the official documentation or FAQ, and if you share the exact topic, I can guide you more precisely.`;

        if (contextEntries.length > 0) {
          const firstEntry = contextEntries[0];
          const sentence = firstEntry.split(/\n/).find(line => line.trim().length > 0) || firstEntry;
          answer = `Based on the available knowledge sources, ${sentence.trim()}\n\nIf this is not enough for your question, please share a little more detail or the exact topic you want clarified.`;
        }

        if (!answer.toLowerCase().includes('source')) {
          answer += '\n\nIf you want, I can also help you refine this question or look for a specific document section.';
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
      console.error('[OpenAIProvider] generate() error:', {
        message: error.message,
        status: error.status,
        code: error.code,
        cause: error.cause?.message,
        type: error.constructor?.name,
      });
      throw new AIError(`OpenAI API Failed: ${error.message}`, ERROR_CODES.PROVIDER_FAILED);
    }
  }

  async *generateStream(messages, options = {}) {
    try {
      const client = this._getClient();
      if (!client) {
        const userMessage = messages.findLast(m => m.role === 'user')?.content || '';
        const systemMessage = messages.find(m => m.role === 'system')?.content || '';
        const contextMatch = systemMessage.match(/--- SOURCE ID: (.+?) ---([\s\S]*)/g) || [];
        const contextEntries = (contextMatch || []).map(entry => entry.replace(/^--- SOURCE ID: .*? ---\s*/s, '').trim()).filter(Boolean);
        let mockResponse = `I can still help from the available knowledge sources. Your question was: ${userMessage}`;

        if (contextEntries.length > 0) {
          const firstEntry = contextEntries[0];
          const sentence = firstEntry.split(/\n/).find(line => line.trim().length > 0) || firstEntry;
          mockResponse = `Based on the available knowledge sources, ${sentence.trim()}\n\nIf this does not fully answer your question, please share more detail about the topic you want help with.`;
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
