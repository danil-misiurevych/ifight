# Źródła turniejów

Gdzie szukać turniejów i jak je weryfikować. Ostatnia aktualizacja: 2026-11-16.

## Zasady

- Na stronę trafia tylko turniej z linkiem do źródła (komunikat, regulamin, oficjalny wpis organizatora).
- Pole `sprawdzono` = data, kiedy porównano wpis ze źródłem.
- Przy rozbieżności (np. inna data w komunikacie i na FB) ważniejszy jest komunikat organizatora lub związku.

## Źródła główne

| Źródło | Co tam jest | Jak sprawdzać |
|---|---|---|
| [Kalendarz PZB](https://pzb.com.pl/kalendarz) | Imprezy ogólnopolskie i międzynarodowe: mistrzostwa Polski, OOM, reprezentacja | Ma eksport do pliku `.ics`, więc da się go sprawdzać automatycznie |
| [Okręgi PZB](https://pzb.com.pl/federacja/okregi) | Lista 16 okręgowych związków z telefonami (bez stron www i FB) | Punkt wyjścia do listy okręgów niżej |
| [Polska Liga Boksu](https://polskaligaboksu.pl) | Terminarz ligi | Ręcznie, raz w sezonie |
| [MartialMatch](https://martialmatch.com) | Platforma zapisów na zawody, są na niej też turnieje bokserskie z regulaminami | Do sprawdzenia, czy ma publiczną listę wydarzeń do odczytu |
| Komunikaty PZB (PDF) | Regulaminy i komunikaty końcowe, w wynikach nazwy klubów | Źródło nazw klubów do listy niżej |

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

Do zebrania. Format: nazwa, miasto, województwo, strona www, Facebook, Instagram, uwagi (np. „co roku organizuje turniej X w marcu”).

## Facebook: jak szukać bez ryzyka blokady

Automatyczne pobieranie danych z Facebooka (scraping) łamie regulamin FB. Konto może zostać zablokowane, a oficjalne API do publicznych stron wymaga trudnej weryfikacji aplikacji. Dlatego:

1. **Claude buduje listę klubów** z wyszukiwarki, z PDF-ów PZB (wyniki zawodów zawierają nazwy klubów) i ze stron okręgów. Ogólna wyszukiwarka słabo indeksuje Facebooka, więc linki FB nie zawsze się znajdą.
2. **Linki FB uzupełniasz Ty** albo Claude w Twojej przeglądarce (rozszerzenie Claude in Chrome), w ludzkim tempie: wyszukanie nazwy klubu i skopiowanie adresu profilu. To zwykłe korzystanie z FB, nie masowe pobieranie.
3. **Obserwujesz te profile** (i grupy, np. trenerów lub boksu w regionie) z włączonymi powiadomieniami.
4. **Gdy zobaczysz turniej**, wklejasz link lub zrzut ekranu agentowi, a on robi z tego wpis i pull request.
5. **Na dłuższą metę**: prośba do klubów i okręgów o wysyłanie komunikatów mailem (adres jest na stronie „O serwisie”).
