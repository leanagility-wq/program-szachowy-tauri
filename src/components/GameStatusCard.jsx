import { useI18n } from "../i18n";

function GameStatusCard({ status, hint, bestMove, bestMoves = [] }) {
  const { t } = useI18n();
  const bestMoveLabel =
    bestMoves.length > 1 ? bestMoves.join(", ") : bestMove ? t("status.shownOnBoard") : "-";

  return (
    <div className="sidebar-card">
      <div className="sidebar-title">{t("app.section.gameStatus")}</div>
      <div className="info-table">
        <div className="info-row">
          <span>{t("status.status")}</span>
          <strong>{status}</strong>
        </div>
        <div className="info-row">
          <span>{t("status.hint")}</span>
          <strong>{hint && hint !== "-" ? t("status.hintShownOnBoard") : "-"}</strong>
        </div>
        <div className="info-row">
          <span>{t("status.bestMove")}</span>
          <strong>{bestMoveLabel}</strong>
        </div>
      </div>
    </div>
  );
}

export default GameStatusCard;
