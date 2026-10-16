use rusqlite::{params_from_iter, Connection, ToSql};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

const TABLES: &[(&str, &[&str])] = &[
    (
        "projects",
        &[
            "id", "ctime", "mtime", "altmd5", "pos", "name", "json", "thumbnail",
            "owner", "gallery", "deleted", "version", "isgift",
        ],
    ),
    (
        "usershapes",
        &[
            "id", "ctime", "md5", "altmd5", "width", "height", "ext", "name",
            "owner", "scale", "version",
        ],
    ),
    (
        "userbkgs",
        &[
            "id", "ctime", "md5", "altmd5", "width", "height", "ext", "owner", "version",
        ],
    ),
];

fn deserialize_optional_value<'de, D>(deserializer: D) -> Result<Option<Value>, D::Error>
where
    D: serde::Deserializer<'de>,
{
    Value::deserialize(deserializer).map(Some)
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct DbClause {
    pub col: String,
    pub op: String,
    #[serde(default, deserialize_with = "deserialize_optional_value")]
    pub value: Option<Value>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct DbOrder {
    pub col: String,
    pub dir: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct DbIntent {
    pub op: String,
    pub table: String,
    pub items: Option<Vec<String>>,
    pub r#where: Option<Vec<DbClause>>,
    pub order: Option<DbOrder>,
    pub row: Option<HashMap<String, Value>>,
    #[serde(default, deserialize_with = "deserialize_optional_value")]
    pub id: Option<Value>,
}

pub struct DatabaseManager {
    pub conn: Mutex<Connection>,
    pub db_path: PathBuf,
    pub media_dir: PathBuf,
}

impl DatabaseManager {
    pub fn new() -> Result<Self, String> {
        let docs = dirs::document_dir().ok_or_else(|| "Could not locate Documents folder".to_string())?;
        let scratch_dir = docs.join("ScratchJR");
        Self::new_in_dir(&scratch_dir)
    }

    pub fn new_in_dir(scratch_dir: &Path) -> Result<Self, String> {
        fs::create_dir_all(scratch_dir).map_err(|e| e.to_string())?;

        let media_dir = scratch_dir.join("media");
        fs::create_dir_all(&media_dir).map_err(|e| e.to_string())?;

        let db_path = scratch_dir.join("scratchjr.sqllite");
        let bak_path = scratch_dir.join("scratchjr.sqllite.bak");

        let db_valid = if db_path.exists() {
            Self::is_file_valid_sqlite(&db_path)
        } else {
            true
        };

        if !db_valid {
            if Self::is_file_valid_sqlite(&bak_path) {
                let _ = fs::remove_file(&db_path);
                fs::copy(&bak_path, &db_path).map_err(|e| e.to_string())?;
            } else {
                // Both main DB and backup are corrupt or missing: quarantine corrupt DB
                // and remove invalid backup so a fresh database can be initialized cleanly.
                let corrupt_path = scratch_dir.join("scratchjr.sqllite.corrupt");
                let _ = fs::remove_file(&corrupt_path);
                if fs::rename(&db_path, &corrupt_path).is_err() {
                    let _ = fs::remove_file(&db_path);
                }
                if bak_path.exists() {
                    let _ = fs::remove_file(&bak_path);
                }
            }
        }

        let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

        let mgr = Self {
            conn: Mutex::new(conn),
            db_path,
            media_dir,
        };

        mgr.init_tables()?;
        mgr.run_migrations()?;
        mgr.save_backup();

        Ok(mgr)
    }

    fn check_connection_integrity(conn: &Connection) -> bool {
        let Ok(mut stmt) = conn.prepare("PRAGMA integrity_check;") else {
            return false;
        };
        let Ok(mut rows) = stmt.query([]) else {
            return false;
        };
        let Ok(Some(row)) = rows.next() else {
            return false;
        };
        let status: String = row.get(0).unwrap_or_default();
        if !status.eq_ignore_ascii_case("ok") {
            return false;
        }
        // Also touch sqlite_master to ensure header/schema pages are readable
        conn.query_row("SELECT count(*) FROM sqlite_master;", [], |r| r.get::<_, i64>(0))
            .is_ok()
    }

    fn is_file_valid_sqlite(path: &Path) -> bool {
        if !path.exists() {
            return false;
        }
        match Connection::open(path) {
            Ok(conn) => Self::check_connection_integrity(&conn),
            Err(_) => false,
        }
    }

    fn init_tables(&self) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS PROJECTS (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                CTIME DATETIME DEFAULT CURRENT_TIMESTAMP,
                MTIME DATETIME,
                ALTMD5 TEXT,
                POS INTEGER,
                NAME TEXT,
                JSON TEXT,
                THUMBNAIL TEXT,
                OWNER TEXT,
                GALLERY TEXT,
                DELETED TEXT,
                VERSION TEXT,
                ISGIFT INTEGER DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS USERSHAPES (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                CTIME DATETIME DEFAULT CURRENT_TIMESTAMP,
                MD5 TEXT,
                ALTMD5 TEXT,
                WIDTH TEXT,
                HEIGHT TEXT,
                EXT TEXT,
                NAME TEXT,
                OWNER TEXT,
                SCALE TEXT,
                VERSION TEXT
            );
            CREATE TABLE IF NOT EXISTS USERBKGS (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                CTIME DATETIME DEFAULT CURRENT_TIMESTAMP,
                MD5 TEXT,
                ALTMD5 TEXT,
                WIDTH TEXT,
                HEIGHT TEXT,
                EXT TEXT,
                OWNER TEXT,
                VERSION TEXT
            );
            CREATE TABLE IF NOT EXISTS PROJECTFILES (
                MD5 TEXT PRIMARY KEY,
                CONTENTS TEXT
            );"
        ).map_err(|e| e.to_string())?;
        Ok(())
    }

    fn run_migrations(&self) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let mut has_isgift = false;
        if let Ok(mut stmt) = conn.prepare("PRAGMA table_info(PROJECTS);") {
            if let Ok(mut rows) = stmt.query([]) {
                while let Ok(Some(row)) = rows.next() {
                    let col_name: String = row.get(1).unwrap_or_default();
                    if col_name.eq_ignore_ascii_case("isgift") {
                        has_isgift = true;
                        break;
                    }
                }
            }
        }
        if !has_isgift {
            let _ = conn.execute("ALTER TABLE PROJECTS ADD COLUMN ISGIFT INTEGER DEFAULT 0", []);
        }
        Ok(())
    }

    pub fn save_backup(&self) {
        let Ok(_guard) = self.conn.lock() else {
            return;
        };
        if !self.db_path.exists() {
            return;
        }
        let bak_path = self.db_path.with_extension("sqllite.bak");
        let tmp_bak_path = self
            .db_path
            .with_extension(format!("sqllite.bak.tmp.{}", std::process::id()));
        if fs::copy(&self.db_path, &tmp_bak_path).is_ok() {
            if fs::rename(&tmp_bak_path, &bak_path).is_err() {
                let _ = fs::remove_file(&bak_path);
                let _ = fs::rename(&tmp_bak_path, &bak_path);
            }
            let _ = fs::remove_file(&tmp_bak_path);
        }
    }

    pub fn restore_backup(&self) -> bool {
        let restore_path = self.db_path.with_extension("sqllite.restore");
        let bak_path = self.db_path.with_extension("sqllite.bak");
        let source_path = if Self::is_file_valid_sqlite(&restore_path) {
            restore_path
        } else if Self::is_file_valid_sqlite(&bak_path) {
            bak_path
        } else {
            return false;
        };
        if let Ok(mut lock) = self.conn.lock() {
            if let Ok(in_mem) = Connection::open_in_memory() {
                *lock = in_mem;
                if fs::copy(&source_path, &self.db_path).is_ok() {
                    if let Ok(reopened) = Connection::open(&self.db_path) {
                        *lock = reopened;
                        return true;
                    }
                }
                // Rollback: restore handle to original file if copy or reopen failed
                if let Ok(reopened) = Connection::open(&self.db_path) {
                    *lock = reopened;
                }
            }
        }
        false
    }

    fn get_allowed_columns(table: &str) -> Option<HashSet<&'static str>> {
        let t = table.to_ascii_lowercase();
        for &(tbl, cols) in TABLES {
            if tbl == t {
                return Some(cols.iter().copied().collect());
            }
        }
        None
    }

    pub fn execute_stmt(&self, intent: DbIntent) -> Result<i64, i64> {
        // Write ops only allow `op`, `table`, `row`, `id`
        if intent.items.is_some() || intent.r#where.is_some() || intent.order.is_some() {
            return Err(-2);
        }

        let allowed_cols = match Self::get_allowed_columns(&intent.table) {
            Some(cols) => cols,
            None => return Err(-2),
        };

        let op = intent.op.to_ascii_lowercase();
        let table_sql = intent.table.to_ascii_uppercase();

        let conn = self.conn.lock().map_err(|_| -1)?;

        match op.as_str() {
            "insert" => {
                if intent.id.is_some() {
                    return Err(-2);
                }
                let row = match intent.row {
                    Some(r) => r,
                    None => return Err(-2),
                };
                let mut col_names = Vec::new();
                let mut placeholders = Vec::new();
                let mut values: Vec<Box<dyn ToSql>> = Vec::new();

                for (k, v) in row {
                    let k_lower = k.to_ascii_lowercase();
                    if !allowed_cols.contains(k_lower.as_str()) {
                        return Err(-2);
                    }
                    col_names.push(k.to_ascii_uppercase());
                    placeholders.push("?");
                    values.push(json_value_to_tosql(v).map_err(|_| -2)?);
                }

                if col_names.is_empty() {
                    return Err(-2);
                }

                let sql = format!(
                    "INSERT INTO {} ({}) VALUES ({})",
                    table_sql,
                    col_names.join(", "),
                    placeholders.join(", ")
                );

                let params: Vec<&dyn ToSql> = values.iter().map(|b| b.as_ref()).collect();
                match conn.execute(&sql, params_from_iter(params)) {
                    Ok(_) => Ok(conn.last_insert_rowid()),
                    Err(_) => Err(-3),
                }
            }
            "update" => {
                let row = match intent.row {
                    Some(r) => r,
                    None => return Err(-2),
                };
                let id_val = match intent.id {
                    Some(id) => id,
                    None => return Err(-2),
                };

                let mut set_clauses = Vec::new();
                let mut values: Vec<Box<dyn ToSql>> = Vec::new();

                for (k, v) in row {
                    let k_lower = k.to_ascii_lowercase();
                    if !allowed_cols.contains(k_lower.as_str()) {
                        return Err(-2);
                    }
                    set_clauses.push(format!("{} = ?", k.to_ascii_uppercase()));
                    values.push(json_value_to_tosql(v).map_err(|_| -2)?);
                }

                if set_clauses.is_empty() {
                    return Err(-2);
                }

                values.push(json_value_to_tosql(id_val).map_err(|_| -2)?);

                let sql = format!(
                    "UPDATE {} SET {} WHERE ID = ?",
                    table_sql,
                    set_clauses.join(", ")
                );

                let params: Vec<&dyn ToSql> = values.iter().map(|b| b.as_ref()).collect();
                match conn.execute(&sql, params_from_iter(params)) {
                    Ok(changes) => Ok(changes as i64),
                    Err(_) => Err(-3),
                }
            }
            "delete" => {
                if intent.row.is_some() {
                    return Err(-2);
                }
                let id_val = match intent.id {
                    Some(id) => id,
                    None => return Err(-2),
                };
                let sql = format!("DELETE FROM {} WHERE ID = ?", table_sql);
                let to_sql_val = json_value_to_tosql(id_val).map_err(|_| -2)?;
                match conn.execute(&sql, [to_sql_val.as_ref()]) {
                    Ok(changes) => Ok(changes as i64),
                    Err(_) => Err(-3),
                }
            }
            _ => Err(-2),
        }
    }

    pub fn execute_query(&self, intent: DbIntent) -> Result<String, String> {
        if intent.op.to_ascii_lowercase() != "select" {
            return Err("execute_query only accepts select".to_string());
        }

        // select only allows `op`, `table`, `items`, `where`, `order`
        if intent.row.is_some() || intent.id.is_some() {
            return Err("unexpected fields on select".to_string());
        }

        let allowed_cols = Self::get_allowed_columns(&intent.table)
            .ok_or_else(|| format!("unknown table: {}", intent.table))?;

        let table_sql = intent.table.to_ascii_uppercase();

        let items_sql = if let Some(items) = intent.items {
            let mut safe_items = Vec::new();
            for it in items {
                let it_lower = it.to_ascii_lowercase();
                if allowed_cols.contains(it_lower.as_str()) {
                    safe_items.push(it.to_ascii_uppercase());
                } else {
                    return Err(format!("unknown items column: {}", it));
                }
            }
            if safe_items.is_empty() {
                "*".to_string()
            } else {
                safe_items.join(", ")
            }
        } else {
            "*".to_string()
        };

        let mut values: Vec<Box<dyn ToSql>> = Vec::new();
        let mut where_clause = String::new();

        if let Some(clauses) = intent.r#where {
            let mut parts = Vec::new();
            for cl in clauses {
                let col_lower = cl.col.to_ascii_lowercase();
                if !allowed_cols.contains(col_lower.as_str()) {
                    return Err(format!("unknown where column: {}", cl.col));
                }
                let op = cl.op.to_ascii_uppercase();
                if op == "IS NULL" {
                    if cl.value.is_some() {
                        return Err("IS NULL takes no value".to_string());
                    }
                    parts.push(format!("{} IS NULL", cl.col.to_ascii_uppercase()));
                } else if op == "=" || op == "!=" {
                    let val = cl.value.ok_or_else(|| "where value is required".to_string())?;
                    values.push(json_value_to_tosql(val)?);
                    parts.push(format!("{} {} ?", cl.col.to_ascii_uppercase(), op));
                } else {
                    return Err(format!("bad where op: {}", cl.op));
                }
            }
            if !parts.is_empty() {
                where_clause = format!(" WHERE {}", parts.join(" AND "));
            }
        }

        let mut order_clause = String::new();
        if let Some(ord) = intent.order {
            let col_lower = ord.col.to_ascii_lowercase();
            if !allowed_cols.contains(col_lower.as_str()) {
                return Err(format!("unknown order column: {}", ord.col));
            }
            let dir = match ord.dir.as_deref() {
                None => "ASC",
                Some(d) if d.eq_ignore_ascii_case("asc") => "ASC",
                Some(d) if d.eq_ignore_ascii_case("desc") => "DESC",
                Some(d) => return Err(format!("invalid order dir: {}", d)),
            };
            order_clause = format!(" ORDER BY {} {}", ord.col.to_ascii_uppercase(), dir);
        }

        let sql = format!("SELECT {} FROM {}{}{}", items_sql, table_sql, where_clause, order_clause);

        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;

        let params: Vec<&dyn ToSql> = values.iter().map(|b| b.as_ref()).collect();
        let column_names: Vec<String> = stmt.column_names().into_iter().map(|s| s.to_ascii_lowercase()).collect();

        let mut rows = stmt.query(params_from_iter(params)).map_err(|e| e.to_string())?;
        let mut result_rows = Vec::new();

        while let Ok(Some(row)) = rows.next() {
            let mut map = serde_json::Map::new();
            for (idx, col_name) in column_names.iter().enumerate() {
                let val: Value = match row.get_ref(idx) {
                    Ok(rusqlite::types::ValueRef::Null) => Value::Null,
                    Ok(rusqlite::types::ValueRef::Integer(i)) => json!(i),
                    Ok(rusqlite::types::ValueRef::Real(f)) => json!(f),
                    Ok(rusqlite::types::ValueRef::Text(t)) => {
                        let text = String::from_utf8_lossy(t);
                        json!(text)
                    }
                    Ok(rusqlite::types::ValueRef::Blob(b)) => {
                        json!(base64::Engine::encode(&base64::engine::general_purpose::STANDARD, b))
                    }
                    Err(_) => Value::Null,
                };
                map.insert(col_name.clone(), val);
            }
            result_rows.push(Value::Object(map));
        }

        serde_json::to_string(&result_rows).map_err(|e| e.to_string())
    }
}

fn json_value_to_tosql(v: Value) -> Result<Box<dyn ToSql>, String> {
    match v {
        Value::Null => Ok(Box::new(rusqlite::types::Null)),
        Value::Bool(b) => Ok(Box::new(if b { 1i64 } else { 0i64 })),
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                Ok(Box::new(i))
            } else if let Some(f) = n.as_f64() {
                Ok(Box::new(f))
            } else {
                Err("Unsupported number value".to_string())
            }
        }
        Value::String(s) => Ok(Box::new(s)),
        Value::Array(_) | Value::Object(_) => {
            Err("Non-primitive JSON value is not allowed".to_string())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicU64, Ordering};

    static TEST_DIR_COUNTER: AtomicU64 = AtomicU64::new(0);

    fn temp_scratch_dir(prefix: &str) -> PathBuf {
        let id = TEST_DIR_COUNTER.fetch_add(1, Ordering::Relaxed);
        let dir = std::env::temp_dir().join(format!(
            "scratchjr_tauri_db_test_{}_{}_{}",
            prefix,
            std::process::id(),
            id
        ));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn test_intent_deny_unknown_fields_and_allowlist() {
        let dir = temp_scratch_dir("allowlist");
        let mgr = DatabaseManager::new_in_dir(&dir).unwrap();

        // Unknown top-level field rejected by serde(deny_unknown_fields)
        let bad_json = json!({
            "op": "select",
            "table": "projects",
            "extra": "nope"
        });
        assert!(serde_json::from_value::<DbIntent>(bad_json).is_err());

        // Unexpected field per operation: `row` on `select`
        let select_with_row: DbIntent = serde_json::from_value(json!({
            "op": "select",
            "table": "projects",
            "row": { "name": "bad" }
        }))
        .unwrap();
        assert!(mgr.execute_query(select_with_row).is_err());

        // Unexpected field per operation: `where` on `insert`
        let insert_with_where: DbIntent = serde_json::from_value(json!({
            "op": "insert",
            "table": "projects",
            "row": { "name": "ok" },
            "where": [{ "col": "id", "op": "=", "value": 1 }]
        }))
        .unwrap();
        assert_eq!(mgr.execute_stmt(insert_with_where), Err(-2));

        // Bad column rejected
        let bad_col_insert: DbIntent = serde_json::from_value(json!({
            "op": "insert",
            "table": "projects",
            "row": { "evil_col": "val" }
        }))
        .unwrap();
        assert_eq!(mgr.execute_stmt(bad_col_insert), Err(-2));

        // Non-primitive value rejected with -2
        let array_val_insert: DbIntent = serde_json::from_value(json!({
            "op": "insert",
            "table": "projects",
            "row": { "name": ["not", "primitive"] }
        }))
        .unwrap();
        assert_eq!(mgr.execute_stmt(array_val_insert), Err(-2));

        // IS NULL with value rejected
        let is_null_with_val: DbIntent = serde_json::from_value(json!({
            "op": "select",
            "table": "projects",
            "where": [{ "col": "deleted", "op": "IS NULL", "value": "NO" }]
        }))
        .unwrap();
        assert!(mgr.execute_query(is_null_with_val).is_err());

        // `=` without value rejected
        let eq_without_val: DbIntent = serde_json::from_value(json!({
            "op": "select",
            "table": "projects",
            "where": [{ "col": "deleted", "op": "=" }]
        }))
        .unwrap();
        assert!(mgr.execute_query(eq_without_val).is_err());

        // Invalid order col and dir rejected
        let bad_order_col: DbIntent = serde_json::from_value(json!({
            "op": "select",
            "table": "projects",
            "order": { "col": "not_a_col", "dir": "asc" }
        }))
        .unwrap();
        assert!(mgr.execute_query(bad_order_col).is_err());

        let bad_order_dir: DbIntent = serde_json::from_value(json!({
            "op": "select",
            "table": "projects",
            "order": { "col": "id", "dir": "sideways" }
        }))
        .unwrap();
        assert!(mgr.execute_query(bad_order_dir).is_err());

        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn test_corruption_recovery_from_bak_and_fresh_fallback() {
        let dir = temp_scratch_dir("corrupt");
        let db_path = dir.join("scratchjr.sqllite");
        let bak_path = dir.join("scratchjr.sqllite.bak");

        {
            let mgr = DatabaseManager::new_in_dir(&dir).unwrap();
            let ins: DbIntent = serde_json::from_value(json!({
                "op": "insert",
                "table": "projects",
                "row": { "name": "SavedProject", "deleted": "NO", "version": "iOSv01" }
            }))
            .unwrap();
            let id = mgr.execute_stmt(ins).unwrap();
            assert!(id > 0);
            mgr.save_backup();
        }

        // Corrupt main DB; valid .bak should recover data
        fs::write(&db_path, b"corrupt main database bytes").unwrap();
        {
            let mgr = DatabaseManager::new_in_dir(&dir).unwrap();
            let sel: DbIntent = serde_json::from_value(json!({
                "op": "select",
                "table": "projects",
                "items": ["name"]
            }))
            .unwrap();
            let rows_str = mgr.execute_query(sel).unwrap();
            assert!(rows_str.contains("SavedProject"));
        }

        // Corrupt BOTH main DB and .bak; startup must quarantine and create a fresh DB without panicking
        fs::write(&db_path, b"corrupt main database bytes").unwrap();
        fs::write(&bak_path, b"corrupt backup database bytes").unwrap();
        {
            let mgr = DatabaseManager::new_in_dir(&dir).unwrap();
            let sel: DbIntent = serde_json::from_value(json!({
                "op": "select",
                "table": "projects"
            }))
            .unwrap();
            let rows_str = mgr.execute_query(sel).unwrap();
            assert_eq!(rows_str, "[]");
            assert!(dir.join("scratchjr.sqllite.corrupt").exists());
        }

        let _ = fs::remove_dir_all(&dir);
    }
}
