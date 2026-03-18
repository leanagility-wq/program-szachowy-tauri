use std::fs;
use std::path::PathBuf;

#[cfg(target_os = "android")]
use std::os::unix::fs::PermissionsExt;

use tauri::Manager;

const OPENINGS_DB_BYTES: &[u8] = include_bytes!("../resources/db/openings.db");
#[cfg(all(target_os = "android", target_arch = "aarch64"))]
const STOCKFISH_ANDROID_ARM64_BYTES: &[u8] =
    include_bytes!("../resources/engines/android/arm64-v8a/stockfish");

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
        return Ok(writable_path);
    }

    ensure_parent_dir(&writable_path, "bazy danych")?;

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
        return prepare_android_stockfish_binary(app);
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
fn android_stockfish_abi_dir() -> &'static str {
    #[cfg(target_arch = "aarch64")]
    {
        "arm64-v8a"
    }
    #[cfg(target_arch = "arm")]
    {
        "armeabi-v7a"
    }
    #[cfg(target_arch = "x86_64")]
    {
        "x86_64"
    }
    #[cfg(target_arch = "x86")]
    {
        "x86"
    }
}

#[cfg(target_os = "android")]
fn prepare_android_stockfish_binary(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let abi_dir = android_stockfish_abi_dir();
    let mut writable_path = app
        .path()
        .app_local_data_dir()
        .map_err(|error| format!("Nie udało się odczytać katalogu danych aplikacji: {error}"))?;
    writable_path = writable_path
        .join("engines")
        .join("android")
        .join(abi_dir)
        .join("stockfish");

    if writable_path.exists() {
        ensure_android_executable_permissions(&writable_path)?;
        return Ok(writable_path);
    }

    ensure_parent_dir(&writable_path, "silnika Android")?;

    let bytes = get_android_stockfish_bytes(abi_dir)?;
    fs::write(&writable_path, bytes).map_err(|error| {
        format!(
            "Nie udało się zapisać androidowego Stockfisha {}: {error}",
            writable_path.display()
        )
    })?;

    ensure_android_executable_permissions(&writable_path)?;

    Ok(writable_path)
}

#[cfg(target_os = "android")]
fn get_android_stockfish_bytes(_abi_dir: &str) -> Result<&'static [u8], String> {
    #[cfg(target_arch = "aarch64")]
    {
        return Ok(STOCKFISH_ANDROID_ARM64_BYTES);
    }

    #[cfg(not(target_arch = "aarch64"))]
    {
        Err(format!(
            "Brak wbudowanej binarki Stockfisha dla tego ABI. Dodaj odpowiedni plik do src-tauri/resources/engines/android/<abi>/stockfish i przebuduj APK."
        ))
    }
}

#[cfg(target_os = "android")]
fn ensure_android_executable_permissions(path: &PathBuf) -> Result<(), String> {
    let metadata = fs::metadata(path)
        .map_err(|error| format!("Nie udało się odczytać metadanych silnika {}: {error}", path.display()))?;
    let mut permissions = metadata.permissions();
    permissions.set_mode(0o755);
    fs::set_permissions(path, permissions).map_err(|error| {
        format!(
            "Nie udało się ustawić praw wykonywania dla silnika {}: {error}",
            path.display()
        )
    })
}
