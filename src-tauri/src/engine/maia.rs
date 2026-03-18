use crate::engine::uci::{self, BestMoveRequest, SearchLimit, UciEngineConfig};
use crate::platform;

pub const MAIA_ID: &str = "maia";
pub const MAIA_LABEL: &str = "Maia";
pub const MAIA_DEFAULT_MOVE_TIME_MS: u64 = 800;
pub const MAIA_TIMEOUT_MS: u64 = 7_000;

pub fn run_move(
    app: &tauri::AppHandle,
    fen: &str,
    _elo: Option<u32>,
) -> Result<String, String> {
    if cfg!(target_os = "android") {
        return Err(
            "Silnik Maia jest dostępny tylko na desktopie. Na Androidzie użyj Stockfisha."
                .to_string(),
        );
    }

    let weights_path = platform::get_maia_weights_path(app)?;
    let config = UciEngineConfig {
        binary_path: platform::get_lc0_path(app)?,
        binary_label: MAIA_LABEL,
        startup_commands: vec![format!(
            "setoption name WeightsFile value {}",
            weights_path.display()
        )],
        timeout_ms: MAIA_TIMEOUT_MS,
    };

    uci::run_bestmove(
        &config,
        &BestMoveRequest {
            fen,
            search_limit: SearchLimit::MoveTime(MAIA_DEFAULT_MOVE_TIME_MS),
            elo: None,
        },
    )
}
