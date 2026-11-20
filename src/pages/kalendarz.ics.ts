import type { APIRoute } from 'astro';
import { turnieje } from '../lib/turnieje';
import { kalendarzIcs, naglowkiIcs } from '../lib/ics';
import { dzisiaj } from '../lib/daty';
import { SITE } from '../site';

export const GET: APIRoute = ({ site }) =>
  new Response(kalendarzIcs(turnieje, { nazwa: `${SITE.nazwa} – boks w Polsce`, dzis: dzisiaj(), site: site! }), {
    headers: naglowkiIcs,
  });
