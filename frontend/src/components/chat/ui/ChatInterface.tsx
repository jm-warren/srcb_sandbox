import { Paper, ScrollArea, Stack, Title } from '@mantine/core';
import { useChat } from '../hooks/useChat';
import { EmptyState } from './EmptyState';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

export default function ChatInterface() {
  const { messages, input, isTyping, setInput, handleSend } = useChat();

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
            <EmptyState />
          ) : (
            <>
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
            </>
          )}
        </Stack>
      </ScrollArea>

      <ChatInput
        input={input}
        isTyping={isTyping}
        onInputChange={setInput}
        onSend={handleSend}
      />
    </Paper>
  );
} 