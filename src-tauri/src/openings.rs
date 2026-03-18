use rusqlite::{params, Connection};

use crate::models::{OpeningDetails, OpeningListItem};
use crate::platform;

pub fn fetch_openings(app: &tauri::AppHandle) -> Result<Vec<OpeningListItem>, String> {
    let db_path = platform::get_database_path(app)?;
    let conn = Connection::open(&db_path)
        .map_err(|e| format!("Nie udało się otworzyć bazy {}: {e}", db_path.display()))?;

    let mut stmt = conn
        .prepare("SELECT id, name, level, side FROM openings ORDER BY name")
        .map_err(|e| format!("Błąd przygotowania zapytania: {e}"))?;

    let rows = stmt
        .query_map([], |row| {
            Ok(OpeningListItem {
                id: row.get(0)?,
                name: row.get(1)?,
                level: row.get(2)?,
                side: row.get(3)?,
            })
        })
        .map_err(|e| format!("Błąd pobierania listy otwarć: {e}"))?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row.map_err(|e| format!("Błąd mapowania wiersza: {e}"))?);
    }

    Ok(result)
}

pub fn fetch_opening_by_id(app: &tauri::AppHandle, id: String) -> Result<OpeningDetails, String> {
    let db_path = platform::get_database_path(app)?;
    let conn = Connection::open(&db_path)
        .map_err(|e| format!("Nie udało się otworzyć bazy {}: {e}", db_path.display()))?;

    let mut stmt = conn
        .prepare("SELECT id, name, level, side, moves FROM openings WHERE id = ?")
        .map_err(|e| format!("Błąd przygotowania zapytania: {e}"))?;

    let row = stmt.query_row(params![id], |row| {
        let moves_json: String = row.get(4)?;
        let moves: Vec<String> = serde_json::from_str(&moves_json).map_err(|_| {
            rusqlite::Error::FromSqlConversionFailure(
                moves_json.len(),
                rusqlite::types::Type::Text,
                Box::<dyn std::error::Error + Send + Sync>::from("Nieprawidłowy JSON w polu moves"),
            )
        })?;

        Ok(OpeningDetails {
            id: row.get(0)?,
            name: row.get(1)?,
            level: row.get(2)?,
            side: row.get(3)?,
            moves,
        })
    });

    match row {
        Ok(opening) => Ok(opening),
        Err(rusqlite::Error::QueryReturnedNoRows) => Err("Nie znaleziono otwarcia".to_string()),
        Err(e) => Err(format!("Błąd pobierania otwarcia: {e}")),
    }
}
