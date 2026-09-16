use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use md5::{Digest, Md5};
use std::fs;
use std::path::{Path, PathBuf};

pub struct IoManager {
    pub scratch_dir: PathBuf,
    pub media_dir: PathBuf,
    pub app_root: PathBuf,
}

impl IoManager {
    pub fn new() -> Result<Self, String> {
        let docs = dirs::document_dir().ok_or_else(|| "Could not locate Documents folder".to_string())?;
        let scratch_dir = docs.join("ScratchJR");
        let media_dir = scratch_dir.join("media");
        fs::create_dir_all(&media_dir).map_err(|e| e.to_string())?;

        // Dynamic resolution: check next to executable, then manifest dir
        let mut app_root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("..").join("src").join("app");
        if let Ok(exe) = std::env::current_exe() {
            if let Some(parent) = exe.parent() {
                let candidate1 = parent.join("resources").join("src").join("app");
                let candidate2 = parent.join("src").join("app");
                if candidate1.exists() {
                    app_root = candidate1;
                } else if candidate2.exists() {
                    app_root = candidate2;
                }
            }
        }

        Ok(Self {
            scratch_dir,
            media_dir,
            app_root,
        })
    }

    pub fn get_settings(&self) -> String {
        format!("{},false,YES,YES", self.scratch_dir.display())
    }

    pub fn get_md5(data: &str) -> String {
        let mut hasher = Md5::new();
        hasher.update(data.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    pub fn safe_app_path(&self, name: &str) -> Option<PathBuf> {
        let clean = name.trim_start_matches('/').trim_start_matches('\\');
        if clean.contains("..") || clean.contains(':') {
            return None;
        }
        Some(self.app_root.join(clean))
    }

    pub fn safe_media_path(&self, name: &str) -> Option<PathBuf> {
        let safe_name = Path::new(name).file_name()?.to_str()?;
        if safe_name.contains('/') || safe_name.contains('\\') || safe_name.contains("..") {
            return None;
        }
        Some(self.media_dir.join(safe_name))
    }

    pub fn read_file(&self, name: &str) -> Option<String> {
        let path = self.safe_media_path(name)?;
        if path.exists() {
            let bytes = fs::read(path).ok()?;
            Some(BASE64.encode(&bytes))
        } else {
            None
        }
    }

    pub fn write_file(&self, name: &str, contents_b64: &str) -> Result<String, String> {
        let path = self.safe_media_path(name).ok_or_else(|| "Unsafe filename".to_string())?;
        let clean_b64 = if let Some(idx) = contents_b64.find(',') {
            &contents_b64[idx + 1..]
        } else {
            contents_b64
        };

        let bytes = BASE64.decode(clean_b64.trim()).map_err(|e| e.to_string())?;
        let tmp_path = path.with_extension("tmp");
        fs::write(&tmp_path, bytes).map_err(|e| e.to_string())?;
        fs::rename(tmp_path, &path).map_err(|e| e.to_string())?;

        Ok(name.to_string())
    }

    pub fn set_media(&self, b64_str: &str, ext: &str) -> Result<String, String> {
        let hash = Self::get_md5(b64_str);
        let filename = format!("{}.{}", hash, ext);
        self.write_file(&filename, b64_str)?;
        Ok(filename)
    }

    pub fn set_media_name(&self, encoded_data: &str, key: &str, ext: &str) -> Result<String, String> {
        let filename = format!("{}.{}", key, ext);
        self.write_file(&filename, encoded_data)?;
        Ok(filename)
    }

    pub fn remove_file(&self, name: &str) -> bool {
        if let Some(path) = self.safe_media_path(name) {
            if path.exists() {
                return fs::remove_file(path).is_ok();
            }
        }
        false
    }

    pub fn clean_assets(&self, file_type: &str, conn: &rusqlite::Connection) -> bool {
        let ext = if file_type == "wav" { "webm" } else { file_type };
        let entries = match fs::read_dir(&self.media_dir) {
            Ok(e) => e,
            Err(_) => return false,
        };

        for entry in entries.flatten() {
            let path = entry.path();
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                if name.ends_with(&format!(".{}", ext)) {
                    // Check if in use
                    let in_projects: Result<i64, _> = conn.query_row(
                        "SELECT COUNT(*) FROM PROJECTS WHERE JSON LIKE ? OR THUMBNAIL LIKE ?",
                        [format!("%{}%", name), format!("%{}%", name)],
                        |r| r.get(0),
                    );
                    let in_shapes: Result<i64, _> = conn.query_row(
                        "SELECT COUNT(*) FROM USERSHAPES WHERE MD5 = ? OR ALTMD5 = ?",
                        [name, name],
                        |r| r.get(0),
                    );
                    let in_bkgs: Result<i64, _> = conn.query_row(
                        "SELECT COUNT(*) FROM USERBKGS WHERE MD5 = ? OR ALTMD5 = ?",
                        [name, name],
                        |r| r.get(0),
                    );

                    let used = in_projects.unwrap_or(1) > 0
                        || in_shapes.unwrap_or(1) > 0
                        || in_bkgs.unwrap_or(1) > 0;

                    if !used {
                        let _ = fs::remove_file(path);
                    }
                }
            }
        }
        true
    }

    pub fn get_text_resource(&self, filename: &str) -> Option<String> {
        let path = self.safe_app_path(filename)?;
        if path.exists() {
            fs::read_to_string(path).ok()
        } else {
            None
        }
    }

    pub fn get_audio_data(&self, audio_name: &str) -> Option<String> {
        // Check user media folder
        let mut candidates = Vec::new();
        if let Some(user_media) = self.safe_media_path(audio_name) {
            candidates.push(user_media);
        }

        // Check app directory sounds/ and app root safely
        if let Some(app_path) = self.safe_app_path(audio_name) {
            candidates.push(app_path);
        }
        let sound_rel = format!("sounds/{}", audio_name.trim_start_matches('/').trim_start_matches('\\'));
        if let Some(sound_path) = self.safe_app_path(&sound_rel) {
            candidates.push(sound_path);
        }

        for candidate in candidates {
            if candidate.exists() {
                if let Ok(bytes) = fs::read(&candidate) {
                    let ext = candidate
                        .extension()
                        .and_then(|e| e.to_str())
                        .unwrap_or("")
                        .to_ascii_lowercase();

                    let mime = match ext.as_str() {
                        "mp3" => "audio/mp3",
                        "wav" => "audio/wav",
                        "webm" => "audio/webm",
                        "ogg" => "audio/ogg",
                        "m4a" | "aac" => "audio/mp4",
                        _ => "audio/wav",
                    };
                    return Some(format!("data:{};base64,{}", mime, BASE64.encode(&bytes)));
                }
            }
        }
        None
    }
}
