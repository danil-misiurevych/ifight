# Plan rozwoju iFight

Zadania są śledzone jako issues na GitHubie. Każdy etap ma jedno zbiorcze issue z listą podzadań.
Ten plik opisuje kierunek i kolejność. Szczegóły i postęp znajdziesz w issues.

Cel: kalendarz wszystkich większych wydarzeń bokserskich w Polsce. Nie tylko turnieje PZB, ale też gale (także zawodowe i freak fighty w boksie), wydarzenia charytatywne, otwarte dni sparingowe i podobne wydarzenia.

Założenia:
- Jedna osoba edytuje dane, więc nie potrzebujemy kont użytkowników ani własnego backendu.
- Bazą danych zostaje plik `src/data/turnieje.yaml` w repozytorium. Każda zmiana to commit, a historia zmian jest za darmo.
- Agent AI nie publikuje niczego sam: otwiera pull request, który zatwierdzasz.

## Etap 1. Start z prawdziwymi danymi

- Uzupełnić wydarzenia po połowie grudnia 2026 (cel: wszystkie znane do końca sezonu). Robi to w praktyce etap 3.

- ~~Podpiąć domenę ifight.pl w Vercel.~~ Zrobione.
- ~~Usunąć wpisy testowe i dodać pierwszą partię prawdziwych wydarzeń.~~ Zrobione.
- ~~Dodać do danych typ wydarzenia i filtr po typie.~~ Zrobione.
- ~~Zmienić hasło i opis strony z „turniejów” na „wydarzenia bokserskie”.~~ Zrobione.

## Etap 2. Organizacja GitHuba

- ~~Roadmapa (ten plik), etykiety, zbiorcze issues dla etapów.~~ Zrobione.
- Tablica GitHub Projects: pominięta. Przy jednej osobie i kilku issues wystarczą etykiety i listy zadań w issues.

## Etap 3. Wyszukiwanie i weryfikacja turniejów

- Lista źródeł: [docs/zrodla.md](docs/zrodla.md). Kalendarz PZB, 16 okręgowych związków, kluby, platformy zapisów, profile na Facebooku.
- Zebrać listę klubów i organizatorów z ich stronami i profilami na FB (Claude pomaga, szczegóły w docs/zrodla.md).
- ~~Parser listy akredytacji PZB (`npm run akredytacje`).~~ Zrobione.
- ~~Instrukcja agenta wyszukującego wydarzenia (`.claude/skills/szukaj-wydarzen`): akredytacje, serwisy biletowe, wyszukiwarka, pull request.~~ Zrobione.
- Uruchamianie agenta raz w tygodniu (zaplanowane zadanie Claude Code w chmurze).
- Imprezy spoza PZB (gale charytatywne, otwarte sparingi) ogłaszane są głównie na Facebooku i Instagramie klubów i sal. Tu przydaje się lista klubów (docs/kluby.csv), którą trzeba uzupełnić o sale bokserskie spoza PZB.
- Facebook bez automatycznego scrapingu: łamie regulamin FB i grozi blokadą. Zamiast tego: obserwowane profile i powiadomienia, wklejanie linków agentowi, prośba do klubów o wysyłanie komunikatów.
- ~~Wytyczne do przeglądu FB agentem w przeglądarce użytkownika, na żądanie (`.claude/skills/przeglad-facebooka`).~~ Zrobione.

## Etap 4. Panel administracyjny

- CMS oparty na gicie (Keystatic albo Decap CMS) pod `/admin`: formularz zamiast ręcznej edycji YAML. Zapis = commit.
- API dla agenta: GitHub API (pull requesty). Błędne dane zatrzymuje walidacja przy budowaniu, a Vercel pokazuje podgląd przed scaleniem.
- ~~Komunikaty błędów walidacji po polsku.~~ Zrobione.

## Etap 5. Wygląd

- ~~Logo, paleta kolorów, czcionki (styl lat 80.).~~ Zrobione.
- Grafika do udostępniania (Open Graph) i nowy favicon.

## Etap 6. Opisy turniejów i SEO

- ~~Osobna strona dla każdego wydarzenia (`/wydarzenia/...`) z linkami: komunikat, zapisy, regulamin, bilety, transmisja.~~ Zrobione. Do uzupełnienia: opisy i linki w danych.
- Strony województw i miast (np. „turnieje bokserskie śląskie”).
- Sitemap, dane strukturalne schema.org dla każdej strony, Google Search Console.

## Etap 7. Social media

- Profile: Instagram i strona na Facebooku, TikTok opcjonalnie.
- Automatyczne grafiki „Turnieje w tym tygodniu / miesiącu” generowane z danych.
- Krótkie filmy z szablonów (np. Remotion) generowane z tych samych danych.
- Pierwsze posty dopiero po etapach 1 i 5, żeby było co pokazać i dobrze to wyglądało.

## Kolejność

1 → 2 → 3 i 4 równolegle (agent z etapu 3 korzysta z mechanizmu PR z etapu 4) → 5 → 6 → 7.
