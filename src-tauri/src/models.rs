use serde::Serialize;

#[derive(Serialize)]
pub struct OpeningListItem {
    pub id: String,
    pub name: String,
    pub level: String,
    pub side: String,
}

#[derive(Serialize)]
pub struct OpeningDetails {
    pub id: String,
    pub name: String,
    pub level: String,
    pub side: String,
    pub moves: Vec<String>,
}

#[derive(Clone, Serialize)]
pub struct Evaluation {
    #[serde(rename = "type")]
    pub evaluation_type: String,
    pub value: i32,
}

#[derive(Serialize)]
pub struct BestMoveResponse {
    #[serde(rename = "bestMove")]
    pub best_move: String,
    #[serde(rename = "bestMoves")]
    pub best_moves: Vec<String>,
}

#[derive(Serialize)]
pub struct EngineMoveResponse {
    #[serde(rename = "bestMove")]
    pub best_move: String,
    pub engine: String,
    #[serde(rename = "engineLabel")]
    pub engine_label: String,
}

#[derive(Serialize)]
pub struct EvaluationResponse {
    pub evaluation: Evaluation,
}

#[derive(Serialize)]
pub struct OpeningMoveAnalysisResponse {
    #[serde(rename = "bestMove")]
    pub best_move: String,
    #[serde(rename = "evaluationBefore")]
    pub evaluation_before: Evaluation,
    #[serde(rename = "evaluationAfter")]
    pub evaluation_after: Evaluation,
    pub score: i32,
}
