# Phase 1：技術選定

## 確定した技術スタック

| カテゴリ | 技術 | 選定理由 |
|----------|------|----------|
| デスクトップFW | Tauri v2 (Rust) | 軽量・ネイティブ性能・セキュリティ |
| フロントエンド | Svelte + TypeScript | バンドルサイズ極小・Tauri公式テンプレあり |
| UIフレームワーク | Tailwind CSS + shadcn-svelte | コンポーネント充実・カスタマイズ性高い |
| ビルドツール | Vite | Svelte + Tauri の標準構成 |
| パッケージ管理 | pnpm | 高速・ディスク効率が良い |

## ファイル表示ライブラリ

| ファイルタイプ | ライブラリ | 備考 |
|---------------|-----------|------|
| PDF | pdfjs-dist (pdf.js) | ページ単位遅延読み込み対応 |
| Markdown | marked + highlight.js | GFM対応・コードブロックハイライト |
| CSV | papaparse | 高速CSV解析 → テーブル表示 |
| JSON | Shiki | シンタックスハイライト付き表示 |
| YAML | Shiki | 同上 |
| テキスト/コード | Shiki | 多言語対応のハイライト |
| 画像 | ネイティブ `<img>` | PNG, JPG, GIF, SVG, WebP対応 |
| HTML | iframe + sandbox | ネットワークアクセスを完全ブロック |

## クラウド互換性マップ

```
Tauri (ローカル)    → Vercel/Cloudflare (Web版) : フロントがSvelteなのでSvelteKit移植可能
ローカルファイルI/O  → クラウドストレージAPI      : Rust側をAPI呼び出しに差し替え可能
pnpm               → CI/CD互換                 : GitHub Actions等で問題なし
Tauri Store plugin  → DB (PostgreSQL等)         : 永続化層の差し替えで対応
```
