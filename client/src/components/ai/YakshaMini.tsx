import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../../store/store';
import { useChat } from '../../hooks/ai/useChat';
import { Button } from '../ui/Button';
import ReactMarkdown from 'react-markdown';

export const YakshaMini: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [input, setInput] = useState('');
  
  const { messages, isStreaming, streamingContent, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {/* Unauthenticated Prompt Bubble */}
        {showPrompt && !isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-4 w-72 rounded-xl bg-white p-4 shadow-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Interact with Yaksha</h4>
              <button onClick={() => setShowPrompt(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please sign in or sign up to access the AI assistant.
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

        {/* Chat Window */}
        {isOpen && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 flex h-[500px] w-[350px] flex-col rounded-2xl bg-white shadow-2xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-primary-600 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Yaksha Mini</h3>
                  <p className="text-xs text-primary-100">Vicharanashala Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-white/20 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-background">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-2">
                  <Bot className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm">Hi! I can answer questions about the Vicharanashala Internship based on the official FAQ.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary-600 text-white rounded-br-none' 
                        : 'bg-white border border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 rounded-bl-none shadow-sm'
                    }`}>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isStreaming && streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-none border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>
                        {streamingContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
              
              {isStreaming && !streamingContent && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-none border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
                <button 
                  type="submit" 
                  disabled={isStreaming || !input.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white disabled:opacity-50 transition-colors hover:bg-primary-700"
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        {isOpen && isAuthenticated ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </div>
  );
};
