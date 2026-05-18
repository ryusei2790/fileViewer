## 📘 ファイル解説：src-tauri/src/lib.rs

### このファイルは何をするものか
FileViewer アプリのエントリポイント。Tauri Builder にプラグインとコマンドを登録してアプリを起動する。今回の変更で「起動時 CLI 引数の収集」と「二重起動時の引数転送」が加わった。

### なぜこのファイルが必要か
Tauri は `lib.rs` の `run()` を起点にアプリ全体を構成する。プラグイン・状態管理・コマンドハンドラはすべてここで一元登録するため、このファイルが設定の中心地になる。

### 構造の説明

| 要素 | 役割 |
|------|------|
| `std::env::args()` | 起動時の CLI 引数を取得（argv[0]=バイナリ名を除外） |
| `.manage(InitialPaths(...))` | 初回起動の引数を AppState に保存。フロントが onMount 後に pull する |
| `tauri_plugin_single_instance::init(...)` | 二重起動を検知し、callback で既存インスタンスへ emit |
| `app.emit("open-files", &paths)` | Tauri グローバルイベントをフロントに送信 |
| `tauri::Emitter` trait | `emit()` メソッドを使うために必要な trait import |

### データの流れ

```
CLI: fv file.md
  → open -na FileViewer.app --args /abs/path
     ├── 未起動: args → AppState(InitialPaths) に保存
     │          → フロントが get_initial_paths で読む
     └── 起動済: single-instance callback → emit("open-files", paths)
                → フロントの listen が受け取る
```

### 初心者が詰まりやすいポイント

- `use tauri::Emitter;` の import がないと `app.emit()` がコンパイルエラーになる
- `.manage()` は `.plugin()` より前に置く必要がある（AppState はプラグイン init 時に参照できる状態にする）
- `argv[0]` はバイナリパス自体なので必ず `skip(1)` する

### 理解確認チェック
- [ ] なぜ emit ではなく AppState に保存するのか（race condition 回避のため）
- [ ] `single-instance` plugin の callback が呼ばれるのはどちらのプロセスか（既存インスタンス側）
- [ ] `tauri::Emitter` を import しないと何が起きるか
