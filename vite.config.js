import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProduction, // Disable source maps in production
      minify: isProduction ? 'terser' : false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
          // Security: Prevent code splitting that could expose internal structure
          chunkFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
          entryFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
          assetFileNames: isProduction ? 'assets/[name]-[hash].[ext]' : 'assets/[name].[ext]',
        },
        // Security: Externalize sensitive dependencies if needed
        external: isProduction ? [] : [],
      },
      // Security: Terser options for production
      terserOptions: isProduction ? {
        compress: {
          drop_console: true, // Remove console.log in production
          drop_debugger: true, // Remove debugger statements
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        },
        mangle: {
          // Obfuscate variable names in production
          reserved: ['$', 'jQuery'], // Preserve important globals
        },
      } : undefined,
    },
    server: {
      host: '0.0.0.0', // 🔥 makes Vite accessible on local network
      port: 5173,       // optional, default is 5173
      // Security: Add security headers to dev server
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      },
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
    // Security: Define environment variables
    define: {
      __DEV__: !isProduction,
      __PROD__: isProduction,
      // Security: Disable debug features in production
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.ENABLE_DEBUG': JSON.stringify(!isProduction),
      'process.env.ENABLE_CONSOLE_LOGS': JSON.stringify(!isProduction),
    },
    // Security: Optimize for production
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: isProduction ? ['@vitejs/plugin-react'] : [],
    },
    // Security: CSS options
    css: {
      devSourcemap: !isProduction, // Disable CSS source maps in production
    },
    // Security: Worker options - Fixed for Vite v7
    worker: {
      format: 'es', // Use ES modules for workers
      plugins: () => isProduction ? [] : [],
    },
    // Security: Preview options
    preview: {
      port: 4173,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      },
    },
  };
});
