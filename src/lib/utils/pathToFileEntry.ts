/**
 * ファイルパス文字列を FileEntry に変換するユーティリティ
 *
 * CLI 引数や "open-files" イベントで受け取った raw パスを
 * fileStore.openMultipleFiles() に渡せる FileEntry 形式に変換する。
 */
import { invoke } from '@tauri-apps/api/core';
import type { FileEntry } from '$lib/stores/fileStore.svelte';
import { getViewerType } from '$lib/utils/fileType';

/** get_file_meta コマンドの戻り値型 */
interface FileMeta {
	name: string;
	extension: string;
	size: number;
	path: string;
}

/**
 * ファイルパスを FileEntry に変換する
 *
 * get_file_meta コマンドで拡張子・サイズを取得し、getViewerType で
 * 適切なビューアを判定して FileEntry を生成する。
 * ファイルが存在しない・権限がない場合は null を返す（呼び出し元で除外する）。
 */
export async function pathToFileEntry(path: string): Promise<FileEntry | null> {
	try {
		const meta = await invoke<FileMeta>('get_file_meta', { path });
		return {
			id: meta.path,
			path: meta.path,
			name: meta.name,
			extension: meta.extension,
			viewerType: getViewerType(meta.extension),
			openedAt: new Date()
		};
	} catch (e) {
		console.error(`FileEntry 変換エラー (${path}):`, e);
		return null;
	}
}

/**
 * 複数パスを FileEntry 配列に変換する（エラーになったパスは除外して返す）
 */
export async function pathsToFileEntries(paths: string[]): Promise<FileEntry[]> {
	const results = await Promise.all(paths.map(pathToFileEntry));
	return results.filter((e): e is FileEntry => e !== null);
}
