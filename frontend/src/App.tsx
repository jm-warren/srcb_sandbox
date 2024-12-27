import { MantineProvider, AppShell, Container } from '@mantine/core';
import ChatInterface from './components/chat/ui/ChatInterface';
import '@mantine/core/styles.css';

function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <AppShell
        style={{
          backgroundColor: 'var(--app-bg)',
          minHeight: '100vh',
        }}
      >
        <Container 
          size="md" 
          h="100vh" 
          p="md" 
          style={{ 
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ChatInterface />
        </Container>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
