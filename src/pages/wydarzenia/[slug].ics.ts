// A single event as an .ics file: /wydarzenia/<slug>.ics ("Apple / Outlook" button on the event page).
import type { APIRoute, GetStaticPaths } from 'astro';
import { turnieje, type Turniej } from '../../lib/turnieje';
import { kalendarzIcs, naglowkiIcs } from '../../lib/ics';

export const getStaticPaths = (() =>
  turnieje.filter((t) => !t.test).map((t) => ({ params: { slug: t.slug }, props: { t } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) => {
  const t = props.t as Turniej;
  // `dzis` set to the event's own end date, so the "recently finished" cut-off never drops it.
  return new Response(kalendarzIcs([t], { nazwa: t.nazwa, dzis: t.koniec, site: site! }), {
    headers: { ...naglowkiIcs, 'Content-Disposition': `attachment; filename="${t.slug}.ics"` },
  });
};
