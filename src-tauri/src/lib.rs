/// FileViewer アプリケーションのエントリポイント
///
/// Tauri Builder でプラグインとコマンドを登録し、アプリを起動する。
/// - tauri_plugin_opener: 外部リンクをOSのデフォルトアプリで開く
/// - tauri_plugin_dialog: ファイル選択ダイアログを表示する
/// - commands::file: ファイル読み込み・メタ情報取得コマンド
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::file::read_file_text,
            commands::file::read_file_binary,
            commands::file::get_file_meta,
            commands::file::resolve_relative_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
