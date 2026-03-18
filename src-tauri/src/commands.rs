use crate::chess_logic::{apply_uci_move_to_fen, get_opening_move_score};
use crate::engine::router;
use crate::models::{
    BestMoveResponse, EngineMoveResponse, EvaluationResponse, OpeningMoveAnalysisResponse,
};
use crate::openings;

fn ensure_non_empty(value: &str, field_name: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        return Err(format!("Brak pola {field_name}"));
    }

    Ok(())
}

fn ensure_player_color(player_color: &str) -> Result<(), String> {
    match player_color {
        "white" | "black" => Ok(()),
        _ => Err("Nieprawidłowy kolor gracza".to_string()),
    }
}

#[tauri::command]
pub fn fetch_openings(app: tauri::AppHandle) -> Result<Vec<crate::models::OpeningListItem>, String> {
    openings::fetch_openings(&app)
}

#[tauri::command]
pub fn fetch_opening_by_id(
    app: tauri::AppHandle,
    id: String,
) -> Result<crate::models::OpeningDetails, String> {
    openings::fetch_opening_by_id(&app, id)
}

#[tauri::command]
pub fn fetch_best_move(app: tauri::AppHandle, fen: String) -> Result<BestMoveResponse, String> {
    ensure_non_empty(&fen, "fen")?;

    let best_moves = router::run_bestmoves(&app, &fen, 3)?;
    let best_move = best_moves.first().cloned().unwrap_or_default();

    Ok(BestMoveResponse {
        best_move,
        best_moves,
    })
}

#[tauri::command]
pub fn fetch_engine_move(
    app: tauri::AppHandle,
    fen: String,
    elo: Option<u32>,
    engine: Option<String>,
) -> Result<EngineMoveResponse, String> {
    ensure_non_empty(&fen, "fen")?;

    let (best_move, engine_id, engine_label) =
        router::run_engine_move(&app, &fen, elo, engine.as_deref())?;

    Ok(EngineMoveResponse {
        best_move,
        engine: engine_id.to_string(),
        engine_label: engine_label.to_string(),
    })
}

#[tauri::command]
pub fn fetch_evaluation(
    app: tauri::AppHandle,
    fen: String,
) -> Result<EvaluationResponse, String> {
    ensure_non_empty(&fen, "fen")?;

    let evaluation = router::run_evaluation(&app, &fen)?;

    Ok(EvaluationResponse { evaluation })
}

#[tauri::command]
pub fn fetch_opening_move_analysis(
    app: tauri::AppHandle,
    fen: String,
    #[allow(non_snake_case)] playedMove: String,
    #[allow(non_snake_case)] playerColor: String,
) -> Result<OpeningMoveAnalysisResponse, String> {
    ensure_non_empty(&fen, "fen")?;
    ensure_non_empty(&playedMove, "playedMove")?;
    ensure_non_empty(&playerColor, "playerColor")?;
    ensure_player_color(&playerColor)?;

    let next_fen = apply_uci_move_to_fen(&fen, &playedMove)?;
    let best_move = router::run_opening_analysis_bestmove(&app, &fen)?;
    let evaluation_before = router::run_evaluation(&app, &fen)?;
    let evaluation_after = router::run_evaluation(&app, &next_fen)?;

    let score = get_opening_move_score(
        &best_move,
        &playedMove,
        &evaluation_before,
        &evaluation_after,
        &playerColor,
    );

    Ok(OpeningMoveAnalysisResponse {
        best_move,
        evaluation_before,
        evaluation_after,
        score,
    })
}
