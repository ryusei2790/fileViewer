## 📘 ファイル解説：src/lib/utils/pathToFileEntry.ts

### このファイルは何をするものか
ファイルパス文字列（例: `/Users/ryusei/docs/README.md`）を、fileStore に渡せる `FileEntry` オブジェクトに変換するユーティリティ。

### なぜこのファイルが必要か
CLI 引数やイベントで届くのは「パス文字列」だが、`fileStore.openMultipleFiles()` が受け取るのは `FileEntry` 型。この変換を一箇所に集約することで、`+layout.svelte` が変換ロジックを持たなくて済む。

### 構造の説明

| 要素 | 役割 |
|------|------|
| `interface FileMeta` | Rust 側 `get_file_meta` コマンドの戻り値型を TypeScript で宣言 |
| `pathToFileEntry(path)` | パス1つを `FileEntry` に変換。エラー時は `null` を返す |
| `invoke<FileMeta>("get_file_meta", { path })` | Tauri コマンドを呼んでメタ情報を取得 |
| `getViewerType(meta.extension)` | 拡張子からどのビューアを使うか判定 |
| `pathsToFileEntries(paths)` | 複数パスを並列変換し、エラーを除外して返す |
| `filter((e): e is FileEntry => e !== null)` | TypeScript の型ガードで `null` を除外 |

### データの流れ

```
paths: string[] (例: ["/abs/path/file.md", "/abs/path/image.png"])
  ↓ Promise.all (並列)
  get_file_meta → { name, extension, size, path }
  getViewerType(extension) → "markdown" | "image" | ...
  ↓
FileEntry[] (例: [{ id, path, name, extension, viewerType, openedAt }])
```

### 初心者が詰まりやすいポイント

- `(e): e is FileEntry => e !== null` は TypeScript の「型ガード」。`filter(e => e !== null)` だけでは `FileEntry | null` の配列にしかならないため、この書き方が必要
- `Promise.all` で並列実行することで、ファイル数が多くても直列より高速に変換できる
- エラーをスローしないで `null` を返す設計にしているのは、1ファイルのエラーで他が開けなくなるのを防ぐため

### 理解確認チェック
- [ ] なぜ `pathToFileEntry` は throw せず `null` を返すのか
- [ ] `filter((e): e is FileEntry => e !== null)` の型ガードが何をしているか
- [ ] `Promise.all` を使う理由（並列処理）
