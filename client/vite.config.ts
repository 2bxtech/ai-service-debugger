import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'zustand'],
          'graph-vendor': ['dagre', 'reactflow'],
          'markdown-vendor': ['react-markdown', 'remark-gfm'],
          'ui-vendor': ['lucide-react', 'react-error-boundary'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
