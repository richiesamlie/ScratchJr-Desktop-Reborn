pub mod db;
pub mod io;
pub mod commands;

use commands::AppState;
use db::DatabaseManager;
use io::IoManager;
use std::sync::Arc;
use tauri::Manager;

use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db = Arc::new(DatabaseManager::new().expect("Failed to initialize database manager"));
    let io = Arc::new(IoManager::new().expect("Failed to initialize IO manager"));

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState { db, io })
        .setup(|app| {
            let toggle_fullscreen = MenuItemBuilder::with_id("fullscreen", "Toggle full screen")
                .accelerator("CmdOrCtrl+F")
                .build(app)?;
            let import_project = MenuItemBuilder::with_id("import_project", "Import Project (.sjr)...")
                .accelerator("CmdOrCtrl+O")
                .build(app)?;
            let export_project = MenuItemBuilder::with_id("export_project", "Export Project (.sjr)...")
                .build(app)?;
            let export_stage = MenuItemBuilder::with_id("export_stage", "Export Stage as PNG...")
                .build(app)?;
            let quit_item = MenuItemBuilder::with_id("quit", "Quit")
                .accelerator("CmdOrCtrl+Q")
                .build(app)?;

            let mut file_submenu_builder = SubmenuBuilder::new(app, "File")
                .item(&toggle_fullscreen);

            #[cfg(debug_assertions)]
            let show_devtools = true;
            #[cfg(not(debug_assertions))]
            let show_devtools = std::env::var("DEBUG_SCRATCHJR").is_ok();

            let toggle_devtools = if show_devtools {
                Some(
                    MenuItemBuilder::with_id("devtools", "Toggle Developer Tools")
                        .accelerator("F12")
                        .build(app)?,
                )
            } else {
                None
            };
            if let Some(ref item) = toggle_devtools {
                file_submenu_builder = file_submenu_builder.item(item);
            }

            let state = app.state::<AppState>();
            let restore_path = state.db.db_path.with_extension("sqllite.restore");
            let bak_path = state.db.db_path.with_extension("sqllite.bak");
            let restore_projects = if restore_path.exists() || bak_path.exists() {
                Some(MenuItemBuilder::with_id("restore_projects", "Restore projects").build(app)?)
            } else {
                None
            };
            if let Some(ref item) = restore_projects {
                file_submenu_builder = file_submenu_builder.item(item);
            }

            let file_submenu = file_submenu_builder
                .item(&import_project)
                .item(&export_project)
                .item(&export_stage)
                .separator()
                .item(&quit_item)
                .build()?;

            let menu = MenuBuilder::new(app)
                .item(&file_submenu)
                .build()?;

            app.set_menu(menu)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let handle = window.app_handle().clone();
                if let Some(w) = handle.get_webview_window("main") {
                    let _ = w.eval("if (window.scratchjr && window.scratchjr.appCloseCallback) { window.scratchjr.appCloseCallback(); } else if (window.scratchjr && window.scratchjr.sendAppClosedAcked) { window.scratchjr.sendAppClosedAcked(); } else if (window.__TAURI_INTERNALS__) { window.__TAURI_INTERNALS__.invoke('app_closed_acked'); }");
                }
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_secs(10));
                    let state = handle.state::<AppState>();
                    state.db.save_backup();
                    handle.exit(0);
                });
            }
        })
        .on_menu_event(|app, event| {
            let id = event.id().as_ref();
            if let Some(w) = app.get_webview_window("main") {
                match id {
                    "fullscreen" => {
                        if let Ok(fs) = w.is_fullscreen() {
                            let _ = w.set_fullscreen(!fs);
                        }
                    }
                    "devtools" => {
                        #[cfg(debug_assertions)]
                        let allow_devtools = true;
                        #[cfg(not(debug_assertions))]
                        let allow_devtools = std::env::var("DEBUG_SCRATCHJR").is_ok();
                        if allow_devtools {
                            if w.is_devtools_open() {
                                let _ = w.close_devtools();
                            } else {
                                let _ = w.open_devtools();
                            }
                        }
                    }
                    "import_project" => {
                        let _ = w.eval("if (window.scratchjr && window.scratchjr.importProjectRequestCallback) { window.scratchjr.importProjectRequestCallback(); } else if (window.Home && typeof window.Home.openFileDialog === 'function') { window.Home.openFileDialog(); }");
                    }
                    "export_project" => {
                        let _ = w.eval("if (window.scratchjr && window.scratchjr.exportProjectRequestCallback) { window.scratchjr.exportProjectRequestCallback(); }");
                    }
                    "export_stage" => {
                        let _ = w.eval("if (window.scratchjr && window.scratchjr.exportStageRequestCallback) { window.scratchjr.exportStageRequestCallback(); }");
                    }
                    "restore_projects" => {
                        let state = app.state::<AppState>();
                        state.db.restore_backup();
                        let _ = w.eval("if (window.scratchjr && window.scratchjr.databaseRestoredCallback) { window.scratchjr.databaseRestoredCallback(); } else { window.location.href = 'index.html?back=yes'; }");
                    }
                    "quit" => {
                        let _ = w.eval("if (window.scratchjr && window.scratchjr.appCloseCallback) { window.scratchjr.appCloseCallback(); } else if (window.scratchjr && window.scratchjr.sendAppClosedAcked) { window.scratchjr.sendAppClosedAcked(); } else if (window.__TAURI_INTERNALS__) { window.__TAURI_INTERNALS__.invoke('app_closed_acked'); }");
                        let handle = app.clone();
                        std::thread::spawn(move || {
                            std::thread::sleep(std::time::Duration::from_secs(10));
                            let state = handle.state::<AppState>();
                            state.db.save_backup();
                            handle.exit(0);
                        });
                    }
                    _ => {}
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::database_stmt,
            commands::database_query,
            commands::io_getsettings,
            commands::io_gettextresource,
            commands::io_get_lang,
            commands::io_getfile,
            commands::io_getmedia,
            commands::io_setfile,
            commands::io_setmedia,
            commands::io_setmedianame,
            commands::io_getmd5,
            commands::io_remove,
            commands::io_cleanassets,
            commands::io_get_audio_data,
            commands::save_sjr_file,
            commands::save_stage_png,
            commands::app_closed_acked,
        ])
        .run(tauri::generate_context!())
        .expect("error while running ScratchJr Tauri application");
}
