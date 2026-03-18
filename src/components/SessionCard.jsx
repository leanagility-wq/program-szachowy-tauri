import { useI18n } from "../i18n";

function SessionCard({
  openingName,
  playerColor,
  mode,
  moveIndex,
  totalAttempts,
  maxScoringMoves
}) {
  const { t } = useI18n();

  const modeLabel =
    mode === "opening"
      ? t("session.trainingOpening")
      : mode === "free"
        ? t("session.trainingFree")
        : t("session.playContinue");

  return (
    <div className="sidebar-card">
      <div className="sidebar-title">{t("app.section.session")}</div>
      <div className="info-table">
        <div className="info-row">
          <span>{t("session.opening")}</span>
          <strong>{openingName || "-"}</strong>
        </div>
        <div className="info-row">
          <span>{t("session.yourColor")}</span>
          <strong>{playerColor === "white" ? t("control.white") : t("control.black")}</strong>
        </div>
        <div className="info-row">
          <span>{t("session.mode")}</span>
          <strong>{modeLabel}</strong>
        </div>
        <div className="info-row">
          <span>{mode === "free" ? t("session.progressScore") : t("session.progressMove")}</span>
          <strong>
            {mode === "free" ? `${totalAttempts}/${maxScoringMoves}` : moveIndex}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default SessionCard;
