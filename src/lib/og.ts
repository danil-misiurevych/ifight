// Share images (Open Graph, 1200×630) rendered at build time: satori lays out
// the card as SVG, resvg turns it into PNG. Same 80s look as the site.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export const SZEROKOSC = 1200;
export const WYSOKOSC = 630;

const K = {
  tlo: '#120428',
  tlo2: '#1c0a3a',
  tekst: '#f4ecff',
  szary: '#b7a8d9',
  roz: '#ff2e88',
  cyjan: '#2de2e6',
  zolty: '#ffd319',
  pomarancz: '#ff901f',
  fiolet: '#a44bff',
};
const ZACHOD = `linear-gradient(90deg, ${K.zolty}, ${K.pomarancz} 35%, ${K.roz} 70%, ${K.fiolet})`;
// Badge colours match the event type labels on the list.
const KOLOR_TYPU: Record<string, { tlo: string; tekst: string }> = {
  gala: { tlo: K.roz, tekst: '#ffffff' },
  turniej: { tlo: K.cyjan, tekst: K.tlo },
  charytatywna: { tlo: K.zolty, tekst: K.tlo },
  sparingi: { tlo: K.pomarancz, tekst: K.tlo },
  szkolenie: { tlo: K.fiolet, tekst: '#ffffff' },
};

// satori reads TTF/OTF/WOFF (not WOFF2); @fontsource ships WOFF next to WOFF2.
// Each subset is a separate file, so the latin-ext one (Polish letters) gets its own
// family name and every font-family below lists both: satori falls back to the second.
function czcionka(pakiet: string, plik: string) {
  return readFileSync(join(process.cwd(), 'node_modules/@fontsource', pakiet, 'files', plik));
}
const F = {
  tekst: "'Barlow', 'Barlow Ext'",
  naglowki: "'Barlow Condensed', 'Barlow Condensed Ext'",
  mono: "'Space Mono', 'Space Mono Ext'",
};
let czcionki: Parameters<typeof satori>[1]['fonts'] | undefined;
function wczytajCzcionki() {
  czcionki ??= (['latin', 'latin-ext'] as const).flatMap((zakres) => {
    const ext = zakres === 'latin-ext' ? ' Ext' : '';
    return [
      { name: `Barlow${ext}`, data: czcionka('barlow', `barlow-${zakres}-600-normal.woff`), weight: 600 as const, style: 'normal' as const },
      {
        name: `Barlow Condensed${ext}`,
        data: czcionka('barlow-condensed', `barlow-condensed-${zakres}-800-italic.woff`),
        weight: 800 as const,
        style: 'italic' as const,
      },
      { name: `Space Mono${ext}`, data: czcionka('space-mono', `space-mono-${zakres}-700-normal.woff`), weight: 700 as const, style: 'normal' as const },
    ];
  });
  return czcionki;
}

type Wezel = { type: string; props: Record<string, unknown> };
const h = (style: Record<string, unknown>, ...children: (Wezel | string | false | undefined)[]): Wezel => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children: children.filter((c) => c !== false && c !== undefined) },
});

/** Long names get a smaller font so they fit in three lines. */
function rozmiarTytulu(tytul: string): number {
  const n = tytul.length;
  if (n <= 22) return 112;
  if (n <= 40) return 92;
  if (n <= 62) return 76;
  if (n <= 90) return 62;
  return 52;
}

export interface Karta {
  /** Small badge above the title, e.g. 'gala' or 'województwo'. */
  etykieta?: string;
  /** Event type, picks the badge colour. */
  typ?: string;
  tytul: string;
  /** Mono line in cyan, e.g. the date. */
  data?: string;
  /** Line in yellow, e.g. the place. */
  miejsce?: string;
  /** Extra line in grey. */
  dopisek?: string;
}

function karta(k: Karta): Wezel {
  const typ = KOLOR_TYPU[k.typ ?? ''] ?? { tlo: K.szary, tekst: K.tlo };
  return h(
    {
      width: SZEROKOSC,
      height: WYSOKOSC,
      flexDirection: 'column',
      backgroundColor: K.tlo,
      backgroundImage: `radial-gradient(ellipse 90% 70% at 50% -10%, rgba(164, 75, 255, 0.45), transparent 70%), linear-gradient(180deg, ${K.tlo}, ${K.tlo2})`,
      color: K.tekst,
      fontFamily: F.tekst,
    },
    // Header: logo and address
    h(
      { justifyContent: 'space-between', alignItems: 'center', padding: '44px 64px 0' },
      h(
        {
          fontFamily: F.naglowki,
          fontStyle: 'italic',
          fontWeight: 800,
          fontSize: 64,
          backgroundImage: `linear-gradient(180deg, ${K.zolty}, ${K.roz} 55%, ${K.fiolet})`,
          backgroundClip: 'text',
          color: 'transparent',
          paddingRight: 8,
        },
        'iFight',
      ),
      h({ fontFamily: F.mono, fontSize: 26, color: K.szary, letterSpacing: 2 }, 'ifight.pl'),
    ),
    // Body
    h(
      { flex: 1, flexDirection: 'column', justifyContent: 'center', padding: '0 64px' },
      k.etykieta &&
        h(
          {
            alignSelf: 'flex-start',
            padding: '4px 14px',
            marginBottom: 18,
            borderRadius: 4,
            backgroundColor: typ.tlo,
            color: typ.tekst,
            fontFamily: F.mono,
            fontSize: 24,
            textTransform: 'uppercase',
            letterSpacing: 3,
          },
          k.etykieta,
        ),
      h(
        {
          fontFamily: F.naglowki,
          fontStyle: 'italic',
          fontWeight: 800,
          fontSize: rozmiarTytulu(k.tytul),
          lineHeight: 1.02,
          textTransform: 'uppercase',
          maxHeight: rozmiarTytulu(k.tytul) * 1.02 * 3,
          overflow: 'hidden',
          textShadow: '0 0 28px rgba(255, 46, 136, 0.55)',
        },
        k.tytul,
      ),
      h(
        { flexWrap: 'wrap', alignItems: 'baseline', marginTop: 26, fontSize: 36 },
        k.data && h({ fontFamily: F.mono, color: K.cyjan, marginRight: 32, textShadow: '0 0 12px rgba(45, 226, 230, 0.6)' }, k.data),
        k.miejsce && h({ color: K.zolty, fontWeight: 600 }, k.miejsce),
      ),
      k.dopisek && h({ marginTop: 14, fontSize: 28, color: K.szary }, k.dopisek),
    ),
    // Sunset stripes at the bottom
    h({ flexDirection: 'column', width: '100%' },
      h({ height: 6, width: '100%', backgroundImage: ZACHOD, marginBottom: 6 }),
      h({ height: 10, width: '100%', backgroundImage: ZACHOD }),
    ),
  );
}

export async function obrazKarty(k: Karta): Promise<Uint8Array> {
  const svg = await satori(karta(k) as Parameters<typeof satori>[0], {
    width: SZEROKOSC,
    height: WYSOKOSC,
    fonts: wczytajCzcionki(),
  });
  return new Resvg(svg, { fitTo: { mode: 'width', value: SZEROKOSC } }).render().asPng();
}

export const odpowiedzPng = (png: Uint8Array) =>
  new Response(png as BodyInit, { headers: { 'Content-Type': 'image/png' } });
