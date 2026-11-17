# iFight — kalendarz wydarzeń bokserskich w Polsce

Minimalistyczna strona statyczna: lista nadchodzących wydarzeń bokserskich (turnieje, gale, wydarzenia charytatywne, otwarte sparingi) z linkami do źródeł.
Serwis jest nieoficjalny, nie przyjmuje zgłoszeń ani opłat.

Technologia: [Astro](https://astro.build) (generowanie statyczne), bez bazy danych i backendu.
Wdrożenie: Vercel, automatycznie z GitHuba.

Plan rozwoju: [ROADMAP.md](ROADMAP.md). Źródła turniejów: [docs/zrodla.md](docs/zrodla.md).

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
| `organizator` | nie | Kto organizuje. |
| `termin_zgloszen` | nie | Termin zgłoszeń, `RRRR-MM-DD`. |
| `zrodlo` | tak | Link do źródła (z `https://`). Kliknięcie w wydarzenie otwiera ten link. |
| `sprawdzono` | tak | Kiedy ostatnio porównano dane ze źródłem. |
| `test` | nie | `true` oznacza wpis testowy (patrz niżej). |

Pole niewymagane można pominąć albo zostawić puste.

### Dopuszczalne wartości

- **typ**: turniej, gala (także zawodowa i freak fighty w boksie), charytatywna, sparingi, inne
- **wojewodztwo**: dolnośląskie, kujawsko-pomorskie, lubelskie, lubuskie, łódzkie, małopolskie, mazowieckie, opolskie, podkarpackie, podlaskie, pomorskie, śląskie, świętokrzyskie, warmińsko-mazurskie, wielkopolskie, zachodniopomorskie
- **kategorie**: młodzik, kadet, junior, młodzieżowiec, senior
- **poziom**: okręgowy, ogólnopolski, międzynarodowy

Można pisać bez polskich znaków i dowolną wielkością liter (`slaskie`, `mlodzik`). Na stronie i tak pojawi się poprawna pisownia.

### Jeśli coś pójdzie nie tak

Budowanie strony sprawdza plik. Przy błędzie (nieistniejąca data, literówka w województwie lub w nazwie pola) wdrożenie na Vercel się nie uda, na stronie zostanie poprzednia wersja, a w logu budowania pojawi się linia w rodzaju:

```
запись №7 «Turniej…», wojewodztwo: допустимые значения: …
```

(Komunikaty błędów są na razie po rosyjsku, tłumaczenie jest w planie.)

### Jak działa lista

- Sortowanie po dacie rozpoczęcia, kolejność wpisów w pliku nie ma znaczenia.
- Wydarzenia, które już się odbyły, chowają się same (dzień po `koniec`), nie trzeba ich usuwać. Sprawdzanie działa i przy budowaniu, i w przeglądarce, więc codzienne przebudowywanie strony nie jest potrzebne.
- Termin zgłoszeń jest podświetlany na 7 dni przed datą (`dniWkrotce` w `src/site.ts`), a po niej pokazuje się „po terminie”.
- Wydarzenie bez `kategorie` lub `plec` jest widoczny przy każdej wartości odpowiedniego filtra: lepiej pokazać za dużo niż ukryć.

### Wpisy testowe

Wpis z `test: true` jest traktowany jako testowy: dopóki na stronie jest choć jeden taki wpis, na głównej wisi ostrzeżenie „Serwis w budowie”, a wpisy testowe nie trafiają do znaczników schema.org. Obecnie w pliku nie ma wpisów testowych.

## Przed startem

- Domena: adres dla canonical, sitemap i robots.txt jest brany automatycznie z domeny produkcyjnej projektu na Vercel. Żeby ustawić go wprost, dodaj w Vercel zmienną środowiskową `SITE_URL` (np. `https://example.pl`).

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

## Struktura

```
src/data/turnieje.yaml         dane — jedyny plik, który trzeba edytować
src/site.ts                    nazwa, opis, kontakt, próg „wkrótce”
src/lib/turnieje.ts            wczytywanie i sprawdzanie danych
src/lib/daty.ts                formatowanie dat, status terminu zgłoszeń
src/pages/index.astro          strona główna z listą
src/pages/o-serwisie.astro     strona „O serwisie”
src/components/                wiersz turnieju, filtry, znaczniki schema.org
src/scripts/lista.ts           filtry i ukrywanie minionych turniejów w przeglądarce
docs/                          dokumentacja: źródła (zrodla.md), lista klubów (kluby.csv)
```
