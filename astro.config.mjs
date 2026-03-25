import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://za3tr.com',
  output: 'server',
  adapter: cloudflare(),
  integrations: [sitemap(), react()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ['node:buffer', 'node:crypto'],
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
