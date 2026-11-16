// Loads and validates src/data/turnieje.yaml at build time.
// Any mistake in the data fails the build with a readable message.
import { parse } from 'yaml';
import { z } from 'astro/zod';
import surowe from '../data/turnieje.yaml?raw';

export const WOJEWODZTWA = [
  'dolnośląskie', 'kujawsko-pomorskie', 'lubelskie', 'lubuskie',
  'łódzkie', 'małopolskie', 'mazowieckie', 'opolskie',
  'podkarpackie', 'podlaskie', 'pomorskie', 'śląskie',
  'świętokrzyskie', 'warmińsko-mazurskie', 'wielkopolskie', 'zachodniopomorskie',
] as const;

// Ordered from youngest to oldest.
export const KATEGORIE = ['młodzik', 'kadet', 'junior', 'młodzieżowiec', 'senior'] as const;
export const POZIOMY = ['okręgowy', 'ogólnopolski', 'międzynarodowy'] as const;
export const PLCIE = ['K', 'M'] as const;

/** 'Łódzkie ' -> 'lodzkie'. Used for lenient matching and for URL/filter values. */
export function slug(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replaceAll('ł', 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

// Accepts a value with or without Polish diacritics, in any letter case.
function zListy<T extends string>(lista: readonly T[]) {
  const poSlugu = new Map(lista.map((w) => [slug(w), w]));
  return z.preprocess(
    (v) => (typeof v === 'string' ? (poSlugu.get(slug(v)) ?? v) : v),
    z.enum(lista as unknown as [T, ...T[]], {
      error: `допустимые значения: ${lista.join(', ')}`,
    }),
  );
}

const data = z
  .string({ error: 'нужна дата в формате ГГГГ-ММ-ДД' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'нужна дата в формате ГГГГ-ММ-ДД')
  .refine(
    (s) => !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s,
    'такой даты не существует',
  );

const tekst = z.string({ error: 'нужен текст' }).trim().min(1, 'не может быть пустым');

// An empty value in YAML (`organizator:`) is treated the same as a missing field.
const opcja = <T extends z.ZodType>(t: T) =>
  z.preprocess((v) => (v === null || v === '' ? undefined : v), t.optional());

const schemat = z
  .strictObject({
    nazwa: tekst,
    start: data,
    koniec: opcja(data),
    miasto: tekst,
    wojewodztwo: zListy(WOJEWODZTWA),
    kategorie: opcja(z.array(zListy(KATEGORIE))),
    plec: opcja(z.array(zListy(PLCIE))),
    poziom: opcja(zListy(POZIOMY)),
    organizator: opcja(tekst),
    termin_zgloszen: opcja(data),
    zrodlo: z.url({ protocol: /^https?$/, error: 'нужна ссылка, начинающаяся с http:// или https://' }),
    sprawdzono: data,
    test: opcja(z.boolean()),
  })
  .refine((t) => !t.koniec || t.koniec >= t.start, {
    path: ['koniec'],
    message: 'дата окончания раньше даты начала',
  });

export interface Turniej {
  nazwa: string;
  start: string;
  koniec: string;
  miasto: string;
  wojewodztwo: (typeof WOJEWODZTWA)[number];
  kategorie: (typeof KATEGORIE)[number][];
  plec: (typeof PLCIE)[number][];
  poziom?: (typeof POZIOMY)[number];
  organizator?: string;
  termin_zgloszen?: string;
  zrodlo: string;
  sprawdzono: string;
  test: boolean;
}

function wczytaj(): Turniej[] {
  const plik = 'src/data/turnieje.yaml';
  let dane: unknown;
  try {
    dane = parse(surowe) ?? [];
  } catch (e) {
    throw new Error(`${plik}: файл не читается как YAML (проверьте отступы и кавычки).\n${(e as Error).message}`);
  }
  if (!Array.isArray(dane)) {
    throw new Error(`${plik}: файл должен быть списком записей, каждая начинается с "- nazwa: ..."`);
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
            ? `неизвестное поле: ${p.keys.join(', ')} (опечатка в названии?)`
            : `${p.path.join('.') || 'запись'}: ${p.message}`;
        bledy.push(`  запись №${i + 1}${nazwa}, ${opis}`);
      }
      return;
    }
    const t = r.data;
    const wKolejnosci = <T extends string>(lista: readonly T[], wybrane: T[] = []) =>
      lista.filter((x) => wybrane.includes(x));
    wynik.push({
      ...t,
      koniec: t.koniec ?? t.start,
      kategorie: wKolejnosci(KATEGORIE, t.kategorie),
      plec: wKolejnosci(PLCIE, t.plec),
      test: t.test ?? false,
    });
  });

  if (bledy.length) {
    throw new Error(`Ошибки в ${plik}:\n${bledy.join('\n')}`);
  }
  return wynik.sort((a, b) => a.start.localeCompare(b.start) || a.nazwa.localeCompare(b.nazwa, 'pl'));
}

export const turnieje: Turniej[] = wczytaj();
