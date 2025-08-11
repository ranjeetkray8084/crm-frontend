import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    host: '0.0.0.0', // 🔥 makes Vite accessible on local network
    port: 5173,       // optional, default is 5173
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
                  proxy.on('error', (err, _req, _res) => {
          // Handle proxy errors silently
        });
        proxy.on('proxyReq', (proxyReq, req, _res) => {
          // Log proxy requests silently
        });
        proxy.on('proxyRes', (proxyRes, req, _res) => {
          // Log proxy responses silently
        });
        },
      },
    },
  },
});
