/**
 * ファイル状態管理ストア
 *
 * 開いているファイル（タブ）のリスト、アクティブタブの管理、
 * 最近開いたファイルの履歴を保持する。
 * Svelte 5 の $state rune を使ったリアクティブな状態管理。
 */
import type { ViewerType } from '$lib/utils/fileType';

/** 開いているファイル1つ分の情報 */
export interface FileEntry {
	/** ユニークID（パスをそのまま使用） */
	id: string;
	/** ファイルの絶対パス */
	path: string;
	/** ファイル名（拡張子含む） */
	name: string;
	/** 拡張子（小文字、ドットなし） */
	extension: string;
	/** 使用するビューアの種別 */
	viewerType: ViewerType;
	/** 開いた日時 */
	openedAt: Date;
	/** 表示倍率（1.0 = 100%）。タブごとに独立し、再起動でリセット */
	zoom?: number;
}

/** 最近開いたファイル履歴の最大保持数 */
const MAX_RECENT_FILES = 20;

/**
 * ファイルストアのファクトリ関数
 *
 * Svelte 5 では $state をモジュールトップレベルで使えないため、
 * 関数内で状態を定義し、操作関数とともに返す。
 */
function createFileStore() {
	/** 現在開いているファイル一覧 */
	let openFiles = $state<FileEntry[]>([]);
	/** アクティブなタブのID */
	let activeFileId = $state<string | null>(null);
	/** 最近開いたファイルの履歴 */
	let recentFiles = $state<FileEntry[]>([]);

	return {
		/** 開いているファイル一覧（読み取り専用） */
		get openFiles() {
			return openFiles;
		},

		/** アクティブなファイルID（読み取り専用） */
		get activeFileId() {
			return activeFileId;
		},

		/** アクティブなファイルのエントリを返す */
		get activeFile(): FileEntry | undefined {
			return openFiles.find((f) => f.id === activeFileId);
		},

		/** 最近開いたファイル履歴（読み取り専用） */
		get recentFiles() {
			return recentFiles;
		},

		/**
		 * ファイルを開く（タブ追加）
		 *
		 * 既に開いている場合はアクティブに切り替えるだけ。
		 * 新規の場合はタブ追加 + アクティブ切替 + 履歴追加。
		 */
		openFile(entry: FileEntry) {
			const existing = openFiles.find((f) => f.id === entry.id);
			if (existing) {
				activeFileId = existing.id;
				return;
			}
			openFiles = [...openFiles, entry];
			activeFileId = entry.id;
			this.addToRecent(entry);
		},

		/**
		 * 複数ファイルを一括で開く（バッチ追加）
		 *
		 * 重複チェックを行いつつ、新規ファイルのみまとめて追加する。
		 * 最後に追加されたファイルをアクティブタブにする。
		 */
		openMultipleFiles(entries: FileEntry[]) {
			const newEntries = entries.filter(
				(entry) => !openFiles.some((f) => f.id === entry.id)
			);
			if (newEntries.length === 0) {
				// すべて既存の場合、最後のファイルをアクティブにする
				if (entries.length > 0) {
					activeFileId = entries[entries.length - 1].id;
				}
				return;
			}
			openFiles = [...openFiles, ...newEntries];
			activeFileId = newEntries[newEntries.length - 1].id;
			for (const entry of newEntries) {
				this.addToRecent(entry);
			}
		},

		/**
		 * タブを閉じる
		 *
		 * 閉じたタブがアクティブだった場合、隣のタブに切り替える。
		 */
		closeFile(id: string) {
			const index = openFiles.findIndex((f) => f.id === id);
			if (index === -1) return;

			openFiles = openFiles.filter((f) => f.id !== id);

			// 閉じたタブがアクティブだった場合、隣のタブに切り替え
			if (activeFileId === id) {
				if (openFiles.length === 0) {
					activeFileId = null;
				} else {
					// 閉じた位置の前のタブ、なければ先頭
					const newIndex = Math.min(index, openFiles.length - 1);
					activeFileId = openFiles[newIndex].id;
				}
			}
		},

		/** アクティブタブを切り替える */
		setActive(id: string) {
			if (openFiles.some((f) => f.id === id)) {
				activeFileId = id;
			}
		},

		/**
		 * 指定タブのズーム倍率を更新する
		 *
		 * 25%〜500% の範囲にクランプして保存。
		 */
		setZoom(id: string, value: number) {
			const clamped = Math.min(5.0, Math.max(0.25, value));
			openFiles = openFiles.map((f) => (f.id === id ? { ...f, zoom: clamped } : f));
		},

		/**
		 * 最近開いたファイル履歴に追加
		 *
		 * 同じパスのファイルは先頭に移動（重複なし）。
		 * MAX_RECENT_FILES を超えたら古いものを削除。
		 */
		addToRecent(entry: FileEntry) {
			recentFiles = [entry, ...recentFiles.filter((f) => f.id !== entry.id)].slice(
				0,
				MAX_RECENT_FILES
			);
		},

		/** 最近開いたファイル履歴から指定IDのエントリを削除する */
		removeFromRecent(id: string) {
			recentFiles = recentFiles.filter((f) => f.id !== id);
		}
	};
}

/** シングルトンのファイルストアインスタンス */
export const fileStore = createFileStore();
