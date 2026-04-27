/**
 * ファイル拡張子 → ビューアタイプのマッピングモジュール
 *
 * レジストリパターンで拡張子とビューアを1箇所で管理する。
 * 新しいファイルタイプを追加する場合、このファイルのみ変更すればよい。
 */

/** ビューアの種別 */
export type ViewerType =
	| 'pdf'
	| 'markdown'
	| 'image'
	| 'csv'
	| 'json'
	| 'yaml'
	| 'html'
	| 'text';

/** ファイルをテキストとして読むかバイナリとして読むかの区分 */
export type ReadMode = 'text' | 'binary';

/** ビューアの定義情報 */
interface ViewerDef {
	type: ViewerType;
	readMode: ReadMode;
}

/**
 * 拡張子 → ビューア定義のレジストリ
 *
 * 設計意図: ビューア追加時にこのマップに1行追加するだけで対応できる。
 * 拡張子はドットなし・小文字で統一。
 */
const VIEWER_REGISTRY: Record<string, ViewerDef> = {
	// PDF
	pdf: { type: 'pdf', readMode: 'binary' },

	// Markdown
	md: { type: 'markdown', readMode: 'text' },
	markdown: { type: 'markdown', readMode: 'text' },

	// 画像（バイナリ）
	png: { type: 'image', readMode: 'binary' },
	jpg: { type: 'image', readMode: 'binary' },
	jpeg: { type: 'image', readMode: 'binary' },
	gif: { type: 'image', readMode: 'binary' },
	webp: { type: 'image', readMode: 'binary' },
	// SVGはXMLテキストなのでテキスト読み込み
	svg: { type: 'image', readMode: 'text' },

	// CSV
	csv: { type: 'csv', readMode: 'text' },
	tsv: { type: 'csv', readMode: 'text' },

	// JSON
	json: { type: 'json', readMode: 'text' },

	// YAML
	yaml: { type: 'yaml', readMode: 'text' },
	yml: { type: 'yaml', readMode: 'text' },

	// HTML
	html: { type: 'html', readMode: 'text' },
	htm: { type: 'html', readMode: 'text' },

	// テキスト / コード（デフォルトのフォールバック先でもある）
	txt: { type: 'text', readMode: 'text' },
	log: { type: 'text', readMode: 'text' },
	css: { type: 'text', readMode: 'text' },
	js: { type: 'text', readMode: 'text' },
	ts: { type: 'text', readMode: 'text' },
	jsx: { type: 'text', readMode: 'text' },
	tsx: { type: 'text', readMode: 'text' },
	rs: { type: 'text', readMode: 'text' },
	py: { type: 'text', readMode: 'text' },
	go: { type: 'text', readMode: 'text' },
	java: { type: 'text', readMode: 'text' },
	c: { type: 'text', readMode: 'text' },
	cpp: { type: 'text', readMode: 'text' },
	h: { type: 'text', readMode: 'text' },
	sh: { type: 'text', readMode: 'text' },
	toml: { type: 'text', readMode: 'text' },
	xml: { type: 'text', readMode: 'text' },
	sql: { type: 'text', readMode: 'text' },
	env: { type: 'text', readMode: 'text' },
	gitignore: { type: 'text', readMode: 'text' },
	dockerfile: { type: 'text', readMode: 'text' }
};

/**
 * 拡張子からビューア定義を取得する
 *
 * @param extension - ドットなし・小文字の拡張子（例: "pdf", "md"）
 * @returns ビューア定義。未対応の拡張子はテキストビューアにフォールバック
 */
export function getViewerDef(extension: string): ViewerDef {
	return VIEWER_REGISTRY[extension.toLowerCase()] ?? { type: 'text', readMode: 'text' };
}

/**
 * 拡張子からビューアタイプのみを取得する
 */
export function getViewerType(extension: string): ViewerType {
	return getViewerDef(extension).type;
}

/**
 * 拡張子から読み込みモードを取得する
 */
export function getReadMode(extension: string): ReadMode {
	return getViewerDef(extension).readMode;
}

/**
 * 画像の拡張子からMIMEタイプを返す
 *
 * base64データをブラウザで表示する際に必要。
 */
export function getImageMimeType(extension: string): string {
	const mimeMap: Record<string, string> = {
		png: 'image/png',
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		gif: 'image/gif',
		webp: 'image/webp',
		svg: 'image/svg+xml'
	};
	return mimeMap[extension.toLowerCase()] ?? 'application/octet-stream';
}
