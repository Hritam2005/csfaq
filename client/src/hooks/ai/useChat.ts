import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, AIWorkspaceService } from '../../services/ai/AIWorkspaceService';
import { useSocket } from '../../components/providers/SocketProvider';
import toast from 'react-hot-toast';

export function useChat(conversationId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { socket } = useSocket();

  // Accumulator ref because state updates in socket listeners can be tricky
  const streamingContentRef = useRef('');

  useEffect(() => {
    if (!socket) return;

    const handleChunk = (data: { text: string }) => {
      streamingContentRef.current += data.text;
      setStreamingContent(streamingContentRef.current);
    };

    const handleDone = (data: { confidence: any, conversationId: string, suggestions?: string[] }) => {
      setIsStreaming(false);
      setSuggestions(data.suggestions || []);
      if (!streamingContentRef.current.trim()) {
        streamingContentRef.current = 'I could not generate a response yet. Please try again in a moment.';
        setStreamingContent(streamingContentRef.current);
      }
      setMessages(prev => [
        ...prev,
        { 
          _id: `bot-${Date.now()}`, 
          role: 'assistant', 
          content: streamingContentRef.current, 
          timestamp: new Date().toISOString() 
        }
      ]);
      setStreamingContent('');
      streamingContentRef.current = '';
    };

    const handleError = (data: { error: string }) => {
      setIsStreaming(false);
      setSuggestions([]);
      setStreamingContent('');
      streamingContentRef.current = '';
      toast.error(data.error || 'Connection to AI failed.');
    };

    const handleStopped = () => {
      setIsStreaming(false);
      setSuggestions([]);
      setMessages(prev => [
        ...prev,
        { 
          _id: `bot-${Date.now()}`, 
          role: 'assistant', 
          content: streamingContentRef.current, 
          timestamp: new Date().toISOString() 
        }
      ]);
      setStreamingContent('');
      streamingContentRef.current = '';
      toast('Generation stopped');
    };

    socket.on('connect', () => {
      console.log('Socket connected for chat');
    });

    socket.on('chat_chunk', handleChunk);
    socket.on('chat_done', handleDone);
    socket.on('chat_error', handleError);
    socket.on('chat_stopped', handleStopped);

    return () => {
      socket.off('connect');
      socket.off('chat_chunk', handleChunk);
      socket.off('chat_done', handleDone);
      socket.off('chat_error', handleError);
      socket.off('chat_stopped', handleStopped);
    };
  }, [socket]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      { _id: tempId, role: 'user', content, timestamp: new Date().toISOString() }
    ]);

    setIsStreaming(true);
    setSuggestions([]);
    setStreamingContent('');
    streamingContentRef.current = '';

    try {
      if (socket) {
        socket.emit('chat_message', {
          prompt: content,
          conversationId,
          filters: {}
        });
      }

      const fallbackResponse = await AIWorkspaceService.sendMessage(content, conversationId);
      if (fallbackResponse?.response) {
        setIsStreaming(false);
        setMessages(prev => [
          ...prev.filter(msg => msg._id !== tempId),
          {
            _id: `bot-${Date.now()}`,
            role: 'assistant',
            content: fallbackResponse.response,
            timestamp: new Date().toISOString(),
            citations: fallbackResponse.citations
          }
        ]);
        setStreamingContent('');
        streamingContentRef.current = '';
        setSuggestions(fallbackResponse.suggestions || []);
      }
    } catch (error: any) {
      setIsStreaming(false);
      setMessages(prev => [
        ...prev.filter(msg => msg._id !== tempId),
        {
          _id: `bot-${Date.now()}`,
          role: 'assistant',
          content: error?.response?.data?.message || 'Yaksha is temporarily unavailable. Please try again.',
          timestamp: new Date().toISOString()
        }
      ]);
      toast.error('Yaksha could not answer right now.');
    }
  }, [conversationId, socket]);

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
    suggestions,
    sendMessage,
    stopGeneration
  };
}
