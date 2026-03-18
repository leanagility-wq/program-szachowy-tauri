import { invoke } from "@tauri-apps/api/core";

function getApiBaseUrl() {
  const configuredUrl = window.chessTrainerConfig?.apiBaseUrl;
  return configuredUrl || "http://127.0.0.1:3001";
}

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function parseJsonOrThrow(response) {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;

    try {
      const data = await response.json();
      errorMessage = data.error || errorMessage;
    } catch {
      // zostawiamy domyślny komunikat
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export async function fetchOpenings() {
  if (isTauriRuntime()) {
    return invoke("fetch_openings");
  }

  const response = await fetch(`${getApiBaseUrl()}/api/openings`);
  return parseJsonOrThrow(response);
}

export async function fetchOpeningById(id) {
  if (isTauriRuntime()) {
    return invoke("fetch_opening_by_id", { id });
  }

  const response = await fetch(`${getApiBaseUrl()}/api/opening/${id}`);
  return parseJsonOrThrow(response);
}

export async function fetchBestMove(fen) {
  if (isTauriRuntime()) {
    return invoke("fetch_best_move", { fen });
  }

  const response = await fetch(`${getApiBaseUrl()}/api/bestmove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fen })
  });

  return parseJsonOrThrow(response);
}

export async function fetchEngineMove(fen, elo, engine = "stockfish") {
  if (isTauriRuntime()) {
    return invoke("fetch_engine_move", { fen, elo, engine });
  }

  const response = await fetch(`${getApiBaseUrl()}/api/engine-move`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fen, elo, engine })
  });

  return parseJsonOrThrow(response);
}

export async function fetchEvaluation(fen) {
  if (isTauriRuntime()) {
    return invoke("fetch_evaluation", { fen });
  }

  const response = await fetch(`${getApiBaseUrl()}/api/evaluation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fen })
  });

  return parseJsonOrThrow(response);
}

export async function fetchOpeningMoveAnalysis(fen, playedMove, playerColor) {
  if (isTauriRuntime()) {
    return invoke("fetch_opening_move_analysis", { fen, playedMove, playerColor });
  }

  const response = await fetch(`${getApiBaseUrl()}/api/analyze-opening-move`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fen, playedMove, playerColor })
  });

  return parseJsonOrThrow(response);
}
