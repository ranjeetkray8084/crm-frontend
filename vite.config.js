import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // ALWAYS USE PRODUCTION API - Force production backend
  const apiBaseUrl = 'https://backend.leadstracker.in';
  
  // Debug logging
  console.log('🔧 Vite Mode:', mode);
  console.log('🔗 Vite Proxy Target (PRODUCTION):', apiBaseUrl);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
