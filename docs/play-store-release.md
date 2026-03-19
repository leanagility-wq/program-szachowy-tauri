# Publikacja w Google Play

Ten projekt jest blisko gotowości do publikacji, ale przed wrzuceniem do sklepu trzeba domknąć kilka rzeczy organizacyjnych i release'owych.

## Co jest już gotowe

- Identyfikator aplikacji: `pl.slowo.trenerszachowy`
- `compileSdk`: `36`
- `targetSdk`: `36`
- `minSdk`: `24`
- Build Android `AAB` jest przygotowany pod wariant telefonu:
  - `npm run android:aab:stockfish:phone`
- Wariant telefonu i emulatora różnią się tylko binarką Stockfisha.
- Publiczne repo projektu:
  - `https://github.com/leanagility-wq/program-szachowy-tauri`

## Co jeszcze trzeba zrobić przed publikacją

1. Założyć aplikację w Play Console i skonfigurować `Play App Signing`.
2. Wygenerować i bezpiecznie zapisać upload key / keystore do podpisywania release.
3. Zbudować release `AAB`:
   - `npm run android:aab:stockfish:phone`
4. Uzupełnić `Main store listing`:
   - nazwa
   - krótki opis
   - pełny opis
   - ikona 512x512
   - co najmniej 2 screenshoty
5. Opublikować politykę prywatności pod publicznym adresem HTTPS i wkleić URL do Play Console.
6. Wypełnić `Data safety`.
7. Wypełnić `Content rating`.
8. Uzupełnić `App access` jako `No login required`.
9. Przejść test na prawdziwym telefonie ARM64.
10. Sprawdzić zgodność z 16 KB page size dla natywnych bibliotek.

## Rekomendowane ustawienia deklaracji w Play Console

### Kategoria

- `Edukacja`

### App access

- `No, all functionality is available without special access`

### Data safety

Na podstawie obecnego kodu Android:

- brak kont użytkowników
- brak reklam
- brak analityki
- brak crash SDK
- trening i ustawienia są trzymane lokalnie na urządzeniu

Najbardziej prawdopodobna deklaracja:

- `No data collected`
- `No data shared`

To trzeba jeszcze potwierdzić przed publikacją, jeśli dodasz później telemetrykę, logowanie błędów albo backend.

### Content rating

Dla obecnej funkcji aplikacji najbardziej prawdopodobny wynik to niski rating ogólny, ale i tak trzeba wypełnić oficjalny formularz IARC.

## Materiały przygotowane w repo

- Opisy sklepu PL:
  - [store-listing.pl.md](docs/store-listing.pl.md)
- Opisy sklepu EN:
  - [store-listing.en.md](docs/store-listing.en.md)
- Polityka prywatności PL:
  - [privacy-policy.pl.md](docs/privacy-policy.pl.md)
- Polityka prywatności EN:
  - [privacy-policy.en.md](docs/privacy-policy.en.md)
- Notatka o licencji Stockfisha:
  - [stockfish-license.md](docs/stockfish-license.md)
- Notice open source PL:
  - [open-source-notice.pl.md](docs/open-source-notice.pl.md)
- Notice open source EN:
  - [open-source-notice.en.md](docs/open-source-notice.en.md)

## Linki publiczne, które możesz już wykorzystać

- repozytorium aplikacji:
  - `https://github.com/leanagility-wq/program-szachowy-tauri`
- README projektu:
  - `https://github.com/leanagility-wq/program-szachowy-tauri/blob/main/README.md`
- licencja i źródła projektu:
  - `https://github.com/leanagility-wq/program-szachowy-tauri/blob/main/docs/stockfish-license.md`
- kod źródłowy Stockfisha:
  - `https://github.com/official-stockfish/Stockfish`
- tekst licencji Stockfisha:
  - `https://github.com/official-stockfish/Stockfish/blob/master/Copying.txt`

## Rekomendowane pola w Play Console

- `App category`:
  - `Edukacja`
- `Developer email`:
  - `fin@o2.pl`
- `Developer website`:
  - najlepiej repo projektu:
    - `https://github.com/leanagility-wq/program-szachowy-tauri`
- `Privacy policy URL`:
  - EN:
    - `https://pawelslowikowski.pl/chess-opening-trainer-privacy-policy/`
  - PL:
    - `https://pawelslowikowski.pl/trener-otwarc-szachowy-polityka-prywatnosci`

## Uwagi praktyczne

- GitHub repo może być użyte jako `Developer website`, jeśli nie masz osobnej strony projektu.
- Link do polityki prywatności powinien nadal prowadzić bezpośrednio do strony z polityką prywatności, a nie do repo albo pliku licencyjnego.
- Dla wersji angielskiej użyj:
  - `https://pawelslowikowski.pl/chess-opening-trainer-privacy-policy/`
- Dla wersji polskiej użyj:
  - `https://pawelslowikowski.pl/trener-otwarc-szachowy-polityka-prywatnosci`
- Jeśli później stworzysz osobną stronę produktu, warto rozdzielić:
  - `Developer website` -> strona projektu
  - `Privacy policy URL` -> strona polityki prywatności

## Krótka instrukcja publikacji

1. Zbuduj release bundle:
   - `npm run android:aab:stockfish:phone`
2. Odbierz plik `AAB` z katalogu:
   - `build/android-stockfish-variants/`
3. Wejdź do Play Console i utwórz aplikację.
4. Wgraj `AAB` na ścieżkę `Internal testing`.
5. Uzupełnij listing, politykę prywatności, data safety, content rating i app access.
6. Napraw wszystkie błędy z `Pre-launch report`, jeśli się pojawią.
7. Dopiero potem przejdź do `Production`.

## Co nadal warto sprawdzić ręcznie

- ikona sklepu i screenshoty
- czy `INTERNET` permission jest rzeczywiście potrzebne w release Android
- 16 KB page size dla bibliotek natywnych
- czy chcesz publicznie udostępnić cały kod źródłowy aplikacji razem ze Stockfishem jako najbezpieczniejszy wariant zgodności z GPL
