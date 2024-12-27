import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mantine/core',
      '@tabler/icons-react',
      'react-markdown',
      'react-syntax-highlighter'
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React dependencies
          'react-core': ['react', 'react-dom'],
          
          // UI Framework
          'mantine': ['@mantine/core', '@mantine/hooks'],
          
          // Icons
          'icons': ['@tabler/icons-react'],
          
          // Markdown processing
          'markdown': ['react-markdown', 'react-syntax-highlighter']
        }
      }
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000
  },
  server: {
    // Optimize deps on server start
    warmup: {
      clientFiles: ['./src/**/*.tsx']
    }
  }
})
