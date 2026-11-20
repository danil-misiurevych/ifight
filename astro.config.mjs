import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { parse } from 'yaml';

// Adres strony jest potrzebny dla canonical, sitemap i robots.txt.
// Kolejność: zmienna SITE_URL -> domena produkcyjna projektu na Vercel -> localhost.
// Gdy będzie własna domena, wystarczy podpiąć ją w Vercel
// (albo ustawić SITE_URL w ustawieniach projektu).
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

// Strony województw bez nadchodzących wydarzeń mają noindex, więc nie trafiają do sitemap.
// Pełne sprawdzanie danych robi src/lib/turnieje.ts; tu wystarczy zgrubny odczyt.
const slug = (s) =>
  String(s).trim().toLowerCase().replaceAll('ł', 'l').normalize('NFD').replace(/[̀-ͯ]/g, '');
const dzis = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(new Date());
const tekst = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? ''));
let wpisy = [];
try {
  wpisy = parse(readFileSync(new URL('./src/data/turnieje.yaml', import.meta.url), 'utf8')) ?? [];
} catch {
  // Błąd w pliku zgłosi z czytelnym komunikatem src/lib/turnieje.ts.
}
const zWydarzeniami = new Set(
  (Array.isArray(wpisy) ? wpisy : [])
    .filter((t) => t && tekst(t.koniec || t.start) >= dzis)
    .map((t) => slug(t.wojewodztwo)),
);

export default defineConfig({
  site,
  integrations: [
    sitemap({
      filter: (strona) => {
        const m = new URL(strona).pathname.match(/^\/wojewodztwo\/([^/]+)\/$/);
        return !m || zWydarzeniami.has(m[1]);
      },
    }),
  ],
  // The page used to be called "O serwisie"; old links keep working.
  redirects: { '/o-serwisie': '/o-stronie/' },
});
