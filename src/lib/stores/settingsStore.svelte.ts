/**
 * アプリケーション設定ストア
 *
 * テーマ���light/dark）などのユーザー設定を管理する。
 * 将来的にTauri Store pluginで永続化する想定。
 */

/** テーマの種別 */
export type Theme = 'light' | 'dark';

/**
 * 設定ストア��ファクトリ関数
 */
function createSettingsStore() {
	/** 現在のテーマ（デフォルト: OSの設定に従う） */
	let theme = $state<Theme>(getSystemTheme());

	return {
		get theme() {
			return theme;
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
		}
	};
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

/** シングルトンの設定��トアインスタンス */
export const settingsStore = createSettingsStore();
