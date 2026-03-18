# Android Stockfish UCI

Architektura Androidowego silnika jest przygotowana pod uruchamianie `Stockfish` jako osobnego procesu UCI.

## Oczekiwana lokalizacja binarki

Dodaj binarkę Android Stockfisha do jednego z katalogów:

- `src-tauri/resources/engines/android/arm64-v8a/stockfish`
- `src-tauri/resources/engines/android/armeabi-v7a/stockfish`
- `src-tauri/resources/engines/android/x86_64/stockfish`
- `src-tauri/resources/engines/android/x86/stockfish`

Najważniejszy wariant dla współczesnych telefonów to `arm64-v8a`.

## Jak to działa

1. Aplikacja przy starcie lub pierwszym użyciu silnika szuka binarki odpowiedniej dla ABI Androida.
2. Jeśli ją znajdzie, kopiuje ją do katalogu danych aplikacji:
   - `app_local_data_dir/engines/android/<abi>/stockfish`
3. Następnie ustawia prawa wykonywania `755`.
4. Rust uruchamia binarkę jako proces UCI i używa tej samej warstwy `uci.rs`, co na Windows.

## Aktualny stan

- architektura Rust dla Androidowego `Stockfish UCI process` jest przygotowana
- frontend Android nadal pozostaje ograniczony do treningu otwarć, dopóki binarka nie zostanie dodana i zweryfikowana
- `Maia` pozostaje desktop-only
