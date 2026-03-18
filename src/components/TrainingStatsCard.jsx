import { useI18n } from "../i18n";

function TrainingStatsCard({
  bookCount,
  correctCount,
  wrongCount,
  totalAttempts,
  accuracy,
  mode,
  maxScoringMoves
}) {
  const { t } = useI18n();
  const isFreeMode = mode === "free";

  return (
    <div className="sidebar-card">
      <div className="sidebar-title">
        {isFreeMode ? t("stats.freeTitle") : t("stats.trainingTitle")}
      </div>
      <div className="info-table">
        {isFreeMode ? (
          <>
            <div className="info-row">
              <span>{t("stats.bookMoves")}</span>
              <strong>{bookCount}</strong>
            </div>
            <div className="info-row">
              <span>{t("stats.goodMoves")}</span>
              <strong>{correctCount}</strong>
            </div>
            <div className="info-row">
              <span>{t("stats.weakerMoves")}</span>
              <strong>{wrongCount}</strong>
            </div>
          </>
        ) : (
          <>
            <div className="info-row">
              <span>{t("stats.correct")}</span>
              <strong>{correctCount}</strong>
            </div>
            <div className="info-row">
              <span>{t("stats.wrong")}</span>
              <strong>{wrongCount}</strong>
            </div>
          </>
        )}
        <div className="info-row">
          <span>{isFreeMode ? t("stats.evaluatedMoves") : t("stats.total")}</span>
          <strong>
            {isFreeMode ? `${totalAttempts}/${maxScoringMoves}` : totalAttempts}
          </strong>
        </div>
        <div className="info-row">
          <span>{isFreeMode ? t("stats.scoring") : t("stats.accuracy")}</span>
          <strong>{accuracy}%</strong>
        </div>
      </div>
    </div>
  );
}

export default TrainingStatsCard;
