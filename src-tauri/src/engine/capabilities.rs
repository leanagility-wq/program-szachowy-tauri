use super::maia;
use super::stockfish;

pub fn require_supported_engine(engine_id: Option<&str>) -> Result<&'static str, String> {
    match engine_id {
        None | Some(stockfish::STOCKFISH_ID) => Ok(stockfish::STOCKFISH_ID),
        Some(maia::MAIA_ID) => {
            if cfg!(target_os = "android") {
                Err("Silnik Maia jest dostępny tylko na desktopie.".to_string())
            } else {
                Ok(maia::MAIA_ID)
            }
        }
        Some(other) => Err(format!("Nieznany silnik: {other}")),
    }
}

pub fn get_engine_label(engine_id: &str) -> &'static str {
    match engine_id {
        maia::MAIA_ID => maia::MAIA_LABEL,
        _ => stockfish::STOCKFISH_LABEL,
    }
}
