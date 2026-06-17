<!--
  ZoomContainer コンポーネント

  全ビューア共通のズーム（拡大縮小）機能を提供するラッパー。
  CSS `zoom` プロパティで子要素全体を拡大縮小し、テキスト・画像・Canvas を同一インタフェースで扱う。

  操作:
    - Cmd/Ctrl + ホイール：ピンチズーム（macOS トラックパッドのピンチも wheel + ctrlKey として届く）
    - Cmd + = / Cmd + - ：10% 刻みでステップズーム
    - Cmd + 0：100% にリセット
-->
<script lang="ts">
  import { onMount, onDestroy, type Snippet } from 'svelte';
  import { fileStore } from '$lib/stores/fileStore.svelte';

  interface Props {
    children: Snippet;
  }
  let { children }: Props = $props();

  /** トースト表示中かどうか */
  let showToast = $state(false);
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  /** アクティブタブの現在の zoom 値（デフォルト 1.0） */
  const currentZoom = $derived(fileStore.activeFile?.zoom ?? 1.0);

  /** トーストを一時表示する */
  function flashToast() {
    showToast = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      showToast = false;
      toastTimer = null;
    }, 1200);
  }

  /** ズーム値を更新してトーストを表示 */
  function applyZoom(delta: number) {
    const id = fileStore.activeFileId;
    if (!id) return;
    const next = (fileStore.activeFile?.zoom ?? 1.0) + delta;
    fileStore.setZoom(id, next);
    flashToast();
  }

  /** ズームを 1.0 にリセット */
  function resetZoom() {
    const id = fileStore.activeFileId;
    if (!id) return;
    fileStore.setZoom(id, 1.0);
    flashToast();
  }

  function handleWheel(e: WheelEvent) {
    // Ctrl or Meta（macOS Cmd）が押されているときのみズーム
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    // deltaY > 0 = スクロールダウン = 縮小
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    applyZoom(delta);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!e.metaKey && !e.ctrlKey) return;

    // 設計意図: e.key はキーボード配列・Shiftの有無で揺れる（特にJIS配列では '+' が ';' キーのShift側）。
    // e.code は物理キー位置ベースでレイアウト非依存のため、こちらを主軸に判定し、e.key はフォールバック扱いにする。
    const code = e.code;
    const key = e.key;

    // ズームイン: Cmd+=, Cmd+Shift+= (→ '+'), JIS Cmd+Shift+; (→ '+'), Numpad+
    const isZoomIn =
      code === 'Equal' ||
      code === 'NumpadAdd' ||
      (code === 'Semicolon' && e.shiftKey) ||
      key === '+' ||
      key === '=';

    // ズームアウト: Cmd+-, Cmd+_, Numpad-
    const isZoomOut =
      code === 'Minus' ||
      code === 'NumpadSubtract' ||
      key === '-' ||
      key === '_';

    // リセット: Cmd+0, Numpad0
    const isReset = code === 'Digit0' || code === 'Numpad0' || key === '0';

    if (isZoomIn) {
      e.preventDefault();
      applyZoom(0.1);
    } else if (isZoomOut) {
      e.preventDefault();
      applyZoom(-0.1);
    } else if (isReset) {
      e.preventDefault();
      resetZoom();
    }
  }

  onMount(() => {
    // passive: false で wheel の preventDefault を有効にする
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('wheel', handleWheel);
    window.removeEventListener('keydown', handleKeydown);
    if (toastTimer) clearTimeout(toastTimer);
  });
</script>

<!-- zoom を CSS カスタムプロパティとして適用し、子要素全体を拡大縮小する -->
<div class="relative h-full w-full" style="zoom: {currentZoom}">
  {@render children()}
</div>

<!-- ズーム倍率インジケータ（右下トースト） -->
{#if showToast}
  <div
    class="pointer-events-none fixed bottom-4 right-4 z-50 rounded-md bg-black/70 px-3 py-1.5 text-sm font-medium text-white shadow-lg"
    aria-live="polite"
  >
    {Math.round(currentZoom * 100)}%
  </div>
{/if}
