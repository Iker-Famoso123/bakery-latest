import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

// SSR con el adapter de Cloudflare. Islas de React solo donde haya
// interactividad real; el resto es HTML estático servido al instante.
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [react()],
});
