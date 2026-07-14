import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// SSR autohospedado: adapter de Node (standalone) para correr en Docker en el Pi.
// Islas de React solo donde haya interactividad; las tarjetas de @rf/ui se
// renderizan a HTML sin JS.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  site: 'https://reposteriafamoso.com',
});
