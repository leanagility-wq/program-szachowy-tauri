import { createContext } from "react";

export const LANGUAGE_STORAGE_KEY = "app-language";
export const DEFAULT_LANGUAGE = "pl";

export const messages = {
  pl: {
    "app.mobileNav": "Nawigacja mobilna",
    "app.tab.play": "Gra",
    "app.tab.status": "Status",
    "app.tab.stats": "Wyniki",
    "app.section.session": "Sesja",
    "app.section.gameStatus": "Stan gry",
    "app.section.results": "Wyniki",
    "board.title": "Trener otwarć szachowych",
    "board.hideEval": "Ukryj pasek",
    "board.showEval": "Pokaż pasek",
    "control.engine": "Silnik",
    "control.engineLevel": "Poziom silnika",
    "control.stockfishOption": "Stockfish - analiza / najlepszy ruch",
    "control.maiaOption": "Maia - ruch ludzki",
    "control.desktopOnly": "tylko desktop",
    "control.mobileNoEngine":
      "W tej wersji Android działa trening otwarć. Silnik do gry dalej będzie dodany osobno.",
    "control.reset": "Reset",
    "control.showHint": "Pokaż podpowiedź",
    "control.undoMove": "Cofnij ruch",
    "control.opening": "Otwarcie",
    "control.chooseColor": "Wybierz kolor",
    "control.white": "Białe",
    "control.black": "Czarne",
    "control.loadOpening": "Załaduj otwarcie",
    "control.freeTraining": "Trenuj bez szablonu",
    "control.hideOptions": "Ukryj opcje",
    "control.options": "Opcje",
    "session.trainingOpening": "Trening otwarcia",
    "session.trainingFree": "Trening bez szablonu",
    "session.playContinue": "Gra dalej",
    "session.opening": "Otwarcie",
    "session.yourColor": "Twój kolor",
    "session.mode": "Tryb",
    "session.progressScore": "Postęp oceny",
    "session.progressMove": "Ruch w linii",
    "status.status": "Status",
    "status.hint": "Podpowiedź",
    "status.bestMove": "Najlepszy ruch",
    "status.shownOnBoard": "Pokazany na planszy",
    "status.hintShownOnBoard": "Pokazana na planszy",
    "stats.freeTitle": "Ocena otwarcia",
    "stats.trainingTitle": "Wyniki treningu",
    "stats.bookMoves": "Książkowe",
    "stats.goodMoves": "Dobre ruchy",
    "stats.weakerMoves": "Słabsze ruchy",
    "stats.correct": "Poprawne",
    "stats.wrong": "Błędne",
    "stats.evaluatedMoves": "Ocenione ruchy",
    "stats.total": "Łącznie",
    "stats.scoring": "Scoring",
    "stats.accuracy": "Skuteczność",
    "trainer.loadingOpenings": "Wczytywanie listy otwarć...",
    "trainer.chooseOpeningAndColor": "Wybierz otwarcie, kolor i kliknij „Załaduj otwarcie”",
    "trainer.noOpenings": "Brak dostępnych otwarć",
    "trainer.fetchOpeningsError": "Błąd pobierania listy otwarć",
    "trainer.programStarts": "{{openingLabel}}. Program zaczyna.",
    "trainer.waitEngineMove": "Poczekaj, {{engineLabel}} wykonuje ruch",
    "trainer.programTurn": "Teraz ruch programu",
    "trainer.engineTurn": "Teraz ruch {{engineLabel}}",
    "trainer.loadedOpening": "Załadowano otwarcie: {{openingName}}",
    "trainer.unnamedOpening": "bez nazwy",
    "trainer.fetchOpeningError": "Błąd pobierania otwarcia",
    "trainer.freeTrainingStarted":
      "Trening bez szablonu uruchomiony. Graj naturalnie w otwarciu z {{engineLabel}}.",
    "trainer.freeTrainingUnavailable":
      "Tryb gry z silnikiem nie jest jeszcze dostępny w wersji Android.",
    "trainer.engineUnavailable": "Silnik nie jest jeszcze dostępny w wersji Android.",
    "trainer.nextRepertoireMove": "Pokazano kolejny ruch z repertuaru.",
    "trainer.trainingReset": "Trening zresetowany",
    "trainer.sessionSaveError": "Błąd zapisu sesji:",
    "engine.refreshError": "Błąd odświeżania analizy:",
    "engine.waitUntilMoveEnds": "Poczekaj, aż zakończy się ruch {{engineLabel}}",
    "engine.topMovesShown": "Pokazano 3 najlepsze opcje ruchów {{engineLabel}}.",
    "engine.noBestMove": "{{engineLabel}} nie zwrócił najlepszego ruchu.",
    "engine.stockfishError": "Błąd Stockfish",
    "engine.bestMoveFetchError": "Nie udało się pobrać najlepszego ruchu {{engineLabel}}.",
    "engine.thinking": "{{engineLabel}} myśli...",
    "engine.noMove": "{{engineLabel}} nie zwrócił ruchu",
    "engine.playedMove": "{{engineLabel}} zagrał: {{move}}",
    "engine.illegalMove": "{{engineLabel}} zwrócił nielegalny ruch: {{move}}",
    "engine.playMoveError": "Błąd podczas ruchu {{engineLabel}}",
    "engine.waitResponse": "Ruch wykonany. Czekaj na odpowiedź {{engineLabel}}.",
    "engine.undoOnlyPlay": "Cofanie działa tylko w trybie gry",
    "engine.waitUntilEngineFinishes": "Poczekaj, aż {{engineLabel}} skończy ruch",
    "engine.noMovesToUndo": "Brak ruchów do cofnięcia",
    "engine.undoSuccess": "Cofnięto ostatni ruch / parę ruchów",
    "opening.lineFinishedContinue":
      "Linia otwarcia zakończona. Możesz grać dalej z {{engineLabel}}.",
    "opening.lineFinishedMobile":
      "Linia otwarcia zakończona. Wersja Android kończy trening na tym etapie.",
    "opening.programPlayed": "Program zagrał: {{move}}",
    "opening.programPlayedFinished":
      "Program zagrał: {{move}}. Linia otwarcia zakończona.",
    "opening.programPlayedFinishedMobile":
      "Program zagrał: {{move}}. Linia otwarcia zakończona w wersji Android.",
    "opening.playMoveError": "Błąd podczas ruchu programu",
    "opening.incorrectTryAgain": "Niepoprawny ruch. Spróbuj jeszcze raz.",
    "opening.correctMove": "Poprawny ruch: {{move}}",
    "opening.correctMoveFinished":
      "Poprawny ruch: {{move}}. Linia otwarcia zakończona.",
    "opening.correctMoveFinishedMobile":
      "Poprawny ruch: {{move}}. Linia otwarcia zakończona w wersji Android.",
    "opening.hintsOnlyTraining": "Podpowiedzi są dostępne tylko w trybie treningu otwarcia",
    "opening.hintOnlyYourTurn": "Podpowiedź jest dostępna tylko w Twoim ruchu",
    "opening.noNextHint": "Brak kolejnej podpowiedzi",
    "free.loadingCatalog": "Wczytywanie repertuaru...",
    "free.recognizingOpening": "Rozpoznawanie otwarcia...",
    "free.outOfBook": "Poza bazą otwarć",
    "free.possibleOpenings": "Możliwe: {{names}}",
    "free.fetchCatalogError": "Błąd pobierania repertuaru do treningu bez szablonu:",
    "free.analyzeMoveError": "Błąd analizy ruchu w treningu bez szablonu:"
  },
  en: {
    "app.mobileNav": "Mobile navigation",
    "app.tab.play": "Play",
    "app.tab.status": "Status",
    "app.tab.stats": "Results",
    "app.section.session": "Session",
    "app.section.gameStatus": "Game status",
    "app.section.results": "Results",
    "board.title": "Chess Opening Trainer",
    "board.hideEval": "Hide bar",
    "board.showEval": "Show bar",
    "control.engine": "Engine",
    "control.engineLevel": "Engine level",
    "control.stockfishOption": "Stockfish - analysis / best move",
    "control.maiaOption": "Maia - human-like move",
    "control.desktopOnly": "desktop only",
    "control.mobileNoEngine":
      "This Android build supports opening training only for now. Engine play will be added separately.",
    "control.reset": "Reset",
    "control.showHint": "Show hint",
    "control.undoMove": "Undo move",
    "control.opening": "Opening",
    "control.chooseColor": "Choose color",
    "control.white": "White",
    "control.black": "Black",
    "control.loadOpening": "Load opening",
    "control.freeTraining": "Train without line",
    "control.hideOptions": "Hide options",
    "control.options": "Options",
    "session.trainingOpening": "Opening training",
    "session.trainingFree": "Free opening training",
    "session.playContinue": "Play on",
    "session.opening": "Opening",
    "session.yourColor": "Your color",
    "session.mode": "Mode",
    "session.progressScore": "Scoring progress",
    "session.progressMove": "Move in line",
    "status.status": "Status",
    "status.hint": "Hint",
    "status.bestMove": "Best move",
    "status.shownOnBoard": "Shown on board",
    "status.hintShownOnBoard": "Shown on board",
    "stats.freeTitle": "Opening evaluation",
    "stats.trainingTitle": "Training results",
    "stats.bookMoves": "Book moves",
    "stats.goodMoves": "Good moves",
    "stats.weakerMoves": "Weaker moves",
    "stats.correct": "Correct",
    "stats.wrong": "Wrong",
    "stats.evaluatedMoves": "Evaluated moves",
    "stats.total": "Total",
    "stats.scoring": "Scoring",
    "stats.accuracy": "Accuracy",
    "trainer.loadingOpenings": "Loading openings list...",
    "trainer.chooseOpeningAndColor": "Choose an opening, color, and click \"Load opening\"",
    "trainer.noOpenings": "No openings available",
    "trainer.fetchOpeningsError": "Error fetching openings list",
    "trainer.programStarts": "{{openingLabel}}. The program starts.",
    "trainer.waitEngineMove": "Wait, {{engineLabel}} is making a move",
    "trainer.programTurn": "Program to move",
    "trainer.engineTurn": "{{engineLabel}} to move",
    "trainer.loadedOpening": "Loaded opening: {{openingName}}",
    "trainer.unnamedOpening": "unnamed",
    "trainer.fetchOpeningError": "Error fetching opening",
    "trainer.freeTrainingStarted":
      "Free training started. Play naturally in the opening against {{engineLabel}}.",
    "trainer.freeTrainingUnavailable":
      "Engine-based play is not available in the Android build yet.",
    "trainer.engineUnavailable": "The engine is not available in the Android build yet.",
    "trainer.nextRepertoireMove": "Displayed the next repertoire move.",
    "trainer.trainingReset": "Training reset",
    "trainer.sessionSaveError": "Error saving session:",
    "engine.refreshError": "Error refreshing analysis:",
    "engine.waitUntilMoveEnds": "Wait until {{engineLabel}} finishes its move",
    "engine.topMovesShown": "Displayed the top 3 move options from {{engineLabel}}.",
    "engine.noBestMove": "{{engineLabel}} did not return a best move.",
    "engine.stockfishError": "Stockfish error",
    "engine.bestMoveFetchError": "Could not fetch the best move from {{engineLabel}}.",
    "engine.thinking": "{{engineLabel}} is thinking...",
    "engine.noMove": "{{engineLabel}} did not return a move",
    "engine.playedMove": "{{engineLabel}} played: {{move}}",
    "engine.illegalMove": "{{engineLabel}} returned an illegal move: {{move}}",
    "engine.playMoveError": "Error during {{engineLabel}} move",
    "engine.waitResponse": "Move made. Wait for {{engineLabel}}'s response.",
    "engine.undoOnlyPlay": "Undo works only in play mode",
    "engine.waitUntilEngineFinishes": "Wait until {{engineLabel}} finishes the move",
    "engine.noMovesToUndo": "No moves to undo",
    "engine.undoSuccess": "Undid the last move / move pair",
    "opening.lineFinishedContinue":
      "Opening line finished. You can continue playing with {{engineLabel}}.",
    "opening.lineFinishedMobile":
      "Opening line finished. The Android build currently ends the training here.",
    "opening.programPlayed": "Program played: {{move}}",
    "opening.programPlayedFinished":
      "Program played: {{move}}. Opening line finished.",
    "opening.programPlayedFinishedMobile":
      "Program played: {{move}}. Opening line finished in the Android build.",
    "opening.playMoveError": "Error during program move",
    "opening.incorrectTryAgain": "Incorrect move. Try again.",
    "opening.correctMove": "Correct move: {{move}}",
    "opening.correctMoveFinished": "Correct move: {{move}}. Opening line finished.",
    "opening.correctMoveFinishedMobile":
      "Correct move: {{move}}. Opening line finished in the Android build.",
    "opening.hintsOnlyTraining": "Hints are available only in opening training mode",
    "opening.hintOnlyYourTurn": "The hint is available only on your turn",
    "opening.noNextHint": "No next hint available",
    "free.loadingCatalog": "Loading repertoire...",
    "free.recognizingOpening": "Recognizing opening...",
    "free.outOfBook": "Outside the opening database",
    "free.possibleOpenings": "Possible: {{names}}",
    "free.fetchCatalogError": "Error fetching repertoire for free training:",
    "free.analyzeMoveError": "Error analyzing move in free training:"
  }
};

export function resolveLanguage(language) {
  return language === "en" ? "en" : DEFAULT_LANGUAGE;
}

export function getInitialLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (storedLanguage) {
    return resolveLanguage(storedLanguage);
  }

  const browserLanguage = window.navigator.language?.slice(0, 2);
  return resolveLanguage(browserLanguage);
}

export function formatMessage(template, variables = {}) {
  return Object.entries(variables).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template
  );
}

export const I18nContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key) => key
});
