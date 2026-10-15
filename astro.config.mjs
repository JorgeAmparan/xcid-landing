import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://xcid.dev',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: { host: true, port: Number(process.env.PORT) || 8080 },
  // Los formularios usan cookies SameSite=Lax (Supabase), que ya bloquean envíos cross-site;
  // la verificación de Origin de Astro falla detrás del proxy de Railway.
  security: { checkOrigin: false },
});
