// Share image of a single event: /og/wydarzenia/<slug>.png
import type { APIRoute, GetStaticPaths } from 'astro';
import { turnieje, TYP_ETYKIETA, type Turniej } from '../../../lib/turnieje';
import { dlugaData, dlugiZakres } from '../../../lib/daty';
import { obrazKarty, odpowiedzPng } from '../../../lib/og';

export const getStaticPaths = (() =>
  turnieje.map((t) => ({ params: { slug: t.slug }, props: { t } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const t = props.t as Turniej;
  return odpowiedzPng(
    await obrazKarty({
      etykieta: TYP_ETYKIETA[t.typ].jeden,
      typ: t.typ,
      tytul: t.nazwa,
      data: dlugiZakres(t.start, t.koniec),
      miejsce: [t.miejsce, t.miasto].filter(Boolean).join(', '),
      dopisek: t.termin_zgloszen
        ? `Zgłoszenia do ${dlugaData(t.termin_zgloszen)}`
        : t.organizator && `Organizator: ${t.organizator}`,
    }),
  );
};
