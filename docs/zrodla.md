# Źródła turniejów

Gdzie szukać turniejów i jak je weryfikować. Ostatnia aktualizacja: 2026-11-16.

## Zasady

- Na stronę trafia tylko turniej z linkiem do źródła (komunikat, regulamin, oficjalny wpis organizatora).
- Pole `sprawdzono` = data, kiedy porównano wpis ze źródłem.
- Przy rozbieżności (np. inna data w komunikacie i na FB) ważniejszy jest komunikat organizatora lub związku.

## Źródła główne

Sprawdzone 2026-11-17, w kolejności przydatności.

| Źródło | Co tam jest | Jak sprawdzać |
|---|---|---|
| [Akredytacje PZB](https://pzb.sorga.pl/api/files/pub/akredytacje.pdf) | **Najlepsze źródło.** Oficjalna lista wszystkich zawodów zatwierdzonych przez PZB, także turniejów klubowych i gal: nazwa, adres, data, organizator. Nowe wpisy na końcu pliku | PDF, pobierać co tydzień i szukać dat od dzisiaj. Brak kategorii wiekowych i terminów zgłoszeń, te trzeba doczytać u organizatora |
| [Kalendarz PZB](https://pzb.com.pl/kalendarz) | Tylko imprezy centralne: mistrzostwa Polski, OOM, starty reprezentacji | Publiczne API: `pzb.com.pl/wp-json/tribe/events/v1/events?start_date=RRRR-MM-DD`, albo eksport .ics |
| Komunikaty organizacyjne PZB | Szczegóły mistrzostw Polski: miejsce, termin zgłoszeń, kategorie | Pojawiają się 2–4 tygodnie przed zawodami w bibliotece mediów strony PZB (`/wp-json/wp/v2/media?search=Komunikat organizacyjny`) |
| Kalendarze okręgów | Np. [kalendarz WOZB](https://wozb.com.pl/wp-content/uploads/2026/01/WOZB-Kalendarz-wraz-z-imprezami-centralnymi-WOZB-21.01.2026-1.pdf) (wielkopolskie), kalendarz Śląskiego ZB | Publikowane w styczniu, potem daty się zmieniają. Traktować jako zapowiedź, potwierdzać w akredytacjach |
| Strony turniejów | Duże turnieje mają własne strony, np. [Złota Rękawica Wisły](https://zlotarekawica.wboksie.pl/) | Ręcznie, przy każdym turnieju |
| [Polska Liga Boksu](https://polskaligaboksu.pl) | Terminarz ligi | Ręcznie, raz w sezonie |
| [MartialMatch](https://martialmatch.com/pl/events?type=Boxing) | Platforma zapisów. W listopadzie 2026 tylko jedna impreza z boksem (kickboxing/MMA), na razie mało przydatna | Raz w miesiącu |

Numerowane „Komunikaty nr …/2026” PZB dotyczą głównie zgrupowań kadry, a nie turniejów. Nie trzeba ich przeglądać.

## Okręgowe związki bokserskie

Strony www i profile FB do uzupełnienia. PZB podaje tylko nazwy i telefony.

| Województwo | Związek | Strona www | Facebook |
|---|---|---|---|
| dolnośląskie | Dolnośląski OZB | | |
| kujawsko-pomorskie | Kujawsko-Pomorski OZB | | |
| lubelskie | Lubelski OZB | | |
| lubuskie | Lubuski OZB | | |
| łódzkie | OZB w Łodzi | | |
| małopolskie | Małopolski Związek Bokserski | | |
| mazowieckie | Warszawsko-Mazowiecki OZB | | |
| opolskie | Opolski OZB | | |
| podkarpackie | Podkarpacki OZB | | |
| podlaskie | Podlaski OZB | | |
| pomorskie | Pomorski OZB | | |
| śląskie | Śląski (Okręgowy) Związek Bokserski | | |
| świętokrzyskie | Świętokrzyski OZB | | |
| warmińsko-mazurskie | Warmińsko-Mazurski OZB | | |
| wielkopolskie | Wielkopolski OZB (Poznań) | | |
| zachodniopomorskie | Zachodniopomorski OZB (Szczecin) | | |

## Kluby i organizatorzy

Lista: [kluby.csv](kluby.csv), 242 kluby z 16 województw. GitHub wyświetla ją jako tabelę z wyszukiwarką, a edytować można ołówkiem albo w Excelu lub Google Sheets.

Kolumny: `wojewodztwo`, `nazwa`, `miasto`, `www`, `facebook`, `instagram`, `uwagi` (np. „co roku organizuje turniej X w marcu”). Kolumny `www`, `facebook` i `instagram` są na razie puste.

Skąd pochodzi lista (stan na 2026-11-16):
- Punktacja klubowa i wyniki z 39 komunikatów końcowych PZB z okresu od września 2025 do listopada 2026: mistrzostwa Polski wszystkich kategorii wiekowych, OOM, eliminacje, Puchar Polski, Międzynarodowe Mistrzostwa Śląska.
- Przy każdym zawodniku komunikat podaje kod okręgu (np. WLP, ŚL), z niego jest województwo. Nazwisk zawodników nie zapisujemy.
- Różne zapisy tego samego klubu (np. „Kielecki Klub Bokserski RUSHH” i „WKB Rushh Kielce”) są scalone. Miasto uzupełnione z nazwy klubu. Gdzie nie dało się go ustalić, pole jest puste.
- Lista obejmuje kluby, których zawodnicy startowali w zawodach PZB. Kluby bez startów w tych zawodach mogą jej brakować.

Jak odświeżyć listę: komunikaty PZB są dostępne przez publiczne API WordPressa strony PZB (`/wp-json/wp/v2/media`, wyszukiwanie „Komunikat końcowy”, typ PDF).

## Facebook: jak szukać bez ryzyka blokady

Automatyczne pobieranie danych z Facebooka (scraping) łamie regulamin FB. Konto może zostać zablokowane, a oficjalne API do publicznych stron wymaga trudnej weryfikacji aplikacji. Dlatego:

1. **Lista klubów jest gotowa** ([kluby.csv](kluby.csv)). Wyszukiwarka, z której korzysta Claude, praktycznie nie zwraca stron z Facebooka ani stron klubów (sprawdzone na kilku dużych klubach), więc linków nie da się uzupełnić automatycznie z chmury.
2. **Linki FB uzupełniasz Ty** albo Claude w Twojej przeglądarce (rozszerzenie Claude in Chrome), w ludzkim tempie: wyszukanie nazwy klubu i skopiowanie adresu profilu. To zwykłe korzystanie z FB, nie masowe pobieranie.
3. **Obserwujesz te profile** (i grupy, np. trenerów lub boksu w regionie) z włączonymi powiadomieniami.
4. **Gdy zobaczysz turniej**, wklejasz link lub zrzut ekranu agentowi, a on robi z tego wpis i pull request.
5. **Na dłuższą metę**: prośba do klubów i okręgów o wysyłanie komunikatów mailem (adres jest na stronie „O serwisie”).
