// Vercel Function: receives the "Dla organizatorów" form and opens a GitHub issue
// labelled "zgłoszenie" with a ready-to-paste YAML draft. Nothing is published on the
// site until someone turns the issue into a pull request and merges it.
//
// Environment variables (Vercel → Settings → Environment Variables):
//   GITHUB_TOKEN – fine-grained token with "Issues: Read and write" on this repo only.
//   GITHUB_REPO  – optional, defaults to danil-misiurevych/ifight.
//
// The repository is public, so the issue is public too: the form does not ask for
// personal contact details.

const REPO = process.env.GITHUB_REPO ?? 'danil-misiurevych/ifight';
const STRONA_FORMULARZA = '/dla-organizatorow/';

const TYPY = ['turniej', 'gala', 'charytatywna', 'sparingi', 'szkolenie', 'inne'];
const WOJEWODZTWA = [
  'dolnośląskie', 'kujawsko-pomorskie', 'lubelskie', 'lubuskie',
  'łódzkie', 'małopolskie', 'mazowieckie', 'opolskie',
  'podkarpackie', 'podlaskie', 'pomorskie', 'śląskie',
  'świętokrzyskie', 'warmińsko-mazurskie', 'wielkopolskie', 'zachodniopomorskie',
];
const DATA = /^\d{4}-\d{2}-\d{2}$/;

type Pola = Record<string, string>;

// Single-line text, trimmed and cut to a sane length.
const linia = (v: unknown, max = 200) =>
  String(v ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);

const adres = (v: string) => {
  if (!v) return '';
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : '';
  } catch {
    return '';
  }
};

// YAML string in double quotes, safe for any text the organizer typed.
const yamlTekst = (v: string) => JSON.stringify(v);

async function odczytaj(request: Request): Promise<Pola> {
  const typ = request.headers.get('content-type') ?? '';
  if (typ.includes('application/json')) {
    const j = await request.json();
    return Object.fromEntries(Object.entries(j ?? {}).map(([k, v]) => [k, String(v ?? '')]));
  }
  const f = await request.formData();
  return Object.fromEntries([...f.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']));
}

function sprawdz(p: Pola) {
  const d = {
    nazwa: linia(p.nazwa, 150),
    typ: linia(p.typ, 20),
    start: linia(p.start, 10),
    koniec: linia(p.koniec, 10),
    miasto: linia(p.miasto, 80),
    wojewodztwo: linia(p.wojewodztwo, 30),
    organizator: linia(p.organizator, 150),
    zrodlo: adres(linia(p.zrodlo, 500)),
    zapisy: adres(linia(p.zapisy, 500)),
    termin_zgloszen: linia(p.termin_zgloszen, 10),
    opis: String(p.opis ?? '').replace(/\r\n?/g, '\n').trim().slice(0, 2000),
  };
  const bledy: string[] = [];
  if (!d.nazwa) bledy.push('Podaj nazwę wydarzenia.');
  if (!TYPY.includes(d.typ)) d.typ = 'inne';
  if (!DATA.test(d.start)) bledy.push('Podaj datę rozpoczęcia.');
  if (d.koniec && (!DATA.test(d.koniec) || d.koniec < d.start)) d.koniec = '';
  if (d.termin_zgloszen && !DATA.test(d.termin_zgloszen)) d.termin_zgloszen = '';
  if (!d.miasto) bledy.push('Podaj miasto.');
  if (!WOJEWODZTWA.includes(d.wojewodztwo)) bledy.push('Wybierz województwo.');
  if (!d.zrodlo) bledy.push('Podaj link do komunikatu lub ogłoszenia (np. post na Facebooku).');
  return { d, bledy };
}

function trescIssue(d: ReturnType<typeof sprawdz>['d']) {
  const yaml = [
    `- nazwa: ${yamlTekst(d.nazwa)}`,
    `  typ: ${d.typ}`,
    `  start: ${d.start}`,
    d.koniec && `  koniec: ${d.koniec}`,
    `  miasto: ${yamlTekst(d.miasto)}`,
    `  wojewodztwo: ${d.wojewodztwo}`,
    d.organizator && `  organizator: ${yamlTekst(d.organizator)}`,
    d.termin_zgloszen && `  termin_zgloszen: ${d.termin_zgloszen}`,
    d.zapisy && `  linki:\n    zapisy: ${yamlTekst(d.zapisy)}`,
    `  zrodlo: ${yamlTekst(d.zrodlo)}`,
    `  sprawdzono: RRRR-MM-DD  # uzupełnij po sprawdzeniu źródła`,
  ]
    .filter(Boolean)
    .join('\n');

  const opis = d.opis ? `\n### Opis od organizatora\n\n${d.opis.replace(/^/gm, '> ')}\n` : '';

  return `Zgłoszenie z formularza [Dla organizatorów](https://ifight.pl${STRONA_FORMULARZA}).

**Przed dodaniem sprawdź dane w źródle:** ${d.zrodlo}
${opis}
### Szkic wpisu do \`src/data/turnieje.yaml\`

\`\`\`yaml
${yaml}
\`\`\`

<sub>Dane wpisał organizator i nie zostały jeszcze sprawdzone.</sub>`;
}

function odpowiedz(request: Request, status: number, dane: { ok: boolean; bledy?: string[]; numer?: number }) {
  const chceJson = (request.headers.get('accept') ?? '').includes('application/json');
  if (chceJson) {
    return new Response(JSON.stringify(dane), {
      status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
  // Plain HTML form without JavaScript: go back to the page with the result in the URL.
  const cel = new URL(STRONA_FORMULARZA, request.url);
  cel.searchParams.set('wynik', dane.ok ? 'ok' : 'blad');
  cel.hash = 'formularz';
  return Response.redirect(cel.href, 303);
}

export async function POST(request: Request) {
  let pola: Pola;
  try {
    pola = await odczytaj(request);
  } catch {
    return odpowiedz(request, 400, { ok: false, bledy: ['Nie udało się odczytać formularza.'] });
  }

  // Spam traps: a hidden field people never fill, and a minimum time on the page.
  const wypelnione = Number(pola.czas ?? 0);
  if (pola.strona_www || (wypelnione && Date.now() - wypelnione < 4000)) {
    return odpowiedz(request, 200, { ok: true });
  }

  const { d, bledy } = sprawdz(pola);
  if (bledy.length) return odpowiedz(request, 422, { ok: false, bledy });

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('zgloszenie: brak GITHUB_TOKEN');
    return odpowiedz(request, 503, { ok: false });
  }

  const res = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'ifight-zgloszenia',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      title: `Zgłoszenie: ${d.nazwa} (${d.start}, ${d.miasto})`,
      body: trescIssue(d),
      labels: ['zgłoszenie'],
    }),
  });

  if (!res.ok) {
    console.error('zgloszenie: GitHub odpowiedział', res.status, await res.text());
    return odpowiedz(request, 502, { ok: false });
  }
  const issue = (await res.json()) as { number: number };
  return odpowiedz(request, 201, { ok: true, numer: issue.number });
}
