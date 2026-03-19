import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { fetchOpenings, fetchOpeningById } from "../services/api";
import {
  getArrowForSanMove,
  getArrowForUciMove,
  getBookMoveSquareStyles,
  isPlayerTurnInOpening,
  isPlayerTurnInGame
} from "../utils/chessHelpers";
import { useOpeningTraining } from "./useOpeningTraining";
import { useEnginePlay } from "./useEnginePlay";
import { useFreeOpeningTraining } from "./useFreeOpeningTraining";
import { getEngineLabel, hasEngineSupportOnPlatform } from "../constants/engines";
import { useI18n } from "../i18n";
import {
  getInitialSessionState,
  persistSessionSnapshot
} from "../features/trainer/sessionState";
import { getRuntimePlatform } from "../platform/runtime";

export function useChessTrainer() {
  const { t } = useI18n();
  const runtimePlatform = getRuntimePlatform();
  const hasEngineSupport = hasEngineSupportOnPlatform(runtimePlatform);
  const [initialSession] = useState(getInitialSessionState);
  const gameRef = useRef(new Chess(initialSession.fen));
  const openingMoveTimeoutRef = useRef(null);
  const openingTrainingRef = useRef(null);
  const postMoveUiTimeoutsRef = useRef(new Set());
  const clearAllAsyncWorkRef = useRef(() => {});
  const hasHydratedSessionRef = useRef(true);
  const needsResumeOpeningMoveRef = useRef(initialSession.needsResumeOpeningMove);
  const needsResumeEngineMoveRef = useRef(initialSession.needsResumeEngineMove);
  const persistTimeoutRef = useRef(null);

  const [fen, setFenState] = useState(initialSession.fen);
  const [openingsList, setOpeningsList] = useState([]);
  const [selectedOpeningId, setSelectedOpeningId] = useState(initialSession.selectedOpeningId);
  const [openingMoves, setOpeningMoves] = useState(initialSession.openingMoves);
  const [openingName, setOpeningName] = useState(initialSession.openingName);
  const [playerColor, setPlayerColor] = useState(initialSession.playerColor);
  const [moveIndex, setMoveIndex] = useState(initialSession.moveIndex);
  const [hint, setHint] = useState(initialSession.hint);
  const [showHint, setShowHint] = useState(initialSession.showHint);
  const [status, setStatus] = useState(initialSession.status);
  const [bestMove, setBestMove] = useState(initialSession.bestMove);
  const [bestMoves, setBestMoves] = useState(initialSession.bestMoves);
  const [correctCount, setCorrectCount] = useState(initialSession.correctCount);
  const [wrongCount, setWrongCount] = useState(initialSession.wrongCount);
  const [mode, setMode] = useState(initialSession.mode);
  const [selectedEngine, setSelectedEngine] = useState(initialSession.selectedEngine);
  const [engineElo, setEngineElo] = useState(initialSession.engineElo);
  const [isEngineThinking, setIsEngineThinking] = useState(false);
  const [evaluation, setEvaluation] = useState(initialSession.evaluation);
  const [selectedSquare, setSelectedSquare] = useState("");
  const selectedEngineLabel = getEngineLabel(selectedEngine);

  const setFen = useCallback((nextFen) => {
    setSelectedSquare("");
    setFenState(nextFen);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadOpeningsList() {
      try {
        const data = await fetchOpenings();

        if (isCancelled) {
          return;
        }

        setOpeningsList(data);
        setStatus(data.length > 0 ? t("trainer.chooseOpeningAndColor") : t("trainer.noOpenings"));
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error(error);
        setStatus(t("trainer.fetchOpeningsError"));
      }
    }

    loadOpeningsList();

    return () => {
      isCancelled = true;
    };
  }, [t]);

  const filteredOpenings = useMemo(() => {
    return openingsList.filter((opening) => opening.side === playerColor);
  }, [openingsList, playerColor]);

  const effectiveSelectedOpeningId = useMemo(() => {
    if (filteredOpenings.length === 0) {
      return "";
    }

    const stillExists = filteredOpenings.some((opening) => opening.id === selectedOpeningId);
    return stillExists ? selectedOpeningId : filteredOpenings[0].id;
  }, [filteredOpenings, selectedOpeningId]);

  const totalAttempts = correctCount + wrongCount;
  const accuracy =
    totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

  const clearScheduledOpeningMove = useCallback(() => {
    if (openingMoveTimeoutRef.current) {
      clearTimeout(openingMoveTimeoutRef.current);
      openingMoveTimeoutRef.current = null;
    }
  }, []);

  const scheduleOpeningComputerMove = useCallback(
    (callback, delay = 400) => {
      clearScheduledOpeningMove();
      openingMoveTimeoutRef.current = setTimeout(() => {
        openingMoveTimeoutRef.current = null;
        callback();
      }, delay);
    },
    [clearScheduledOpeningMove]
  );

  const clearScheduledPostMoveUiWork = useCallback(() => {
    for (const timeoutId of postMoveUiTimeoutsRef.current) {
      clearTimeout(timeoutId);
    }

    postMoveUiTimeoutsRef.current.clear();
  }, []);

  const scheduleAfterBoardAnimation = useCallback((callback, delayMs) => {
    const resolvedDelay =
      typeof delayMs === "number" ? delayMs : runtimePlatform === "android" ? 140 : 0;

    if (resolvedDelay <= 0 || typeof window === "undefined") {
      callback();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      postMoveUiTimeoutsRef.current.delete(timeoutId);
      callback();
    }, resolvedDelay);

    postMoveUiTimeoutsRef.current.add(timeoutId);
  }, [runtimePlatform]);

  const runLowPriorityUiUpdate = useCallback((callback, delayMs) => {
    scheduleAfterBoardAnimation(() => {
      startTransition(callback);
    }, delayMs);
  }, [scheduleAfterBoardAnimation]);

  const engine = useEnginePlay({
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
    runLowPriorityUiUpdate
  });

  const freeOpeningTraining = useFreeOpeningTraining({
    filteredOpenings,
    playerColor,
    gameRef,
    fen
  });

  const {
    openingLabel: freeOpeningLabel,
    bookCount: freeBookCount,
    goodCount: freeGoodCount,
    wrongCount: freeWrongCount,
    totalAttempts: freeTotalAttempts,
    accuracy: freeAccuracy,
    maxScoringMoves,
    bookMoveSquare,
    analyzePlayerMove: analyzeFreeOpeningMove,
    resetAnalysis: resetFreeOpeningAnalysis
  } = freeOpeningTraining;

  const clearAllAsyncWork = useCallback(() => {
    clearScheduledOpeningMove();
    clearScheduledPostMoveUiWork();
    engine.clearScheduledEngineMove();
    engine.invalidatePendingAsyncWork();
  }, [clearScheduledOpeningMove, clearScheduledPostMoveUiWork, engine]);

  const clearSquareSelection = useCallback(() => {
    setSelectedSquare("");
  }, []);

  useEffect(() => {
    clearAllAsyncWorkRef.current = clearAllAsyncWork;
  });

  useEffect(() => {
    return () => {
      clearAllAsyncWorkRef.current();
    };
  }, []);

  const resetSessionState = useCallback(() => {
    clearAllAsyncWork();
    clearSquareSelection();

    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setMoveIndex(0);
    setBestMoves([]);
    setBestMove("");
    setShowHint(false);
    setMode("opening");
    setIsEngineThinking(false);
    setEvaluation({ type: "cp", value: 0 });
    setCorrectCount(0);
    setWrongCount(0);
  }, [clearAllAsyncWork, clearSquareSelection, setFen]);

  const startOpeningFromBeginning = useCallback((moves, openingLabel) => {
    engine.refreshEvaluation(gameRef.current.fen());

    if (playerColor === "white") {
      setHint(moves[0] || "");
      setStatus(openingLabel);
      return;
    }

    setHint(moves[1] || "");
    setStatus(t("trainer.programStarts", { openingLabel }));

    scheduleOpeningComputerMove(() => {
      openingTrainingRef.current?.playOpeningComputerMove(0, moves);
    }, 400);
  }, [engine, playerColor, scheduleOpeningComputerMove, t]);

  const openingTraining = useOpeningTraining({
    engineLabel: selectedEngineLabel,
    canContinueWithEngine: hasEngineSupport,
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
    refreshEvaluation: engine.refreshEvaluation,
    enterPlayMode: (customStatus) => engine.enterPlayMode(customStatus, setMode),
    scheduleOpeningComputerMove,
    clearScheduledOpeningMove,
    scheduleAfterBoardAnimation,
    runLowPriorityUiUpdate
  });

  useEffect(() => {
    openingTrainingRef.current = openingTraining;
  }, [openingTraining]);

  useEffect(() => {
    if (!needsResumeOpeningMoveRef.current) {
      return;
    }

    needsResumeOpeningMoveRef.current = false;
    scheduleOpeningComputerMove(() => {
      openingTraining.playOpeningComputerMove(moveIndex, openingMoves);
    }, 300);
  }, [moveIndex, openingMoves, openingTraining, scheduleOpeningComputerMove]);

  useEffect(() => {
    if (!needsResumeEngineMoveRef.current) {
      return;
    }

    needsResumeEngineMoveRef.current = false;
    engine.scheduleEngineMove(300);
  }, [engine]);

  const canPlayerAct = useCallback(() => {
    if (isEngineThinking || engine.isEngineMoveScheduled) {
      setStatus(t("trainer.waitEngineMove", { engineLabel: selectedEngineLabel }));
      return false;
    }

    if (mode === "opening") {
      if (!isPlayerTurnInOpening(moveIndex, playerColor)) {
        setStatus(t("trainer.programTurn"));
        return false;
      }

      return true;
    }

    if (!isPlayerTurnInGame(gameRef.current, playerColor)) {
      setStatus(t("trainer.engineTurn", { engineLabel: selectedEngineLabel }));
      return false;
    }

    return true;
  }, [
    engine.isEngineMoveScheduled,
    isEngineThinking,
    mode,
    moveIndex,
    playerColor,
    selectedEngineLabel,
    t
  ]);

  const isOwnPieceSquare = useCallback((square) => {
    const piece = gameRef.current.get(square);
    if (!piece) {
      return false;
    }

    return (
      (playerColor === "white" && piece.color === "w") ||
      (playerColor === "black" && piece.color === "b")
    );
  }, [playerColor]);

  const selectSquare = useCallback((square) => {
    if (!canPlayerAct() || !isOwnPieceSquare(square)) {
      return;
    }

    setSelectedSquare(square);
  }, [canPlayerAct, isOwnPieceSquare]);

  const tryPlayerMove = useCallback((sourceSquare, targetSquare) => {
    if (!canPlayerAct()) {
      return false;
    }

    let move;
    const fenBeforeMove = gameRef.current.fen();

    try {
      move = gameRef.current.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q"
      });
    } catch {
      return false;
    }

    if (move === null) {
      return false;
    }

    clearSquareSelection();

    if (mode === "opening") {
      return openingTraining.handleOpeningModeMove(move);
    }

    if (mode === "free") {
      analyzeFreeOpeningMove({
        fenBeforeMove,
        move,
        historyAfterMove: gameRef.current.history()
      });
    }

    return engine.handlePlayModeMove();
  }, [analyzeFreeOpeningMove, canPlayerAct, clearSquareSelection, engine, mode, openingTraining]);

  const handlePieceDrop = useCallback((event) => {
    const { sourceSquare, targetSquare } = event;
    return tryPlayerMove(sourceSquare, targetSquare);
  }, [tryPlayerMove]);

  const handleSquareClick = useCallback(({ square }) => {
    if (!square) {
      return;
    }

    if (!selectedSquare) {
      selectSquare(square);
      return;
    }

    if (selectedSquare === square) {
      clearSquareSelection();
      return;
    }

    if (isOwnPieceSquare(square)) {
      selectSquare(square);
      return;
    }

    tryPlayerMove(selectedSquare, square);
  }, [clearSquareSelection, isOwnPieceSquare, selectSquare, selectedSquare, tryPlayerMove]);

  const boardArrows = useMemo(() => {
    if (mode === "opening" && showHint && hint) {
      const hintArrow = getArrowForSanMove(fen, hint, "#f59e0b");
      return hintArrow ? [hintArrow] : [];
    }

    if ((mode === "play" || mode === "free") && bestMove) {
      const suggestionColors = ["#22c55e", "#38bdf8", "#f59e0b"];
      return bestMoves
        .map((move, index) => getArrowForUciMove(move, suggestionColors[index] || "#22c55e"))
        .filter(Boolean);
    }

    return [];
  }, [mode, showHint, hint, fen, bestMove, bestMoves]);

  const customSquareStyles = useMemo(() => {
    const styles = mode === "free" ? getBookMoveSquareStyles(bookMoveSquare) : {};

    if (selectedSquare) {
      const currentStyles = styles[selectedSquare] || {};
      styles[selectedSquare] = {
        ...currentStyles,
        boxShadow: [currentStyles.boxShadow, "inset 0 0 0 3px rgba(59, 130, 246, 0.95)"]
          .filter(Boolean)
          .join(", "),
        backgroundColor: "rgba(59, 130, 246, 0.18)"
      };
    }

    return styles;
  }, [mode, bookMoveSquare, selectedSquare]);

  const chessboardOptions = useMemo(() => ({
    id: "OpeningTrainerBoard",
    position: fen,
    boardWidth: 400,
    boardOrientation: playerColor,
    arrows: boardArrows,
    customSquareStyles,
    alphaNotationStyle: {
      transform: "translateY(-4px)"
    },
    numericNotationStyle: {
      transform: "translateY(4px)"
    },
    onPieceDrop: handlePieceDrop,
    onSquareClick: handleSquareClick
  }), [boardArrows, customSquareStyles, fen, handlePieceDrop, handleSquareClick, playerColor]);

  const getVisibleHint = useCallback(() => {
    return showHint ? hint || "-" : "-";
  }, [hint, showHint]);

  const loadOpening = useCallback(async () => {
    if (!effectiveSelectedOpeningId) {
      return;
    }

    try {
      const data = await fetchOpeningById(effectiveSelectedOpeningId);
      const moves = data.moves || [];
      const loadedOpeningName = data.name || t("trainer.unnamedOpening");

      resetSessionState();
      setOpeningMoves(moves);
      setOpeningName(loadedOpeningName);

      startOpeningFromBeginning(
        moves,
        t("trainer.loadedOpening", { openingName: loadedOpeningName })
      );
    } catch (error) {
      console.error(error);
      setStatus(t("trainer.fetchOpeningError"));
    }
  }, [effectiveSelectedOpeningId, resetSessionState, startOpeningFromBeginning, t]);

  function resetTraining() {
    if (mode === "free") {
      startFreeTraining();
      return;
    }

    resetSessionState();
    startOpeningFromBeginning(openingMoves, t("trainer.trainingReset"));
  }

  const startFreeTraining = useCallback(() => {
    if (!hasEngineSupport) {
      setStatus(t("trainer.freeTrainingUnavailable"));
      return;
    }

    resetSessionState();
    resetFreeOpeningAnalysis();
    setOpeningMoves([]);
    setOpeningName("");
    setHint("");
    setShowHint(false);
    setBestMoves([]);
    setBestMove("");
    setMode("free");
    setStatus(t("trainer.freeTrainingStarted", { engineLabel: selectedEngineLabel }));

    if (!isPlayerTurnInGame(gameRef.current, playerColor)) {
      engine.scheduleEngineMove(300);
    }
  }, [
    engine,
    hasEngineSupport,
    playerColor,
    resetFreeOpeningAnalysis,
    resetSessionState,
    selectedEngineLabel,
    t
  ]);

  const showCurrentHint = useCallback(() => {
    if (openingTraining.canShowHint(mode)) {
      setShowHint(true);
      setStatus(t("trainer.nextRepertoireMove"));
    }
  }, [mode, openingTraining, t]);

  const handleRequestHint = useCallback(() => {
    if (mode === "opening") {
      showCurrentHint();
      return;
    }

    if (!hasEngineSupport) {
      setStatus(t("trainer.engineUnavailable"));
      return;
    }

    engine.handleGetBestMove();
  }, [engine, hasEngineSupport, mode, showCurrentHint, t]);

  const displayedOpeningName = mode === "free" ? freeOpeningLabel : openingName;
  const displayedCorrectCount = mode === "free" ? freeGoodCount : correctCount;
  const displayedWrongCount = mode === "free" ? freeWrongCount : wrongCount;
  const displayedTotalAttempts = mode === "free" ? freeTotalAttempts : totalAttempts;
  const displayedAccuracy = mode === "free" ? freeAccuracy : accuracy;
  const displayedBookCount = mode === "free" ? freeBookCount : 0;

  useEffect(() => {
    if (!hasHydratedSessionRef.current || typeof window === "undefined") {
      return;
    }

    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }

    persistTimeoutRef.current = setTimeout(() => {
      persistSessionSnapshot(
        {
          fen,
          selectedOpeningId: effectiveSelectedOpeningId,
          openingMoves,
          openingName: displayedOpeningName,
          playerColor,
          moveIndex,
          hint,
          showHint,
          status,
          bestMove,
          bestMoves,
          correctCount: displayedCorrectCount,
          wrongCount: displayedWrongCount,
          mode,
          selectedEngine,
          engineElo,
          evaluation
        },
        t("trainer.sessionSaveError")
      );
    }, 180);

    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
        persistTimeoutRef.current = null;
      }
    };
  }, [
    fen,
    effectiveSelectedOpeningId,
    openingMoves,
    displayedOpeningName,
    playerColor,
    moveIndex,
    hint,
    showHint,
    status,
    bestMove,
    bestMoves,
    displayedCorrectCount,
    displayedWrongCount,
    mode,
    selectedEngine,
    engineElo,
    evaluation,
    t
  ]);

  return {
    filteredOpenings,
    selectedOpeningId: effectiveSelectedOpeningId,
    setSelectedOpeningId,
    playerColor,
    setPlayerColor,
    selectedEngine,
    setSelectedEngine,
    engineElo,
    setEngineElo,
    mode,
    isEngineThinking,
    isEngineMoveScheduled: engine.isEngineMoveScheduled,
    evaluation,
    selectedSquare,
    chessboardOptions,
    openingName: displayedOpeningName,
    moveIndex,
    bestMove,
    bestMoves,
    bookCount: displayedBookCount,
    correctCount: displayedCorrectCount,
    wrongCount: displayedWrongCount,
    totalAttempts: displayedTotalAttempts,
    accuracy: displayedAccuracy,
    maxScoringMoves,
    status,
    visibleHint: getVisibleHint(),
    loadOpening,
    startFreeTraining,
    resetTraining,
    handleRequestHint,
    undoLastMovePair: () => engine.undoLastMovePair(mode, isEngineThinking)
  };
}
