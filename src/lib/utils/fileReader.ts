/**
 * Tauriコマンド呼び出しラッパーモジュール
 *
 * フロントエンドからRust側のファイル読み込みコマンドを呼び出す。
 * コンポーネントが直接 invoke() を呼ぶのではなく、
 * このモジュールを経由することで型安全性とテスタビリティを確保する。
 */
import { invoke } from '@tauri-apps/api/core';
import { getReadMode } from './fileType';

/** Rust側の FileMeta 構造体に対応する型 */
export interface FileMeta {
	/** ファイル名（拡張子含む） */
	name: string;
	/** 拡張子（小文字、ドットなし） */
	extension: string;
	/** ファイルサイズ（バイト） */
	size: number;
	/** ファイルの絶対パス */
	path: string;
}

/**
 * ファイルのメタ情報を取得する
 *
 * @param path - ファイルの絶対パス
 * @returns FileMeta オブジェクト
 */
export async function getFileMeta(path: string): Promise<FileMeta> {
	return invoke<FileMeta>('get_file_meta', { path });
}

/**
 * テキストファイルを読み込む
 *
 * @param path - ファイルの絶対パス
 * @returns ファイル内容のUTF-8文字列
 */
export async function readFileText(path: string): Promise<string> {
	return invoke<string>('read_file_text', { path });
}

/**
 * バイナリファイルを読み込む（base64エンコード）
 *
 * @param path - ファイルの絶対パス
 * @returns base64エンコードされた文字列
 */
export async function readFileBinary(path: string): Promise<string> {
	return invoke<string>('read_file_binary', { path });
}

/**
 * 拡張子に応じた読み込みモードでファイルを読み込む
 *
 * fileType.ts の getReadMode() に基づき、
 * テキストかバイナリかを自動判定して適切なコマンドを呼び出す。
 *
 * @param path - ファイルの絶対パス
 * @param extension - ファイルの拡張子
 * @returns ファイル内容（テキスト or base64）
 */
export async function readFile(path: string, extension: string): Promise<string> {
	const mode = getReadMode(extension);
	if (mode === 'binary') {
		return readFileBinary(path);
	}
	return readFileText(path);
}
