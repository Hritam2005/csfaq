import { PromptSanitizer } from '../security/PromptSanitizer.js';
import { KnowledgeRetriever } from '../retriever/KnowledgeRetriever.js';
import { ContextBuilder } from '../context/ContextBuilder.js';
import { SYSTEM_PROMPT } from '../prompts/SystemPrompt.js';
import { ProviderFactory } from '../providers/ProviderFactory.js';
import { ConversationManager } from './ConversationManager.js';
import { AIAnalytics } from '../analytics/AIAnalytics.js';
import { ConfidenceCalculator } from '../analytics/ConfidenceCalculator.js';
import { CitationBuilder } from '../../knowledge-engine/citations/CitationBuilder.js';
import { ResponseGuard } from './ResponseGuard.js';
import { SuggestedQuestions } from '../../chat/suggestions/SuggestedQuestions.js';

export class AIOrchestrator {
  /**
   * The Master RAG Pipeline processing an incoming chat request.
   */
  static async chat(prompt, conversationId, user, filters = {}) {
    const startTime = Date.now();

    // 1. Sanitize & Security Check
    const cleanPrompt = PromptSanitizer.sanitize(prompt);
    const guardResult = ResponseGuard.evaluate(cleanPrompt);

    if (guardResult.shouldFilter) {
      return {
        conversationId: conversationId || null,
        response: guardResult.reply,
        citations: [],
        confidence: { score: 0.2, rating: 'Low' },
        suggestions: guardResult.suggestions,
      };
    }

    // 2. Manage Conversation Memory
    const conversation = await ConversationManager.getConversation(conversationId, user._id);
    const history = ConversationManager.getRecentHistory(conversation, 4); // Keep last 4 turns

    // 3. Knowledge Retrieval (Hybrid Search)
    const retrievalStart = Date.now();
    const retrievedDocs = await KnowledgeRetriever.retrieve(cleanPrompt, filters);
    const retrievalLatency = Date.now() - retrievalStart;

    // 4. Context Building
    const context = ContextBuilder.build(retrievedDocs);
    const systemInstruction = SYSTEM_PROMPT.replace('{{CONTEXT}}', context.text);

    // 5. Construct LLM Messages Array
    const messages = [
      { role: 'system', content: systemInstruction },
      ...history,
      { role: 'user', content: cleanPrompt }
    ];

    // 6. Execute Provider Call
    const provider = ProviderFactory.getActiveProvider();
    const response = await provider.generate(messages);

    // 7. Format Citations
    const citations = context.sources.map(source => {
      if (source._type === 'chunk') return CitationBuilder.build(source, source.document);
      return { citationId: source._id, source: 'FAQ', textSnippet: source.question };
    });

    // 8. Calculate Confidence
    const confidence = ConfidenceCalculator.calculate(context.sources, response.content);

    // 9. Persist and Analytics
    await ConversationManager.appendTurn(conversation, cleanPrompt, response.content, citations);
    
    await AIAnalytics.logUsage({
      conversationId: conversation._id,
      userId: user._id,
      provider: provider.providerType,
      model: provider.defaultModel,
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
      latencyMs: Date.now() - startTime,
      retrievalLatencyMs: retrievalLatency,
      confidenceScore: confidence.score,
      confidenceRating: confidence.rating,
    });

    return {
      conversationId: conversation._id,
      response: response.content,
      citations,
      confidence,
      suggestions: SuggestedQuestions.generate(response.content),
    };
  }

  static async streamChat(prompt, conversationId, user, filters = {}, res) {
    const startTime = Date.now();
    const cleanPrompt = PromptSanitizer.sanitize(prompt);
    const guardResult = ResponseGuard.evaluate(cleanPrompt);

    if (guardResult.shouldFilter) {
      res.write(`data: ${JSON.stringify({ type: 'metadata', conversationId: conversationId || null, citations: [] })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: guardResult.reply })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'done', confidence: { score: 0.2, rating: 'Low' }, suggestions: guardResult.suggestions })}\n\n`);
      res.end();
      return;
    }

    const conversation = await ConversationManager.getConversation(conversationId, user._id);
    const history = ConversationManager.getRecentHistory(conversation, 4);

    const retrievalStart = Date.now();
    const retrievedDocs = await KnowledgeRetriever.retrieve(cleanPrompt, filters);
    const retrievalLatency = Date.now() - retrievalStart;

    const context = ContextBuilder.build(retrievedDocs);
    const systemInstruction = SYSTEM_PROMPT.replace('{{CONTEXT}}', context.text);

    const messages = [
      { role: 'system', content: systemInstruction },
      ...history,
      { role: 'user', content: cleanPrompt }
    ];

    const citations = context.sources.map(source => {
      if (source._type === 'chunk') return CitationBuilder.build(source, source.document);
      return { citationId: source._id, source: 'FAQ', textSnippet: source.question };
    });

    // Send initial metadata
    res.write(`data: ${JSON.stringify({ type: 'metadata', conversationId: conversation._id, citations })}\n\n`);

    const provider = ProviderFactory.getActiveProvider();
    let fullContent = '';

    // Simulate streaming by receiving an async iterable from the provider
    // Note: Provider needs to implement generateStream
    const stream = await provider.generateStream(messages);

    for await (const chunk of stream) {
      if (chunk.content) {
        fullContent += chunk.content;
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk.content })}\n\n`);
      }
    }

    const confidence = ConfidenceCalculator.calculate(context.sources, fullContent);

    await ConversationManager.appendTurn(conversation, cleanPrompt, fullContent, citations);

    await AIAnalytics.logUsage({
      conversationId: conversation._id,
      userId: user._id,
      provider: provider.providerType,
      model: provider.defaultModel,
      promptTokens: 0, // In streaming, tokens must be estimated or fetched differently
      completionTokens: 0, 
      totalTokens: 0,
      latencyMs: Date.now() - startTime,
      retrievalLatencyMs: retrievalLatency,
      confidenceScore: confidence.score,
      confidenceRating: confidence.rating,
    });

    res.write(`data: ${JSON.stringify({ type: 'done', confidence, suggestions: SuggestedQuestions.generate(fullContent) })}\n\n`);
    res.end();
  }

  static async streamChatSocket(prompt, conversationId, user, filters = {}, socket) {
    const startTime = Date.now();
    const cleanPrompt = PromptSanitizer.sanitize(prompt);
    const guardResult = ResponseGuard.evaluate(cleanPrompt);

    if (guardResult.shouldFilter) {
      socket.emit('chat_metadata', { conversationId: conversationId || null, citations: [] });
      socket.emit('chat_chunk', { text: guardResult.reply });
      socket.emit('chat_done', { confidence: { score: 0.2, rating: 'Low' }, conversationId: conversationId || null, suggestions: guardResult.suggestions });
      return;
    }

    const conversation = await ConversationManager.getConversation(conversationId, user._id);
    const history = ConversationManager.getRecentHistory(conversation, 4);

    const retrievalStart = Date.now();
    const retrievedDocs = await KnowledgeRetriever.retrieve(cleanPrompt, filters);
    const retrievalLatency = Date.now() - retrievalStart;

    const context = ContextBuilder.build(retrievedDocs);
    const systemInstruction = SYSTEM_PROMPT.replace('{{CONTEXT}}', context.text);

    const messages = [
      { role: 'system', content: systemInstruction },
      ...history,
      { role: 'user', content: cleanPrompt }
    ];

    const citations = context.sources.map(source => {
      if (source._type === 'chunk') return CitationBuilder.build(source, source.document);
      return { citationId: source._id, source: 'FAQ', textSnippet: source.question };
    });

    socket.emit('chat_metadata', { conversationId: conversation._id, citations });

    const provider = ProviderFactory.getActiveProvider();
    let fullContent = '';

    const stream = await provider.generateStream(messages);

    for await (const chunk of stream) {
      if (chunk.content) {
        fullContent += chunk.content;
        socket.emit('chat_chunk', { text: chunk.content });
      }
    }

    const confidence = ConfidenceCalculator.calculate(context.sources, fullContent);
    await ConversationManager.appendTurn(conversation, cleanPrompt, fullContent, citations);

    await AIAnalytics.logUsage({
      conversationId: conversation._id,
      userId: user._id,
      provider: provider.providerType,
      model: provider.defaultModel,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      latencyMs: Date.now() - startTime,
      retrievalLatencyMs: retrievalLatency,
      confidenceScore: confidence.score,
      confidenceRating: confidence.rating,
    });

    socket.emit('chat_done', {
      confidence,
      conversationId: conversation._id,
      citations,
      suggestions: SuggestedQuestions.generate(fullContent),
    });
  }
}
