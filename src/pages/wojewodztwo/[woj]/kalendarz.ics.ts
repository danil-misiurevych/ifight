import type { APIRoute, GetStaticPaths } from 'astro';
import { slug, turnieje, WOJEWODZTWA } from '../../../lib/turnieje';
import { kalendarzIcs, naglowkiIcs } from '../../../lib/ics';
import { dzisiaj } from '../../../lib/daty';
import { SITE } from '../../../site';

export const getStaticPaths = (() =>
  WOJEWODZTWA.map((w) => ({ params: { woj: slug(w) }, props: { wojewodztwo: w } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) => {
  const w = props.wojewodztwo as string;
  return new Response(
    kalendarzIcs(
      turnieje.filter((t) => t.wojewodztwo === w),
      { nazwa: `${SITE.nazwa} – boks, ${w}`, dzis: dzisiaj(), site: site! },
    ),
    { headers: naglowkiIcs },
  );
};
