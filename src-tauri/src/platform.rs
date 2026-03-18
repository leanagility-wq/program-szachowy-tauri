use std::fs;
use std::path::PathBuf;

use tauri::Manager;

const OPENINGS_DB_BYTES: &[u8] = include_bytes!("../resources/db/openings.db");

fn log_platform(message: &str) {
    eprintln!("[platform] {message}");
}

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

fn ensure_parent_dir(path: &PathBuf, label: &str) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Nie udało się utworzyć katalogu {label}: {error}"))?;
    }

    Ok(())
}

pub fn get_database_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let mut writable_path = app
        .path()
        .app_local_data_dir()
        .map_err(|error| format!("Nie udało się odczytać katalogu danych aplikacji: {error}"))?;
    writable_path = writable_path.join("db").join("openings.db");

    if writable_path.exists() {
        log_platform(&format!("database path existing={}", writable_path.display()));
        return Ok(writable_path);
    }

    ensure_parent_dir(&writable_path, "bazy danych")?;

    if let Ok(source_path) = find_existing_path(
        app,
        &[&["resources", "db", "openings.db"], &["db", "openings.db"]],
    ) {
        if fs::copy(&source_path, &writable_path).is_ok() {
            log_platform(&format!(
                "database copied from {} to {}",
                source_path.display(),
                writable_path.display()
            ));
            return Ok(writable_path);
        }
    }

    fs::write(&writable_path, OPENINGS_DB_BYTES).map_err(|error| {
        format!(
            "Nie udało się zapisać wbudowanej bazy {}: {error}",
            writable_path.display()
        )
    })?;

    log_platform(&format!(
        "database written from embedded bytes to {}",
        writable_path.display()
    ));

    Ok(writable_path)
}

pub fn get_stockfish_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    #[cfg(target_os = "windows")]
    {
        return find_existing_path(
            app,
            &[
                &["resources", "engines", "windows", "stockfish.exe"],
                &["stockfish.exe"],
            ],
        );
    }

    #[cfg(target_os = "android")]
    {
        return get_android_stockfish_path(app);
    }

    #[cfg(not(any(target_os = "windows", target_os = "android")))]
    Err("Stockfish ma obecnie tylko przygotowaną implementację dla Windows i Androida.".to_string())
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

#[cfg(target_os = "android")]
fn get_android_stockfish_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    if let Some(native_lib_dir) = detect_android_native_lib_dir_from_env() {
        let stockfish_path = native_lib_dir.join("libstockfish.so");
        if stockfish_path.exists() {
            log_platform(&format!(
                "android stockfish path resolved from LD_LIBRARY_PATH={}",
                stockfish_path.display()
            ));
            return Ok(stockfish_path);
        }

        log_platform(&format!(
            "android LD_LIBRARY_PATH dir detected, but libstockfish.so missing: {}",
            stockfish_path.display()
        ));
    }

    if let Some(native_lib_dir) = detect_android_native_lib_dir() {
        let stockfish_path = native_lib_dir.join("libstockfish.so");
        if stockfish_path.exists() {
            log_platform(&format!(
                "android stockfish path resolved from /proc/self/maps={}",
                stockfish_path.display()
            ));
            return Ok(stockfish_path);
        }

        log_platform(&format!(
            "android native lib dir detected, but libstockfish.so missing: {}",
            stockfish_path.display()
        ));
    }

    let current_binary = tauri::process::current_binary(&app.env()).map_err(|error| {
        format!("Nie udało się ustalić ścieżki do natywnej biblioteki aplikacji: {error}")
    })?;

    log_platform(&format!(
        "android current binary path fallback={}",
        current_binary.display()
    ));

    let native_lib_dir = current_binary.parent().ok_or_else(|| {
        "Nie udało się ustalić katalogu natywnych bibliotek aplikacji.".to_string()
    })?;

    let stockfish_path = native_lib_dir.join("libstockfish.so");
    if stockfish_path.exists() {
        log_platform(&format!(
            "android stockfish path resolved from fallback={}",
            stockfish_path.display()
        ));
        return Ok(stockfish_path);
    }

    Err(format!(
        "Nie znaleziono androidowej binarki Stockfisha. Ostatnio sprawdzona ścieżka: {}",
        stockfish_path.display()
    ))
}

#[cfg(target_os = "android")]
fn detect_android_native_lib_dir_from_env() -> Option<PathBuf> {
    let value = std::env::var("LD_LIBRARY_PATH").ok()?;
    log_platform(&format!("android LD_LIBRARY_PATH={value}"));

    for part in value.split(':') {
        let candidate = PathBuf::from(part);
        if candidate.join("libstockfish.so").exists() {
            log_platform(&format!(
                "android native lib dir detected from LD_LIBRARY_PATH={}",
                candidate.display()
            ));
            return Some(candidate);
        }
    }

    None
}

#[cfg(target_os = "android")]
fn detect_android_native_lib_dir() -> Option<PathBuf> {
    let maps = fs::read_to_string("/proc/self/maps").ok()?;

    for line in maps.lines() {
        if !line.contains("libapp_lib.so") {
            continue;
        }

        let path = line.split_whitespace().last()?;
        if !path.starts_with('/') {
            continue;
        }

        let path = PathBuf::from(path);
        let parent = path.parent()?.to_path_buf();
        log_platform(&format!(
            "android native lib dir detected from /proc/self/maps={}",
            parent.display()
        ));
        return Some(parent);
    }

    log_platform("android native lib dir not found in /proc/self/maps");
    None
}
