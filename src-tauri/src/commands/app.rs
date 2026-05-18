/// アプリケーション状態・起動引数に関するコマンド
use std::sync::Mutex;
use tauri::State;

/// 起動時の CLI 引数（ファイルパス）を保持する AppState
///
/// lib.rs で .manage() に渡すため pub が必要。
/// フロントエンドが onMount 後に get_initial_paths で読み取るまで保持する。
pub struct InitialPaths(pub Mutex<Vec<String>>);

/// 起動時に渡されたファイルパスを返してクリアする（ワンショット）
///
/// フロントの onMount 後に呼ばれることを前提にしており、
/// これにより emit より先にフロントが受け取れない race condition を回避する。
/// クリアすることでコンポーネント再マウント時の重複開きを防ぐ。
#[tauri::command]
pub fn get_initial_paths(state: State<'_, InitialPaths>) -> Vec<String> {
    let mut paths = state.0.lock().unwrap();
    let result = paths.clone();
    paths.clear();
    result
}
