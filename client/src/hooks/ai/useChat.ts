import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, AIWorkspaceService } from '../../services/ai/AIWorkspaceService';
import { useSocket } from '../../components/providers/SocketProvider';
import toast from 'react-hot-toast';

export interface ChatCitation {
  citationId?: string;
  source?: string;
  textSnippet?: string;
  title?: string;
}

export interface ChatConfidence {
  score: number;
  rating: string;
}

export function useChat(conversationId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [citations, setCitations] = useState<ChatCitation[]>([]);
  const [confidence, setConfidence] = useState<ChatConfidence | null>(null);
  const { socket } = useSocket();

  const streamingContentRef = useRef('');
  const usedSocketRef = useRef(false);

  useEffect(() => {
    if (!socket) return;

    const handleMetadata = (data: { citations?: ChatCitation[] }) => {
      usedSocketRef.current = true;
      setCitations(data.citations || []);
    };

    const handleChunk = (data: { text: string }) => {
      usedSocketRef.current = true;
      streamingContentRef.current += data.text;
      setStreamingContent(streamingContentRef.current);
    };

    const handleDone = (data: {
      confidence?: ChatConfidence;
      conversationId: string;
      suggestions?: string[];
      citations?: ChatCitation[];
    }) => {
      setIsStreaming(false);
      setSuggestions(data.suggestions || []);
      if (data.confidence) setConfidence(data.confidence);
      if (data.citations?.length) setCitations(data.citations);

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
          timestamp: new Date().toISOString(),
          citations: data.citations,
          confidence: data.confidence,
        }
      ]);
      setStreamingContent('');
      streamingContentRef.current = '';
    };

    const handleError = (data: { error: string }) => {
      setIsStreaming(false);
      setSuggestions([]);
      setCitations([]);
      setConfidence(null);
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
          content: streamingContentRef.current || '(Stopped)',
          timestamp: new Date().toISOString(),
        }
      ]);
      setStreamingContent('');
      streamingContentRef.current = '';
      toast('Generation stopped');
    };

    socket.on('chat_metadata', handleMetadata);
    socket.on('chat_chunk', handleChunk);
    socket.on('chat_done', handleDone);
    socket.on('chat_error', handleError);
    socket.on('chat_stopped', handleStopped);

    return () => {
      socket.off('chat_metadata', handleMetadata);
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
    setCitations([]);
    setConfidence(null);
    setStreamingContent('');
    streamingContentRef.current = '';
    usedSocketRef.current = false;

    try {
      if (socket) {
        socket.emit('chat_message', {
          prompt: content,
          conversationId,
          filters: {}
        });
      }

      await new Promise(resolve => setTimeout(resolve, 800));

      if (!usedSocketRef.current) {
        const fallbackResponse = await AIWorkspaceService.sendMessage(content, conversationId);
        if (fallbackResponse?.response) {
          setIsStreaming(false);
          setMessages(prev => [
            ...prev.filter(msg => msg._id !== tempId),
            { _id: tempId, role: 'user', content, timestamp: new Date().toISOString() },
            {
              _id: `bot-${Date.now()}`,
              role: 'assistant',
              content: fallbackResponse.response,
              timestamp: new Date().toISOString(),
              citations: fallbackResponse.citations,
              confidence: fallbackResponse.confidence,
            }
          ]);
          setCitations(fallbackResponse.citations || []);
          setConfidence(fallbackResponse.confidence || null);
          setSuggestions(fallbackResponse.suggestions || []);
        }
      }
    } catch (error: any) {
      setIsStreaming(false);
      setMessages(prev => [
        ...prev.filter(msg => msg._id !== tempId),
        { _id: tempId, role: 'user', content, timestamp: new Date().toISOString() },
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

  const clearChat = useCallback(() => {
    setMessages([]);
    setSuggestions([]);
    setCitations([]);
    setConfidence(null);
    setStreamingContent('');
    streamingContentRef.current = '';
  }, []);

  return {
    messages,
    setMessages,
    isStreaming,
    streamingContent,
    suggestions,
    citations,
    confidence,
    sendMessage,
    stopGeneration,
    clearChat,
  };
}
