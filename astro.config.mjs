import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://thehumanelement.blog',
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
});
