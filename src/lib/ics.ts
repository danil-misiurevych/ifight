// iCalendar (RFC 5545) feed built from the event list, so people can subscribe
// in Google Calendar, Apple Calendar or Outlook and get updates automatically.
import type { Turniej } from './turnieje';
import { slug, TYP_ETYKIETA } from './turnieje';
import { SITE } from '../site';

// Recently finished events stay in the feed for a while,
// so they do not vanish from subscribers' calendars the day after.
export const DNI_WSTECZ = 60;

/** '2026-12-05' -> '20261205' */
const dataIcs = (d: string) => d.replaceAll('-', '');

/** The day after, because DTEND of an all-day event is exclusive. */
function nastepnyDzien(d: string): string {
  const x = new Date(`${d}T00:00:00Z`);
  x.setUTCDate(x.getUTCDate() + 1);
  return x.toISOString().slice(0, 10);
}

const escape = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

// Lines longer than 75 octets are folded: CRLF + one space, never splitting a UTF-8 character.
function zawin(linia: string): string {
  const enc = new TextEncoder();
  const czesci: string[] = [];
  let biezaca = '';
  let bajty = 0;
  for (const znak of linia) {
    const n = enc.encode(znak).length;
    const limit = czesci.length === 0 ? 75 : 74;
    if (bajty + n > limit) {
      czesci.push(biezaca);
      biezaca = '';
      bajty = 0;
    }
    biezaca += znak;
    bajty += n;
  }
  czesci.push(biezaca);
  return czesci.join('\r\n ');
}

/** Stable across rebuilds as long as name, start and city do not change. */
export function uid(t: Turniej): string {
  const s = slug(`${t.start}-${t.miasto}-${t.nazwa}`).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${s}@ifight.pl`;
}

export function kalendarzIcs(
  turnieje: Turniej[],
  opcje: { nazwa: string; dzis: string; teraz?: Date },
): string {
  const teraz = opcje.teraz ?? new Date();
  const stamp = teraz.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const od = new Date(`${opcje.dzis}T00:00:00Z`);
  od.setUTCDate(od.getUTCDate() - DNI_WSTECZ);
  const granica = od.toISOString().slice(0, 10);

  const linie = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${SITE.nazwa}//Kalendarz wydarzen bokserskich//PL`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escape(opcje.nazwa)}`,
    `X-WR-CALDESC:${escape(SITE.haslo)}`,
    'X-WR-TIMEZONE:Europe/Warsaw',
    // Hint for clients that poll subscribed calendars.
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
    'X-PUBLISHED-TTL:PT12H',
  ];

  for (const t of turnieje) {
    if (t.test || t.koniec < granica) continue;
    const opis = [
      TYP_ETYKIETA[t.typ].jeden,
      t.kategorie.length > 0 && `kategorie: ${t.kategorie.join(', ')}`,
      t.plec.length > 0 && `płeć: ${t.plec.join('+')}`,
      t.poziom && `poziom: ${t.poziom}`,
      t.organizator && `organizator: ${t.organizator}`,
      t.termin_zgloszen && `termin zgłoszeń: ${t.termin_zgloszen}`,
      `źródło: ${t.zrodlo}`,
      `sprawdzono: ${t.sprawdzono}. Przed wyjazdem potwierdź szczegóły u organizatora.`,
    ].filter(Boolean);

    linie.push(
      'BEGIN:VEVENT',
      `UID:${uid(t)}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${dataIcs(t.start)}`,
      `DTEND;VALUE=DATE:${dataIcs(nastepnyDzien(t.koniec))}`,
      `SUMMARY:${escape(t.nazwa)}`,
      `LOCATION:${escape(`${t.miasto}, ${t.wojewodztwo}`)}`,
      `DESCRIPTION:${escape(opis.join('\n'))}`,
      `URL:${t.zrodlo}`,
      `CATEGORIES:${escape(TYP_ETYKIETA[t.typ].jeden)}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }
  linie.push('END:VCALENDAR');
  return linie.map(zawin).join('\r\n') + '\r\n';
}

export const naglowkiIcs = { 'Content-Type': 'text/calendar; charset=utf-8' };
