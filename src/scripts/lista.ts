// Client-side behaviour of the event list:
// - hides events that ended after the last build,
// - refreshes deadline states against today's date,
// - applies filters without reloading and keeps them in the URL,
// - opens and closes the filter panel (collapsed unless the URL has filters).
import { dzisiaj, stanTerminu } from '../lib/daty';

const lista = document.getElementById('turnieje');
const form = document.getElementById('filtry') as HTMLFormElement | null;

if (lista && form) {
  const dzis = dzisiaj();
  const dniWkrotce = Number(lista.dataset.dniWkrotce);
  const wiersze = [...lista.querySelectorAll<HTMLElement>('.t')];
  const miesiace = [...lista.querySelectorAll<HTMLElement>('.miesiac')];
  const licznik = document.getElementById('licznik')!;
  const wyczysc = document.getElementById('wyczysc')!;
  const pusto = document.getElementById('pusto')!;
  const pasek = document.getElementById('filtry-pasek')!;
  const przycisk = document.getElementById('filtry-przycisk')!;
  const ile = document.getElementById('filtry-ile')!;
  const pola = ['typ', 'woj', 'kat', 'plec', 'mies'] as const;
  const select = (n: string) => form.elements.namedItem(n) as HTMLSelectElement;

  const aktualne = wiersze.filter((w) => {
    const trwa = w.dataset.koniec! >= dzis;
    if (!trwa) w.remove();
    return trwa;
  });

  for (const el of lista.querySelectorAll<HTMLElement>('.termin')) {
    const { stan, dopisek } = stanTerminu(el.dataset.termin!, dzis, dniWkrotce);
    el.dataset.stan = stan;
    el.querySelector('.termin-dopisek')!.textContent = dopisek ? `(${dopisek})` : '';
  }

  const odmiana = (n: number) => {
    if (n === 1) return 'wydarzenie';
    const j = n % 10, d = n % 100;
    return j >= 2 && j <= 4 && (d < 12 || d > 14) ? 'wydarzenia' : 'wydarzeń';
  };

  // A tournament with no categories/sex given matches any value:
  // better to show it than to hide it from a coach.
  const pasuje = (w: HTMLElement, f: Record<string, string>) =>
    (!f.typ || w.dataset.typ === f.typ) &&
    (!f.woj || w.dataset.woj === f.woj) &&
    (!f.mies || w.dataset.mies === f.mies) &&
    (!f.kat || !w.dataset.kat || w.dataset.kat.split(' ').includes(f.kat)) &&
    (!f.plec || !w.dataset.plec || w.dataset.plec.split(' ').includes(f.plec));

  const zastosuj = () => {
    const f = Object.fromEntries(pola.map((p) => [p, select(p).value]));
    let widoczne = 0;
    for (const w of aktualne) {
      const ok = pasuje(w, f);
      w.hidden = !ok;
      if (ok) widoczne++;
    }
    for (const m of miesiace) m.hidden = !m.querySelector('.t:not([hidden])');

    const liczbaAktywnych = pola.filter((p) => f[p]).length;
    const aktywne = liczbaAktywnych > 0;
    ile.textContent = String(liczbaAktywnych);
    ile.hidden = !aktywne;
    licznik.textContent = `${widoczne} ${odmiana(widoczne)}`;
    wyczysc.hidden = !aktywne;
    pusto.hidden = widoczne > 0;
    pusto.textContent = aktywne
      ? 'Brak wydarzeń dla wybranych filtrów.'
      : 'Brak nadchodzących wydarzeń w kalendarzu.';

    const q = new URLSearchParams();
    for (const p of pola) if (f[p]) q.set(p, f[p]);
    const s = q.toString();
    history.replaceState(null, '', s ? `?${s}` : location.pathname);
  };

  // Restore filters from the URL, ignoring values that are not in the lists.
  const q = new URLSearchParams(location.search);
  for (const p of pola) {
    const v = q.get(p);
    if (v && [...select(p).options].some((o) => o.value === v)) select(p).value = v;
  }

  const pokaz = (otwarte: boolean) => {
    form.hidden = !otwarte;
    przycisk.setAttribute('aria-expanded', String(otwarte));
  };
  przycisk.addEventListener('click', () => pokaz(form.hidden));

  form.addEventListener('change', zastosuj);
  wyczysc.addEventListener('click', () => {
    form.reset();
    zastosuj();
  });
  pasek.hidden = false;
  pokaz(pola.some((p) => select(p).value));
  zastosuj();
}
