import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-date-pickers',
      'react-router-dom',
      'date-fns',
      '@emotion/react',
      '@emotion/styled',
      '@tanstack/react-query'
    ],
    force: true
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
