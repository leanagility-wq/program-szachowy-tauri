# Trener Szachowy

Mobilno-desktopowa aplikacja do treningu podstawowych otwarć szachowych.

Projekt został przeniesiony z architektury `React + Electron + Express + SQLite` do:

- `React + Vite`
- `Tauri 2`
- `Rust commands` w `src-tauri`
- `SQLite` obsługiwane lokalnie przez Rust
- lokalne silniki szachowe (`Stockfish`, a na desktopie także przygotowana ścieżka pod `Maia`)

## Co potrafi aplikacja

- trening otwarć z lokalnej bazy SQLite
- wczytywanie szczegółów otwarcia bez backendu HTTP
- dalsza gra po zakończeniu linii otwarcia
- podpowiedzi najlepszego ruchu
- lokalny `Stockfish` dla desktopu i Androida
- responsywny interfejs pod telefon i desktop

## Stack

- frontend: `React 19`, `Vite`
- desktop/mobile shell: `Tauri 2`
- backend lokalny: `Rust`
- baza: `SQLite`
- logika szachowa: `chess.js`

## Uruchomienie lokalne

Wymagania:

- `Node.js`
- `npm`
- `Rust`
- dla Tauri: standardowe zależności Tauri dla Windows

Instalacja:

```powershell
npm install
```

Uruchomienie aplikacji desktopowej:

```powershell
npm run tauri dev
```

Frontend build:

```powershell
npm run build
```

Lint:

```powershell
npm run lint
```

## Android

Inicjalizacja projektu Android:

```powershell
npm run android:init
```

Build APK dla telefonu (`arm64-v8a`):

```powershell
npm run android:apk:stockfish:phone
```

Build APK dla emulatora (`x86_64`):

```powershell
npm run android:apk:stockfish:emulator
```

Build `AAB` do Google Play:

```powershell
npm run android:aab:stockfish:phone
```

Gotowe artefakty trafiają do:

```text
build/android-stockfish-variants/
```

## Binarne pliki Stockfisha

Repo nie przechowuje dużych lokalnych binarek Stockfisha.

Przed buildem Androida trzeba samodzielnie umieścić odpowiednie binarki w lokalnych katalogach:

- telefon ARM64:
  - `src-tauri/resources/engines/android/arm64-v8a/stockfish`
- emulator x86_64:
  - `src-tauri/resources/engines/android/x86_64/stockfish`

Plik powinien mieć nazwę:

```text
stockfish
```

bez rozszerzenia `.exe`.

## Dokumentacja projektu

- publikacja w Google Play:
  - [docs/play-store-release.md](docs/play-store-release.md)
- warianty Androidowego Stockfisha:
  - [docs/android-stockfish-variants.md](docs/android-stockfish-variants.md)
- Android build:
  - [docs/android-build.md](docs/android-build.md)
- notatka licencyjna Stockfisha:
  - [docs/stockfish-license.md](docs/stockfish-license.md)
- teksty open source notice:
  - [docs/open-source-notice.pl.md](docs/open-source-notice.pl.md)
  - [docs/open-source-notice.en.md](docs/open-source-notice.en.md)

## Licencje i źródła

Ta aplikacja korzysta z silnika szachowego Stockfish.

- Stockfish source code:
  - https://github.com/official-stockfish/Stockfish
- Stockfish license text:
  - https://github.com/official-stockfish/Stockfish/blob/master/Copying.txt

Repozytorium tej aplikacji:

- https://github.com/leanagility-wq/program-szachowy-tauri

## Status

Projekt jest aktywnie rozwijany. Największy nacisk był dotąd położony na:

- migrację funkcji z Expressa do Tauri/Rust
- lokalny Androidowy `Stockfish`
- responsywny interfejs mobilny
