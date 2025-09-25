import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy /api to backend so cookies work in dev
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
