import { Chess } from "chess.js";
import {
  ENGINE_ELO_OPTIONS,
  getDefaultEngineForPlatform,
  hasEngineSupportOnPlatform,
  isEngineAvailableOnPlatform,
  isSupportedEngine
} from "../../constants/engines";
import { getRuntimePlatform } from "../../platform/runtime";
import { isPlayerTurnInGame, isPlayerTurnInOpening } from "../../utils/chessHelpers";

export const SESSION_STORAGE_KEY = "chess-trainer-session-v1";
export const SUPPORTED_ELO = ENGINE_ELO_OPTIONS;
export const DEFAULT_SESSION_STATUS = "Wczytywanie listy otwarć...";

function getDefaultFen() {
  return new Chess().fen();
}

function getSafeFen(fen) {
  if (typeof fen !== "string") {
    return getDefaultFen();
  }

  try {
    return new Chess(fen).fen();
  } catch {
    return getDefaultFen();
  }
}

export function readPersistedSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error("Błąd odczytu zapisanej sesji:", error);
    return null;
  }
}

export function getInitialSessionState() {
  const persistedSession = readPersistedSession();
  const runtimePlatform = getRuntimePlatform();
  const hasEngineSupport = hasEngineSupportOnPlatform(runtimePlatform);
  const fen = getSafeFen(persistedSession?.fen);
  const playerColor = persistedSession?.playerColor === "black" ? "black" : "white";
  const mode =
    hasEngineSupport &&
    (persistedSession?.mode === "play" || persistedSession?.mode === "free")
      ? persistedSession.mode
      : "opening";
  const openingMoves = Array.isArray(persistedSession?.openingMoves)
    ? persistedSession.openingMoves.filter((move) => typeof move === "string")
    : [];
  const moveIndex = Number.isInteger(persistedSession?.moveIndex)
    ? Math.max(0, persistedSession.moveIndex)
    : 0;
  const engineElo = SUPPORTED_ELO.includes(persistedSession?.engineElo)
    ? persistedSession.engineElo
    : 1400;
  const requestedEngine = isSupportedEngine(persistedSession?.selectedEngine)
    ? persistedSession.selectedEngine
    : getDefaultEngineForPlatform(runtimePlatform);
  const selectedEngine = isEngineAvailableOnPlatform(requestedEngine, runtimePlatform)
    ? requestedEngine
    : getDefaultEngineForPlatform(runtimePlatform) || "stockfish";
  const evaluation =
    persistedSession?.evaluation &&
    (persistedSession.evaluation.type === "cp" ||
      persistedSession.evaluation.type === "mate") &&
    typeof persistedSession.evaluation.value === "number"
      ? persistedSession.evaluation
      : { type: "cp", value: 0 };

  const restoredGame = new Chess(fen);

  return {
    fen,
    selectedOpeningId:
      typeof persistedSession?.selectedOpeningId === "string"
        ? persistedSession.selectedOpeningId
        : "",
    openingMoves,
    openingName:
      typeof persistedSession?.openingName === "string"
        ? persistedSession.openingName
        : "",
    playerColor,
    moveIndex,
    hint: typeof persistedSession?.hint === "string" ? persistedSession.hint : "",
    showHint: Boolean(persistedSession?.showHint),
    status:
      typeof persistedSession?.status === "string"
        ? persistedSession.status
        : DEFAULT_SESSION_STATUS,
    bestMove: typeof persistedSession?.bestMove === "string" ? persistedSession.bestMove : "",
    bestMoves: Array.isArray(persistedSession?.bestMoves)
      ? persistedSession.bestMoves.filter((move) => typeof move === "string")
      : [],
    correctCount: Number.isInteger(persistedSession?.correctCount)
      ? Math.max(0, persistedSession.correctCount)
      : 0,
    wrongCount: Number.isInteger(persistedSession?.wrongCount)
      ? Math.max(0, persistedSession.wrongCount)
      : 0,
    mode,
    selectedEngine,
    engineElo,
    evaluation,
    needsResumeOpeningMove:
      mode === "opening" &&
      openingMoves.length > moveIndex &&
      !isPlayerTurnInOpening(moveIndex, playerColor),
    needsResumeEngineMove:
      hasEngineSupport &&
      (mode === "play" || mode === "free") &&
      !isPlayerTurnInGame(restoredGame, playerColor)
  };
}

export function persistSessionSnapshot(sessionSnapshot, sessionSaveErrorLabel) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionSnapshot));
  } catch (error) {
    console.error(sessionSaveErrorLabel, error);
  }
}
