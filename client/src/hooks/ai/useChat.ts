import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage } from '../../services/ai/AIWorkspaceService';
import { useSocket } from '../../components/providers/SocketProvider';
import toast from 'react-hot-toast';

export function useChat(conversationId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const { socket, isConnected } = useSocket();

  // Accumulator ref because state updates in socket listeners can be tricky
  const streamingContentRef = useRef('');

  useEffect(() => {
    if (!socket) return;

    const handleChunk = (data: { text: string }) => {
      streamingContentRef.current += data.text;
      setStreamingContent(streamingContentRef.current);
    };

    const handleDone = (_data: { confidence: any, conversationId: string }) => {
      setIsStreaming(false);
      const finalContent = streamingContentRef.current;
      setMessages(prev => [
        ...prev,
        { 
          _id: `bot-${Date.now()}`, 
          role: 'assistant', 
          content: finalContent, 
          timestamp: new Date().toISOString() 
        }
      ]);
      setStreamingContent('');
      streamingContentRef.current = '';
    };

    const handleError = (data: { error: string }) => {
      setIsStreaming(false);
      setStreamingContent('');
      streamingContentRef.current = '';
      toast.error(data.error || 'Connection to AI failed.');
    };

    const handleStopped = () => {
      setIsStreaming(false);
      const finalContent = streamingContentRef.current;
      setMessages(prev => [
        ...prev,
        { 
          _id: `bot-${Date.now()}`, 
          role: 'assistant', 
          content: finalContent, 
          timestamp: new Date().toISOString() 
        }
      ]);
      setStreamingContent('');
      streamingContentRef.current = '';
      toast('Generation stopped');
    };

    socket.on('chat_chunk', handleChunk);
    socket.on('chat_done', handleDone);
    socket.on('chat_error', handleError);
    socket.on('chat_stopped', handleStopped);

    return () => {
      socket.off('chat_chunk', handleChunk);
      socket.off('chat_done', handleDone);
      socket.off('chat_error', handleError);
      socket.off('chat_stopped', handleStopped);
    };
  }, [socket]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !socket || !isConnected) {
      toast.error('You are disconnected from the server. Please refresh or log in again.');
      return;
    }

    // Optimistic UI Append
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [
      ...prev, 
      { _id: tempId, role: 'user', content, timestamp: new Date().toISOString() }
    ]);

    setIsStreaming(true);
    setStreamingContent('');
    streamingContentRef.current = '';

    socket.emit('chat_message', {
      prompt: content,
      conversationId,
      filters: {}
    });
  }, [conversationId, socket, isConnected]);

  const stopGeneration = useCallback(() => {
    if (socket) {
      socket.emit('stop_generation');
    }
  }, [socket]);

  return {
    messages,
    setMessages,
    isStreaming,
    streamingContent,
    sendMessage,
    stopGeneration
  };
}
