import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchOpeningById, fetchOpeningMoveAnalysis } from "../services/api";
import { useI18n } from "../i18n";

const MAX_SCORING_MOVES = 5;

function getOpeningLabel(t, matchingOpenings, historyLength, isLoadingCatalog) {
  if (isLoadingCatalog) {
    return t("free.loadingCatalog");
  }

  if (historyLength === 0) {
    return t("free.recognizingOpening");
  }

  if (matchingOpenings.length === 0) {
    return t("free.outOfBook");
  }

  if (matchingOpenings.length === 1) {
    return matchingOpenings[0].name;
  }

  const names = matchingOpenings.slice(0, 3).map((opening) => opening.name);
  const suffix = matchingOpenings.length > 3 ? "..." : "";
  return t("free.possibleOpenings", { names: `${names.join(" / ")}${suffix}` });
}

function getScoreState(scoreEntries) {
  const totalAttempts = scoreEntries.length;
  const scoreSum = scoreEntries.reduce((sum, entry) => sum + entry.score, 0);
  const accuracy = totalAttempts > 0 ? Math.round(scoreSum / totalAttempts) : 0;
  const bookCount = scoreEntries.filter((entry) => entry.category === "book").length;
  const goodCount = scoreEntries.filter((entry) => entry.category === "good").length;
  const wrongCount = scoreEntries.filter((entry) => entry.category === "weak").length;

  return {
    bookCount,
    goodCount,
    wrongCount,
    totalAttempts,
    accuracy
  };
}

export function useFreeOpeningTraining({
  filteredOpenings,
  playerColor,
  gameRef,
  fen
}) {
  const { t } = useI18n();
  const [openingCatalog, setOpeningCatalog] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [scoreEntries, setScoreEntries] = useState([]);
  const [bookMoveSquare, setBookMoveSquare] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadCatalog() {
      if (filteredOpenings.length === 0) {
        setOpeningCatalog([]);
        setIsLoadingCatalog(false);
        return;
      }

      setIsLoadingCatalog(true);

      try {
        const detailedOpenings = await Promise.all(
          filteredOpenings.map((opening) => fetchOpeningById(opening.id))
        );

        if (isCancelled) {
          return;
        }

        setOpeningCatalog(detailedOpenings);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error(t("free.fetchCatalogError"), error);
        setOpeningCatalog([]);
      } finally {
        if (!isCancelled) {
          setIsLoadingCatalog(false);
        }
      }
    }

    loadCatalog();

    return () => {
      isCancelled = true;
    };
  }, [filteredOpenings, t]);

  const openingLabel = useMemo(() => {
    const history = fen ? gameRef.current.history() : [];
    const matchingOpenings = openingCatalog.filter((opening) =>
      history.every((move, index) => opening.moves[index] === move)
    );

    return getOpeningLabel(t, matchingOpenings, history.length, isLoadingCatalog);
  }, [fen, gameRef, isLoadingCatalog, openingCatalog, t]);

  const analyzePlayerMove = useCallback(
    async ({ fenBeforeMove, move, historyAfterMove }) => {
      if (scoreEntries.length >= MAX_SCORING_MOVES || !move?.from || !move?.to) {
        return;
      }

      const isBookMove =
        Array.isArray(historyAfterMove) &&
        historyAfterMove.length > 0 &&
        openingCatalog.some((opening) =>
          historyAfterMove.every((historyMove, index) => opening.moves[index] === historyMove)
        );

      setBookMoveSquare(isBookMove ? move.to : "");

      const playedMove = `${move.from}${move.to}${move.promotion || ""}`;

      try {
        const data = await fetchOpeningMoveAnalysis(
          fenBeforeMove,
          playedMove,
          playerColor
        );

        setScoreEntries((previousEntries) => {
          if (previousEntries.length >= MAX_SCORING_MOVES) {
            return previousEntries;
          }

          return [
            ...previousEntries,
            {
              moveNumber: previousEntries.length + 1,
              score: data.score ?? 0,
              category: isBookMove
                ? "book"
                : (data.score ?? 0) >= 75
                  ? "good"
                  : "weak"
            }
          ];
        });
      } catch (error) {
        console.error(t("free.analyzeMoveError"), error);
      }
    },
    [openingCatalog, playerColor, scoreEntries.length, t]
  );

  const resetAnalysis = useCallback(() => {
    setScoreEntries([]);
    setBookMoveSquare("");
  }, []);

  const scoreState = useMemo(() => getScoreState(scoreEntries), [scoreEntries]);

  return {
    openingLabel,
    bookCount: scoreState.bookCount,
    goodCount: scoreState.goodCount,
    wrongCount: scoreState.wrongCount,
    totalAttempts: scoreState.totalAttempts,
    accuracy: scoreState.accuracy,
    maxScoringMoves: MAX_SCORING_MOVES,
    bookMoveSquare,
    analyzePlayerMove,
    resetAnalysis
  };
}
