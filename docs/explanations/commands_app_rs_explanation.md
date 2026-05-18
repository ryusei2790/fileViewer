## 📘 ファイル解説：src-tauri/src/commands/app.rs

### このファイルは何をするものか
アプリ起動時の CLI 引数（ファイルパス）を保持する AppState 型と、それをフロントに返す Tauri コマンドを定義する。

### なぜこのファイルが必要か
`lib.rs` で起動時に収集した引数を、フロントエンドが `onMount` 後に安全に取得するための「橋渡し」役。型定義とコマンドを `lib.rs` から分離することで責務を明確にしている。

### 構造の説明

| 要素 | 役割 |
|------|------|
| `pub struct InitialPaths(pub Mutex<Vec<String>>)` | 起動引数リストを保持する AppState 型。`lib.rs` から参照するため `pub` |
| `Mutex<Vec<String>>` | Tauri はマルチスレッドで動くため、共有状態は必ず Mutex で保護する |
| `get_initial_paths(state)` | 保存されたパスを返してクリアする（ワンショット設計） |
| `state.0.lock().unwrap()` | `Mutex` のロックを取得して中の `Vec` を操作する |
| `paths.clear()` | 一度読んだら消す。再マウント時の重複開きを防ぐ |

### データの流れ

```
lib.rs: .manage(InitialPaths(Mutex::new(initial_paths)))
    ↓ Tauri が AppState として管理
フロント: invoke("get_initial_paths")
    ↓
get_initial_paths(state) → paths をコピーして返す → paths.clear()
    ↓
フロント: 返ってきた Vec<String> をファイルオープンに使う
```

### 初心者が詰まりやすいポイント

- `pub struct` の `pub` がないと `lib.rs` で `.manage(commands::app::InitialPaths(...))` が参照できない
- `Mutex` は `use std::sync::Mutex;` が必要（Cargo.toml への追加は不要、標準ライブラリ）
- `state.0` でタプル構造体の最初のフィールドにアクセスする（`state.paths` ではない）

### 理解確認チェック
- [ ] ワンショット設計とは何か（一度読んだらクリアする）
- [ ] なぜ `Vec<String>` を `Mutex` で包むのか
- [ ] `pub struct InitialPaths(pub Mutex<Vec<String>>)` のどちらの `pub` が何のためにあるか
