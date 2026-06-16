# 📘 ファイル解説：ZoomContainer.svelte

## このファイルは何をするものか

全ビューア（PDF・Markdown・画像・CSV・JSON・YAML・HTML・テキスト）に共通のズーム（拡大縮小）機能を提供するラッパーコンポーネント。  
子要素に CSS の `zoom` プロパティを適用し、マウスホイール・ピンチ・キーボードショートカットで倍率を変更する。

## なぜこのファイルが必要か

- 8 種類あるビューアそれぞれに個別でズーム実装を組み込むと保守コストが 8 倍になる
- `ZoomContainer` で包むだけで全ビューアが同一インタフェースで拡大縮小に対応できる
- イベントリスナー（`wheel` / `keydown`）は `window` に登録するため、ビューア内のどの要素にフォーカスがあっても動作する

## 構造の説明

| 要素 | 役割 |
|------|------|
| `currentZoom` ($derived) | `fileStore.activeFile?.zoom ?? 1.0` を参照し、タブ切り替え時に自動で追従する |
| `handleWheel` | `Ctrl/Meta + wheel` でズーム。`deltaY > 0` = 縮小、`< 0` = 拡大（macOS ピンチも同じイベント） |
| `handleKeydown` | `Cmd + =` / `Cmd + -` で ±10%、`Cmd + 0` で 100% リセット |
| `applyZoom(delta)` | `fileStore.setZoom(id, current + delta)` を呼び出してストアを更新 |
| `resetZoom()` | `fileStore.setZoom(id, 1.0)` でリセット |
| `flashToast()` | 1.2 秒間だけズーム倍率インジケータ（画面右下）を表示する |
| `onMount` / `onDestroy` | `window` へのリスナー登録・解除（メモリリーク防止） |
| `<div style="zoom: {currentZoom}">` | `{@render children()}` で渡された全ビューアを CSS zoom で包む |
| トースト `<div>` | `position: fixed` で右下に「110%」などを表示。zoom div の**外側**（兄弟要素）なので zoom 影響を受けない |

## データの流れ

```
ユーザー操作（ホイール / ピンチ / キーボード）
  ↓
handleWheel / handleKeydown
  ↓
applyZoom(delta) / resetZoom()
  ↓
fileStore.setZoom(activeFileId, newValue)   ← ストアを更新
  ↓
currentZoom ($derived) が自動再計算           ← Svelte の reactivity
  ↓
<div style="zoom: {currentZoom}">            ← DOM が更新
  ↓
全ビューアが拡大縮小される
```

## 初心者が詰まりやすいポイント

- **`{ passive: false }` が必要な理由**：`wheel` イベントのデフォルトはパッシブリスナーのため `preventDefault()` が無効。`passive: false` を明示しないとブラウザのページスクロールを止められない
- **macOS のピンチズームが `ctrlKey: true` で届く理由**：macOS の WebKit はトラックパッドのピンチジェスチャーを `WheelEvent` に変換し、その際 `event.ctrlKey` を `true` にして送る（実際の Ctrl キーを押していなくても）
- **トースト div が zoom div の外にある理由**：zoom を適用した div の子要素に `position: fixed` を置くと、WebKit では固定位置が viewport 基準ではなく zoom div 基準になってしまうことがある。兄弟要素にすることで正しく viewport 右下に表示される
- **`Cmd + =`（イコール）と `Cmd + +`（プラス）の両方に対応している理由**：JIS キーボードで `Cmd + +` を押すと `key` が `=` になる場合があり、US キーボードは `+`。両方 catch することで確実に動作する

## 理解確認チェック

- [ ] `$derived` を使うことで `fileStore.activeFile` が変わると `currentZoom` が自動更新されることを理解した
- [ ] `wheel` イベントに `{ passive: false }` が必要な理由を説明できる
- [ ] トーストが zoom div の外（兄弟要素）にある理由を説明できる
- [ ] `onDestroy` でリスナーを解除しないとメモリリークが発生することを理解した

> ✅ 上記を理解したら「承認」と返信してください。次のステップに進みます。
