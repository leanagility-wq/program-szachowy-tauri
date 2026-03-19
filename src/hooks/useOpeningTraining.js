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
  clearScheduledOpeningMove,
  scheduleAfterBoardAnimation,
  runLowPriorityUiUpdate,
  markCaptureAnimationSquare
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
      const appliedMove = gameRef.current.move(move);
      const nextIndex = index + 1;

      if (appliedMove?.captured && !appliedMove.flags?.includes("e")) {
        markCaptureAnimationSquare(appliedMove.from, appliedMove.to);
      }

      setFen(gameRef.current.fen());
      runLowPriorityUiUpdate(() => {
        setMoveIndex(nextIndex);

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
      });
      scheduleAfterBoardAnimation(() => refreshEvaluation(gameRef.current.fen()));
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
      runLowPriorityUiUpdate(() => {
        enterPlayMode(t("opening.lineFinishedContinue", { engineLabel }));
      });
      scheduleAfterBoardAnimation(() => refreshEvaluation(gameRef.current.fen()));
      return true;
    }

    if (move.san !== correctMove) {
      gameRef.current.undo();
      setWrongCount((prev) => prev + 1);
      setStatus(t("opening.incorrectTryAgain"));
      return false;
    }

    const nextIndex = moveIndex + 1;

    setFen(gameRef.current.fen());
    runLowPriorityUiUpdate(() => {
      setCorrectCount((prev) => prev + 1);
      setMoveIndex(nextIndex);
      setStatus(t("opening.correctMove", { move: move.san }));
      setShowHint(false);

      if (openingMoves[nextIndex]) {
        if (isPlayerTurnInOpening(nextIndex, playerColor)) {
          setHint(openingMoves[nextIndex] || "");
        } else {
          setHint("");
          scheduleOpeningComputerMove(() => {
            playOpeningComputerMove(nextIndex, openingMoves);
          }, 400);
        }
      } else if (canContinueWithEngine) {
        enterPlayMode(t("opening.correctMoveFinished", { move: move.san }));
      } else {
        setStatus(t("opening.correctMoveFinishedMobile", { move: move.san }));
      }
    });
    scheduleAfterBoardAnimation(() => refreshEvaluation(gameRef.current.fen()));

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
