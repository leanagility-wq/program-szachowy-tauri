import { Chess } from "chess.js";

export function isPlayerTurnInOpening(index, playerColor) {
  if (playerColor === "white") {
    return index % 2 === 0;
  }

  return index % 2 === 1;
}

export function isPlayerTurnInGame(game, playerColor) {
  const turn = game.turn();

  if (playerColor === "white") {
    return turn === "w";
  }

  return turn === "b";
}

export function getEvaluationPercent(evaluation) {
  if (!evaluation) return 50;

  if (evaluation.type === "mate") {
    if (evaluation.value > 0) return 100;
    if (evaluation.value < 0) return 0;
    return 50;
  }

  const clamped = Math.max(-500, Math.min(500, evaluation.value));
  return ((clamped + 500) / 1000) * 100;
}

export function getEvaluationLabel(evaluation) {
  if (!evaluation) return "0.0";

  if (evaluation.type === "mate") {
    return evaluation.value > 0
      ? `#${evaluation.value}`
      : `-#${Math.abs(evaluation.value)}`;
  }

  return (evaluation.value / 100).toFixed(1);
}

export function getArrowForSanMove(fen, san, color = "#f59e0b") {
  if (!fen || !san) return null;

  try {
    const chess = new Chess(fen);
    const matchingMove = chess
      .moves({ verbose: true })
      .find((move) => move.san === san);

    if (!matchingMove) {
      return null;
    }

    return {
      startSquare: matchingMove.from,
      endSquare: matchingMove.to,
      color
    };
  } catch {
    return null;
  }
}

export function getArrowForUciMove(uci, color = "#22c55e") {
  if (typeof uci !== "string" || uci.length < 4) {
    return null;
  }

  return {
    startSquare: uci.slice(0, 2),
    endSquare: uci.slice(2, 4),
    color
  };
}

export function getBookMoveSquareStyles(square) {
  if (!square) {
    return {};
  }

  const bookBadgeSvg = encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect x="2" y="3" width="14" height="14" rx="2" fill="#f8fafc" stroke="#b45309" stroke-width="1.5"/><path d="M6 5.5h5.5a2.5 2.5 0 0 1 2.5 2.5v6.5H8A2 2 0 0 0 6 16.5z" fill="#f59e0b"/><path d="M6 5.5h1.5v11H6z" fill="#92400e"/><path d="M8 8h4" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/><path d="M8 10.5h4" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></svg>'
  );

  return {
    [square]: {
      boxShadow: "inset 0 0 0 2px rgba(245, 158, 11, 0.9)",
      backgroundImage: `url("data:image/svg+xml;charset=utf-8,${bookBadgeSvg}")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 4px bottom 4px",
      backgroundSize: "18px 18px"
    }
  };
}
