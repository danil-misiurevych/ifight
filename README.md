# iFight — kalendarz wydarzeń bokserskich w Polsce

Minimalistyczna strona statyczna: lista nadchodzących turniejów i zawodów bokserskich, na które można zgłosić zawodników, z terminami zgłoszeń i linkami do źródeł.

**Strefa zawodników:** publikowane są tylko wpisy, w których `udzial` zawiera `zawodnicy` lub `otwarte`, z wyjątkiem typu `szkolenie` (funkcja `wStrefie` w `src/lib/turnieje.ts`). Pozostałe wpisy (gale do oglądania, wydarzenia charytatywne, szkolenia) zostają w `turnieje.yaml`, ale nie mają stron, nie trafiają do kalendarzy .ics ani do sitemap. Przy zmianie zasad popraw też kopię warunku w `astro.config.mjs`.
Serwis jest nieoficjalny i bezpłatny. Organizatorzy mogą zgłaszać wydarzenia do kalendarza; zapisy zawodników i bilety obsługuje zawsze organizator.

Technologia: [Astro](https://astro.build) (generowanie statyczne), bez bazy danych i backendu.
Wdrożenie: Vercel, automatycznie z GitHuba.

Plan rozwoju: [ROADMAP.md](ROADMAP.md). Źródła turniejów: [docs/zrodla.md](docs/zrodla.md).

## Zgłoszenia od organizatorów

Strona `/dla-organizatorow/` ma formularz. Wysyła go funkcja Vercel `api/zgloszenie.ts`, która zakłada issue z etykietą `zgłoszenie` i gotowym szkicem wpisu YAML. Na stronie nic się nie pojawia, dopóki ktoś nie sprawdzi źródła i nie scali PR.

Repozytorium jest publiczne, więc issue też: formularz nie prosi o dane kontaktowe.

Ustawienia w Vercel (Settings → Environment Variables, środowisko Production i Preview):

- `GITHUB_TOKEN`: token „fine-grained” tylko do tego repozytorium, uprawnienie *Issues: Read and write*.
- `GITHUB_REPO` (opcjonalnie): domyślnie `danil-misiurevych/ifight`.

Lokalnie (`npm run dev`) funkcja nie działa: formularz pokaże komunikat o błędzie z adresem e-mail.

## Jak dodać wydarzenie

1. Otwórz `src/data/turnieje.yaml` (można bezpośrednio na GitHubie, przycisk z ołówkiem).
2. Skopiuj poniższy blok na koniec pliku i uzupełnij.
3. Zapisz (commit). Vercel przebuduje stronę w około minutę.

```yaml
- nazwa: Turniej o Puchar Miasta
  typ: turniej
  start: 2027-03-13
  koniec: 2027-03-14
  miasto: Poznań
  wojewodztwo: wielkopolskie
  kategorie: [kadet, junior]
  plec: [K, M]
  poziom: okręgowy
  organizator: KS Przykład
  termin_zgloszen: 2027-03-05
  miejsce: Hala sportowa, ul. Przykładowa 1
  opis: Krótki opis wydarzenia (opcjonalnie).
  linki:
    zapisy: https://adres-zapisow.pl
    regulamin: https://adres-regulaminu.pl
    transmisja: https://youtube.com/...
  zrodlo: https://adres-komunikatu.pl/turniej
  sprawdzono: 2027-02-20
```

Ważne: każdy wpis zaczyna się od `- `, pozostałe linie od dwóch spacji. Między wpisami pusta linia.

### Pola

| Pole | Wymagane | Co wpisać |
|---|---|---|
| `nazwa` | tak | Nazwa wydarzenia. Jeśli zawiera dwukropek lub `[`, weź ją w cudzysłów. |
| `typ` | nie | Rodzaj wydarzenia (lista niżej). Brak oznacza `turniej`. |
| `start` | tak | Data rozpoczęcia, `RRRR-MM-DD`. |
| `koniec` | nie | Data zakończenia. Brak oznacza wydarzenie jednodniowe. |
| `miasto` | tak | Miasto. |
| `wojewodztwo` | tak | Jedno z 16 województw (lista niżej). |
| `kategorie` | nie | Kategorie wiekowe w nawiasach kwadratowych, po przecinku. |
| `plec` | nie | `[K]`, `[M]` albo `[K, M]`. |
| `poziom` | nie | `okręgowy`, `ogólnopolski` albo `międzynarodowy`. |
| `udzial` | nie | Dla kogo, w nawiasach kwadratowych: `widownia` (tylko oglądanie), `zawodnicy` (start z licencją, zgłoszenia przez kluby), `otwarte` (może się zapisać każdy). Brak: turniej → zawodnicy, gala → widownia, sparingi i szkolenie → otwarte. |
| `organizator` | nie | Kto organizuje. |
| `termin_zgloszen` | nie | Termin zgłoszeń, `RRRR-MM-DD`. |
| `miejsce` | nie | Obiekt lub adres (hala, hotel, ulica). |
| `opis` | nie | Krótki opis na stronie wydarzenia. |
| `obraz` | nie | Nazwa pliku plakatu z `src/assets/wydarzenia/`, np. `gala-2027.jpg`. Na liście jako miniatura (na komputerze), na stronie wydarzenia w całości; pionowy plakat trafia też na grafikę do udostępniania. Bez plakatu wydarzenie po prostu go nie ma. |
| `linki` | nie | Linki na stronie wydarzenia (`zapisy`, `bilety` i `facebook` także jako przyciski na liście), każdy w osobnej linii z dwiema spacjami wcięcia: `komunikat`, `wydarzenie` (wydarzenie na Facebooku), `facebook` (profil organizatora na Facebooku), `zapisy`, `regulamin`, `bilety`, `transmisja`, `wyniki`. |
| `zrodlo` | tak | Link do źródła (z `https://`). Zawsze widoczny na stronie wydarzenia. |
| `slug` | nie | Własny adres strony wydarzenia (`/wydarzenia/<slug>/`). Domyślnie z nazwy i roku. Ustaw, gdy dwa wydarzenia mają ten sam adres albo żeby adres nie zmienił się po zmianie nazwy. |
| `sprawdzono` | tak | Kiedy ostatnio porównano dane ze źródłem. |
| `test` | nie | `true` oznacza wpis testowy (patrz niżej). |

Pole niewymagane można pominąć albo zostawić puste.

### Dopuszczalne wartości

- **typ**: turniej, gala (także zawodowa i freak fighty w boksie), charytatywna, sparingi, szkolenie (seminaria, szkolenia, kursy, obozy), inne
- **udzial**: widownia, zawodnicy, otwarte
- **wojewodztwo**: dolnośląskie, kujawsko-pomorskie, lubelskie, lubuskie, łódzkie, małopolskie, mazowieckie, opolskie, podkarpackie, podlaskie, pomorskie, śląskie, świętokrzyskie, warmińsko-mazurskie, wielkopolskie, zachodniopomorskie
- **kategorie**: młodzik, kadet, junior, młodzieżowiec, senior
- **poziom**: okręgowy, ogólnopolski, międzynarodowy

Można pisać bez polskich znaków i dowolną wielkością liter (`slaskie`, `mlodzik`). Na stronie i tak pojawi się poprawna pisownia.

### Jeśli coś pójdzie nie tak

Budowanie strony sprawdza plik. Przy błędzie (nieistniejąca data, literówka w województwie lub w nazwie pola) wdrożenie na Vercel się nie uda, na stronie zostanie poprzednia wersja, a w logu budowania pojawi się linia w rodzaju:

```
wpis nr 7 «Turniej…», wojewodztwo: dopuszczalne wartości: …
```

### Jak działa lista

- Każde wydarzenie ma własną stronę `/wydarzenia/<nazwa>-<rok>/` (dla SEO): dane, linki, znaczniki schema.org. Kliknięcie w wiersz listy otwiera tę stronę.
- Minione wydarzenia trafiają do `/archiwum/`.
- Pasek filtrów jest domyślnie zwinięty (przycisk „Filtry”); rozwija się sam, gdy adres zawiera filtry.
- Sortowanie po dacie rozpoczęcia, kolejność wpisów w pliku nie ma znaczenia.
- Wydarzenia, które już się odbyły, chowają się same (dzień po `koniec`), nie trzeba ich usuwać. Sprawdzanie działa i przy budowaniu, i w przeglądarce, więc codzienne przebudowywanie strony nie jest potrzebne.
- Termin zgłoszeń jest podświetlany na 7 dni przed datą (`dniWkrotce` w `src/site.ts`), a po niej pokazuje się „po terminie”.
- Wydarzenie bez `kategorie` lub `plec` jest widoczne przy każdej wartości odpowiedniego filtra: lepiej pokazać za dużo niż ukryć.

### Wpisy testowe

Wpis z `test: true` jest traktowany jako testowy: dopóki na stronie jest choć jeden taki wpis, na głównej wisi ostrzeżenie „Serwis w budowie”, a wpisy testowe nie trafiają do znaczników schema.org. Obecnie w pliku nie ma wpisów testowych.

## Przed startem

- Domena: adres dla canonical, sitemap i robots.txt jest brany automatycznie z domeny produkcyjnej projektu na Vercel. Żeby ustawić go wprost, dodaj w Vercel zmienną środowiskową `SITE_URL` (np. `https://example.pl`).
- Statystyki odwiedzin: strona ładuje skrypt Vercel Web Analytics (`<Analytics />` w `src/layouts/Strona.astro`, bez ciasteczek). Dane zbierają się dopiero po włączeniu Web Analytics w panelu Vercel: projekt **ifight** → zakładka **Analytics** → **Enable**. Wyniki są w tej samej zakładce.

## Uruchomienie lokalne

Wymagany Node.js 22.23.4 lub nowszy.

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

`npm run dev` uruchamia stronę pod http://localhost:4321, `npm run build` buduje ją do `dist/`.

## Sprawdzanie akredytacji PZB

Skrypt pobiera [listę akredytacji PZB](https://pzb.sorga.pl/api/files/pub/akredytacje.pdf) i porównuje nadchodzące zawody z `src/data/turnieje.yaml`.

```bash
npm run akredytacje
```

Wypisuje gotowe wpisy YAML dla wydarzeń, których brakuje, oraz wpisy z tym źródłem, których w PDF już nie ma (zmiana daty lub odwołanie).

```bash
npm run akredytacje -- --zapisz
```

Dopisuje brakujące wydarzenia na koniec pliku i ustawia `sprawdzono` na dziś we wpisach potwierdzonych w PDF.
Z PDF skrypt bierze też obiekt (`miejsce`), organizatora (albo klub wnioskujący) i po zawodach link do protokołu (`linki.wyniki`). Kategorie, płeć i poziom ustawia tylko wtedy, gdy wynikają z nazwy zawodów (np. „Mistrzostwa Mazowsza Juniorek i Juniorów” → `[junior]`, `[K, M]`, `okręgowy`).
PDF nie podaje województwa ani osobnej kolumny kategorii: województwo jest zgadywane z miasta. Gdzie się nie udało, wpis ma komentarz `# SPRAWDŹ` i puste pole, więc budowanie strony go zatrzyma, dopóki go nie poprawisz.
Inne opcje: `--json` (wynik dla agenta), `--plik akredytacje.pdf` (PDF z dysku), `--od RRRR-MM-DD` (udaje inną datę, do testów).

## Strony województw i kalendarz do subskrypcji

- `/wojewodztwo/<nazwa>/` (np. `/wojewodztwo/slaskie/`): lista wydarzeń z jednego województwa, pod wyszukiwania w rodzaju „turnieje bokserskie śląskie”. Istnieje wszystkie 16 stron; strona bez nadchodzących wydarzeń dostaje `noindex` i nie trafia do sitemap.
- `/kalendarz.ics`: kalendarz wszystkich wydarzeń do subskrypcji w Google, Apple lub Outlook. Każde województwo ma własny: `/wojewodztwo/<nazwa>/kalendarz.ics`. Wydarzenia zostają w kalendarzu jeszcze 60 dni po zakończeniu (`DNI_WSTECZ` w `src/lib/ics.ts`).
- Każde wydarzenie ma na swojej stronie przyciski „Dodaj do kalendarza” (Google oraz plik `/wydarzenia/<adres>.ics` dla Apple i Outlooka) i „Udostępnij” (menu udostępniania w telefonie, WhatsApp, Facebook, kopiowanie linku).
- Kalendarze i liczby przy województwach odświeżają się przy każdym budowaniu strony, czyli przy każdej zmianie danych.

## Grafiki do udostępniania

Każde wydarzenie i województwo ma własną grafikę (Open Graph), którą Facebook, Messenger, WhatsApp czy X pokazują przy udostępnionym linku. Grafiki powstają przy budowaniu z tych samych danych (satori + resvg), więc nie trzeba ich robić ręcznie. Podgląd: `/og/wydarzenia/<adres-wydarzenia>.png`.

Facebook zapamiętuje grafikę na długo. Po zmianie danych wydarzenia można ją odświeżyć w [narzędziu do debugowania udostępnień](https://developers.facebook.com/tools/debug/).

## Struktura

```
src/data/turnieje.yaml         dane — jedyny plik, który trzeba edytować
src/site.ts                    nazwa, opis, kontakt, próg „wkrótce”
src/lib/turnieje.ts            wczytywanie i sprawdzanie danych
src/lib/daty.ts                formatowanie dat, status terminu zgłoszeń
src/pages/index.astro          strona główna z listą
src/pages/o-stronie.astro      strona „O stronie” (stary adres /o-serwisie/ przekierowuje)
src/pages/archiwum.astro       archiwum minionych wydarzeń
src/pages/wydarzenia/[slug].astro  osobna strona każdego wydarzenia
src/pages/wojewodztwo/         strony województw i ich kalendarze .ics
src/pages/kalendarz.ics.ts     kalendarz wszystkich wydarzeń
src/lib/ics.ts                 budowanie pliku iCalendar
src/lib/og.ts                  grafiki do udostępniania (1200×630 PNG)
src/pages/og/                  adresy grafik: /og/strona.png, /og/wydarzenia/…, /og/wojewodztwo/…
src/components/                lista, wiersz, filtry, województwa, subskrypcja, schema.org
src/scripts/lista.ts           filtry i ukrywanie minionych turniejów w przeglądarce
scripts/akredytacje.mjs        porównanie z listą akredytacji PZB
docs/                          dokumentacja: źródła (zrodla.md), lista klubów (kluby.csv)
```
