use rusqlite::{params_from_iter, Connection, ToSql};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::PathBuf;
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

#[derive(Debug, Deserialize, Serialize)]
pub struct DbClause {
    pub col: String,
    pub op: String,
    pub value: Option<Value>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct DbOrder {
    pub col: String,
    pub dir: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct DbIntent {
    pub op: String,
    pub table: String,
    pub items: Option<Vec<String>>,
    pub r#where: Option<Vec<DbClause>>,
    pub order: Option<DbOrder>,
    pub row: Option<HashMap<String, Value>>,
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
        fs::create_dir_all(&scratch_dir).map_err(|e| e.to_string())?;

        let media_dir = scratch_dir.join("media");
        fs::create_dir_all(&media_dir).map_err(|e| e.to_string())?;

        let db_path = scratch_dir.join("scratchjr.sqllite");
        let bak_path = scratch_dir.join("scratchjr.sqllite.bak");

        // Open or auto-recover
        let conn = match Connection::open(&db_path) {
            Ok(c) => {
                // Verify integrity
                let mut is_ok = false;
                if let Ok(mut stmt) = c.prepare("PRAGMA integrity_check;") {
                    if let Ok(mut rows) = stmt.query([]) {
                        if let Ok(Some(row)) = rows.next() {
                            let status: String = row.get(0).unwrap_or_default();
                            if status == "ok" {
                                is_ok = true;
                            }
                        }
                    }
                }

                if is_ok {
                    c
                } else if bak_path.exists() {
                    let _ = fs::copy(&bak_path, &db_path);
                    Connection::open(&db_path).map_err(|e| e.to_string())?
                } else {
                    c
                }
            }
            Err(_) if bak_path.exists() => {
                let _ = fs::copy(&bak_path, &db_path);
                Connection::open(&db_path).map_err(|e| e.to_string())?
            }
            Err(e) => return Err(e.to_string()),
        };

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
        let bak_path = self.db_path.with_extension("sqllite.bak");
        if self.db_path.exists() {
            let _ = fs::copy(&self.db_path, &bak_path);
        }
    }

    pub fn has_restore_database(&self) -> bool {
        let bak_path = self.db_path.with_extension("sqllite.bak");
        bak_path.exists()
    }

    pub fn restore_backup(&self) -> bool {
        let bak_path = self.db_path.with_extension("sqllite.bak");
        if !bak_path.exists() {
            return false;
        }
        if let Ok(mut lock) = self.conn.lock() {
            if let Ok(in_mem) = Connection::open_in_memory() {
                *lock = in_mem;
                if fs::copy(&bak_path, &self.db_path).is_ok() {
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
        let allowed_cols = match Self::get_allowed_columns(&intent.table) {
            Some(cols) => cols,
            None => return Err(-2),
        };

        let op = intent.op.to_ascii_lowercase();
        let table_sql = intent.table.to_ascii_uppercase();

        let conn = self.conn.lock().map_err(|_| -1)?;

        match op.as_str() {
            "insert" => {
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
                    values.push(json_value_to_tosql(v));
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
                    values.push(json_value_to_tosql(v));
                }

                if set_clauses.is_empty() {
                    return Err(-2);
                }

                values.push(json_value_to_tosql(id_val));

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
                let id_val = match intent.id {
                    Some(id) => id,
                    None => return Err(-2),
                };
                let sql = format!("DELETE FROM {} WHERE ID = ?", table_sql);
                let to_sql_val = json_value_to_tosql(id_val);
                match conn.execute(&sql, [to_sql_val.as_ref()]) {
                    Ok(changes) => Ok(changes as i64),
                    Err(_) => Err(-3),
                }
            }
            _ => Err(-2),
        }
    }

    pub fn execute_query(&self, intent: DbIntent) -> Result<String, String> {
        let allowed_cols = match Self::get_allowed_columns(&intent.table) {
            Some(cols) => cols,
            None => return Ok("[]".to_string()),
        };

        if intent.op.to_ascii_lowercase() != "select" {
            return Ok("[]".to_string());
        }

        let table_sql = intent.table.to_ascii_uppercase();

        let items_sql = if let Some(items) = intent.items {
            let mut safe_items = Vec::new();
            for it in items {
                let it_lower = it.to_ascii_lowercase();
                if allowed_cols.contains(it_lower.as_str()) {
                    safe_items.push(it.to_ascii_uppercase());
                } else {
                    return Ok("[]".to_string());
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
                    return Ok("[]".to_string());
                }
                let op = cl.op.to_ascii_uppercase();
                if op == "IS NULL" {
                    parts.push(format!("{} IS NULL", cl.col.to_ascii_uppercase()));
                } else if op == "=" || op == "!=" {
                    parts.push(format!("{} {} ?", cl.col.to_ascii_uppercase(), op));
                    let val = cl.value.unwrap_or(Value::Null);
                    values.push(json_value_to_tosql(val));
                } else {
                    return Ok("[]".to_string());
                }
            }
            if !parts.is_empty() {
                where_clause = format!(" WHERE {}", parts.join(" AND "));
            }
        }

        let mut order_clause = String::new();
        if let Some(ord) = intent.order {
            let col_lower = ord.col.to_ascii_lowercase();
            if allowed_cols.contains(col_lower.as_str()) {
                let dir = match ord.dir.as_deref() {
                    Some("desc") | Some("DESC") => "DESC",
                    _ => "ASC",
                };
                order_clause = format!(" ORDER BY {} {}", ord.col.to_ascii_uppercase(), dir);
            }
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

fn json_value_to_tosql(v: Value) -> Box<dyn ToSql> {
    match v {
        Value::Null => Box::new(rusqlite::types::Null),
        Value::Bool(b) => Box::new(if b { 1i64 } else { 0i64 }),
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                Box::new(i)
            } else if let Some(f) = n.as_f64() {
                Box::new(f)
            } else {
                Box::new(n.to_string())
            }
        }
        Value::String(s) => Box::new(s),
        _ => Box::new(v.to_string()),
    }
}
