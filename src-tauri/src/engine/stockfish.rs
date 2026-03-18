use crate::engine::uci::{self, BestMoveRequest, SearchLimit, UciEngineConfig};
use crate::models::Evaluation;
use crate::platform;

pub const STOCKFISH_ID: &str = "stockfish";
pub const STOCKFISH_LABEL: &str = "Stockfish";
pub const STOCKFISH_DEFAULT_MOVE_TIME_MS: u64 = 300;
pub const STOCKFISH_DEFAULT_BESTMOVE_DEPTH: u32 = 12;
pub const STOCKFISH_DEFAULT_EVALUATION_DEPTH: u32 = 10;
pub const STOCKFISH_TIMEOUT_MS: u64 = 5_000;

fn get_stockfish_config(app: &tauri::AppHandle) -> Result<UciEngineConfig, String> {
    let binary_path = platform::get_stockfish_path(app)?;

    Ok(UciEngineConfig {
        binary_path,
        binary_label: STOCKFISH_LABEL,
        startup_commands: Vec::new(),
        timeout_ms: STOCKFISH_TIMEOUT_MS,
    })
}

pub fn run_bestmove(
    app: &tauri::AppHandle,
    fen: &str,
    depth: Option<u32>,
    movetime_ms: Option<u64>,
    elo: Option<u32>,
) -> Result<String, String> {
    let config = get_stockfish_config(app)?;
    let search_limit = movetime_ms
        .map(SearchLimit::MoveTime)
        .unwrap_or_else(|| SearchLimit::Depth(depth.unwrap_or(STOCKFISH_DEFAULT_BESTMOVE_DEPTH)));

    uci::run_bestmove(
        &config,
        &BestMoveRequest {
            fen,
            search_limit,
            elo,
        },
    )
}

pub fn run_bestmoves(
    app: &tauri::AppHandle,
    fen: &str,
    depth: Option<u32>,
    count: usize,
) -> Result<Vec<String>, String> {
    let config = get_stockfish_config(app)?;
    uci::run_multipv(
        &config,
        fen,
        depth.unwrap_or(STOCKFISH_DEFAULT_BESTMOVE_DEPTH),
        count,
    )
}

pub fn run_evaluation(
    app: &tauri::AppHandle,
    fen: &str,
    depth: Option<u32>,
) -> Result<Evaluation, String> {
    let config = get_stockfish_config(app)?;
    uci::run_evaluation(
        &config,
        fen,
        depth.unwrap_or(STOCKFISH_DEFAULT_EVALUATION_DEPTH),
    )
}
