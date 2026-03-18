import { useState } from "react";
import { useI18n } from "../i18n";
import {
  ENGINE_ELO_OPTIONS,
  getEngineOptionAvailability,
  hasEngineSupportOnPlatform
} from "../constants/engines";
import { getRuntimePlatform } from "../platform/runtime";

function ControlPanel({
  filteredOpenings,
  selectedOpeningId,
  setSelectedOpeningId,
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
  isMobileLayout
}) {
  const { t } = useI18n();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const runtimePlatform = getRuntimePlatform();
  const engineOptions = getEngineOptionAvailability(runtimePlatform);
  const hasEngineSupport = hasEngineSupportOnPlatform(runtimePlatform);

  const advancedControls = (
    <>
      <div className={`toolbar-grid${isMobileLayout ? " toolbar-grid-mobile-options" : ""}`}>
        <div className="control-group">
          <label className="control-label">{t("control.engine")}</label>
          <select
            value={selectedEngine}
            onChange={(e) => setSelectedEngine(e.target.value)}
            className="app-select"
            disabled={!hasEngineSupport}
          >
            {engineOptions.map((engine) => {
              const label =
                engine.id === "stockfish"
                  ? t("control.stockfishOption")
                  : t("control.maiaOption");

              return (
                <option key={engine.id} value={engine.id} disabled={!engine.isAvailable}>
                  {engine.isAvailable ? label : `${label} (${t("control.desktopOnly")})`}
                </option>
              );
            })}
          </select>
        </div>

        <div className="control-group">
          <label className="control-label">{t("control.engineLevel")}</label>
          <select
            value={engineElo}
            onChange={(e) => setEngineElo(Number(e.target.value))}
            className="app-select"
            disabled={!hasEngineSupport || selectedEngine !== "stockfish"}
          >
            {ENGINE_ELO_OPTIONS.map((elo) => (
              <option key={elo} value={elo}>
                Stockfish {elo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!hasEngineSupport ? <div className="control-note">{t("control.mobileNoEngine")}</div> : null}

      <div className={`button-row${isMobileLayout ? " button-row-mobile-secondary" : ""}`}>
        <button className="app-button" onClick={onResetTraining}>
          {t("control.reset")}
        </button>

        {!isMobileLayout ? (
          <button className="app-button" onClick={onRequestHint}>
            {t("control.showHint")}
          </button>
        ) : null}

        {!isMobileLayout ? (
          <button
            className="app-button danger"
            onClick={onUndoLastMovePair}
            disabled={mode !== "play" || isEngineThinking || isEngineMoveScheduled}
          >
            {t("control.undoMove")}
          </button>
        ) : null}
      </div>
    </>
  );

  return (
    <>
      <div className={`toolbar-grid${isMobileLayout ? " toolbar-grid-mobile-main" : ""}`}>
        <div className="control-group">
          <label className="control-label">{t("control.opening")}</label>
          <div className="opening-picker-row">
            <select
              value={selectedOpeningId}
              onChange={(e) => setSelectedOpeningId(e.target.value)}
              className="app-select"
            >
              {filteredOpenings.map((opening) => (
                <option key={opening.id} value={opening.id}>
                  {opening.name}
                </option>
              ))}
            </select>

            <div className="color-toggle-group" role="group" aria-label={t("control.chooseColor")}>
              <button
                type="button"
                className={`color-toggle-button color-toggle-button-light${playerColor === "white" ? " active" : ""}`}
                onClick={() => setPlayerColor("white")}
                aria-pressed={playerColor === "white"}
                title={t("control.white")}
              >
                B
              </button>

              <button
                type="button"
                className={`color-toggle-button color-toggle-button-dark${playerColor === "black" ? " active" : ""}`}
                onClick={() => setPlayerColor("black")}
                aria-pressed={playerColor === "black"}
                title={t("control.black")}
              >
                C
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`button-row${isMobileLayout ? " button-row-mobile-primary" : ""}`}>
        <button className="app-button primary" onClick={onLoadOpening}>
          {t("control.loadOpening")}
        </button>

        <button className="app-button" onClick={onStartFreeTraining}>
          {t("control.freeTraining")}
        </button>

        {isMobileLayout ? (
          <button
            type="button"
            className="app-button mobile-options-button"
            onClick={() => setIsOptionsOpen((value) => !value)}
            aria-expanded={isOptionsOpen}
          >
            {isOptionsOpen ? t("control.hideOptions") : t("control.options")}
          </button>
        ) : null}
      </div>

      {!isMobileLayout || isOptionsOpen ? advancedControls : null}
    </>
  );
}

export default ControlPanel;
