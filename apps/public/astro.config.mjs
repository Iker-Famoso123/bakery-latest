import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// SSR con el adapter de Cloudflare. Islas de React solo donde haya
// interactividad real; las tarjetas de @rf/ui se renderizan a HTML sin JS.
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  site: 'https://reposteriafamoso.com',
});
