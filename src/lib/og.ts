// Share images (Open Graph, 1200×630) rendered at build time: satori lays out
// the card as SVG, resvg turns it into PNG. „Fight night” look: black like a gala
// poster, heavy upright condensed headings, gold date, the event poster on the right,
// and the red and blue ring corners along the bottom.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';

export const SZEROKOSC = 1200;
export const WYSOKOSC = 630;

const K = {
  tlo: '#0b0b0d',
  tekst: '#f4f2ee',
  szary: '#a9abb3',
  czerwony: '#e0263f',
  niebieski: '#2f5fc4',
  zloto: '#f0c64a',
};
// Badge colour follows the ring corner: red for taking part, blue for watching.
const KOLOR_NAROZNIKA: Record<string, string> = { start: K.czerwony, ogladam: K.niebieski };

// satori reads TTF/OTF/WOFF (not WOFF2); @fontsource ships WOFF next to WOFF2.
// Each subset is a separate file, so the latin-ext one (Polish letters) gets its own
// family name and every font-family below lists both: satori falls back to the second.
function czcionka(pakiet: string, plik: string) {
  return readFileSync(join(process.cwd(), 'node_modules/@fontsource', pakiet, 'files', plik));
}
const F = {
  tekst: "'Barlow', 'Barlow Ext'",
  naglowki: "'Barlow Condensed', 'Barlow Condensed Ext'",
};
let czcionki: Parameters<typeof satori>[1]['fonts'] | undefined;
function wczytajCzcionki() {
  czcionki ??= (['latin', 'latin-ext'] as const).flatMap((zakres) => {
    const ext = zakres === 'latin-ext' ? ' Ext' : '';
    return [
      { name: `Barlow${ext}`, data: czcionka('barlow', `barlow-${zakres}-600-normal.woff`), weight: 600 as const, style: 'normal' as const },
      {
        name: `Barlow Condensed${ext}`,
        data: czcionka('barlow-condensed', `barlow-condensed-${zakres}-800-normal.woff`),
        weight: 800 as const,
        style: 'normal' as const,
      },
    ];
  });
  return czcionki;
}

type Wezel = { type: string; props: Record<string, unknown> };
const h = (style: Record<string, unknown>, ...children: (Wezel | string | false | undefined)[]): Wezel => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children: children.filter((c) => c !== false && c !== undefined) },
});

/** Long names get a smaller font so they fit in three lines (narrower column next to a poster). */
function rozmiarTytulu(tytul: string, zPlakatem: boolean): number {
  const n = tytul.length * (zPlakatem ? 1.9 : 1);
  if (n <= 22) return 124;
  if (n <= 40) return 100;
  if (n <= 62) return 82;
  if (n <= 90) return 66;
  return 54;
}

/** Poster from src/assets/wydarzenia/ scaled to the card height, as a data URI.
    Only upright posters fit beside the text; wide banners would be cropped to a random strip. */
async function plakat(plik: string): Promise<{ src: string; szerokosc: number } | undefined> {
  const sciezka = join(process.cwd(), 'src/assets/wydarzenia', plik);
  const { width = 1, height = 0 } = await sharp(sciezka).metadata();
  if (width > height * 0.9) return undefined;
  const { data, info } = await sharp(sciezka)
    .resize({ height: WYSOKOSC, width: 520, fit: 'cover', position: 'top' })
    .jpeg({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  return { src: `data:image/jpeg;base64,${data.toString('base64')}`, szerokosc: info.width };
}

export interface Karta {
  /** Small badge above the title, e.g. 'gala' or 'województwo'. */
  etykieta?: string;
  /** 'start' or 'ogladam': picks the badge colour. */
  naroznik?: string;
  tytul: string;
  /** Line in gold, e.g. the date. */
  data?: string;
  /** Line in white, e.g. the place. */
  miejsce?: string;
  /** Extra line in grey. */
  dopisek?: string;
  /** Poster file name in src/assets/wydarzenia/, shown on the right. */
  plakat?: string;
}

async function karta(k: Karta): Promise<Wezel> {
  const p = k.plakat ? await plakat(k.plakat) : undefined;
  const kolor = KOLOR_NAROZNIKA[k.naroznik ?? ''] ?? K.czerwony;
  const rozmiar = rozmiarTytulu(k.tytul, Boolean(p));
  const tresc = h(
    { flex: 1, flexDirection: 'column', minWidth: 0 },
    // Header: logo and address
    h(
      { justifyContent: 'space-between', alignItems: 'center', padding: '44px 56px 0 64px' },
      h(
        { fontFamily: F.naglowki, fontWeight: 800, fontSize: 60, textTransform: 'uppercase', color: K.tekst },
        'i',
        h({ color: K.czerwony }, 'Fight'),
      ),
      h({ fontSize: 26, color: K.szary, letterSpacing: 1 }, 'ifight.pl'),
    ),
    // Body
    h(
      { flex: 1, flexDirection: 'column', justifyContent: 'center', padding: '0 56px 0 64px', overflow: 'hidden' },
      k.etykieta &&
        h(
          {
            alignSelf: 'flex-start',
            padding: '4px 16px',
            marginBottom: 20,
            borderRadius: 3,
            backgroundColor: kolor,
            color: '#ffffff',
            fontFamily: F.naglowki,
            fontWeight: 800,
            fontSize: 30,
            textTransform: 'uppercase',
            letterSpacing: 3,
          },
          k.etykieta,
        ),
      h(
        {
          fontFamily: F.naglowki,
          fontWeight: 800,
          fontSize: rozmiar,
          lineHeight: 1,
          textTransform: 'uppercase',
          maxHeight: rozmiar * 3,
          overflow: 'hidden',
        },
        k.tytul,
      ),
      h(
        { flexWrap: 'wrap', alignItems: 'baseline', marginTop: 26, fontFamily: F.naglowki, fontWeight: 800, fontSize: 42 },
        k.data && h({ color: K.zloto, marginRight: 28 }, k.data),
        k.miejsce && h({ color: K.tekst }, k.miejsce),
      ),
      k.dopisek && h({ marginTop: 12, fontSize: 28, lineHeight: 1.25, maxHeight: 35, overflow: 'hidden', color: K.szary }, k.dopisek),
    ),
    // Ring corners at the bottom
    h({ height: 14, width: '100%' }, h({ flex: 1, backgroundColor: K.czerwony }), h({ flex: 1, backgroundColor: K.niebieski })),
  );
  return h(
    { width: SZEROKOSC, height: WYSOKOSC, backgroundColor: K.tlo, color: K.tekst, fontFamily: F.tekst },
    tresc,
    p &&
      h(
        { position: 'relative', width: p.szerokosc, height: WYSOKOSC },
        { type: 'img', props: { src: p.src, width: p.szerokosc, height: WYSOKOSC, style: { width: p.szerokosc, height: WYSOKOSC } } },
        // Fade the poster's left edge into the black card.
        h({
          position: 'absolute',
          left: 0,
          top: 0,
          width: 90,
          height: WYSOKOSC,
          backgroundImage: `linear-gradient(90deg, ${K.tlo}, rgba(11, 11, 13, 0))`,
        }),
      ),
  );
}

export async function obrazKarty(k: Karta): Promise<Uint8Array> {
  const svg = await satori((await karta(k)) as Parameters<typeof satori>[0], {
    width: SZEROKOSC,
    height: WYSOKOSC,
    fonts: wczytajCzcionki(),
  });
  return new Resvg(svg, { fitTo: { mode: 'width', value: SZEROKOSC } }).render().asPng();
}

export const odpowiedzPng = (png: Uint8Array) =>
  new Response(png as BodyInit, { headers: { 'Content-Type': 'image/png' } });
