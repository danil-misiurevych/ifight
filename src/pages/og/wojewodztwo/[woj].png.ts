// Share image of a region page: /og/wojewodztwo/<slug>.png
import type { APIRoute, GetStaticPaths } from 'astro';
import { slug, WOJEWODZTWA } from '../../../lib/turnieje';
import { obrazKarty, odpowiedzPng } from '../../../lib/og';

export const getStaticPaths = (() =>
  WOJEWODZTWA.map((w) => ({ params: { woj: slug(w) }, props: { wojewodztwo: w } }))) satisfies GetStaticPaths;

// The number of events is left out on purpose: the image is cached by Facebook
// and other sites for a long time, so it should not show data that goes stale.
export const GET: APIRoute = async ({ props }) =>
  odpowiedzPng(
    await obrazKarty({
      etykieta: 'województwo',
      tytul: `Boks – ${props.wojewodztwo}`,
      dopisek: 'Turnieje, gale, wydarzenia charytatywne i sparingi',
    }),
  );
