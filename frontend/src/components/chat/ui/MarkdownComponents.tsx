import { Box, Text, Title, Popover, Stack, Group, Paper } from '@mantine/core';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '../types';

export const createMarkdownComponents = (message: Message) => ({
  code: ({inline, className, children}: {inline?: boolean, className?: string, children: React.ReactNode}) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={oneDark}
        language={match[1]}
        customStyle={{
          margin: '0.5rem 0',
          borderRadius: '4px',
        }}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code 
        className={className}
        style={{
          backgroundColor: 'var(--container-bg)',
          padding: '0.2rem 0.4rem',
          borderRadius: '4px',
          fontSize: '0.9em',
        }}
      >
        {children}
      </code>
    );
  },

  text: ({children}: {children: React.ReactNode}) => {
    if (typeof children !== 'string') return <>{children}</>;
    
    console.log('Processing text for citations:', children);
    console.log('Available citations:', message.citations);
    
    const parts = children.split(/(\[\d+\])/g);
    console.log('Split parts:', parts);
    
    return (
      <>
        {parts.map((part, index) => {
          const citationMatch = part.match(/\[(\d+)\]/);
          if (!citationMatch) return part;
          
          const citationId = parseInt(citationMatch[1]);
          console.log('Looking for citation:', citationId);
          
          const citation = message.citations?.find(c => c.id === citationId);
          console.log('Found citation:', citation);
          
          if (!citation) return part;
          
          return (
            <Popover key={index} width={400} position="top" withArrow shadow="md">
              <Popover.Target>
                <Text 
                  component="span" 
                  c="blue.5" 
                  style={{ 
                    cursor: 'pointer', 
                    textDecoration: 'underline',
                    display: 'inline-block',
                  }}
                >
                  {part}
                </Text>
              </Popover.Target>
              <Popover.Dropdown p="md">
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Text fw={500} size="sm">Source: {citation.source}</Text>
                    <Text size="xs" c="dimmed">Page {citation.page}</Text>
                  </Group>
                  <Paper 
                    withBorder 
                    p="sm" 
                    style={{ 
                      backgroundColor: 'var(--container-bg)',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}
                  >
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {citation.content}
                    </Text>
                  </Paper>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          );
        })}
      </>
    );
  },

  p: ({children}: {children: React.ReactNode}) => (
    <Text 
      size="sm" 
      style={{ 
        margin: '0.5rem 0',
        lineHeight: 1.6,
        color: 'var(--text-bright)',
      }}
    >
      {children}
    </Text>
  ),

  h1: ({children}: {children: React.ReactNode}) => (
    <Title order={1} style={{ margin: '1rem 0 0.5rem', fontSize: '1.5rem', color: 'var(--text-bright)' }}>
      {children}
    </Title>
  ),

  h2: ({children}: {children: React.ReactNode}) => (
    <Title order={2} style={{ margin: '1rem 0 0.5rem', fontSize: '1.3rem', color: 'var(--text-bright)' }}>
      {children}
    </Title>
  ),

  ul: ({children}: {children: React.ReactNode}) => (
    <Box component="ul" style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
      {children}
    </Box>
  ),

  li: ({children}: {children: React.ReactNode}) => (
    <Box 
      component="li" 
      style={{ 
        margin: '0.25rem 0',
        color: 'var(--text-bright)',
        fontSize: '0.875rem',
        lineHeight: 1.6,
      }}
    >
      {children}
    </Box>
  ),
}); 