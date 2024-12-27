import { useState } from 'react';
import { Message } from '../types';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      text: input,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const tempBotMessage: Message = {
        text: '',
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, tempBotMessage]);

      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to initialize stream reader');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              console.log('Stream completed. Final message:', messages[messages.length - 1]);
              break;
            }

            try {
              const parsedData = JSON.parse(data);
              console.log('Received data:', parsedData);
              
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.isBot) {
                  if (parsedData.citations) {
                    console.log('Adding citations:', parsedData.citations);
                    lastMessage.citations = parsedData.citations;
                  } else if (parsedData.chunk) {
                    console.log('Adding chunk:', parsedData.chunk);
                    lastMessage.text += parsedData.chunk;
                  }
                  console.log('Updated message:', lastMessage);
                }
                return newMessages;
              });
            } catch (e) {
              console.error('Failed to parse chunk:', e);
            }
          }
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        text: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    messages,
    input,
    isTyping,
    setInput,
    handleSend,
  };
}; 