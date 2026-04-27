<!--
  ドラッグ&ドロップエリアコンポーネント

  ファイルが開かれていない時にメインエリアに表示される。
  Tauri v2 の onDragDropEvent を使い、ファイルのD&D受け付けを実装する。
  設計意図: ファイル選択ダイアログ以外の直感的なファイルオープン手段を提供する。
-->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { fileStore, type FileEntry } from '$lib/stores/fileStore';
  import { getFileMeta } from '$lib/utils/fileReader';
  import { getViewerType } from '$lib/utils/fileType';

  /** ドラッグ中かどうかのフラグ（視覚的フィードバック用） */
  let isDragging = $state(false);

  /** イベントリスナーの解除関数 */
  let unlisten: (() => void) | null = null;

  onMount(async () => {
    const appWindow = getCurrentWindow();

    unlisten = await appWindow.onDragDropEvent(async (event) => {
      if (event.payload.type === 'over') {
        isDragging = true;
      } else if (event.payload.type === 'drop') {
        isDragging = false;
        // ドロップされたファイルパスを取得（最初の1つのみ）
        const paths = event.payload.paths;
        if (paths.length > 0) {
          await openDroppedFile(paths[0]);
        }
      } else if (event.payload.type === 'leave') {
        isDragging = false;
      }
    });
  });

  onDestroy(() => {
    unlisten?.();
  });

  /**
   * ドロップされたファイルを開く
   */
  async function openDroppedFile(path: string) {
    try {
      const meta = await getFileMeta(path);
      const entry: FileEntry = {
        id: meta.path,
        path: meta.path,
        name: meta.name,
        extension: meta.extension,
        viewerType: getViewerType(meta.extension),
        openedAt: new Date()
      };
      fileStore.openFile(entry);
    } catch (e) {
      console.error('ファイルのオープンに失敗:', e);
    }
  }
</script>

<div
  class="flex h-full flex-col items-center justify-center gap-4 p-8
         {isDragging
           ? 'border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-950'
           : 'bg-white dark:bg-gray-800'}"
>
  <div class="text-6xl text-gray-300 dark:text-gray-600">
    📄
  </div>
  <p class="text-lg font-medium text-gray-500 dark:text-gray-400">
    {isDragging ? 'ここにドロップ' : 'ファイルをドラッグ&ドロップ'}
  </p>
  <p class="text-sm text-gray-400 dark:text-gray-500">
    または左のサイドバーから「ファイルを開く」をクリック
  </p>
  <p class="text-xs text-gray-300 dark:text-gray-600">
    対応形式: PDF, Markdown, 画像, CSV, JSON, YAML, HTML, テキスト/コード
  </p>
</div>
