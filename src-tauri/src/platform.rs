use std::fs;
use std::path::PathBuf;

use tauri::Manager;

const OPENINGS_DB_BYTES: &[u8] = include_bytes!("../resources/db/openings.db");

fn get_resource_path(app: &tauri::AppHandle, parts: &[&str]) -> Result<PathBuf, String> {
    let mut path = app
        .path()
        .resource_dir()
        .map_err(|error| format!("Nie udało się odczytać resource_dir: {error}"))?;

    for part in parts {
        path = path.join(part);
    }

    Ok(path)
}

fn get_dev_path(parts: &[&str]) -> PathBuf {
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));

    for part in parts {
        path = path.join(part);
    }

    path
}

fn find_existing_path(app: &tauri::AppHandle, candidates: &[&[&str]]) -> Result<PathBuf, String> {
    for candidate in candidates {
        let bundled_path = get_resource_path(app, candidate)?;
        if bundled_path.exists() {
            return Ok(bundled_path);
        }

        let dev_path = get_dev_path(candidate);
        if dev_path.exists() {
            return Ok(dev_path);
        }
    }

    Err(format!(
        "Nie znaleziono zasobu. Sprawdzono kandydaty: {}",
        candidates
            .iter()
            .map(|candidate| candidate.join("/"))
            .collect::<Vec<_>>()
            .join(", ")
    ))
}

pub fn get_database_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let mut writable_path = app
        .path()
        .app_local_data_dir()
        .map_err(|error| format!("Nie udało się odczytać katalogu danych aplikacji: {error}"))?;
    writable_path = writable_path.join("db").join("openings.db");

    if writable_path.exists() {
        return Ok(writable_path);
    }

    if let Some(parent) = writable_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Nie udało się utworzyć katalogu bazy danych: {error}"))?;
    }

    if let Ok(source_path) = find_existing_path(
        app,
        &[&["resources", "db", "openings.db"], &["db", "openings.db"]],
    ) {
        if fs::copy(&source_path, &writable_path).is_ok() {
            return Ok(writable_path);
        }
    }

    fs::write(&writable_path, OPENINGS_DB_BYTES).map_err(|error| {
        format!(
            "Nie udało się zapisać wbudowanej bazy {}: {error}",
            writable_path.display()
        )
    })?;

    Ok(writable_path)
}

pub fn get_stockfish_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    if !cfg!(target_os = "windows") {
        return Err("Stockfish ma obecnie tylko desktopową implementację dla Windows.".to_string());
    }

    find_existing_path(
        app,
        &[
            &["resources", "engines", "windows", "stockfish.exe"],
            &["stockfish.exe"],
        ],
    )
}

pub fn get_lc0_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    if !cfg!(target_os = "windows") {
        return Err("Silnik Maia jest dostępny tylko na desktopie Windows.".to_string());
    }

    find_existing_path(
        app,
        &[&["resources", "engines", "windows", "lc0.exe"], &["lc0.exe"]],
    )
}

pub fn get_maia_weights_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    if !cfg!(target_os = "windows") {
        return Err("Silnik Maia jest dostępny tylko na desktopie Windows.".to_string());
    }

    find_existing_path(
        app,
        &[
            &["resources", "engines", "windows", "maia.pb.gz"],
            &["maia.pb.gz"],
        ],
    )
}
