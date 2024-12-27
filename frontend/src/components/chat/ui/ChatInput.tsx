import { Box, TextInput, Group, ActionIcon, Paper } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';

interface ChatInputProps {
  input: string;
  isTyping: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export function ChatInput({ input, isTyping, onInputChange, onSend }: ChatInputProps) {
  return (
    <Paper
      p="md"
      radius={0}
      style={{
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--input-bg)',
        position: 'relative',
      }}
    >
      <Box style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Group gap={8} align="center" style={{ position: 'relative' }}>
          <TextInput
            placeholder="Type your message..."
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSend()}
            size="lg"
            radius="xl"
            disabled={isTyping}
            style={{ flex: 1 }}
            styles={{
              input: {
                backgroundColor: 'var(--container-bg)',
                border: '1px solid var(--border-color)',
                '&:focus': {
                  borderColor: 'var(--mantine-color-blue-filled)',
                },
                fontSize: '1rem',
                padding: '1.2rem',
                height: 'auto',
                paddingRight: '3.5rem',
                color: 'var(--text-bright)',
                '&::placeholder': {
                  color: 'var(--text-secondary)',
                }
              }
            }}
          />
          <ActionIcon
            size="lg"
            radius="xl"
            color="blue"
            variant="subtle"
            onClick={onSend}
            disabled={isTyping}
            style={{ 
              position: 'absolute',
              right: '0.5rem',
              backgroundColor: input.trim() ? 'var(--mantine-color-blue-filled)' : 'transparent',
              color: input.trim() ? 'white' : 'var(--mantine-color-blue-filled)',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: input.trim() ? 'var(--mantine-color-blue-filled-hover)' : 'var(--mantine-color-blue-light)',
              }
            }}
          >
            <IconSend size="1.2rem" />
          </ActionIcon>
        </Group>
      </Box>
    </Paper>
  );
} 