use super::capabilities;
use super::maia;
use super::stockfish;
use crate::models::Evaluation;

pub fn run_engine_move(
    app: &tauri::AppHandle,
    fen: &str,
    elo: Option<u32>,
    engine_id: Option<&str>,
) -> Result<(String, &'static str, &'static str), String> {
    let resolved_engine = capabilities::require_supported_engine(engine_id)?;

    let best_move = match resolved_engine {
        maia::MAIA_ID => maia::run_move(app, fen, elo)?,
        _ => stockfish::run_bestmove(
            app,
            fen,
            None,
            Some(stockfish::STOCKFISH_DEFAULT_MOVE_TIME_MS),
            elo,
        )?,
    };

    Ok((
        best_move,
        resolved_engine,
        capabilities::get_engine_label(resolved_engine),
    ))
}

pub fn run_bestmoves(
    app: &tauri::AppHandle,
    fen: &str,
    count: usize,
) -> Result<Vec<String>, String> {
    stockfish::run_bestmoves(
        app,
        fen,
        Some(stockfish::STOCKFISH_DEFAULT_BESTMOVE_DEPTH),
        count,
    )
}

pub fn run_evaluation(app: &tauri::AppHandle, fen: &str) -> Result<Evaluation, String> {
    stockfish::run_evaluation(
        app,
        fen,
        Some(stockfish::STOCKFISH_DEFAULT_EVALUATION_DEPTH),
    )
}

pub fn run_opening_analysis_bestmove(
    app: &tauri::AppHandle,
    fen: &str,
) -> Result<String, String> {
    stockfish::run_bestmove(
        app,
        fen,
        Some(stockfish::STOCKFISH_DEFAULT_BESTMOVE_DEPTH),
        None,
        None,
    )
}
