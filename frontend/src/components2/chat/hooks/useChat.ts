import { useState, useCallback } from 'react';
import { Message, StreamChunk, Citation } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);

  const handleStream = useCallback(async (userMessage: string) => {
    if (isStreaming) return;

    // Add user message
    const userMessageObj: Message = {
      id: uuidv4(),
      text: userMessage,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessageObj]);

    // Create placeholder for bot message
    const botMessageId = uuidv4();
    const botMessage: Message = {
      id: botMessageId,
      text: '',
      isBot: true,
      timestamp: new Date(),
      isComplete: false,
    };
    setMessages(prev => [...prev, botMessage]);
    setCurrentStreamId(botMessageId);
    setIsStreaming(true);

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let citations: Citation[] = [];
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Process the chunks
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          if (line.includes('[DONE]')) {
            setMessages(prev => prev.map(msg => 
              msg.id === botMessageId ? { ...msg, isComplete: true } : msg
            ));
            setIsStreaming(false);
            setCurrentStreamId(null);
            break;
          }

          try {
            const data: StreamChunk = JSON.parse(line.slice(5));
            
            if (data.citations) {
              citations = data.citations;
              setMessages(prev => prev.map(msg => 
                msg.id === botMessageId ? { ...msg, citations } : msg
              ));
            }

            if (data.chunk) {
              accumulatedText += data.chunk;
              setMessages(prev => prev.map(msg => 
                msg.id === botMessageId ? { ...msg, text: accumulatedText } : msg
              ));
            }
          } catch (e) {
            console.error('Failed to parse chunk:', e);
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? { 
          ...msg, 
          text: 'Error: Failed to get response', 
          isComplete: true 
        } : msg
      ));
    } finally {
      setIsStreaming(false);
      setCurrentStreamId(null);
    }
  }, [isStreaming]);

  return {
    messages,
    isStreaming,
    currentStreamId,
    sendMessage: handleStream,
  };
} 