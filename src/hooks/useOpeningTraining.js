import { isPlayerTurnInOpening } from "../utils/chessHelpers";
import { useI18n } from "../i18n";

export function useOpeningTraining({
  engineLabel,
  canContinueWithEngine,
  playerColor,
  openingMoves,
  moveIndex,
  setMoveIndex,
  setHint,
  setShowHint,
  setStatus,
  setCorrectCount,
  setWrongCount,
  gameRef,
  setFen,
  refreshEvaluation,
  enterPlayMode,
  scheduleOpeningComputerMove,
  clearScheduledOpeningMove
}) {
  const { t } = useI18n();

  function playOpeningComputerMove(index, movesFromArg = openingMoves) {
    clearScheduledOpeningMove();

    const move = movesFromArg[index];

    if (!move) {
      if (canContinueWithEngine) {
        enterPlayMode(t("opening.lineFinishedContinue", { engineLabel }));
      } else {
        setStatus(t("opening.lineFinishedMobile"));
      }
      return;
    }

    try {
      gameRef.current.move(move);
      const nextIndex = index + 1;

      setFen(gameRef.current.fen());
      setMoveIndex(nextIndex);
      refreshEvaluation(gameRef.current.fen());

      if (movesFromArg[nextIndex] && isPlayerTurnInOpening(nextIndex, playerColor)) {
        setHint(movesFromArg[nextIndex] || "");
        setShowHint(false);
      } else {
        setHint("");
        setShowHint(false);
      }

      setStatus(t("opening.programPlayed", { move }));

      if (!movesFromArg[nextIndex]) {
        if (canContinueWithEngine) {
          enterPlayMode(t("opening.programPlayedFinished", { move }));
        } else {
          setStatus(t("opening.programPlayedFinishedMobile", { move }));
        }
      }
    } catch (error) {
      console.error(error);
      setStatus(t("opening.playMoveError"));
    }
  }

  function handleOpeningModeMove(move) {
    const correctMove = openingMoves[moveIndex];

    if (!correctMove) {
      if (!canContinueWithEngine) {
        gameRef.current.undo();
        setStatus(t("opening.lineFinishedMobile"));
        return false;
      }

      setFen(gameRef.current.fen());
      refreshEvaluation(gameRef.current.fen());
      enterPlayMode(t("opening.lineFinishedContinue", { engineLabel }));
      return true;
    }

    if (move.san !== correctMove) {
      gameRef.current.undo();
      setWrongCount((prev) => prev + 1);
      setStatus(t("opening.incorrectTryAgain"));
      return false;
    }

    const nextIndex = moveIndex + 1;

    setCorrectCount((prev) => prev + 1);
    setFen(gameRef.current.fen());
    setMoveIndex(nextIndex);
    setStatus(t("opening.correctMove", { move: move.san }));
    setShowHint(false);
    refreshEvaluation(gameRef.current.fen());

    if (openingMoves[nextIndex]) {
      if (isPlayerTurnInOpening(nextIndex, playerColor)) {
        setHint(openingMoves[nextIndex] || "");
      } else {
        setHint("");
        scheduleOpeningComputerMove(() => {
          playOpeningComputerMove(nextIndex, openingMoves);
        }, 400);
      }
    } else {
      if (canContinueWithEngine) {
        enterPlayMode(t("opening.correctMoveFinished", { move: move.san }));
      } else {
        setStatus(t("opening.correctMoveFinishedMobile", { move: move.san }));
      }
    }

    return true;
  }

  function canShowHint(mode) {
    if (mode !== "opening") {
      setStatus(t("opening.hintsOnlyTraining"));
      return false;
    }

    if (!isPlayerTurnInOpening(moveIndex, playerColor)) {
      setStatus(t("opening.hintOnlyYourTurn"));
      return false;
    }

    if (!openingMoves[moveIndex]) {
      setStatus(t("opening.noNextHint"));
      return false;
    }

    return true;
  }

  return {
    playOpeningComputerMove,
    handleOpeningModeMove,
    canShowHint
  };
}
