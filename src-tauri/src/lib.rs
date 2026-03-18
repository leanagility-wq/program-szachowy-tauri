mod chess_logic;
mod commands;
mod engine;
mod models;
mod openings;
mod platform;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::fetch_openings,
            commands::fetch_opening_by_id,
            commands::fetch_best_move,
            commands::fetch_engine_move,
            commands::fetch_evaluation,
            commands::fetch_opening_move_analysis
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
