import { getEvaluationPercent, getEvaluationLabel } from "../utils/chessHelpers";
import { useI18n } from "../i18n";

function EvaluationBar({ evaluation, playerColor, isMobileLayout }) {
  const { t } = useI18n();
  const evaluationPercent = getEvaluationPercent(evaluation);
  const isBlackPerspective = playerColor === "black";
  const leadingLabel = isBlackPerspective ? "B" : "C";
  const trailingLabel = isBlackPerspective ? "C" : "B";
  const leadingLabelTitle = leadingLabel === "B" ? t("control.white") : t("control.black");
  const trailingLabelTitle = trailingLabel === "B" ? t("control.white") : t("control.black");

  return (
    <div className={`eval-bar-wrap${isMobileLayout ? " eval-bar-wrap-horizontal" : ""}`}>
      <div
        className={`eval-label eval-label-leading${isMobileLayout ? " eval-label-horizontal" : ""}`}
        title={leadingLabelTitle}
      >
        {leadingLabel}
      </div>

      <div
        className={`eval-bar${isBlackPerspective ? " eval-bar-black-perspective" : " eval-bar-white-perspective"}${isMobileLayout ? " eval-bar-horizontal" : " eval-bar-vertical"}`}
      >
        <div
          className="eval-bar-fill"
          style={{
            "--eval-fill-size": `${evaluationPercent}%`
          }}
        />
        <div className="eval-marker">{getEvaluationLabel(evaluation)}</div>
      </div>

      <div
        className={`eval-label eval-label-trailing${isMobileLayout ? " eval-label-horizontal" : ""}`}
        title={trailingLabelTitle}
      >
        {trailingLabel}
      </div>
    </div>
  );
}

export default EvaluationBar;
