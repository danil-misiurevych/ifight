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
- ~~Uruchamianie agenta raz w tygodniu (zaplanowane zadanie Claude Code w chmurze).~~ Zrobione: w każdy poniedziałek ok. 7:00 agent otwiera PR z nowymi wydarzeniami.
- Imprezy spoza PZB (gale charytatywne, otwarte sparingi) ogłaszane są głównie na Facebooku i Instagramie klubów i sal. Tu przydaje się lista klubów (docs/kluby.csv), którą trzeba uzupełnić o sale bokserskie spoza PZB.
- Facebook bez automatycznego scrapingu: łamie regulamin FB i grozi blokadą. Zamiast tego: obserwowane profile i powiadomienia, wklejanie linków agentowi, prośba do klubów o wysyłanie komunikatów.
- ~~Wytyczne do przeglądu FB i IG agentem w przeglądarce użytkownika, na żądanie, z rotacją profili (`.claude/skills/przeglad-social`).~~ Zrobione.

## Etap 4. Panel administracyjny

- CMS oparty na gicie (Keystatic albo Decap CMS) pod `/admin`: formularz zamiast ręcznej edycji YAML. Zapis = commit.
- ~~Formularz dla organizatorów (`/dla-organizatorow/`): zgłoszenie zakłada issue z etykietą `zgłoszenie`.~~ Zrobione.
- API dla agenta: GitHub API (pull requesty). Błędne dane zatrzymuje walidacja przy budowaniu, a Vercel pokazuje podgląd przed scaleniem.
- ~~Komunikaty błędów walidacji po polsku.~~ Zrobione.

## Etap 5. Wygląd

- ~~Logo, paleta kolorów, czcionki (styl lat 80.).~~ Zrobione.
- ~~Nowy wygląd „Narożniki” (po researchu, listopad 2026): czerwony i niebieski narożnik ringu, tryby „Startuję / Oglądam”, widoczne filtry, kategorie i termin zgłoszeń na karcie, przycisk „Zgłoś wydarzenie”. Grafiki do udostępniania w stylu plakatu gali.~~ Zrobione.
- ~~Grafika do udostępniania (Open Graph).~~ Zrobione: osobna dla każdego wydarzenia i województwa, generowana przy budowaniu (`src/lib/og.ts`).

## Etap 6. Opisy turniejów i SEO

- ~~Osobna strona dla każdego wydarzenia (`/wydarzenia/...`) z linkami: komunikat, zapisy, regulamin, bilety, transmisja.~~ Zrobione. Do uzupełnienia: opisy i linki w danych.
- ~~Strony województw (np. „turnieje bokserskie śląskie”).~~ Zrobione: `/wojewodztwo/<nazwa>/`. Strony miast: gdy w jednym mieście będzie kilka wydarzeń.
- ~~Kalendarz do subskrypcji (.ics) dla całej Polski i każdego województwa.~~ Zrobione.
- ~~Sitemap, dane strukturalne schema.org.~~ Zrobione.
- ~~Google Search Console: domena zweryfikowana, sitemap zgłoszona.~~ Zrobione (20.11.2026, 36 stron).

## Etap 7. Social media

- Profile: Instagram i strona na Facebooku, TikTok opcjonalnie.
- Automatyczne grafiki „Turnieje w tym tygodniu / miesiącu” generowane z danych (można użyć `src/lib/og.ts`).
- Krótkie filmy z szablonów (np. Remotion) generowane z tych samych danych.
- Pierwsze posty dopiero po etapach 1 i 5, żeby było co pokazać i dobrze to wyglądało.

## Etap 8. Przyciąganie użytkowników i organizatorów

Dwie grupy, które się nakręcają: odwiedzający (zawodnicy, trenerzy, rodzice, kibice) przyciągają organizatorów, a organizatorzy przynoszą wydarzenia i udostępniają je swoim odbiorcom. Najpierw pełne dane i ruch z Google, potem organizatorzy, na końcu narzędzia do powrotów.

### 8.1. Pomiar (najpierw, żeby wiedzieć, co działa)

- Zdarzenia w Vercel Analytics: klik w zapisy lub bilety, „Dodaj do kalendarza”, subskrypcja .ics, „Udostępnij”, wysłany formularz organizatora.
- Kilka liczb sprawdzanych raz w miesiącu: odwiedzający tygodniowo, kliknięcia z Google (Search Console), pobrania kalendarzy .ics, zgłoszenia od organizatorów, liczba nadchodzących wydarzeń.
- Cel na start: co najmniej 60 nadchodzących wydarzeń i każde województwo z przynajmniej jednym.

### 8.2. Ruch z Google

- Search Console: raz w miesiącu sprawdzić „Skuteczność” (na jakie frazy wchodzą ludzie) i raport „Wydarzenia” (czy Google widzi dane schema.org).
- Strony pod konkretne wyszukiwania: kategorie wiekowe („turnieje bokserskie dla kadetów”, „boks dzieci zawody”), rodzaje („gale boksu 2027”, „sparingi otwarte”), miasta, gdy w mieście są co najmniej 3 wydarzenia.
- Wydarzenia po zakończeniu: dodać link do wyników lub relacji. Archiwum dostaje wtedy ruch także po imprezie.
- Linki przychodzące: poprosić okręgowe związki, kluby i media bokserskie o link do kalendarza swojego województwa.

### 8.3. Organizatorzy (formularz już działa)

- Wiadomość do klubów z `docs/kluby.csv`, których wydarzenia już są w kalendarzu: link do ich strony, gotowa grafika, link do formularza. Zacząć od okręgowych związków (jeden kontakt to wiele turniejów).
- Agent `szukaj-wydarzen` co tydzień przegląda otwarte issues z etykietą `zgłoszenie`, sprawdza źródło i zamienia je w PR.
- Znaczek „Potwierdzone przez organizatora” przy wydarzeniu (pole w danych).
- Przycisk „Pobierz grafikę” na stronie wydarzenia (PNG z `src/lib/og.ts`) do wrzucenia na FB i IG klubu.
- Raz w miesiącu krótka wiadomość do aktywnych organizatorów: ile osób obejrzało ich wydarzenie i ile dodało je do kalendarza.
- Widget lub link „Nasze wydarzenia w kalendarzu iFight” do wklejenia na stronę klubu.

### 8.4. Powroty odwiedzających

- Cotygodniowy newsletter „Co w tym tygodniu” z podziałem na województwa, generowany z danych (np. Buttondown lub Resend). Zapis na stronie, bez kont.
- Lepiej wyeksponować subskrypcję kalendarza .ics województwa, bo to „newsletter” bez maila.
- Przypomnienie przed terminem zgłoszeń dla trenerów: w newsletterze i jako osobny wpis w kalendarzu .ics.

### 8.5. Social media (rozwinięcie etapu 7)

- Stały rytm: poniedziałek „W tym tygodniu”, czwartek „Termin zgłoszeń mija”, po weekendzie „Wyniki i relacje”.
- Oznaczać organizatorów w postach, żeby udostępniali je dalej.
- Grupy na FB dla trenerów i rodziców zawodników: wrzucać zestawienia województw, nie pojedyncze linki.

### Kolejność w etapie 8

8.1 → wiadomości do klubów i obsługa zgłoszeń przez agenta (8.3) → strony pod wyszukiwania (8.2) → social media (8.5) → newsletter (8.4) → statystyki dla organizatorów i widget (8.3).

## Kolejność

1 → 2 → 3 i 4 równolegle (agent z etapu 3 korzysta z mechanizmu PR z etapu 4) → 5 → 6 → 7 → 8 (8.1–8.3 można zaczynać już teraz).
