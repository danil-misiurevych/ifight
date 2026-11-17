import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Adres strony jest potrzebny dla canonical, sitemap i robots.txt.
// Kolejność: zmienna SITE_URL -> domena produkcyjna projektu na Vercel -> localhost.
// Gdy będzie własna domena, wystarczy podpiąć ją w Vercel
// (albo ustawić SITE_URL w ustawieniach projektu).
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

export default defineConfig({
  site,
  integrations: [sitemap()],
  // The page used to be called "O serwisie"; old links keep working.
  redirects: { '/o-serwisie': '/o-stronie/' },
});
