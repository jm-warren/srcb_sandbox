import { Box, Text } from '@mantine/core';
import { IconRobot } from '@tabler/icons-react';

export function EmptyState() {
  return (
    <Box 
      style={{ 
        textAlign: 'center', 
        padding: '4rem 1rem',
        color: 'var(--text-secondary)',
      }}
    >
      <IconRobot size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
      <Text size="lg">Start a conversation...</Text>
      <Text size="sm" c="dimmed">Type a message below to begin</Text>
    </Box>
  );
} 