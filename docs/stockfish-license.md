# Stockfish i publikacja w Google Play

To nie jest porada prawna, ale praktyczna ocena ryzyka licencyjnego dla tego projektu.

## Krótka odpowiedź

Tak, licencja Stockfisha pozwala na publikację darmowej aplikacji. Sama GPL nie zabrania też publikacji płatnej.

## Co z tego wynika

Stockfish jest publikowany na licencji `GPL-3.0`.

Najważniejsze konsekwencje praktyczne:

- musisz zachować informacje o licencji i autorach,
- użytkownik musi mieć dostęp do kodu źródłowego odpowiadającego binarce, którą dystrybuujesz,
- jeśli modyfikujesz Stockfisha, musisz udostępnić także odpowiednie źródła tych modyfikacji,
- nie możesz nakładać dodatkowych ograniczeń sprzecznych z GPL.

## Najbezpieczniejszy model zgodności

Dla tej aplikacji najbezpieczniejsze operacyjnie podejście jest takie:

1. Upublicznić repozytorium źródłowe aplikacji.
2. Trzymać w nim lub linkować dokładne źródła użytej wersji Stockfisha.
3. Dodać w opisie sklepowym i polityce prywatności wzmiankę o użyciu Stockfisha.
4. Udostępnić publiczny link do kodu źródłowego i licencji.

## Co polecam przed publikacją

- dodać publiczne repo lub stronę z kodem źródłowym odpowiadającym release,
- dodać stronę `Open source licenses` albo przynajmniej ekran `Informacje prawne`,
- przechowywać informację, z którego dokładnie commita i której binarki Stockfisha zbudowano release.

## Linki dla tego projektu

- repozytorium aplikacji:
  - https://github.com/leanagility-wq/program-szachowy-tauri
- README projektu:
  - https://github.com/leanagility-wq/program-szachowy-tauri/blob/main/README.md
- notatka licencyjna projektu:
  - https://github.com/leanagility-wq/program-szachowy-tauri/blob/main/docs/stockfish-license.md
- notice open source PL:
  - https://github.com/leanagility-wq/program-szachowy-tauri/blob/main/docs/open-source-notice.pl.md
- notice open source EN:
  - https://github.com/leanagility-wq/program-szachowy-tauri/blob/main/docs/open-source-notice.en.md

## Oficjalne linki Stockfisha

- repozytorium Stockfisha:
  - https://github.com/official-stockfish/Stockfish
- tekst licencji Stockfisha:
  - https://github.com/official-stockfish/Stockfish/blob/master/Copying.txt

## Co już można powiedzieć uczciwie

- aplikacja korzysta z lokalnego silnika Stockfish,
- Stockfish jest projektem open source na GPL-3.0,
- aplikacja może być publikowana darmowo,
- obowiązki GPL nadal trzeba spełnić.
