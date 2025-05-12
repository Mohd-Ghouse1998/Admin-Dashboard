
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { defineConfig as defineViteConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy all API requests to Django backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: false, // Don't rewrite Host header
        secure: false,
      },
      '/tenant': {
        target: 'http://localhost:8000',
        changeOrigin: false, // Don't rewrite Host header
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Define the process.env for Next.js compatibility
    'process.env': {
      NODE_ENV: mode === 'production' ? '"production"' : '"development"',
      __NEXT_VERSION: '"12.0.0"',
      __NEXT_ROUTER_BASEPATH: '""',
      __NEXT_HAS_REWRITES: 'false',
      __NEXT_I18N_SUPPORT: 'false'
    },
    'process.browser': 'true',
    'process.platform': '"browser"',
    'process.nextTick': '(callback) => setTimeout(callback, 0)'
  },
}));
