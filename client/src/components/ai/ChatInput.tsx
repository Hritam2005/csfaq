import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip } from 'lucide-react';
import { Button } from '../ui/Button';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onStop, isStreaming, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isStreaming) {
      onStop();
      return;
    }
    if (!input.trim() || disabled) return;
    
    onSend(input.trim());
    setInput('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto p-4">
      <form 
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 rounded-2xl border border-gray-200 bg-white p-2 pr-12 shadow-sm focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:focus-within:border-primary-500"
      >
        <button 
          type="button"
          disabled={disabled || isStreaming}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 dark:hover:text-gray-300"
          title="Attach Document"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isStreaming}
          placeholder={isStreaming ? 'AI is generating...' : 'Ask the enterprise knowledge base...'}
          className="max-h-52 min-h-[44px] w-full resize-none bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500 disabled:opacity-50"
          rows={1}
        />

        <div className="absolute bottom-3 right-3 flex items-center justify-center">
          {isStreaming ? (
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={onStop}
              className="h-8 w-8 rounded-lg text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              title="Stop Generation"
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || disabled}
              className="h-8 w-8 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500"
              title="Send Message"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
      
      <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        AI responses are generated based on indexed enterprise data. Verify critical information.
      </div>
    </div>
  );
};
