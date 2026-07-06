import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // `@/components/Foo`  ->  `<repo>/client/src/components/Foo`
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 3000,
    proxy: {
      // Main CSFAQ API (Express on port 5000).
      // All /api/* and /socket.io traffic that belongs to the main server
      // goes through here.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // The Query Triage microservice runs on its own port (5001).
      // The client talks to it DIRECTLY (see VITE_TRIAGE_URL in
      // src/config/env.ts → http://localhost:5001/api/v1) so that CORS and
      // socket.io upgrades behave the same in dev and production.
      // We DO NOT prox triage through Vite – keep things simple.
      //
      // Socket.io (used by triage) is also reached directly on 5001.
      '/socket.io': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
