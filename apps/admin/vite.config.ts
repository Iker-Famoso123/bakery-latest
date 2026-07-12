import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // En desarrollo, /api se reenvía a la API de Nest.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
