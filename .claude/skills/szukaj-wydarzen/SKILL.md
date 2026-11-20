---
name: szukaj-wydarzen
description: Wyszukuje nadchodzące wydarzenia bokserskie w Polsce (turnieje PZB, gale zawodowe i amatorskie, wydarzenia charytatywne, otwarte sparingi), sprawdza je u źródła i otwiera pull request ze zmianami w src/data/turnieje.yaml. Używaj przy cotygodniowym przeglądzie albo gdy użytkownik prosi o poszukanie nowych wydarzeń lub wkleja link do wydarzenia.
---

# Wyszukiwanie wydarzeń bokserskich

Cel: `src/data/turnieje.yaml` zawiera wszystkie znane nadchodzące wydarzenia bokserskie w Polsce, każde z linkiem do źródła.
Wynik pracy to **jeden pull request**. Nigdy nie scalaj go sam i nie commituj na `main`.

Format wpisów i dopuszczalne wartości: README.md (sekcja „Jak dodać wydarzenie”). Lista źródeł: docs/zrodla.md.

## Zasady

- Wpis trafia do danych tylko wtedy, gdy sam otworzyłeś źródło i potwierdziłeś w nim datę i miasto. Wynik wyszukiwarki to nie źródło.
- `zrodlo` wskazuje stronę organizatora, komunikat, akredytację PZB albo stronę biletową wydarzenia. Nie artykuł prasowy, jeśli istnieje źródło organizatora.
- Tylko boks: olimpijski, zawodowy, amatorski, freak fighty na zasadach bokserskich. Pomijaj gale MMA, kickboxingu, K1 i walk na gołe pięści, chyba że źródło wyraźnie podaje walki bokserskie (wtedy w nazwie lub organizatorze zaznacz, że chodzi o walki bokserskie podczas gali).
- Nie zgaduj pól. Brak kategorii, płci albo terminu zgłoszeń w źródle oznacza, że pole zostaje puste.
- Przy rozbieżności między źródłami ważniejszy jest komunikat organizatora albo związku. Opisz rozbieżność w PR.
- Facebook i Instagram: **bez automatycznego przeglądania i scrapingu** (regulamin, ryzyko blokady konta). Przegląd FB/IG robi osobny skill `przeglad-social`, tylko na żądanie użytkownika w jego przeglądarce. Jeśli użytkownik wklei link lub zrzut ekranu z FB, możesz z niego zrobić wpis. Wtedy `zrodlo` to ten link.
- Nie dodawaj duplikatów. Przed dodaniem sprawdź, czy wydarzenia nie ma już pod inną nazwą tego samego dnia.

## Kroki

### 1. Akredytacje PZB

```bash
npm ci
```

```bash
npm run akredytacje -- --zapisz
```

Skrypt dopisuje nowe zawody z listy akredytacji i odświeża `sprawdzono`. Potem:

- Popraw każdy wpis z komentarzem `# SPRAWDŹ`: ustal miasto i województwo (adres jest w komentarzu), usuń komentarz.
- Popraw nazwy pisane wielkimi literami na zwykłą pisownię, zostaw nazwy własne gal („Boxing Night”).
- Usuń dopisek `# Akredytacja A…` nad wpisem dopiero wtedy, gdy wpis jest poprawiony. Numer akredytacji podaj w opisie PR.
- Jeśli skrypt zgłosił wpisy „DO SPRAWDZENIA” (są w danych, nie ma ich w PDF), poszukaj, czy zmieniła się data albo nazwa. Nie usuwaj wpisu bez potwierdzenia odwołania, opisz to w PR.

### 2. Szczegóły turniejów

Dla nowych turniejów z akredytacji poszukaj komunikatu organizatora (strona klubu, okręgowego związku, PZB). Jeśli go znajdziesz, uzupełnij `kategorie`, `plec`, `poziom`, `termin_zgloszen`, `miejsce`, `linki` (np. `zapisy`, `regulamin`, `bilety`, `transmisja`, tylko jeśli są w źródle) i zmień `zrodlo` na komunikat.

### 3. Gale i wydarzenia spoza PZB

Sprawdź po kolei:

1. eBilet, kategoria sporty walki: `https://www.ebilet.pl/sport/sporty-walki/`. Otwórz stronę każdej gali bokserskiej, potwierdź datę, miasto, obiekt i organizatora.
2. Inne serwisy biletowe (Going., KupBilecik, Biletyna): wyszukaj „boxing night”, „gala boksu”.
3. Wyszukiwarka, zapytania na najbliższe 6 miesięcy, np.:
   - `gala boksu <miesiąc> <rok>`, `boxing night <miesiąc> <rok>`
   - `charytatywna gala boksu <rok>`, `turniej charytatywny boks <rok>`
   - `seminarium bokserskie <rok>`, `kurs instruktora boksu <rok>`, `szkolenie sędziów boks <rok>`, `obóz bokserski <rok>`
   - `otwarty sparing boks <miasto>`, `open sparing boks <rok>`
   - promotorzy: MB Promotions, Tymex Boxing Promotion, KnockOut Promotions, Polsat Boxing Promotions, Rocky Boxing Night, TBS Promotions
4. Polska Liga Boksu: terminarz na polskaligaboksu.pl.

Typ: gala zawodowa lub amatorska → `gala`, wydarzenie na cel charytatywny → `charytatywna`, otwarte sparingi → `sparingi`, seminaria, szkolenia, kursy i obozy → `szkolenie`.

Dla kogo (`udzial`), tylko jeśli wynika to ze źródła: `widownia` (tylko oglądanie, walczą zaproszeni zawodnicy), `zawodnicy` (start z licencją, zgłoszenia przez kluby), `otwarte` (może się zapisać każdy, np. white collar, otwarte sparingi). Brak pola = domyślna wartość dla rodzaju (turniej → zawodnicy, gala → widownia). Link do zapisów lub biletów wpisz w `linki.zapisy` / `linki.bilety`, bo pokazują się jako przyciski na liście.

Plakat (`obraz`): tylko oficjalny plakat ze strony organizatora albo serwisu biletowego, nigdy z FB/IG. Zapisz go jako `src/assets/wydarzenia/<slug-wydarzenia>.jpg` (do 1 MB) i dopisz `obraz: <plik>`. Jeśli nie da się go pobrać, pomiń: strona pokaże zaślepkę. Szczegóły: src/assets/wydarzenia/README.md.
W polu `organizator` możesz dopisać w nawiasie obiekt i rodzaj boksu, np. `MB Promotions (boks zawodowy, Hala OSiR)`.

### 4. Sprawdzenie

```bash
npm run build
```

Budowanie musi przejść. Błąd walidacji pokazuje numer wpisu i pole do poprawy.

### 5. Pull request

- Gałąź `agent/wydarzenia-RRRR-MM-DD`, jeden commit, np. „Dodaj 4 wydarzenia, odśwież akredytacje”.
- Opis PR po polsku:
  - tabela nowych wpisów: data, nazwa, miasto, typ, link do źródła;
  - zmienione wpisy z opisem zmiany;
  - wpisy do sprawdzenia przez człowieka (rozbieżności, możliwe odwołania, niepewne miasto);
  - znalezione, ale niedodane wydarzenia z powodem (np. brak potwierdzonej daty, nie boks).
- Jeśli nic się nie zmieniło poza datami `sprawdzono`, otwórz PR tylko wtedy, gdy minęło ponad 14 dni od poprzedniego odświeżenia.
