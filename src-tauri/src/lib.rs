/// FileViewer アプリケーションのエントリポイント
///
/// Tauri Builder でプラグインとコマンドを登録し、アプリを起動する。
/// - tauri_plugin_single_instance: 二重起動を防ぎ、CLI 引数を既存ウィンドウへ転送する
/// - tauri_plugin_opener: 外部リンクをOSのデフォルトアプリで開く
/// - tauri_plugin_dialog: ファイル選択ダイアログを表示する
/// - commands::app: 起動引数取得コマンド
/// - commands::file: ファイル読み込み・メタ情報取得コマンド
mod commands;

use std::sync::Mutex;
use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 起動時の CLI 引数を収集する
    // argv[0] はバイナリ名なので skip、"--" 始まりの内部フラグも除外する
    let initial_paths: Vec<String> = std::env::args()
        .skip(1)
        .filter(|a| !a.starts_with("--"))
        .collect();

    tauri::Builder::default()
        // 初回起動時の引数を AppState に保存（フロントが onMount 後に pull する）
        .manage(commands::app::InitialPaths(Mutex::new(initial_paths)))
        // 二重起動を検知して既存インスタンスに引数を転送する
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            let paths: Vec<String> = argv
                .iter()
                .skip(1)
                .filter(|a| !a.starts_with("--"))
                .cloned()
                .collect();
            if !paths.is_empty() {
                let _ = app.emit("open-files", &paths);
            }
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::file::read_file_text,
            commands::file::read_file_binary,
            commands::file::get_file_meta,
            commands::file::resolve_relative_path,
            commands::app::get_initial_paths,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
