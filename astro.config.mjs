import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://daily-sublime.netlify.app',
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
});
