// Date helpers shared by the build and the browser script.
// All dates are plain 'YYYY-MM-DD' strings, compared in Europe/Warsaw time.

export function dzisiaj(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(new Date());
}

export function dniMiedzy(od: string, do_: string): number {
  return Math.round((Date.parse(do_) - Date.parse(od)) / 86_400_000);
}

const MIESIACE = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
];

/** '2026-12' -> 'Grudzień 2026' */
export function nazwaMiesiaca(ym: string): string {
  const [r, m] = ym.split('-');
  return `${MIESIACE[Number(m) - 1]} ${r}`;
}

/** '2026-12-05' -> '5.12' */
export function krotkaData(d: string): string {
  const [, m, dz] = d.split('-');
  return `${Number(dz)}.${m}`;
}

/** '5.12', '5–7.12', '30.12–2.01' */
export function zakresDat(start: string, koniec: string): string {
  if (start === koniec) return krotkaData(start);
  if (start.slice(0, 7) === koniec.slice(0, 7)) {
    return `${Number(start.slice(8))}–${krotkaData(koniec)}`;
  }
  return `${krotkaData(start)}–${krotkaData(koniec)}`;
}

export type StanTerminu = 'ok' | 'wkrotce' | 'minal';

/** Deadline state and the short note shown next to the date. */
export function stanTerminu(
  termin: string,
  dzis: string,
  dniWkrotce: number,
): { stan: StanTerminu; dopisek: string } {
  const dni = dniMiedzy(dzis, termin);
  if (dni < 0) return { stan: 'minal', dopisek: 'po terminie' };
  if (dni > dniWkrotce) return { stan: 'ok', dopisek: '' };
  if (dni === 0) return { stan: 'wkrotce', dopisek: 'dziś' };
  if (dni === 1) return { stan: 'wkrotce', dopisek: 'jutro' };
  return { stan: 'wkrotce', dopisek: `za ${dni} dni` };
}

const MIESIACE_DOPELNIACZ = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
];
const DNI = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];

/** '2026-12-05' -> 'sobota, 5 grudnia 2026' */
export function dlugaData(d: string): string {
  const [r, m, dz] = d.split('-').map(Number);
  const dzien = DNI[new Date(Date.UTC(r, m - 1, dz)).getUTCDay()];
  return `${dzien}, ${dz} ${MIESIACE_DOPELNIACZ[m - 1]} ${r}`;
}

/** Long form of a date range: 'sobota, 5 grudnia 2026' or '5–7 grudnia 2026'. */
export function dlugiZakres(start: string, koniec: string): string {
  if (start === koniec) return dlugaData(start);
  const [r1, m1, d1] = start.split('-').map(Number);
  const [r2, m2, d2] = koniec.split('-').map(Number);
  if (r1 === r2 && m1 === m2) return `${d1}–${d2} ${MIESIACE_DOPELNIACZ[m2 - 1]} ${r2}`;
  if (r1 === r2) return `${d1} ${MIESIACE_DOPELNIACZ[m1 - 1]} – ${d2} ${MIESIACE_DOPELNIACZ[m2 - 1]} ${r2}`;
  return `${d1} ${MIESIACE_DOPELNIACZ[m1 - 1]} ${r1} – ${d2} ${MIESIACE_DOPELNIACZ[m2 - 1]} ${r2}`;
}
