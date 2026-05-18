## 📘 ファイル解説：scripts/fv

### このファイルは何をするものか
ターミナルから `fv file.md` のように実行して FileViewer でファイルを開く CLI スクリプト。`subl` と同じ使い勝手を実現する。

### なぜこのファイルが必要か
macOS の GUI アプリはターミナルから直接起動できるが、ファイルパスの引数を渡す標準的な方法がない。このスクリプトが「引数の正規化」「存在チェック」「open コマンドへの引き渡し」を担う。

### 構造の説明

| 要素 | 役割 |
|------|------|
| `set -euo pipefail` | エラー時即終了・未定義変数エラー・パイプエラーの厳格化 |
| `[[ ! -d "$APP" ]]` | FileViewer.app の存在確認 |
| `[[ $# -eq 0 ]]` | 引数なし時はアプリを前面に出すだけ |
| `[[ "$arg" == --* ]]` | 将来の `--オプション` フラグを予約（現在はスキップ） |
| `realpath "$arg"` | 相対パスを絶対パスに変換（`./README.md` → `/Users/.../README.md`） |
| `open -na "$APP" --args "${resolved_paths[@]}"` | FileViewer を起動（または single-instance 経由で既存に転送） |

### なぜ `open -n` が必要か

`-n` は「既に起動していても新規インスタンスを立ち上げる」フラグ。これにより:
1. macOS が FileViewer を起動しようとする
2. Rust の single-instance plugin が「もう動いている」と検知
3. 起動を阻止し、既存インスタンスの callback に引数を転送する

`-n` なしだと macOS が既存ウィンドウを前面に出すだけで引数が渡らない。

### インストール方法

```bash
sudo install -m 755 scripts/fv /usr/local/bin/fv
# または、ビルド後のバンドルから
sudo install -m 755 /Applications/FileViewer.app/Contents/Resources/fv /usr/local/bin/fv
```

### 初心者が詰まりやすいポイント

- `"${resolved_paths[@]}"` の `[@]` は配列の全要素展開。`$resolved_paths` だと最初の1つしか渡らない
- `realpath` は macOS 標準ではなく Homebrew の `coreutils` が必要な場合がある（macOS Monterey 以降は標準搭載）
- スペースを含むパスも `"$(realpath "$arg")"` のように quote すれば正しく処理される

### 理解確認チェック
- [ ] `open -na` の `-n` と `-a` それぞれの意味
- [ ] `realpath` が必要な理由（相対パスのまま渡すと？）
- [ ] `"${resolved_paths[@]}"` と `$resolved_paths` の違い
