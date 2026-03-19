# Android Stockfish Variants

Projekt ma teraz dwa przewidywalne warianty APK, ktore roznia sie tylko
podmieniona binarka Stockfisha.

## Oczekiwane binarki

- Telefon ARM64:
  - `src-tauri/resources/engines/android/arm64-v8a/stockfish`
- Emulator x86_64:
  - `src-tauri/resources/engines/android/x86_64/stockfish`

Pliki maja byc binarkami wykonywalnymi bez rozszerzenia `.exe`.

## Budowanie

- Telefon ARM64:
  - `npm run android:apk:stockfish:arm64`
- Emulator x86_64:
  - `npm run android:apk:stockfish:x86_64`

Skrypt:
- czyści poprzednie `libstockfish.so` z `src-tauri/android-jniLibs`
- kopiuje tylko wybrana binarke do `jniLibs`
- buduje debug APK
- zapisuje nazwany artefakt w `build/android-stockfish-variants`

## Wynik

Powstaja nazwane pliki:
- `build/android-stockfish-variants/app-universal-debug-stockfish-arm64-v8a.apk`
- `build/android-stockfish-variants/app-universal-debug-stockfish-x86_64.apk`
