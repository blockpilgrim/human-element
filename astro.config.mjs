import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://human-element.netlify.app',
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
});
