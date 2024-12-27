import { Text } from '@mantine/core';
import { Message } from '../types';
import { useMemo } from 'react';

interface MessageContentProps {
  message: Message;
}

export function MessageContent({ message }: MessageContentProps) {
  // Split content into parts (text and citations)
  const parts = useMemo(() => {
    if (!message.isBot || !message.text) return [{ type: 'text', content: message.text }];

    const textParts = message.text.split(/(\[References:.*?\]|\[\d+\])/gs);
    
    return textParts.map(part => {
      // Check if this is a citation reference
      const citationMatch = part.match(/\[(\d+)\]/);
      if (citationMatch) {
        const citationId = parseInt(citationMatch[1]);
        const citation = message.citations?.find(c => c.id === citationId);
        return {
          type: 'citation',
          content: part,
          citation,
        };
      }

      // Check if this is the references section
      if (part.startsWith('References:')) {
        return {
          type: 'references',
          content: part,
        };
      }

      // Regular text
      return {
        type: 'text',
        content: part,
      };
    });
  }, [message.text, message.citations, message.isBot]);

  return (
    <Text 
      component="div"
      style={{ 
        whiteSpace: 'pre-wrap',
        lineHeight: 1.6,
        color: 'var(--text-bright)',
      }}
    >
      {parts.map((part, index) => {
        if (part.type === 'citation') {
          return (
            <Text
              key={index}
              component="span"
              style={{
                color: 'var(--mantine-color-blue-filled)',
                cursor: part.citation ? 'pointer' : 'default',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
                fontWeight: 500,
              }}
            >
              {part.content}
            </Text>
          );
        }

        if (part.type === 'references') {
          return (
            <Text
              key={index}
              component="div"
              style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              {part.content}
            </Text>
          );
        }

        return <span key={index}>{part.content}</span>;
      })}
    </Text>
  );
} 