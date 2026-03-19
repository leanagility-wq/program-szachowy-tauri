# Android Stockfish Variants

Projekt ma jeden wspolny kod aplikacji i dwa warianty APK Android.
Różnią się tylko lokalnie podmienioną binarką Stockfisha.

## Wejściowe binarki

- Telefon ARM64:
  - `src-tauri/resources/engines/android/arm64-v8a/stockfish`
- Emulator x86_64:
  - `src-tauri/resources/engines/android/x86_64/stockfish`

Pliki mają być binarkami wykonywalnymi bez rozszerzenia `.exe`.
Nie są wersjonowane w repo.

## Budowanie

- Telefon ARM64:
  - `npm run android:apk:stockfish:arm64`
  - alias: `npm run android:apk:stockfish:phone`
- Emulator x86_64:
  - `npm run android:apk:stockfish:x86_64`
  - alias: `npm run android:apk:stockfish:emulator`

Skrypt builda:
- czyści poprzednie `libstockfish.so` z `src-tauri/android-jniLibs`
- usuwa stare assety silnika z wygenerowanego projektu Android
- kopiuje tylko wybraną binarkę do `jniLibs`
- buduje debug APK
- zapisuje nazwany artefakt w `build/android-stockfish-variants`

## Wynik

Powstają nazwane pliki:
- `build/android-stockfish-variants/app-universal-debug-stockfish-arm64-v8a.apk`
- `build/android-stockfish-variants/app-universal-debug-stockfish-x86_64.apk`
