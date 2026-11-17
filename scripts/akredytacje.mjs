#!/usr/bin/env node
// Porównuje listę akredytacji PZB (PDF) z src/data/turnieje.yaml.
//
//   npm run akredytacje                 raport: nowe wydarzenia i wpisy, których nie ma już w PDF
//   npm run akredytacje -- --zapisz     dodatkowo dopisuje nowe wydarzenia do turnieje.yaml
//                                       i ustawia `sprawdzono` na dziś we wpisach potwierdzonych w PDF
//   npm run akredytacje -- --plik x.pdf czyta PDF z dysku zamiast pobierać
//   npm run akredytacje -- --od 2026-10-01  udaje, że dziś jest podana data (do testów)
//   npm run akredytacje -- --json       wynik jako JSON (dla agenta)
//
// PDF nie podaje województwa ani kategorii. Województwo zgadujemy z miasta
// (lista miast z docs/kluby.csv). Wpisy, których nie udało się dopasować, mają
// komentarz "# SPRAWDŹ" i puste pole, więc budowanie strony je zatrzyma.
import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const URL_PDF = 'https://pzb.sorga.pl/api/files/pub/akredytacje.pdf';
const PLIK_DANYCH = 'src/data/turnieje.yaml';
const PLIK_KLUBOW = 'docs/kluby.csv';

const arg = process.argv.slice(2);
const opcja = (n) => arg.includes(n);
const wartosc = (n) => (arg.includes(n) ? arg[arg.indexOf(n) + 1] : undefined);

const dzisiaj = wartosc('--od') ?? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(new Date());

const slug = (s) =>
  s.toLowerCase().replaceAll('ł', 'l').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

// ---------- 1. Odczyt PDF ----------

// Granice kolumn (współrzędna x na stronie). Nagłówki: Numer | Protokół | Wydarzenie | Adres | Data | Organizator | Wnioskuje.
const KOLUMNY = [
  ['numer', 0],
  ['protokol', 140],
  ['wydarzenie', 245],
  ['adres', 375],
  ['data', 510],
  ['organizator', 590],
  ['wnioskuje', 700],
];
const kolumna = (x) => KOLUMNY.findLast(([, od]) => x >= od)[0];
const NUMER = /^A\d+\/\d{4}$/;

async function wierszePdf(dane) {
  const doc = await getDocument({ data: dane, verbosity: 0 }).promise;
  const wiersze = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const elementy = (await (await doc.getPage(p)).getTextContent()).items
      .filter((it) => it.str.trim())
      .map((it) => ({ x: it.transform[4], y: it.transform[5], s: it.str.trim() }));
    // Każdy wiersz tabeli ma numer akredytacji w pierwszej kolumnie. Tekst wielowierszowych
    // komórek przypisujemy do numeru leżącego najbliżej w pionie.
    const naglowek = elementy.find((e) => e.s === 'Numer akredytacji');
    const tabela = naglowek ? elementy.filter((e) => e.y < naglowek.y - 3) : elementy;
    const kotwice = tabela.filter((e) => e.x < 140 && NUMER.test(e.s));
    const naStronie = kotwice.map((k) => ({ numer: k.s, y: k.y, komorki: {} }));
    for (const e of tabela) {
      if (!kotwice.length || kotwice.includes(e)) continue;
      const w = naStronie.reduce((a, b) => (Math.abs(b.y - e.y) < Math.abs(a.y - e.y) ? b : a));
      if (Math.abs(w.y - e.y) > 40) continue; // nagłówek tabeli lub stopka
      (w.komorki[kolumna(e.x)] ??= []).push(e);
    }
    for (const w of naStronie) {
      const tekst = (k) =>
        (w.komorki[k] ?? [])
          .sort((a, b) => b.y - a.y || a.x - b.x)
          .map((e) => e.s)
          .join(' ')
          .replace(/\s+/g, ' ')
          .replace(/\s+([,.])/g, '$1')
          .trim();
      wiersze.push({
        numer: w.numer,
        wydarzenie: tekst('wydarzenie'),
        adres: tekst('adres'),
        data: tekst('data'),
        organizator: tekst('organizator'),
        strona: p,
      });
    }
  }
  return wiersze;
}

// '05.12.2026' -> {start}, '05-07.12.2026' / '05.12-07.12.2026' / '30.12.2026-02.01.2027' -> {start, koniec}
function daty(s) {
  const d = s.replace(/\s/g, '');
  let m;
  if ((m = d.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/))) return { start: iso(m[3], m[2], m[1]) };
  if ((m = d.match(/^(\d{1,2})[-–](\d{1,2})\.(\d{1,2})\.(\d{4})$/)))
    return { start: iso(m[4], m[3], m[1]), koniec: iso(m[4], m[3], m[2]) };
  if ((m = d.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?[-–]?(\d{1,2})\.(\d{1,2})\.(\d{4})$/)))
    return { start: iso(m[3] ?? m[6], m[2], m[1]), koniec: iso(m[6], m[5], m[4]) };
  return null;
}
const iso = (r, m, d) => `${r}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

// ---------- 2. Miasto i województwo ----------

const WOJ_OZB = {
  'dolnoslask': 'dolnośląskie', 'kujawsko': 'kujawsko-pomorskie', 'lubelsk': 'lubelskie', 'lubusk': 'lubuskie',
  'lodz': 'łódzkie', 'malopolsk': 'małopolskie', 'mazowiec': 'mazowieckie', 'opolsk': 'opolskie',
  'podkarpack': 'podkarpackie', 'podlask': 'podlaskie', 'pomorsk': 'pomorskie', 'slask': 'śląskie',
  'swietokrzysk': 'świętokrzyskie', 'warminsko': 'warmińsko-mazurskie', 'wielkopolsk': 'wielkopolskie',
  'zachodniopomorsk': 'zachodniopomorskie',
};

function wczytajMiasta() {
  const miasta = new Map(); // slug miasta -> { miasto, wojewodztwo }
  const [, ...linie] = readFileSync(PLIK_KLUBOW, 'utf8').trim().split('\n');
  for (const l of linie) {
    const [woj, , miasto] = l.split(',');
    if (miasto && !miasta.has(slug(miasto))) miasta.set(slug(miasto), { miasto, wojewodztwo: woj });
  }
  // Miasta z dotychczasowych wpisów też się przydają.
  for (const t of parse(readFileSync(PLIK_DANYCH, 'utf8')) ?? []) {
    if (t.miasto && t.wojewodztwo && !miasta.has(slug(t.miasto)))
      miasta.set(slug(t.miasto), { miasto: t.miasto, wojewodztwo: t.wojewodztwo });
  }
  return miasta;
}

function zgadnijMiejsce(w, miasta) {
  // Najpierw adres, potem organizator. Najdłuższa nazwa wygrywa ("Bielsko-Biała" przed "Biała").
  for (const pole of [w.adres, w.organizator]) {
    const s = ` ${slug(pole)} `;
    const trafienia = [...miasta.keys()].filter((m) => s.includes(` ${m} `)).sort((a, b) => b.length - a.length);
    if (trafienia.length) return { ...miasta.get(trafienia[0]), pewne: true };
  }
  // Nie znamy miasta: propozycja z adresu (po kodzie pocztowym albo pierwsze słowo), do sprawdzenia.
  const kod = w.adres.match(/\d{2}-\s?\d{3}\s+([A-ZĄĆĘŁŃÓŚŹŻ][\p{L}-]+(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][\p{L}-]+)?)/u);
  const pierwsze = w.adres.match(/^([A-ZĄĆĘŁŃÓŚŹŻ][\p{L}-]+)(?=\s*[-–,])/u);
  // Organizator to okręgowy związek: znamy przynajmniej województwo.
  const org = slug(w.organizator);
  const ozb = Object.entries(WOJ_OZB).find(([k]) => org.includes(k) && /ozb|o z b|zwiazek/.test(org));
  return { miasto: kod?.[1] ?? pierwsze?.[1] ?? '', wojewodztwo: ozb?.[1] ?? '', pewne: false };
}

const zgadnijTyp = (nazwa) => (/\bgal[aiy]\b|boxing (night|show)|fight night/i.test(nazwa) ? 'gala' : undefined);

// ---------- 3. Porównanie z danymi ----------

// Słowa, które występują w nazwach prawie wszystkich wydarzeń i nic nie mówią o tym, które to.
const POSPOLITE = new Set(
  ('turniej turnieju bokserski bokserskiego boks boksu boksie bokserska gala gali puchar pucharu miasta ' +
    'prezydenta burmistrza wojta starosty marszalka memorial memorialu mistrzostwa ogolnopolski ogolnopolskiego ' +
    'miedzynarodowy miedzynarodowego okregowy imienia oraz dla pod patronatem klub klubu sportowy').split(' '),
);
function slowa(s) {
  return new Set(slug(s).split(' ').filter((w) => w.length >= 3 && !/^[ivxlc]+$/.test(w) && !POSPOLITE.has(w)));
}
/** Udział wspólnych znaczących słów, 0..1. */
function podobienstwo(a, b) {
  const A = slowa(a);
  const B = slowa(b);
  if (!A.size || !B.size) return slug(a) === slug(b) ? 1 : 0;
  return [...A].filter((w) => B.has(w)).length / Math.min(A.size, B.size);
}

function porownaj(zPdf, wpisy) {
  const nowe = [];
  const potwierdzone = new Set();
  for (const w of zPdf) {
    // Ta sama data i co najmniej połowa znaczących słów nazwy wspólna. Wygrywa najlepiej pasujący wpis.
    const kandydaci = wpisy
      .filter((t) => String(t.start) === w.start && !potwierdzone.has(t))
      .map((t) => ({ t, p: Math.max(podobienstwo(t.nazwa, w.wydarzenie), podobienstwo(t.nazwa, `${w.wydarzenie} ${w.organizator}`)) }))
      .filter((k) => k.p >= 0.5)
      .sort((a, b) => b.p - a.p);
    if (kandydaci.length) potwierdzone.add(kandydaci[0].t);
    else nowe.push(w);
  }
  // Wpisy oparte na PDF, które nie mają już odpowiednika (np. zmiana daty albo odwołanie).
  const zniknely = wpisy.filter(
    (t) => t.zrodlo === URL_PDF && String(t.koniec ?? t.start) >= dzisiaj && !potwierdzone.has(t),
  );
  return { nowe, potwierdzone: [...potwierdzone], zniknely };
}

// ---------- 4. Zapis ----------

function wpisYaml(w, miasta) {
  const m = zgadnijMiejsce(w, miasta);
  const typ = zgadnijTyp(w.wydarzenie);
  // Cudzysłów tylko tam, gdzie YAML go wymaga.
  const q = (s) => (/: | #|^[-?:,\[\]{}#&*!|>'"%@`]|:$/.test(s) ? JSON.stringify(s) : s);
  // "Nazwa" -> „Nazwa”, żeby nie trzeba było jej brać w cudzysłów.
  const nazwa = w.wydarzenie.replace(/"([^"]*)"/g, '„$1”').replace(/^"+|"+$/g, '').replace(/"/g, '”');
  const linie = [
    `- nazwa: ${q(nazwa)}`,
    typ && `  typ: ${typ}`,
    `  start: ${w.start}`,
    w.koniec && `  koniec: ${w.koniec}`,
    `  miasto: ${[q(m.miasto), !m.pewne && `# SPRAWDŹ, adres w PDF: ${w.adres}`].filter(Boolean).join(' ')}`,
    `  wojewodztwo: ${[m.wojewodztwo, !m.pewne && '# SPRAWDŹ'].filter(Boolean).join(' ')}`,
    w.organizator && w.organizator !== '-' && `  organizator: ${q(w.organizator)}`,
    `  zrodlo: ${URL_PDF}`,
    `  sprawdzono: ${dzisiaj}`,
  ];
  return `# Akredytacja ${w.numer}\n${linie.filter(Boolean).join('\n')}\n`;
}

function ustawSprawdzono(tekst, wpisy) {
  // Zmieniamy tylko linię `sprawdzono` w blokach potwierdzonych wpisów, reszta pliku zostaje bez zmian.
  const bloki = tekst.split(/\n(?=- )/);
  return bloki
    .map((b) => {
      const t = wpisy.find((t) => b.startsWith(`- nazwa: ${t.nazwa}`) || b.startsWith(`- nazwa: ${JSON.stringify(t.nazwa)}`));
      return t && t.zrodlo === URL_PDF ? b.replace(/^  sprawdzono: .*$/m, `  sprawdzono: ${dzisiaj}`) : b;
    })
    .join('\n');
}

// ---------- Główna część ----------

const plik = wartosc('--plik');
const dane = plik
  ? new Uint8Array(readFileSync(plik))
  : new Uint8Array(await (await fetch(URL_PDF)).arrayBuffer());

const wszystkie = await wierszePdf(dane);
const bledne = wszystkie.filter((w) => !daty(w.data));
const zPdf = [];
for (const w of wszystkie) {
  const d = daty(w.data);
  if (!d || (d.koniec ?? d.start) < dzisiaj) continue;
  // PDF czasem ma ten sam wpis dwa razy pod różnymi numerami.
  if (zPdf.some((z) => z.start === d.start && slug(z.wydarzenie) === slug(w.wydarzenie))) continue;
  zPdf.push({ ...w, ...d });
}

const tekstDanych = readFileSync(PLIK_DANYCH, 'utf8');
const wpisy = parse(tekstDanych) ?? [];
const { nowe, potwierdzone, zniknely } = porownaj(zPdf, wpisy);
const miasta = wczytajMiasta();

if (opcja('--json')) {
  console.log(
    JSON.stringify(
      {
        dzisiaj,
        wierszy_w_pdf: wszystkie.length,
        nadchodzace: zPdf.length,
        nieczytelne_daty: bledne.map((w) => ({ numer: w.numer, data: w.data })),
        nowe: nowe.map((w) => ({ ...w, ...zgadnijMiejsce(w, miasta), typ: zgadnijTyp(w.wydarzenie) ?? 'turniej' })),
        potwierdzone: potwierdzone.map((t) => t.nazwa),
        zniknely: zniknely.map((t) => ({ nazwa: t.nazwa, start: t.start })),
      },
      null,
      2,
    ),
  );
} else {
  console.log(`PDF: ${wszystkie.length} akredytacji, nadchodzących (od ${dzisiaj}): ${zPdf.length}.`);
  console.log(`Potwierdzone w danych: ${potwierdzone.length}.`);
  if (bledne.length) console.log(`Nieczytelna data w ${bledne.length} wierszach: ${bledne.map((w) => `${w.numer} "${w.data}"`).join(', ')}`);
  if (nowe.length) {
    console.log(`\nNOWE (${nowe.length}), brak w ${PLIK_DANYCH}:\n`);
    for (const w of nowe) console.log(wpisYaml(w, miasta));
  } else console.log('\nBrak nowych wydarzeń.');
  if (zniknely.length) {
    console.log(`\nDO SPRAWDZENIA (${zniknely.length}): wpisy ze źródłem PDF, których w PDF nie ma (zmiana daty lub nazwy, odwołanie?):`);
    for (const t of zniknely) console.log(`  ${t.start}  ${t.nazwa}`);
  }
}

if (opcja('--zapisz')) {
  let tekst = ustawSprawdzono(tekstDanych, potwierdzone);
  if (nowe.length) tekst = `${tekst.trimEnd()}\n\n${nowe.map((w) => wpisYaml(w, miasta)).join('\n')}`;
  if (tekst !== tekstDanych) {
    writeFileSync(PLIK_DANYCH, tekst.endsWith('\n') ? tekst : `${tekst}\n`);
    console.error(`\nZapisano ${PLIK_DANYCH}: ${nowe.length} nowych, ${potwierdzone.length} z nową datą sprawdzenia.`);
  }
}

// Kod 2 = są zmiany do przejrzenia (przydatne dla agenta i CI).
process.exitCode = nowe.length || zniknely.length ? 2 : 0;
