import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import ControlPanel from "./ControlPanel";
import EvaluationBar from "./EvaluationBar";
import { useI18n } from "../i18n";

function ChessBoardPanel({
  filteredOpenings,
  selectedOpeningId,
  setSelectedOpeningId,
  openingName,
  playerColor,
  setPlayerColor,
  selectedEngine,
  setSelectedEngine,
  engineElo,
  setEngineElo,
  onLoadOpening,
  onStartFreeTraining,
  onResetTraining,
  onRequestHint,
  onUndoLastMovePair,
  mode,
  isEngineThinking,
  isEngineMoveScheduled,
  evaluation,
  selectedSquare,
  captureAnimationSquare,
  chessboardOptions,
  isMobileLayout,
  mobileControlView = "full"
}) {
  const { t } = useI18n();
  const [isEvaluationVisible, setIsEvaluationVisible] = useState(true);
  const [boardWidth, setBoardWidth] = useState(480);
  const boardWrapRef = useRef(null);
  const mobileCanDragPiece = useCallback(() => false, []);

  const getMobileSquareStateClass = useCallback((square) => {
    if (square === selectedSquare) {
      return "mobile-square-click-target is-selected";
    }

    return "mobile-square-click-target";
  }, [selectedSquare]);

  const renderMobileSquare = useCallback(({ square, piece, children }) => {
    const wrapClassName =
      square === captureAnimationSquare
        ? "mobile-square-click-target-wrap is-capture-animation-target"
        : "mobile-square-click-target-wrap";

    return (
      <div className={wrapClassName}>
        {children}
        <button
          type="button"
          className={getMobileSquareStateClass(square)}
          aria-label={`square-${square}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            chessboardOptions.onSquareClick?.({ square, piece });
          }}
        />
      </div>
    );
  }, [captureAnimationSquare, chessboardOptions, getMobileSquareStateClass]);

  useEffect(() => {
    function updateBoardWidth() {
      const viewportWidth = typeof window === "undefined" ? 1280 : window.innerWidth;
      const isCompactLayout = viewportWidth <= 768;
      const boardContainerWidth = boardWrapRef.current?.clientWidth || viewportWidth;
      const reservedSpace = isCompactLayout ? 0 : isEvaluationVisible ? 52 : 0;
      const horizontalPadding = isCompactLayout ? 8 : 24;
      const nextWidth = Math.max(
        280,
        Math.min(480, Math.floor(boardContainerWidth - reservedSpace - horizontalPadding))
      );

      setBoardWidth(nextWidth);
    }

    updateBoardWidth();

    if (typeof window === "undefined") {
      return undefined;
    }

    const resizeObserver =
      typeof ResizeObserver !== "undefined" && boardWrapRef.current
        ? new ResizeObserver(() => updateBoardWidth())
        : null;

    if (resizeObserver && boardWrapRef.current) {
      resizeObserver.observe(boardWrapRef.current);
    }

    window.addEventListener("resize", updateBoardWidth);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateBoardWidth);
    };
  }, [isEvaluationVisible]);

  const resolvedChessboardOptions = useMemo(() => ({
    ...chessboardOptions,
    allowDragging: !isMobileLayout,
    canDragPiece: isMobileLayout ? mobileCanDragPiece : chessboardOptions.canDragPiece,
    onSquareClick: isMobileLayout ? chessboardOptions.onSquareClick : undefined,
    squareRenderer: isMobileLayout ? renderMobileSquare : undefined,
    boardWidth
  }), [boardWidth, chessboardOptions, isMobileLayout, mobileCanDragPiece, renderMobileSquare]);

  return (
    <section className="board-panel">
      <h1 className="app-title">{t("board.title")}</h1>

      {openingName ? (
        <div className="board-opening-chip">
          <span className="board-opening-chip-label">{t("control.opening")}</span>
          <strong className="board-opening-chip-name">{openingName}</strong>
        </div>
      ) : null}

      <ControlPanel
        filteredOpenings={filteredOpenings}
        selectedOpeningId={selectedOpeningId}
        setSelectedOpeningId={setSelectedOpeningId}
        playerColor={playerColor}
        setPlayerColor={setPlayerColor}
        selectedEngine={selectedEngine}
        setSelectedEngine={setSelectedEngine}
        engineElo={engineElo}
        setEngineElo={setEngineElo}
        onLoadOpening={onLoadOpening}
        onStartFreeTraining={onStartFreeTraining}
        onResetTraining={onResetTraining}
        onRequestHint={onRequestHint}
        onUndoLastMovePair={onUndoLastMovePair}
        mode={mode}
        isEngineThinking={isEngineThinking}
        isEngineMoveScheduled={isEngineMoveScheduled}
        isMobileLayout={isMobileLayout}
        mobileView={mobileControlView}
      />

      <div className="board-analysis-row">
        <div className="eval-panel">
          <button
            type="button"
            className="eval-toggle-button"
            onClick={() => setIsEvaluationVisible((previousValue) => !previousValue)}
            aria-pressed={isEvaluationVisible}
          >
            {isEvaluationVisible ? t("board.hideEval") : t("board.showEval")}
          </button>

          {isEvaluationVisible ? (
            <EvaluationBar
              evaluation={evaluation}
              playerColor={playerColor}
              isMobileLayout={isMobileLayout}
            />
          ) : null}
        </div>

        <div className="board-wrap" ref={boardWrapRef}>
          <div className="board-box" style={{ width: `${boardWidth}px` }}>
            <Chessboard
              options={resolvedChessboardOptions}
            />
          </div>
        </div>

        {isMobileLayout ? (
          <div className="mobile-board-actions">
            <button type="button" className="app-button mobile-hint-button" onClick={onRequestHint}>
              {t("control.showHint")}
            </button>
            <button
              type="button"
              className="app-button danger mobile-undo-button"
              onClick={onUndoLastMovePair}
              disabled={mode === "opening" || isEngineThinking || isEngineMoveScheduled}
            >
              {t("control.undoMove")}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default memo(ChessBoardPanel);
