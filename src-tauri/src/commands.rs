use crate::db::{DatabaseManager, DbIntent};
use crate::io::IoManager;
use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use serde_json::Value;
use std::fs;
use std::sync::Arc;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_dialog::DialogExt;

pub struct AppState {
    pub db: Arc<DatabaseManager>,
    pub io: Arc<IoManager>,
}

#[tauri::command]
pub fn database_stmt(state: State<'_, AppState>, raw: Value) -> i64 {
    let intent: DbIntent = if raw.is_string() {
        match serde_json::from_str(raw.as_str().unwrap_or_default()) {
            Ok(i) => i,
            Err(_) => return -2,
        }
    } else {
        match serde_json::from_value(raw) {
            Ok(i) => i,
            Err(_) => return -2,
        }
    };

    match state.db.execute_stmt(intent) {
        Ok(res) => {
            state.db.save_backup();
            res
        }
        Err(code) => code,
    }
}

#[tauri::command]
pub fn database_query(state: State<'_, AppState>, raw: Value) -> String {
    let intent: DbIntent = if raw.is_string() {
        match serde_json::from_str(raw.as_str().unwrap_or_default()) {
            Ok(i) => i,
            Err(_) => return "[]".to_string(),
        }
    } else {
        match serde_json::from_value(raw) {
            Ok(i) => i,
            Err(_) => return "[]".to_string(),
        }
    };

    state.db.execute_query(intent).unwrap_or_else(|_| "[]".to_string())
}

#[tauri::command]
pub fn io_getsettings(state: State<'_, AppState>) -> String {
    state.io.get_settings()
}

#[tauri::command]
pub fn io_gettextresource(state: State<'_, AppState>, filename: String) -> Option<String> {
    state.io.get_text_resource(&filename)
}

#[tauri::command]
pub fn io_get_is_debug() -> bool {
    false
}

#[tauri::command]
pub fn io_get_lang() -> Option<String> {
    None
}

#[tauri::command]
pub fn io_getfile(state: State<'_, AppState>, name: String) -> Option<String> {
    state.io.read_file(&name)
}

#[tauri::command]
pub fn io_getmedia(state: State<'_, AppState>, name: String) -> Option<String> {
    state.io.read_file(&name)
}

#[tauri::command]
pub fn io_setfile(state: State<'_, AppState>, name: String, contents: String) -> Result<String, String> {
    state.io.write_file(&name, &contents)
}

#[tauri::command]
pub fn io_setmedia(state: State<'_, AppState>, base64_content_str: String, ext: String) -> Result<String, String> {
    state.io.set_media(&base64_content_str, &ext)
}

#[tauri::command]
pub fn io_setmedianame(state: State<'_, AppState>, encoded_data: String, key: String, ext: String) -> Result<String, String> {
    state.io.set_media_name(&encoded_data, &key, &ext)
}

#[tauri::command]
pub fn io_getmd5(data: String) -> String {
    IoManager::get_md5(&data)
}

#[tauri::command]
pub fn io_remove(state: State<'_, AppState>, filename: String) -> bool {
    state.io.remove_file(&filename)
}

#[tauri::command]
pub fn io_cleanassets(state: State<'_, AppState>, file_type: String) -> bool {
    if let Ok(conn) = state.db.conn.lock() {
        state.io.clean_assets(&file_type, &conn)
    } else {
        false
    }
}

#[tauri::command]
pub fn io_get_audio_data(state: State<'_, AppState>, audio_name: String) -> Option<String> {
    state.io.get_audio_data(&audio_name)
}

#[tauri::command]
pub fn app_closed_acked(app: AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.destroy();
    }
}

fn clean_base64_decode(raw: &str) -> Result<Vec<u8>, String> {
    let clean = if let Some(idx) = raw.find(";base64,") {
        &raw[idx + 8..]
    } else if let Some(stripped) = raw.strip_prefix("data:") {
        if let Some(idx) = stripped.find(',') {
            &stripped[idx + 1..]
        } else {
            stripped
        }
    } else {
        raw
    };

    let sanitized: String = clean.chars().filter(|c| !c.is_whitespace()).collect();
    if let Ok(bytes) = BASE64.decode(&sanitized) {
        return Ok(bytes);
    }
    use base64::engine::general_purpose::URL_SAFE;
    if let Ok(bytes) = URL_SAFE.decode(&sanitized) {
        return Ok(bytes);
    }
    BASE64.decode(&sanitized).map_err(|e| format!("Base64 decode error: {e}"))
}

#[tauri::command]
pub async fn save_sjr_file(app: AppHandle, data_b64: String, suggested_name: String) -> Result<Option<String>, String> {
    let clean_name = suggested_name.replace(['\\', '/', ':', '*', '?', '"', '<', '>', '|'], "_");
    let default_file = if clean_name.to_ascii_lowercase().ends_with(".sjr") {
        clean_name
    } else {
        format!("{}.sjr", clean_name)
    };

    use tauri::Manager;
    let file_path = if let Some(w) = app.get_webview_window("main") {
        app.dialog()
            .file()
            .set_parent(&w)
            .add_filter("ScratchJr Project (*.sjr)", &["sjr"])
            .set_file_name(&default_file)
            .blocking_save_file()
    } else {
        app.dialog()
            .file()
            .add_filter("ScratchJr Project (*.sjr)", &["sjr"])
            .set_file_name(&default_file)
            .blocking_save_file()
    };

    if let Some(path) = file_path {
        let path_buf = path.into_path().map_err(|e| e.to_string())?;
        let bytes = clean_base64_decode(&data_b64)?;
        fs::write(&path_buf, bytes).map_err(|e| e.to_string())?;
        Ok(Some(path_buf.to_string_lossy().to_string()))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn save_stage_png(app: AppHandle, data_url: String, suggested_name: String) -> Result<Option<String>, String> {
    let clean_name = suggested_name.replace(['\\', '/', ':', '*', '?', '"', '<', '>', '|'], "_");
    let default_file = if clean_name.to_ascii_lowercase().ends_with(".png") {
        clean_name
    } else {
        format!("{}.png", clean_name)
    };

    use tauri::Manager;
    let file_path = if let Some(w) = app.get_webview_window("main") {
        app.dialog()
            .file()
            .set_parent(&w)
            .add_filter("PNG Image (*.png)", &["png"])
            .set_file_name(&default_file)
            .blocking_save_file()
    } else {
        app.dialog()
            .file()
            .add_filter("PNG Image (*.png)", &["png"])
            .set_file_name(&default_file)
            .blocking_save_file()
    };

    if let Some(path) = file_path {
        let path_buf = path.into_path().map_err(|e| e.to_string())?;
        let bytes = clean_base64_decode(&data_url)?;
        fs::write(&path_buf, bytes).map_err(|e| e.to_string())?;
        Ok(Some(path_buf.to_string_lossy().to_string()))
    } else {
        Ok(None)
    }
}
