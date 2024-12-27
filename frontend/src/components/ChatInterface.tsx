import { useState } from 'react';
import { 
  Box, 
  TextInput, 
  Text, 
  Paper, 
  ScrollArea,
  Stack,
  Group,
  ActionIcon,
  rem,
  Title,
  Popover,
} from '@mantine/core';
import { IconSend, IconRobot, IconUser } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
  citations?: Citation[];
}

interface Citation {
  id: number;
  source: string;
  page: number;
  content: string;
}

export default function ChatInterface() {
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
      // Create a temporary message for streaming response
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
              break;
            }

            try {
              const parsedData = JSON.parse(data);
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.isBot) {
                  if (parsedData.citations) {
                    lastMessage.citations = parsedData.citations;
                  } else if (parsedData.chunk) {
                    lastMessage.text += parsedData.chunk;
                  }
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

  return (
    <Paper
      style={{
        height: '100%',
        backgroundColor: 'var(--container-bg)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      radius="lg"
      shadow="md"
    >
      <Title
        order={2}
        ta="center"
        py="sm"
        style={{
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--header-bg)',
          color: 'var(--text-bright)',
        }}
      >
        AI Chat Assistant
      </Title>

      <ScrollArea 
        flex={1}
        type="hover"
        offsetScrollbars
        scrollbarSize={8}
        style={{ backgroundColor: 'var(--chat-bg)' }}
      >
        <Stack gap="md" p="md">
          {messages.length === 0 ? (
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
          ) : (
            <>
              {messages.map((message, index) => (
                <Group
                  key={index}
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
                        components={{
                          code: ({inline, className, children}) => {
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
                          // Text content with citations
                          text: ({children}) => {
                            if (typeof children !== 'string') return <>{children}</>;
                            const parts = children.split(/(\[\d+\])/g);
                            return (
                              <>
                                {parts.map((part, index) => {
                                  const citationMatch = part.match(/\[(\d+)\]/);
                                  if (!citationMatch) return part;
                                  
                                  const citationId = parseInt(citationMatch[1]);
                                  const citation = message.citations?.find(c => c.id === citationId);
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
                          p: ({children}) => (
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
                          h1: ({children}) => (
                            <Title order={1} style={{ margin: '1rem 0 0.5rem', fontSize: '1.5rem', color: 'var(--text-bright)' }}>
                              {children}
                            </Title>
                          ),
                          h2: ({children}) => (
                            <Title order={2} style={{ margin: '1rem 0 0.5rem', fontSize: '1.3rem', color: 'var(--text-bright)' }}>
                              {children}
                            </Title>
                          ),
                          ul: ({children}) => (
                            <Box component="ul" style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                              {children}
                            </Box>
                          ),
                          li: ({children}) => (
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
                        }}
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
              ))}
            </>
          )}
        </Stack>
      </ScrollArea>

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
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
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
              onClick={handleSend}
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
    </Paper>
  );
} 