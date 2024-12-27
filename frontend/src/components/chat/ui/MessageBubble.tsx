import { Paper, Text, ActionIcon, Group, rem } from '@mantine/core';
import { IconRobot, IconUser } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { createMarkdownComponents } from './MarkdownComponents';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <Group
      wrap="nowrap"
      gap="sm"
      justify={message.isBot ? 'flex-start' : 'flex-end'}
      align="flex-start"
    >
      {message.isBot && (
        <ActionIcon
          variant="subtle"
          color="blue"
          size="lg"
          radius="xl"
          style={{ backgroundColor: 'var(--icon-bg)' }}
        >
          <IconRobot size={rem('1.2rem')} />
        </ActionIcon>
      )}

      <Paper
        p="sm"
        radius="md"
        style={{
          backgroundColor: message.isBot ? 'var(--message-bot-bg)' : 'var(--mantine-color-blue-filled)',
          maxWidth: '70%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {message.isBot ? (
          <ReactMarkdown
            components={createMarkdownComponents(message)}
            className="markdown-content"
          >
            {message.text}
          </ReactMarkdown>
        ) : (
          <Text 
            size="sm" 
            style={{ 
              whiteSpace: 'pre-wrap', 
              lineHeight: 1.5,
              color: 'white',
            }}
          >
            {message.text}
          </Text>
        )}
        <Text 
          size="xs" 
          style={{ 
            opacity: 0.7, 
            textAlign: 'right',
            marginTop: '4px',
            color: message.isBot ? 'var(--text-secondary)' : 'var(--mantine-color-white-alpha-70)',
          }}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Paper>

      {!message.isBot && (
        <ActionIcon
          variant="subtle"
          color="blue"
          size="lg"
          radius="xl"
          style={{ backgroundColor: 'var(--icon-bg)' }}
        >
          <IconUser size={rem('1.2rem')} />
        </ActionIcon>
      )}
    </Group>
  );
} 