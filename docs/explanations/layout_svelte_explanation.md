## 📘 ファイル解説：src/routes/+layout.svelte

### このファイルは何をするものか
アプリ全体のルートレイアウト。今回の変更で「CLI から渡されたファイルを開く処理」が追加された。アプリ起動時に1回だけ実行される `onMount` 内で、初回 CLI 引数の取得と再利用時のイベント受信を設定する。

### なぜこのファイルが必要か
SvelteKit のルートレイアウトは全ページの共通部分であり、アプリが生きている間ずっと存在する。ファイルオープンの受け口をここに置くことで、ページ遷移しても listen が切れない。

### 構造の説明

| 要素 | 役割 |
|------|------|
| `invoke<string[]>("get_initial_paths")` | 初回起動時の CLI 引数をワンショットで取得 |
| `listen<string[]>("open-files", ...)` | 2回目以降の `fv` 起動時にイベントを受信 |
| `pathsToFileEntries(paths)` | パス配列を FileEntry 配列に変換 |
| `fileStore.openMultipleFiles(entries)` | fileStore に登録してタブを追加 |
| `return unlisten` | `onMount` の戻り値 = クリーンアップ関数（コンポーネント破棄時に listen を解除） |

### データの流れ

```
onMount 実行
  ↓
invoke("get_initial_paths")
  → [] なら何もしない
  → ["/path/..."] なら pathsToFileEntries → fileStore.openMultipleFiles

listen("open-files") を登録して待機
  ↓（2回目の fv 実行時）
event.payload: string[]
  → pathsToFileEntries → fileStore.openMultipleFiles
```

### 初回 vs 再利用の違い

| ケース | 経路 |
|--------|------|
| `fv file.md`（未起動） | `onMount` → `invoke("get_initial_paths")` |
| `fv file.md`（起動済） | Rust callback → `emit("open-files")` → `listen` ハンドラ |

### 初心者が詰まりやすいポイント

- `listen` は非同期で登録するため `await` が必要。忘れると listen が完了する前に次の処理が走る
- `return unlisten` を忘れると、ルートレイアウトが破棄された時（ほぼ起きないが）に listen がリークする
- `invoke` と `listen` は両方 `@tauri-apps/api` から import する（パスが違うので注意）

### 理解確認チェック
- [ ] 初回起動と2回目以降でなぜ経路が違うのか（AppState と emit の違い）
- [ ] `return unlisten` がなぜ必要か（クリーンアップの概念）
- [ ] `listen` に `await` が必要な理由
