import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bot } from 'lucide-react';
import { useChat } from '../../hooks/ai/useChat';
import { ChatInput } from '../../components/ai/ChatInput';
import { MessageRenderer } from '../../components/ai/MessageRenderer';
import { AIWorkspaceService } from '../../services/ai/AIWorkspaceService';

export const ConversationPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const { data } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => AIWorkspaceService.getConversation(id!),
    enabled: !!id,
  });

  const { messages, setMessages, isStreaming, streamingContent, sendMessage, stopGeneration } = useChat(id);

  // Sync server messages on load
  useEffect(() => {
    if (data?.data?.messages) {
      setMessages(data.data.messages);
    } else if (!id) {
      setMessages([]);
    }
  }, [data, id, setMessages]);

  // Auto-scroll logic
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async (content: string) => {
    if (!id) {
      // If we are on /ai/chat (new conversation), we must create one first, then navigate
      try {
        const res = await AIWorkspaceService.createConversation(content.substring(0, 30));
        navigate(`/ai/conversations/${res.data._id}`, { replace: true });
        // The navigation will unmount this hook instance. 
        // In a real app we'd decouple the stream from the route via a global provider.
        // For simplicity, we trigger send after navigation in this scoped component block.
      } catch (e) {
        // handle error
      }
    } else {
      sendMessage(content);
    }
  };

  return (
    <div className="flex h-full flex-col relative">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isStreaming ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30">
              <Bot className="h-8 w-8 text-primary-600 dark:text-primary-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How can I help you today?</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md">
              Ask questions about enterprise documents, request data summaries, or synthesize cross-department knowledge.
            </p>
          </div>
        ) : (
          <div className="pb-32">
            {messages.map((msg, idx) => (
              <MessageRenderer key={msg._id || idx} role={msg.role} content={msg.content} />
            ))}
            
            {isStreaming && streamingContent && (
              <MessageRenderer role="assistant" content={streamingContent} isStreaming={true} />
            )}
            
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input Area Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-background dark:via-background pt-10">
        <ChatInput 
          onSend={id ? handleSend : async (msg) => {
            // Lazy New Chat execution
            const res = await AIWorkspaceService.createConversation(msg.substring(0, 30));
            navigate(`/ai/conversations/${res.data._id}`, { state: { initialMessage: msg } });
          }} 
          onStop={stopGeneration} 
          isStreaming={isStreaming} 
        />
      </div>

    </div>
  );
};
