import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Адрес сайта нужен для canonical, sitemap и robots.txt.
// Порядок: переменная SITE_URL -> production-домен проекта на Vercel -> localhost.
// Когда появится свой домен, достаточно привязать его в Vercel
// (или задать SITE_URL в настройках проекта).
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

export default defineConfig({
  site,
  integrations: [sitemap()],
});
