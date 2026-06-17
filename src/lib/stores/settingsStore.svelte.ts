/**
 * アプリケーション設定ストア
 *
 * テーマ（light/dark）とサイドバー開閉状態などのユーザー設定を管理する。
 * localStorageに永続化し、リロード後も状態を復元する。
 */

/** テーマの種別 */
export type Theme = 'light' | 'dark';

/** localStorageキー：サイドバー開閉状態の保存先 */
const SIDEBAR_COLLAPSED_KEY = 'fileviewer:sidebarCollapsed';

/**
 * 設定ストアのファクトリ関数
 *
 * 設計意図: Svelte 5 の $state ルーンを使い、リアクティブな単一インスタンスを返す。
 * UI状態（サイドバー開閉）も同じストアに同居させ、現状の規模ではシンプルさを優先する。
 */
function createSettingsStore() {
	/** 現在のテーマ（デフォルト: OSの設定に従う） */
	let theme = $state<Theme>(getSystemTheme());

	/** サイドバー折りたたみ状態（永続化された値があれば復元） */
	let sidebarCollapsed = $state<boolean>(loadSidebarCollapsed());

	return {
		get theme() {
			return theme;
		},

		get sidebarCollapsed() {
			return sidebarCollapsed;
		},

		/** テーマを切り替える */
		toggleTheme() {
			theme = theme === 'light' ? 'dark' : 'light';
			applyTheme(theme);
		},

		/** テーマを指定して設定する */
		setTheme(newTheme: Theme) {
			theme = newTheme;
			applyTheme(theme);
		},

		/** サイドバー開閉を切り替える（localStorage同期） */
		toggleSidebar() {
			sidebarCollapsed = !sidebarCollapsed;
			persistSidebarCollapsed(sidebarCollapsed);
		},

		/** サイドバー開閉状態を明示的にセット */
		setSidebarCollapsed(collapsed: boolean) {
			sidebarCollapsed = collapsed;
			persistSidebarCollapsed(collapsed);
		}
	};
}

/**
 * localStorageからサイドバー開閉状態を読み込む
 * SSRやアクセス不可環境では false（展開状態）にフォールバック。
 */
function loadSidebarCollapsed(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
	} catch {
		return false;
	}
}

/** サイドバー開閉状態をlocalStorageに保存する */
function persistSidebarCollapsed(collapsed: boolean) {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
	} catch {
		// プライベートモード等で書き込み不可の場合は無視
	}
}

/**
 * OSのカラースキーム設定を取得する
 */
function getSystemTheme(): Theme {
	if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		return 'dark';
	}
	return 'light';
}

/**
 * テーマをDOMに反映する
 *
 * html要素のclass属性で dark/light を切り替える。
 * Tailwind CSS の dark mode（class戦略）に対応。
 */
function applyTheme(theme: Theme) {
	if (typeof document !== 'undefined') {
		document.documentElement.classList.toggle('dark', theme === 'dark');
	}
}

/** シングルトンの設定ストアインスタンス */
export const settingsStore = createSettingsStore();
