/// ファイル読み込み・メタ情報取得コマンド
///
/// フロントエンドからTauriコマンドとして呼び出され、
/// ローカルファイルシステムからファイルを読み込む。
/// テキスト系 → UTF-8文字列、バイナリ系 → base64エンコード文字列で返す。
use base64::{engine::general_purpose::STANDARD, Engine};
use chardetng::EncodingDetector;
use serde::Serialize;
use std::fs;
use std::path::Path;

/// ファイルのメタ情報を表す構造体
#[derive(Serialize)]
pub struct FileMeta {
    /// ファイル名（拡張子含む）
    pub name: String,
    /// ファイルの拡張子（小文字、ドットなし）
    pub extension: String,
    /// ファイルサイズ（バイト）
    pub size: u64,
    /// ファイルの絶対パス
    pub path: String,
}

/// テキストファイルを読み込み、UTF-8文字列として返す
///
/// バイト列として読み込み → エンコーディングを自動検出 → UTF-8に変換して返す。
/// Shift_JIS, EUC-JP, UTF-16 等の非UTF-8ファイルにも対応する。
/// 対応: .md, .txt, .csv, .json, .yaml, .yml, .html, .css, .js, .ts 等
#[tauri::command]
pub fn read_file_text(path: String) -> Result<String, String> {
    let bytes = fs::read(&path).map_err(|e| format!("ファイル読み込みエラー: {}", e))?;

    // UTF-8として有効ならそのまま返す（最も高速なパス）
    if let Ok(text) = std::str::from_utf8(&bytes) {
        return Ok(text.to_string());
    }

    // UTF-8でない場合、chardetngでエンコーディングを推定
    let mut detector = EncodingDetector::new();
    detector.feed(&bytes, true);
    let encoding = detector.guess(None, true);

    // encoding_rsでUTF-8に変換
    let (decoded, _, had_errors) = encoding.decode(&bytes);
    if had_errors {
        // デコードエラーがあっても可能な限り表示する（置換文字で補完）
        Ok(decoded.into_owned())
    } else {
        Ok(decoded.into_owned())
    }
}

/// バイナリファイルを読み込み、base64エンコード文字列として返す
///
/// 対応: .pdf, .png, .jpg, .jpeg, .gif, .svg, .webp 等
/// base64にする理由: TauriのコマンドはJSON経由でデータを渡すため、
/// バイナリデータを直接渡せない
#[tauri::command]
pub fn read_file_binary(path: String) -> Result<String, String> {
    let bytes = fs::read(&path).map_err(|e| format!("ファイル読み込みエラー: {}", e))?;
    Ok(STANDARD.encode(&bytes))
}

/// ファイルのメタ情報を取得する
///
/// ファイル名、拡張子、サイズ、パスを返す。
/// ビューアの種類を判定するためにフロントエンド側で使用する。
#[tauri::command]
pub fn get_file_meta(path: String) -> Result<FileMeta, String> {
    let file_path = Path::new(&path);

    // ファイルの存在チェック
    let metadata = fs::metadata(&path).map_err(|e| format!("メタ情報取得エラー: {}", e))?;

    // ファイル名を取得（パスの末尾）
    let name = file_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    // 拡張子を取得（小文字に正規化、ドットなし）
    let extension = file_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    Ok(FileMeta {
        name,
        extension,
        size: metadata.len(),
        path,
    })
}
