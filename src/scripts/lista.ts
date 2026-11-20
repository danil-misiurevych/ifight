// Client-side behaviour of the event list:
// - hides events that ended after the last build,
// - refreshes deadline states against today's date,
// - applies the mode switch and filters without reloading and keeps them in the URL.
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
  // A page may leave some filters out (a region page has no region filter).
  const selecty = (['woj', 'kat', 'plec', 'typ', 'mies'] as const)
    .map((n) => form.elements.namedItem(n))
    .filter((el): el is HTMLSelectElement => el instanceof HTMLSelectElement);
  const tryby = [...form.querySelectorAll<HTMLInputElement>('input[name="tryb"]')];
  const tryb = () => tryby.find((r) => r.checked)?.value ?? '';

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

  // An event with no categories/sex/participation given matches any value:
  // better to show it than to hide it from a coach.
  const zawiera = (lista: string | undefined, v: string) => !lista || lista.split(' ').includes(v);
  const pasuje = (w: HTMLElement, f: Record<string, string>) =>
    (!f.typ || w.dataset.typ === f.typ) &&
    (!f.woj || w.dataset.woj === f.woj) &&
    (!f.mies || w.dataset.mies === f.mies) &&
    (!f.kat || zawiera(w.dataset.kat, f.kat)) &&
    (!f.plec || zawiera(w.dataset.plec, f.plec)) &&
    (!f.tryb || zawiera(w.dataset.tryby, f.tryb));

  const zastosuj = () => {
    const f: Record<string, string> = Object.fromEntries(selecty.map((s) => [s.name, s.value]));
    f.tryb = tryb();
    let widoczne = 0;
    for (const w of aktualne) {
      const ok = pasuje(w, f);
      w.hidden = !ok;
      if (ok) widoczne++;
    }
    for (const m of miesiace) m.hidden = !m.querySelector('.t:not([hidden])');
    for (const s of selecty) s.classList.toggle('wybrany', Boolean(s.value));

    const aktywne = Object.values(f).some(Boolean);
    licznik.textContent = `${widoczne} ${odmiana(widoczne)}`;
    wyczysc.hidden = !aktywne;
    pusto.hidden = widoczne > 0;
    pusto.textContent = aktywne
      ? 'Brak wydarzeń dla wybranych filtrów.'
      : 'Brak nadchodzących wydarzeń w kalendarzu.';

    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(f)) if (v) q.set(k, v);
    const s = q.toString();
    history.replaceState(null, '', s ? `?${s}` : location.pathname);
  };

  // Restore filters from the URL, ignoring values that are not in the lists.
  const q = new URLSearchParams(location.search);
  for (const s of selecty) {
    const v = q.get(s.name);
    if (v && [...s.options].some((o) => o.value === v)) s.value = v;
  }
  const t = q.get('tryb');
  for (const r of tryby) if (r.value === t) r.checked = true;

  form.addEventListener('change', zastosuj);
  wyczysc.addEventListener('click', () => {
    form.reset();
    zastosuj();
  });
  form.hidden = false;
  zastosuj();
}
