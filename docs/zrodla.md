# Źródła turniejów

Gdzie szukać turniejów i jak je weryfikować. Ostatnia aktualizacja: 2026-11-21.

## Zasady

- Na stronę trafia tylko turniej z linkiem do źródła (komunikat, regulamin, oficjalny wpis organizatora).
- Pole `sprawdzono` = data, kiedy porównano wpis ze źródłem.
- Przy rozbieżności (np. inna data w komunikacie i na FB) ważniejszy jest komunikat organizatora lub związku.

## Źródła główne

Sprawdzone 2026-11-17, w kolejności przydatności.

| Źródło | Co tam jest | Jak sprawdzać |
|---|---|---|
| [Akredytacje PZB](https://pzb.sorga.pl/api/files/pub/akredytacje.pdf) | **Najlepsze źródło.** Oficjalna lista wszystkich zawodów zatwierdzonych przez PZB, także turniejów klubowych i gal: nazwa, adres (obiekt), data, organizator, klub wnioskujący, po zawodach link do protokołu. Nowe wpisy na końcu pliku. Akredytacje pojawiają się zwykle 2–4 tygodnie przed zawodami | `npm run akredytacje` (opis w README). Kategorie, płeć i poziom skrypt odczytuje tylko z nazwy zawodów („Mistrzostwa Mazowsza Juniorek i Juniorów”). Terminu zgłoszeń w PDF nie ma, trzeba go doczytać u organizatora |
| [Kalendarz PZB](https://pzb.com.pl/kalendarz) | Tylko imprezy centralne: mistrzostwa Polski, OOM, starty reprezentacji | Publiczne API: `pzb.com.pl/wp-json/tribe/events/v1/events?start_date=RRRR-MM-DD`, albo eksport .ics |
| Komunikaty organizacyjne PZB | Szczegóły mistrzostw Polski: miejsce, termin zgłoszeń, kategorie | Pojawiają się 2–4 tygodnie przed zawodami w bibliotece mediów strony PZB (`/wp-json/wp/v2/media?search=Komunikat organizacyjny`) |
| Strony okręgowych związków | Komunikaty turniejów klubowych i mistrzostw okręgu, kalendarze roczne | Lista, adresy i rotacja: sekcja [Okręgowe związki bokserskie](#okręgowe-związki-bokserskie). Kalendarze roczne publikowane w styczniu, potem daty się zmieniają: traktować jako zapowiedź, potwierdzać w komunikacie lub akredytacjach |
| Strony turniejów | Duże turnieje mają własne strony, np. [Złota Rękawica Wisły](https://zlotarekawica.wboksie.pl/) | Ręcznie, przy każdym turnieju |
| [Polska Liga Boksu](https://polskaligaboksu.pl) | Terminarz ligi | Ręcznie, raz w sezonie |
| Zgłoszenia organizatorów | Formularz [Dla organizatorów](https://ifight.pl/dla-organizatorow/) otwiera issue z etykietą `zgłoszenie` i szkicem wpisu | `gh issue list --label zgłoszenie --state open`, w każdym przebiegu (krok 0 skilla) |
| [MartialMatch](https://martialmatch.com/pl/events?type=Boxing) | Platforma zapisów. W listopadzie 2026 tylko jedna impreza z boksem (kickboxing/MMA), na razie mało przydatna | Raz w miesiącu |

Numerowane „Komunikaty nr …/2026” PZB dotyczą głównie zgrupowań kadry, a nie turniejów. Nie trzeba ich przeglądać.

## Okręgowe związki bokserskie

Sprawdzone 2026-11-21. Okręgi publikują komunikaty turniejów klubowych i mistrzostw okręgu, często zanim zawody trafią do akredytacji PZB, i podają w nich to, czego PDF nie ma: kategorie, termin zgłoszeń, godziny wagi. Kontakty (mail, telefon) wszystkich 16 okręgów: [pzb.com.pl/federacja/okregi](https://pzb.com.pl/federacja/okregi).

Strony na WordPressie mają publiczne API, które zwraca wpisy jako JSON i jest szybsze od czytania HTML:
`<strona>/wp-json/wp/v2/posts?per_page=20&after=RRRR-MM-DDT00:00:00&_fields=date,title,link`, a treść wpisu: `…/posts?slug=<slug>&_fields=content`.

### Okręgi ze stroną www (przeglądać co tydzień)

| Województwo | Związek | Gdzie są komunikaty | Uwagi |
|---|---|---|---|
| wielkopolskie | [WOZB](https://wozb.com.pl/) | [Aktualności](https://wozb.com.pl/aktualnosci/), API WordPressa | Najaktywniejszy okręg: komunikat każdego turnieju i ligi (Poznańska Liga Bokserska) z PDF. W styczniu [kalendarz roczny](https://wozb.com.pl/wp-content/uploads/2026/01/WOZB-Kalendarz-wraz-z-imprezami-centralnymi-WOZB-21.01.2026-1.pdf) |
| mazowieckie | [WM OZB](http://wmozb.pl/) (tylko `http://`, `https` nie działa) | Numerowane „Komunikat nr …/RRRR” Wydziału Sportowego, API WordPressa | Komunikaty turniejów z terminem i adresem zgłoszeń |
| śląskie | [Śląski ZB](https://slaskizwiazekbokserski.com/) (`.pl` blokuje automatyczne pobieranie, `.com` to ta sama strona) | [Komunikaty](https://slaskizwiazekbokserski.com/komunikaty/), [Kalendarium](https://slaskizwiazekbokserski.com/kalendarium-szb/), API WordPressa | Kalendarz roczny w PDF w bibliotece mediów (`/wp-json/wp/v2/media?search=kalendarz`). „Obsada sędziowska” w tytule = potwierdzenie daty i miejsca zawodów |
| małopolskie | [MZB](https://mzb.info.pl/) | [Kalendarz](https://mzb.info.pl/kalendarz/) | Kalendarz roczny (Grand Prix Małopolski, mistrzostwa okręgu) bez komunikatów. Daty potwierdzać w akredytacjach |
| lubelskie | [LOZB](https://lozb.pl/) | [Najbliższe zawody](https://lozb.pl/najblizsze-zawody/), [Komunikaty](https://lozb.pl/komunikaty/) | Wpisy rzadko, głównie gale FENIX |
| podkarpackie | [POZB](https://www.pozb.pl/) | [Komunikaty organizacyjne zawodów](https://www.pozb.pl/category/komunikaty-organizacyjne-zawodow/) | Cykl Międzynarodowy Puchar Karpat. Ostatni wpis 2026-04, raczej co kilka miesięcy |
| świętokrzyskie | [SOZB](https://sozb.pl/) | brak | Strona w budowie (tylko wpisy testowe). Sprawdzać raz w miesiącu, czy ruszyła |

### Okręgi bez strony www (tylko Facebook)

Nie przeglądać automatycznie (patrz niżej). Profile obserwuje użytkownik, a skill `przeglad-social` przegląda je na żądanie. Turnieje z tych okręgów agent znajduje w akredytacjach PZB i w wyszukiwarce (`turniej bokserski <miasto> <miesiąc> <rok>`, lokalne portale).

| Województwo | Związek | Facebook | Sprawdzone adresy, które nie działają |
|---|---|---|---|
| dolnośląskie | Dolnośląski OZB (Wrocław) | [profil](https://www.facebook.com/p/Dolno%C5%9Bl%C4%85ski-Okr%C4%99gowy-Zwi%C4%85zek-Bokserski-100057266387039/) | boks-dozb.pl (z profilu FB), dozb.wordpress.com (ostatni wpis 2016) |
| kujawsko-pomorskie | Kujawsko-Pomorski OZB (Grudziądz) | nie znaleziono | kpozb.pl |
| lubuskie | Lubuski OZB | nie znaleziono | |
| łódzkie | OZB w Łodzi | [profil](https://www.facebook.com/p/Okr%C4%99gowy-Zwi%C4%85zek-Bokserski-w-%C5%81odzi-100063703654791/) | |
| opolskie | Opolski OZB | nie znaleziono | oozb.pl (podawany w katalogach, nie odpowiada) |
| podlaskie | Podlaski OZB (Białystok) | [profil](https://www.facebook.com/p/Podlaski-Okr%C4%99gowy-Zwi%C4%85zek-Bokserski-100028543279356/) | |
| pomorskie | Pomorski OZB (Gdańsk) | nie znaleziono | (pozb.pl to Podkarpacki OZB) |
| warmińsko-mazurskie | Warmińsko-Mazurski OZB (Olsztyn) | nie znaleziono | |
| zachodniopomorskie | Zachodniopomorski OZB (Szczecin) | [profil](https://www.facebook.com/p/ZOZB-Zachodniopomorski-Okr%C4%99gowy-Zwi%C4%85zek-Bokserski-100057418780647/) | zozb.szczecin.pl (podawany w katalogach, nie odpowiada) |

Warszawsko-Mazowiecki OZB ma też [profil FB](https://facebook.com/wmozb). Raz na kwartał warto sprawdzić, czy któryś okręg z drugiej tabeli nie założył strony (wyszukiwarka: „<nazwa związku>”).

### Inne strony z zapowiedziami turniejów

| Źródło | Co tam jest |
|---|---|
| [bokser.org](https://bokser.org/) | Najstarszy portal o boksie olimpijskim: zapowiedzi turniejów klubowych i wieści z okręgów. Dobre do znalezienia turnieju, potem potwierdzić u organizatora |
| [wBoksie.pl](https://wboksie.pl/) | Platforma stron turniejów (Złota Rękawica Wisły, Memoriał Bendiga, Turniej Stamma, MP Seniorów). Nowe turnieje pojawiają się na liście „Nasze wydarzenia”, zwykle z formularzem zgłoszeń klubów |
| [MaxLiga](https://maxliga.pl/) | Amatorska liga boksu z otwartymi zapisami (także bez klubu, od 13 lat), cztery dywizje w Polsce. Typ `turniej`, `udzial: [otwarte]`. Terminy ogłasza w aktualnościach, API wydarzeń (`/wp-json/tribe/events/v1/events`) bywa puste |
| [Warsaw Boxing Cup](https://warsawboxingcup.pl/) | Zawody boksu olimpijskiego Fundacji Wyczyn z zapisami zawodników |
| Lokalne portale | Np. calisia.pl, info.elblag.pl, bialystokonline.pl. Tylko gdy organizator nie ma własnej strony; wtedy w PR zaznacz, że źródło to artykuł |

### Rotacja

Strony z pierwszej tabeli i akredytacje PZB przeglądaj w każdym przebiegu (to kilka zapytań do API). Dla okręgów z drugiej tabeli w każdym przebiegu szukaj w wyszukiwarce turniejów z 3 województw, po kolei według tygodnia roku (numer tygodnia ISO modulo 3):

| Tydzień mod 3 | Województwa |
|---|---|
| 0 | dolnośląskie, kujawsko-pomorskie, lubuskie |
| 1 | łódzkie, opolskie, podlaskie |
| 2 | pomorskie, warmińsko-mazurskie, zachodniopomorskie |

Zapytania: `turniej bokserski <województwo> <miesiąc> <rok>`, `turniej bokserski <największe miasta> <rok>`, nazwy cyklicznych turniejów z akredytacji z poprzedniego roku (np. „Mikołajkowy Turniej Bokserski Elbląg”).

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
2. **Linki FB uzupełniasz Ty** albo Claude w Twojej przeglądarce (rozszerzenie Claude in Chrome), w ludzkim tempie: wyszukanie nazwy klubu i skopiowanie adresu profilu. To zwykłe korzystanie z FB, nie masowe pobieranie. Zasady i limity takiej sesji: [.claude/skills/przeglad-social](../.claude/skills/przeglad-social/SKILL.md). Wystarczy poprosić, np. „przejrzyj FB i IG” (kolejne profile z listy, po kolei według kolumny `przejrzano`) albo „przejrzyj FB klubów ze śląskiego”.
3. **Obserwujesz te profile** (i grupy, np. trenerów lub boksu w regionie) z włączonymi powiadomieniami.
4. **Gdy zobaczysz turniej**, wklejasz link lub zrzut ekranu agentowi, a on robi z tego wpis i pull request.
5. **Na dłuższą metę**: prośba do klubów i okręgów o wysyłanie komunikatów mailem (adres jest na stronie „O serwisie”).
