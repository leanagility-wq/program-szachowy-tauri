# Android Build

Projekt jest przygotowany pod build Androida w Tauri 2.

## Co jest już gotowe

- wygenerowany projekt Android Studio w `src-tauri/gen/android`
- skonfigurowany identyfikator aplikacji: `pl.slowo.trenerszachowy`
- osobny config Androida w `src-tauri/tauri.android.conf.json`
- do paczki Android są dołączane tylko zasoby potrzebne mobilnie:
  - `resources/db/openings.db`
- `Maia` pozostaje desktop-only i jest blokowana po stronie aplikacji
- `Stockfish` i `Maia` nie są dokładane jako zasoby Windows do builda Android

## Komendy

- inicjalizacja Androida:

```powershell
npm run android:init
```

- build debug APK:

```powershell
npm run android:apk -- --debug
```

- build release APK:

```powershell
npm run android:apk
```

- build release AAB:

```powershell
npm run android:aab
```

## Wymagania systemowe na Windows

Tauri przy buildzie Androida tworzy linki symboliczne do bibliotek `.so` w `src-tauri/gen/android/app/src/main/jniLibs`.

Na tym komputerze build zatrzymuje się obecnie na błędzie:

`Creation symbolic link is not allowed for this system.`

Żeby dokończyć build APK/AAB na Windows, trzeba włączyć:

- `Developer Mode` w systemie Windows

albo uruchamiać build w środowisku, które pozwala tworzyć symlinki.

## Aktualny stan

- frontend build przechodzi
- Rust dla targetu Android kompiluje się
- projekt Android został wygenerowany poprawnie
- ostatni bloker przed gotowym APK/AAB to uprawnienie do symlinków na Windows
