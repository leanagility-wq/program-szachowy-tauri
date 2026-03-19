import { useEffect, useRef, useState } from "react";
import { fetchBestMove, fetchEngineMove, fetchEvaluation } from "../services/api";
import { isPlayerTurnInGame } from "../utils/chessHelpers";
import { getEngineLabel } from "../constants/engines";
import { useI18n } from "../i18n";

export function useEnginePlay({
  runtimePlatform,
  playerColor,
  selectedEngine,
  engineElo,
  isEngineThinking,
  gameRef,
  setFen,
  setStatus,
  setHint,
  setShowHint,
  setBestMove,
  setBestMoves,
  setIsEngineThinking,
  setEvaluation,
  scheduleAfterBoardAnimation,
  runLowPriorityUiUpdate,
  markCaptureAnimationSquare
}) {
  const { t } = useI18n();
  const engineMoveTimeoutRef = useRef(null);
  const evaluationRequestIdRef = useRef(0);
  const bestMoveRequestIdRef = useRef(0);
  const [isEngineMoveScheduled, setIsEngineMoveScheduled] = useState(false);
  const engineLabel = getEngineLabel(selectedEngine);

  useEffect(() => {
    return () => {
      clearScheduledEngineMove();
    };
  }, []);

  function clearScheduledEngineMove() {
    if (engineMoveTimeoutRef.current) {
      clearTimeout(engineMoveTimeoutRef.current);
      engineMoveTimeoutRef.current = null;
    }
    setIsEngineMoveScheduled(false);
  }

  function invalidatePendingAsyncWork() {
    evaluationRequestIdRef.current += 1;
    bestMoveRequestIdRef.current += 1;
  }

  async function refreshEvaluation(fenToCheck) {
    const requestId = ++evaluationRequestIdRef.current;

    try {
      const data = await fetchEvaluation(fenToCheck);
      if (requestId === evaluationRequestIdRef.current && data.evaluation) {
        setEvaluation(data.evaluation);
      }
    } catch (error) {
      console.error(t("engine.refreshError"), error);
    }
  }

  async function handleGetBestMove() {
    if (isEngineThinking || isEngineMoveScheduled) {
      setStatus(t("engine.waitUntilMoveEnds", { engineLabel }));
      return;
    }

    const requestId = ++bestMoveRequestIdRef.current;

    try {
      const data = await fetchBestMove(gameRef.current.fen());
      if (requestId === bestMoveRequestIdRef.current) {
        const suggestedMoves = Array.isArray(data.bestMoves)
          ? data.bestMoves.filter((move) => typeof move === "string" && move.length >= 4)
          : data.bestMove
            ? [data.bestMove]
            : [];

        if (suggestedMoves.length > 0) {
          setBestMoves(suggestedMoves);
          setBestMove(suggestedMoves[0]);
          setStatus(t("engine.topMovesShown", { engineLabel }));
        } else {
          setBestMoves([]);
          setBestMove("-");
          setStatus(t("engine.noBestMove", { engineLabel }));
        }
      }
    } catch (error) {
      console.error(error);
      if (requestId === bestMoveRequestIdRef.current) {
        setBestMoves([]);
        setBestMove(t("engine.stockfishError"));
        setStatus(t("engine.bestMoveFetchError", { engineLabel }));
      }
    }
  }

  async function playEngineMove() {
    try {
      setIsEngineMoveScheduled(false);
      setIsEngineThinking(true);
      setStatus(t("engine.thinking", { engineLabel }));

      const currentFen = gameRef.current.fen();
      const data = await fetchEngineMove(currentFen, engineElo, selectedEngine);

      if (gameRef.current.fen() !== currentFen) {
        return;
      }

      if (!data.bestMove) {
        setStatus(t("engine.noMove", { engineLabel }));
        return;
      }

      const bestMoveUci = data.bestMove;
      const from = bestMoveUci.slice(0, 2);
      const to = bestMoveUci.slice(2, 4);
      const promotion = bestMoveUci.length > 4 ? bestMoveUci[4] : "q";

      const appliedMove = gameRef.current.move({
        from,
        to,
        promotion
      });

      if (!appliedMove) {
        setStatus(t("engine.illegalMove", { engineLabel, move: bestMoveUci }));
        return;
      }

      if (appliedMove.captured && !appliedMove.flags?.includes("e")) {
        markCaptureAnimationSquare(appliedMove.from, appliedMove.to);
      }

      setFen(gameRef.current.fen());
      runLowPriorityUiUpdate(() => {
        setStatus(t("engine.playedMove", { engineLabel, move: bestMoveUci }));
      });
      scheduleAfterBoardAnimation(() => {
        refreshEvaluation(gameRef.current.fen());
      });
    } catch (error) {
      console.error(error);
      setStatus(t("engine.playMoveError", { engineLabel }));
    } finally {
      setIsEngineThinking(false);
    }
  }

  function scheduleEngineMove(delay = 300) {
    clearScheduledEngineMove();
    setIsEngineMoveScheduled(true);

    engineMoveTimeoutRef.current = setTimeout(() => {
      engineMoveTimeoutRef.current = null;
      playEngineMove();
    }, delay);
  }

  function enterPlayMode(customStatus, setMode) {
    setMode("play");
    setHint("");
    setShowHint(false);

    if (customStatus) {
      setStatus(customStatus);
    }

    if (!isPlayerTurnInGame(gameRef.current, playerColor)) {
      scheduleEngineMove(300);
    }
  }

  function handlePlayModeMove() {
    setFen(gameRef.current.fen());
    runLowPriorityUiUpdate(() => {
      setHint("");
      setShowHint(false);
      setBestMoves([]);
      setBestMove("");
      setStatus(t("engine.waitResponse", { engineLabel }));
    });
    scheduleAfterBoardAnimation(() => {
      refreshEvaluation(gameRef.current.fen());
    });

    scheduleEngineMove(runtimePlatform === "android" ? 220 : 300);

    return true;
  }

  function undoLastMovePair(mode, thinkingNow) {
    if (mode !== "play" && mode !== "free") {
      setStatus(t("engine.undoOnlyPlay"));
      return;
    }

    if (thinkingNow) {
      setStatus(t("engine.waitUntilEngineFinishes", { engineLabel }));
      return;
    }

    clearScheduledEngineMove();
    invalidatePendingAsyncWork();

    const historyLength = gameRef.current.history().length;

    if (historyLength === 0) {
      setStatus(t("engine.noMovesToUndo"));
      return;
    }

    if (isPlayerTurnInGame(gameRef.current, playerColor)) {
      gameRef.current.undo();
      if (gameRef.current.history().length > 0) {
        gameRef.current.undo();
      }
    } else {
      gameRef.current.undo();
    }

    setFen(gameRef.current.fen());
    runLowPriorityUiUpdate(() => {
      setStatus(t("engine.undoSuccess"));
      setHint("");
      setShowHint(false);
      setBestMoves([]);
      setBestMove("");
    });
    scheduleAfterBoardAnimation(() => {
      refreshEvaluation(gameRef.current.fen());
    }, 80);
  }

  return {
    invalidatePendingAsyncWork,
    refreshEvaluation,
    handleGetBestMove,
    playEngineMove,
    scheduleEngineMove,
    enterPlayMode,
    handlePlayModeMove,
    undoLastMovePair,
    clearScheduledEngineMove,
    isEngineMoveScheduled
  };
}
