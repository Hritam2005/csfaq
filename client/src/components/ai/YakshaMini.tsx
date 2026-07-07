import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Trash2, Square, ExternalLink, BookOpen, Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../../store/store';
import { useChat } from '../../hooks/ai/useChat';
import { Button } from '../ui/Button';
import { KnowledgeService } from '../../services/knowledge/KnowledgeService';
import ReactMarkdown from 'react-markdown';

const DEFAULT_STARTERS = [
  'How do I apply for the internship?',
  'What is the eligibility criteria?',
  'What documents are required?',
];

export const YakshaMini: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [input, setInput] = useState('');

  const {
    messages,
    isStreaming,
    streamingContent,
    suggestions,
    citations,
    confidence,
    sendMessage,
    stopGeneration,
    clearChat,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: popularFaqs = [] } = useQuery({
    queryKey: ['popular-faqs'],
    queryFn: () => KnowledgeService.getPopularFaqs(4),
    enabled: isOpen && isAuthenticated,
  });

  const starterQuestions = popularFaqs.length > 0
    ? popularFaqs.map((f) => f.question)
    : DEFAULT_STARTERS;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const toggleChat = () => {
    if (!isAuthenticated) {
      setShowPrompt(!showPrompt);
    } else {
      setIsOpen(!isOpen);
      setShowPrompt(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isStreaming) sendMessage(suggestion);
  };

  const confidenceColor = confidence?.rating === 'High'
    ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
    : confidence?.rating === 'Medium'
      ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      : 'text-gray-600 bg-gray-50 dark:bg-gray-800';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {showPrompt && !isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-4 w-72 rounded-xl bg-white p-4 shadow-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Interact with Yaksha</h4>
              <button onClick={() => setShowPrompt(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Sign in to chat with Yaksha — your AI guide powered by the official knowledge base.
            </p>
            <div className="flex gap-2">
              <Link to="/login" className="flex-1">
                <Button variant="default" className="w-full h-8 text-xs">Sign In</Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button variant="outline" className="w-full h-8 text-xs">Sign Up</Button>
              </Link>
            </div>
          </motion.div>
        )}

        {isOpen && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 flex h-[560px] w-[380px] flex-col rounded-2xl bg-white shadow-2xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 overflow-hidden"
          >
            <div className="flex items-center justify-between bg-primary-600 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Yaksha</h3>
                  <p className="text-xs text-primary-100">Knowledge-powered assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button onClick={clearChat} className="rounded-full p-1.5 hover:bg-white/20" title="Clear chat">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="rounded-full p-1.5 hover:bg-white/20">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-background">
              {messages.length === 0 ? (
                <div className="flex flex-col h-full">
                  <div className="flex flex-col items-center text-center text-gray-500 space-y-2 mb-6">
                    <Sparkles className="h-8 w-8 text-primary-400" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Ask me anything about the internship</p>
                    <p className="text-xs">I search the official knowledge base to give accurate answers.</p>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Popular questions</p>
                  <div className="space-y-2">
                    {starterQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSuggestionClick(q)}
                        className="w-full text-left rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs hover:border-primary-400 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <Link
                    to="/faqs"
                    className="mt-4 inline-flex items-center justify-center gap-1 text-xs text-primary-600 hover:underline"
                  >
                    <BookOpen className="h-3 w-3" /> Browse full knowledge base
                  </Link>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={msg._id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[88%] rounded-2xl px-4 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-none'
                        : 'bg-white border border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 rounded-bl-none shadow-sm'
                    }`}>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                        <div className="mt-2 border-t border-gray-100 pt-2 dark:border-gray-700">
                          <p className="text-[10px] font-semibold uppercase text-gray-400 mb-1">Sources</p>
                          {msg.citations.slice(0, 3).map((c: any, i: number) => (
                            <div key={i} className="text-[11px] text-primary-600 dark:text-primary-400 truncate">
                              {c.source === 'FAQ' && c.citationId ? (
                                <Link to={`/faqs/${c.citationId}`} className="hover:underline">
                                  📄 {c.textSnippet || 'FAQ article'}
                                </Link>
                              ) : (
                                <span>📄 {c.textSnippet || c.title || 'Document'}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.role === 'assistant' && msg.confidence && (
                        <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${confidenceColor}`}>
                          {msg.confidence.rating} confidence
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}

              {isStreaming && streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[88%] rounded-2xl rounded-bl-none border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{streamingContent}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {isStreaming && !streamingContent && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-none border bg-white px-4 py-2 text-sm text-gray-500 shadow-sm dark:bg-gray-800">
                    <Loader2 className="h-4 w-4 animate-spin" /> Searching knowledge base...
                  </div>
                </div>
              )}

              {!isStreaming && citations.length > 0 && messages.length > 0 && (
                <div className="rounded-lg border border-primary-100 bg-primary-50/50 p-2 dark:border-primary-900 dark:bg-primary-900/10">
                  <p className="text-[10px] font-semibold uppercase text-primary-600 mb-1">Latest sources</p>
                  {citations.slice(0, 2).map((c, i) => (
                    <div key={i} className="text-[11px] text-gray-600 dark:text-gray-400 truncate">
                      {c.citationId ? (
                        <Link to={`/faqs/${c.citationId}`} className="hover:text-primary-600">{c.textSnippet}</Link>
                      ) : c.textSnippet}
                    </div>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
              {suggestions.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs text-primary-700 hover:bg-primary-100"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about the internship..."
                  className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
                />
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={stopGeneration}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                    title="Stop"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white disabled:opacity-50 hover:bg-primary-700"
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </button>
                )}
              </form>
              <Link
                to="/ai/chat"
                className="mt-2 flex items-center justify-center gap-1 text-[11px] text-gray-400 hover:text-primary-500"
              >
                <ExternalLink className="h-3 w-3" /> Open full Yaksha workspace
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleChat}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        {isOpen && isAuthenticated ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </div>
  );
};
