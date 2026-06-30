import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // Standardized dark code block theme
import { Bot, User, Check, Copy } from 'lucide-react';
import { cn } from '../ui/Button';

interface MessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming?: boolean;
}

export const MessageRenderer: React.FC<MessageProps> = ({ role, content, isStreaming }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = role === 'user';

  return (
    <div className={cn("group relative flex gap-4 w-full px-4 py-6 md:px-6 lg:px-8", isUser ? "bg-white dark:bg-background" : "bg-gray-50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800/50")}>
      <div className="flex w-full max-w-4xl mx-auto gap-4 md:gap-6">
        
        {/* Avatar */}
        <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {isUser ? (
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <Bot className="h-5 w-5 text-primary-600 dark:text-primary-500" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 prose prose-gray dark:prose-invert max-w-none break-words">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              table: ({node, ...props}) => <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700" {...props} /></div>,
              a: ({node, ...props}) => <a className="text-primary-600 hover:text-primary-500 dark:text-primary-400" target="_blank" rel="noopener noreferrer" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
          
          {isStreaming && (
            <span className="inline-block h-4 w-2 ml-1 animate-pulse bg-gray-400 dark:bg-gray-500 rounded-sm" />
          )}
        </div>

        {/* Actions (Hidden until hover) */}
        {!isStreaming && (
          <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handleCopy}
              className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              title="Copy message"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
