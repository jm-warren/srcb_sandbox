import { Paper, Group, Text, Stack } from '@mantine/core';
import { IconRobot, IconUser } from '@tabler/icons-react';
import { Message } from '../types';
import { MessageContent } from './MessageContent';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.isBot;

  return (
    <Stack 
      gap={4}
      align={isBot ? "flex-start" : "flex-end"}
      style={{ 
        padding: '0.5rem 1rem',
        maxWidth: '85%',
        alignSelf: isBot ? 'flex-start' : 'flex-end',
      }}
    >
      <Group 
        align="flex-start" 
        style={{ 
          backgroundColor: isBot ? 'var(--message-bot-bg)' : undefined,
          borderRadius: '8px',
          gap: isBot ? '1rem' : '0.5rem',
          flexDirection: isBot ? 'row' : 'row-reverse',
        }}
      >
        {/* Avatar */}
        <div style={{
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '50%',
          backgroundColor: isBot ? 'var(--icon-bg)' : 'var(--message-user-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {isBot ? (
            <IconRobot 
              style={{ 
                width: 'calc(1.5rem * var(--mantine-scale))', 
                height: 'calc(1.5rem * var(--mantine-scale))',
                color: 'var(--mantine-color-blue-filled)',
              }} 
            />
          ) : (
            <IconUser 
              style={{ 
                width: 'calc(1.5rem * var(--mantine-scale))', 
                height: 'calc(1.5rem * var(--mantine-scale))',
                color: 'white',
              }} 
            />
          )}
        </div>

        {/* Message Content */}
        <Paper 
          shadow="sm"
          p="lg" 
          style={{ 
            flex: 1,
            backgroundColor: isBot ? 'var(--container-bg)' : 'var(--message-user-bg)',
            color: isBot ? 'var(--text-bright)' : 'white',
            border: isBot ? '1px solid var(--border-color)' : 'none',
          }}
          radius="md"
        >
          <MessageContent message={message} />
        </Paper>
      </Group>

      {/* Timestamp */}
      <Text 
        size="xs" 
        c="dimmed"
        style={{
          marginLeft: isBot ? '3.5rem' : '0',
          marginRight: isBot ? '0' : '3.5rem',
        }}
      >
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </Stack>
  );
} 