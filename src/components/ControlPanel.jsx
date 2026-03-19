import { memo, useState } from "react";
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
  isMobileLayout,
  mobileView = "main"
}) {
  const { t } = useI18n();
  const [isOpeningChooserVisible, setIsOpeningChooserVisible] = useState(false);
  const runtimePlatform = getRuntimePlatform();
  const engineOptions = getEngineOptionAvailability(runtimePlatform);
  const hasEngineSupport = hasEngineSupportOnPlatform(runtimePlatform);
  const isMobileMainView = isMobileLayout && mobileView === "main";
  const isMobileOptionsView = isMobileLayout && mobileView === "options";
  const shouldShowOpeningControls = !isMobileLayout || isOpeningChooserVisible;
  const shouldShowPrimaryControls = !isMobileLayout || isMobileMainView;
  const shouldShowAdvancedControls = !isMobileLayout || isMobileOptionsView;

  function handleOpeningChange(nextOpeningId) {
    setSelectedOpeningId(nextOpeningId);
    setIsOpeningChooserVisible(false);
    onLoadOpening(nextOpeningId);
  }

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

      <div className="about-card">
        <div className="about-card-title">{t("about.title")}</div>
        <p className="about-card-text">{t("about.summary")}</p>
      </div>

      {!isMobileLayout ? (
        <div className="button-row">
          <button className="app-button" onClick={onRequestHint}>
            {t("control.showHint")}
          </button>

          <button
            className="app-button danger"
            onClick={onUndoLastMovePair}
            disabled={mode === "opening" || isEngineThinking || isEngineMoveScheduled}
          >
            {t("control.undoMove")}
          </button>
        </div>
      ) : null}
    </>
  );

  return (
    <>
      {shouldShowPrimaryControls ? (
        <>
          {shouldShowOpeningControls ? (
            <div className={`toolbar-grid${isMobileLayout ? " toolbar-grid-mobile-main" : ""}`}>
              <div className="control-group">
                <label className="control-label">{t("control.opening")}</label>
                <div className="opening-picker-row">
                  <select
                    value={selectedOpeningId}
                    onChange={(e) => handleOpeningChange(e.target.value)}
                    className="app-select"
                    disabled={filteredOpenings.length === 0}
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
          ) : null}

          {!isMobileLayout ? (
            <div className="button-row">
              <button className="app-button primary" onClick={() => onLoadOpening(selectedOpeningId)}>
                {t("control.trainOpening")}
              </button>

              <button className="app-button" onClick={onStartFreeTraining}>
                {t("control.freeTraining")}
              </button>

              <button className="app-button" onClick={onResetTraining}>
                {t("control.reset")}
              </button>
            </div>
          ) : (
            <>
              <div className="button-row button-row-mobile-primary button-row-mobile-training">
                <button
                  className="app-button primary"
                  onClick={() => {
                    if (isOpeningChooserVisible) {
                      setIsOpeningChooserVisible(false);
                      onLoadOpening(selectedOpeningId);
                      return;
                    }

                    setIsOpeningChooserVisible(true);
                  }}
                >
                  {t("control.trainOpening")}
                </button>
              </div>

              <div className="button-row button-row-mobile-secondary button-row-mobile-training-secondary">
                <button
                  className="app-button"
                  onClick={() => {
                    setIsOpeningChooserVisible(false);
                    onStartFreeTraining();
                  }}
                >
                  {t("control.freeTraining")}
                </button>

                <button className="app-button" onClick={onResetTraining}>
                  {t("control.reset")}
                </button>
              </div>
            </>
          )}
        </>
      ) : null}

      {shouldShowAdvancedControls ? advancedControls : null}
    </>
  );
}

export default memo(ControlPanel);
