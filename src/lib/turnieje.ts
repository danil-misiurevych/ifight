// Loads and validates src/data/turnieje.yaml at build time.
// Any mistake in the data fails the build with a readable message.
import { parse } from 'yaml';
import { z } from 'astro/zod';
import type { ImageMetadata } from 'astro';
import surowe from '../data/turnieje.yaml?raw';

// Event posters: src/assets/wydarzenia/<file>, referenced by file name in `obraz`.
const OBRAZY = new Map(
  Object.entries(
    import.meta.glob<ImageMetadata>('../assets/wydarzenia/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }),
  ).map(([sciezka, obraz]) => [sciezka.split('/').pop()!, obraz]),
);

// Polish wording for Zod's built-in messages (e.g. a wrong value type).
z.config(z.locales.pl());

export const WOJEWODZTWA = [
  'dolnośląskie', 'kujawsko-pomorskie', 'lubelskie', 'lubuskie',
  'łódzkie', 'małopolskie', 'mazowieckie', 'opolskie',
  'podkarpackie', 'podlaskie', 'pomorskie', 'śląskie',
  'świętokrzyskie', 'warmińsko-mazurskie', 'wielkopolskie', 'zachodniopomorskie',
] as const;

/** 'śląskie' -> 'śląskim', as in „w województwie śląskim”. Holds for all 16 names. */
export const wMiejscowniku = (w: string) => w.replace(/ie$/, 'im');

/** Address of the region page, e.g. '/wojewodztwo/slaskie/'. */
export const adresWojewodztwa = (w: string) => `/wojewodztwo/${slug(w)}/`;

// Ordered from youngest to oldest.
export const KATEGORIE = ['młodzik', 'kadet', 'junior', 'młodzieżowiec', 'senior'] as const;
export const POZIOMY = ['okręgowy', 'ogólnopolski', 'międzynarodowy'] as const;
export const PLCIE = ['K', 'M'] as const;
// Kind of event. A missing `typ` means 'turniej'.
export const TYPY = ['turniej', 'gala', 'charytatywna', 'sparingi', 'szkolenie', 'inne'] as const;
// Label of a single event in a row, and plural label in the filter.
export const TYP_ETYKIETA: Record<(typeof TYPY)[number], { jeden: string; wiele: string }> = {
  turniej: { jeden: 'turniej', wiele: 'turnieje' },
  gala: { jeden: 'gala', wiele: 'gale' },
  charytatywna: { jeden: 'wydarzenie charytatywne', wiele: 'charytatywne' },
  sparingi: { jeden: 'sparingi', wiele: 'sparingi' },
  // Seminars, courses (coach/referee licences), training camps.
  szkolenie: { jeden: 'szkolenie', wiele: 'szkolenia i seminaria' },
  inne: { jeden: 'inne', wiele: 'inne' },
};

// Who the event is for. An event can have more than one, e.g. a gala with ticketed
// pro bouts and an open amateur card: `udzial: [widownia, otwarte]`.
export const UDZIALY = ['widownia', 'zawodnicy', 'otwarte'] as const;
export type Udzial = (typeof UDZIALY)[number];
export const UDZIAL_ETYKIETA: Record<Udzial, { krotka: string; opis: string }> = {
  widownia: { krotka: 'do oglądania', opis: 'dla widzów – walczą zaproszeni zawodnicy' },
  zawodnicy: { krotka: 'start z licencją', opis: 'dla zawodników z licencją, zgłoszenia przez kluby' },
  otwarte: { krotka: 'otwarte zapisy', opis: 'może się zapisać każdy, także bez licencji' },
};
// Used when an entry has no `udzial`. Charity events and „inne” vary too much to assume.
const UDZIAL_DOMYSLNY: Partial<Record<(typeof TYPY)[number], Udzial[]>> = {
  turniej: ['zawodnicy'],
  gala: ['widownia'],
  sparingi: ['otwarte'],
  szkolenie: ['otwarte'],
};

/** Events someone can enter (licensed boxers or open sign-up) count as „Startuję”. */
export const dlaStartujacych = (udzial: Udzial[]) => udzial.some((u) => u !== 'widownia');
export const dlaWidzow = (udzial: Udzial[]) => udzial.includes('widownia');
/** Ring corner of an event: red for taking part, blue for watching, none when unknown. */
export const naroznik = (udzial: Udzial[]): 'start' | 'ogladam' | '' =>
  dlaStartujacych(udzial) ? 'start' : dlaWidzow(udzial) ? 'ogladam' : '';

// Optional links shown on the event page, in this order.
export const LINKI = {
  komunikat: 'Komunikat / ogłoszenie',
  wydarzenie: 'Wydarzenie na Facebooku',
  facebook: 'Organizator na Facebooku',
  zapisy: 'Zapisy',
  regulamin: 'Regulamin',
  bilety: 'Bilety',
  transmisja: 'Transmisja',
  wyniki: 'Wyniki',
} as const;
export type RodzajLinku = keyof typeof LINKI;

/** 'Łódzkie ' -> 'lodzkie'. Used for lenient matching and for URL/filter values. */
export function slug(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replaceAll('ł', 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** 'Turniej o „Puchar” Łodzi' -> 'turniej-o-puchar-lodzi'. Used for event page URLs. */
export function slugUrl(s: string): string {
  return slug(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Accepts a value with or without Polish diacritics, in any letter case.
function zListy<T extends string>(lista: readonly T[]) {
  const poSlugu = new Map(lista.map((w) => [slug(w), w]));
  return z.preprocess(
    (v) => (typeof v === 'string' ? (poSlugu.get(slug(v)) ?? v) : v),
    z.enum(lista as unknown as [T, ...T[]], {
      error: `dopuszczalne wartości: ${lista.join(', ')}`,
    }),
  );
}

const data = z
  .string({ error: 'potrzebna data w formacie RRRR-MM-DD' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'potrzebna data w formacie RRRR-MM-DD')
  .refine(
    (s) => !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s,
    'taka data nie istnieje',
  );

// A list written as [a, b]; a bare value (`kategorie: junior`) gets a hint.
const lista = <T extends z.ZodType>(t: T, przyklad: string) =>
  z.array(t, { error: `potrzebna lista w nawiasach kwadratowych, np. ${przyklad}` });

const tekst = z.string({ error: 'potrzebny tekst' }).trim().min(1, 'nie może być puste');

// An empty value in YAML (`organizator:`) is treated the same as a missing field.
const opcja = <T extends z.ZodType>(t: T) =>
  z.preprocess((v) => (v === null || v === '' ? undefined : v), t.optional());

const link = z.url({ protocol: /^https?$/, error: 'potrzebny link zaczynający się od http:// lub https://' });

const schemat = z
  .strictObject({
    nazwa: tekst,
    typ: opcja(zListy(TYPY)),
    start: data,
    koniec: opcja(data),
    miasto: tekst,
    wojewodztwo: zListy(WOJEWODZTWA),
    kategorie: opcja(lista(zListy(KATEGORIE), '[kadet, junior]')),
    plec: opcja(lista(zListy(PLCIE), '[K, M]')),
    poziom: opcja(zListy(POZIOMY)),
    udzial: opcja(lista(zListy(UDZIALY), '[widownia] albo [zawodnicy, otwarte]')),
    organizator: opcja(tekst),
    termin_zgloszen: opcja(data),
    miejsce: opcja(tekst),
    opis: opcja(tekst),
    obraz: opcja(
      z
        .string({ error: 'potrzebna nazwa pliku, np. plakat.jpg' })
        .refine((plik) => OBRAZY.has(plik), {
          error: 'nie ma takiego pliku w src/assets/wydarzenia/ (dopuszczalne: jpg, png, webp)',
        }),
    ),
    linki: opcja(
      z.strictObject(
        Object.fromEntries(Object.keys(LINKI).map((k) => [k, opcja(link)])) as Record<RodzajLinku, ReturnType<typeof opcja<typeof link>>>,
        { error: `potrzebna lista linków, np. zapisy: https://… (dopuszczalne: ${Object.keys(LINKI).join(', ')})` },
      ),
    ),
    zrodlo: link,
    sprawdzono: data,
    slug: opcja(
      z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'tylko małe litery bez polskich znaków, cyfry i myślniki, np. turniej-o-puchar-2027'),
    ),
    test: opcja(z.boolean()),
  })
  .refine((t) => !t.koniec || t.koniec >= t.start, {
    path: ['koniec'],
    message: 'data zakończenia jest wcześniejsza niż data rozpoczęcia',
  });

export interface Turniej {
  nazwa: string;
  typ: (typeof TYPY)[number];
  start: string;
  koniec: string;
  miasto: string;
  wojewodztwo: (typeof WOJEWODZTWA)[number];
  kategorie: (typeof KATEGORIE)[number][];
  plec: (typeof PLCIE)[number][];
  poziom?: (typeof POZIOMY)[number];
  /** Who can take part; from `udzial` or derived from the type (may be empty). */
  udzial: Udzial[];
  organizator?: string;
  termin_zgloszen?: string;
  miejsce?: string;
  opis?: string;
  /** Poster from src/assets/wydarzenia/, if the entry names one. */
  obraz?: ImageMetadata;
  /** File name of the poster in src/assets/wydarzenia/ (used by the share images). */
  plikObrazu?: string;
  linki: { rodzaj: RodzajLinku; etykieta: string; url: string }[];
  zrodlo: string;
  /** Path segment of the event page: /wydarzenia/<slug>/ */
  slug: string;
  sprawdzono: string;
  test: boolean;
}

function wczytaj(): Turniej[] {
  const plik = 'src/data/turnieje.yaml';
  let dane: unknown;
  try {
    dane = parse(surowe) ?? [];
  } catch (e) {
    throw new Error(`${plik}: pliku nie da się odczytać jako YAML (sprawdź wcięcia i cudzysłowy).\n${(e as Error).message}`);
  }
  if (!Array.isArray(dane)) {
    throw new Error(`${plik}: plik musi być listą wpisów, każdy zaczyna się od "- nazwa: ..."`);
  }

  const bledy: string[] = [];
  const wynik: Turniej[] = [];
  dane.forEach((wpis, i) => {
    const r = schemat.safeParse(wpis);
    if (!r.success) {
      const nazwa = typeof wpis?.nazwa === 'string' ? ` «${wpis.nazwa}»` : '';
      for (const p of r.error.issues) {
        const opis =
          p.code === 'unrecognized_keys'
            ? `nieznane pole: ${p.keys.join(', ')} (literówka w nazwie?)`
            : `${p.path.join('.') || 'wpis'}: ${p.message}`;
        bledy.push(`  wpis nr ${i + 1}${nazwa}, ${opis}`);
      }
      return;
    }
    const t = r.data;
    const wKolejnosci = <T extends string>(lista: readonly T[], wybrane: T[] = []) =>
      lista.filter((x) => wybrane.includes(x));
    const rok = t.start.slice(0, 4);
    // Long names are cut at a word boundary so URLs stay readable.
    let nazwa = slugUrl(t.nazwa);
    if (nazwa.length > 80) nazwa = nazwa.slice(0, 81).replace(/-[^-]*$/, '');
    wynik.push({
      ...t,
      obraz: t.obraz ? OBRAZY.get(t.obraz) : undefined,
      plikObrazu: t.obraz,
      slug: t.slug ?? (nazwa.includes(rok) ? nazwa : `${nazwa}-${rok}`),
      linki: (Object.keys(LINKI) as RodzajLinku[])
        .filter((k) => t.linki?.[k])
        .map((k) => ({ rodzaj: k, etykieta: LINKI[k], url: t.linki![k]! })),
      typ: t.typ ?? 'turniej',
      udzial: wKolejnosci(UDZIALY, t.udzial ?? UDZIAL_DOMYSLNY[t.typ ?? 'turniej']),
      koniec: t.koniec ?? t.start,
      kategorie: wKolejnosci(KATEGORIE, t.kategorie),
      plec: wKolejnosci(PLCIE, t.plec),
      test: t.test ?? false,
    });
  });

  const uzyte = new Map<string, string>();
  for (const t of wynik) {
    const inny = uzyte.get(t.slug);
    if (inny) bledy.push(`  «${t.nazwa}» i «${inny}» mają ten sam adres strony /wydarzenia/${t.slug}/ – dodaj jednemu z nich pole slug`);
    uzyte.set(t.slug, t.nazwa);
  }

  if (bledy.length) {
    throw new Error(`Błędy w ${plik}:\n${bledy.join('\n')}`);
  }
  return wynik.sort((a, b) => a.start.localeCompare(b.start) || a.nazwa.localeCompare(b.nazwa, 'pl'));
}

export const turnieje: Turniej[] = wczytaj();
