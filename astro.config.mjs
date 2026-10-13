// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Cuando tengas dominio propio, cambia SITE_URL (y src/config/site.ts) por el dominio.
const SITE_URL = 'https://amadoracacioperez-ai.github.io';

export default defineConfig({
  site: SITE_URL,
  // Astro 7 elimina por defecto los espacios entre elementos en línea ('jsx');
  // `true` conserva el comportamiento clásico y evita textos pegados.
  compressHTML: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'es'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', fr: 'fr', es: 'es' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
