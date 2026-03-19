import { useState } from "react";
import "./App.css";

import { useChessTrainer } from "./hooks/useChessTrainer";
import { useI18n } from "./i18n";
import { useResponsiveLayout } from "./hooks/useResponsiveLayout";

import ChessBoardPanel from "./components/ChessBoardPanel";
import ControlPanel from "./components/ControlPanel";
import SessionCard from "./components/SessionCard";
import GameStatusCard from "./components/GameStatusCard";
import TrainingStatsCard from "./components/TrainingStatsCard";
import LanguageSwitcher from "./components/LanguageSwitcher";
import CollapsibleSection from "./components/CollapsibleSection";

function MobileTabIcon({ tabId }) {
  if (tabId === "play") {
    return (
      <svg viewBox="0 0 24 24" className="mobile-tabbar-icon-svg" aria-hidden="true">
        <path
          d="M9 6.5a3 3 0 1 1 6 0c0 1.2-.7 2.2-1.7 2.7v1.2h2.2v2.2H8.5v-2.2h2.2V9.2A3 3 0 0 1 9 6.5ZM8 14h8l1.2 4.5H6.8L8 14Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (tabId === "status") {
    return (
      <svg viewBox="0 0 24 24" className="mobile-tabbar-icon-svg" aria-hidden="true">
        <path
          d="M6 5.5h12A1.5 1.5 0 0 1 19.5 7v10A1.5 1.5 0 0 1 18 18.5H6A1.5 1.5 0 0 1 4.5 17V7A1.5 1.5 0 0 1 6 5.5Zm1.5 3v2h9v-2h-9Zm0 4v2h5v-2h-5Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (tabId === "options") {
    return (
      <svg viewBox="0 0 24 24" className="mobile-tabbar-icon-svg" aria-hidden="true">
        <path
          d="M19.4 13a7.9 7.9 0 0 0 .05-1 7.9 7.9 0 0 0-.05-1l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.5 7.5 0 0 0-1.73-1l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54a7.5 7.5 0 0 0-1.73 1l-2.39-.96a.5.5 0 0 0-.6.22L2.4 8.78a.5.5 0 0 0 .12.64L4.55 11a7.9 7.9 0 0 0-.05 1 7.9 7.9 0 0 0 .05 1L2.52 14.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.54.42 1.12.76 1.73 1l.36 2.54a.5.5 0 0 0 .5.42h3.84a.5.5 0 0 0 .5-.42l.36-2.54c.61-.24 1.19-.58 1.73-1l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64L19.4 13Zm-7.4 2.25A3.25 3.25 0 1 1 12 8.75a3.25 3.25 0 0 1 0 6.5Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="mobile-tabbar-icon-svg" aria-hidden="true">
      <path
        d="M6 17.5h2.5v-6H6v6Zm4.75 0h2.5v-10h-2.5v10Zm4.75 0H18v-4h-2.5v4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function App() {
  const { t } = useI18n();
  const trainer = useChessTrainer();
  const { isMobileLayout } = useResponsiveLayout();
  const [activeMobileTab, setActiveMobileTab] = useState("play");
  const [isSessionExpanded, setIsSessionExpanded] = useState(true);
  const [isStatusExpanded, setIsStatusExpanded] = useState(true);
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);

  const sessionPanel = (
    <CollapsibleSection
      title={t("app.section.session")}
      isMobileLayout={isMobileLayout}
      isExpanded={isSessionExpanded}
      onToggle={() => setIsSessionExpanded((value) => !value)}
    >
      <SessionCard
        openingName={trainer.openingName}
        playerColor={trainer.playerColor}
        mode={trainer.mode}
        moveIndex={trainer.moveIndex}
        totalAttempts={trainer.totalAttempts}
        maxScoringMoves={trainer.maxScoringMoves}
      />
    </CollapsibleSection>
  );

  const statusPanel = (
    <CollapsibleSection
      title={t("app.section.gameStatus")}
      isMobileLayout={isMobileLayout}
      isExpanded={isStatusExpanded}
      onToggle={() => setIsStatusExpanded((value) => !value)}
    >
      <GameStatusCard
        status={trainer.status}
        hint={trainer.visibleHint}
        bestMove={trainer.bestMove}
        bestMoves={trainer.bestMoves}
      />
    </CollapsibleSection>
  );

  const statsPanel = (
    <CollapsibleSection
      title={t("app.section.results")}
      isMobileLayout={isMobileLayout}
      isExpanded={isStatsExpanded}
      onToggle={() => setIsStatsExpanded((value) => !value)}
    >
      <TrainingStatsCard
        bookCount={trainer.bookCount}
        correctCount={trainer.correctCount}
        wrongCount={trainer.wrongCount}
        totalAttempts={trainer.totalAttempts}
        accuracy={trainer.accuracy}
        mode={trainer.mode}
        maxScoringMoves={trainer.maxScoringMoves}
      />
    </CollapsibleSection>
  );

  const mobileTabs = [
    { id: "play", label: t("app.tab.play") },
    { id: "options", label: t("app.tab.options") },
    { id: "status", label: t("app.tab.status") },
    { id: "stats", label: t("app.tab.stats") }
  ];

  return (
    <div className="app-shell">
      <div className="app-topbar">
        <LanguageSwitcher />
      </div>

      <div className="app-layout">
        <div className="app-main-column">
          {!isMobileLayout || activeMobileTab === "play" ? (
            <ChessBoardPanel
              filteredOpenings={trainer.filteredOpenings}
              selectedOpeningId={trainer.selectedOpeningId}
              setSelectedOpeningId={trainer.setSelectedOpeningId}
              openingName={trainer.openingName}
              playerColor={trainer.playerColor}
              setPlayerColor={trainer.setPlayerColor}
              selectedEngine={trainer.selectedEngine}
              setSelectedEngine={trainer.setSelectedEngine}
              engineElo={trainer.engineElo}
              setEngineElo={trainer.setEngineElo}
              onLoadOpening={trainer.loadOpening}
              onStartFreeTraining={trainer.startFreeTraining}
              onResetTraining={trainer.resetTraining}
              onRequestHint={trainer.handleRequestHint}
              onUndoLastMovePair={trainer.undoLastMovePair}
              mode={trainer.mode}
              isEngineThinking={trainer.isEngineThinking}
              isEngineMoveScheduled={trainer.isEngineMoveScheduled}
              evaluation={trainer.evaluation}
              selectedSquare={trainer.selectedSquare}
              captureAnimationSquare={trainer.captureAnimationSquare}
              chessboardOptions={trainer.chessboardOptions}
              isMobileLayout={isMobileLayout}
              mobileControlView={isMobileLayout ? "main" : "full"}
            />
          ) : null}

          {isMobileLayout && activeMobileTab === "options" ? (
            <section className="board-panel mobile-options-panel">
              <h2 className="sidebar-title">{t("app.tab.options")}</h2>
              <ControlPanel
                filteredOpenings={trainer.filteredOpenings}
                selectedOpeningId={trainer.selectedOpeningId}
                setSelectedOpeningId={trainer.setSelectedOpeningId}
                playerColor={trainer.playerColor}
                setPlayerColor={trainer.setPlayerColor}
                selectedEngine={trainer.selectedEngine}
                setSelectedEngine={trainer.setSelectedEngine}
                engineElo={trainer.engineElo}
                setEngineElo={trainer.setEngineElo}
                onLoadOpening={trainer.loadOpening}
                onStartFreeTraining={trainer.startFreeTraining}
                onResetTraining={trainer.resetTraining}
                onRequestHint={trainer.handleRequestHint}
                onUndoLastMovePair={trainer.undoLastMovePair}
                mode={trainer.mode}
                isEngineThinking={trainer.isEngineThinking}
                isEngineMoveScheduled={trainer.isEngineMoveScheduled}
                isMobileLayout={isMobileLayout}
                mobileView="options"
              />
            </section>
          ) : null}

          {isMobileLayout && activeMobileTab === "status" ? (
            <div className="mobile-panel-stack">
              {sessionPanel}
              {statusPanel}
            </div>
          ) : null}

          {isMobileLayout && activeMobileTab === "stats" ? (
            <div className="mobile-panel-stack">{statsPanel}</div>
          ) : null}
        </div>

        {!isMobileLayout ? (
          <aside className="sidebar-panel">
            {sessionPanel}
            {statusPanel}
            {statsPanel}
          </aside>
        ) : null}
      </div>

      {isMobileLayout ? (
        <nav className="mobile-tabbar" aria-label={t("app.mobileNav")}>
          {mobileTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`mobile-tabbar-button${activeMobileTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveMobileTab(tab.id)}
              aria-pressed={activeMobileTab === tab.id}
            >
              <span className="mobile-tabbar-icon" aria-hidden="true">
                <MobileTabIcon tabId={tab.id} />
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

export default App;
