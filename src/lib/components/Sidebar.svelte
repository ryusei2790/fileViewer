<!--
  サイドバーコンポーネント

  ファイル選択ダイアログの起動と、最近開いたファイルの履歴表示を担当。
  設計意図: ファイルを開く導線を1箇所に集約し、ユーザーの操作をシンプルにする。
-->
<script lang="ts">
  import { open } from '@tauri-apps/plugin-dialog';
  import { fileStore, type FileEntry } from '$lib/stores/fileStore.svelte';
  import { settingsStore } from '$lib/stores/settingsStore.svelte';
  import { getFileMeta } from '$lib/utils/fileReader';
  import { getViewerType } from '$lib/utils/fileType';

  /**
   * ファイル選択ダイアログを開き、選択されたファイルをタブに追加する
   * multiple: true で複数ファイルの一括選択に対応
   */
  async function handleOpenFile() {
    const selected = await open({
      multiple: true,
      filters: [
        {
          name: 'Supported Files',
          extensions: [
            'pdf', 'md', 'markdown',
            'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg',
            'csv', 'tsv',
            'json', 'yaml', 'yml',
            'html', 'htm',
            'txt', 'log', 'css', 'js', 'ts', 'jsx', 'tsx',
            'rs', 'py', 'go', 'java', 'c', 'cpp', 'h', 'sh',
            'toml', 'xml', 'sql'
          ]
        }
      ]
    });

    if (!selected) return;

    // multiple: true の場合、selected は string[] になる
    const paths = Array.isArray(selected) ? selected : [selected];
    const entries: FileEntry[] = await Promise.all(
      paths.map(async (path) => {
        const meta = await getFileMeta(path);
        return {
          id: meta.path,
          path: meta.path,
          name: meta.name,
          extension: meta.extension,
          viewerType: getViewerType(meta.extension),
          openedAt: new Date()
        };
      })
    );
    fileStore.openMultipleFiles(entries);
  }

  /**
   * 履歴からファイルを開く
   */
  function handleOpenRecent(entry: FileEntry) {
    fileStore.openFile({ ...entry, openedAt: new Date() });
  }
</script>

<aside class="flex h-full w-56 flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
  <!-- ヘッダー -->
  <div class="flex items-center justify-between border-b border-gray-200 px-3 py-3 dark:border-gray-700">
    <h1 class="text-sm font-bold text-gray-800 dark:text-gray-200">FileViewer</h1>
    <button
      onclick={() => settingsStore.toggleTheme()}
      class="rounded p-1 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
      title="テーマ切替"
    >
      {settingsStore.theme === 'light' ? '🌙' : '☀️'}
    </button>
  </div>

  <!-- ファイルを開くボタン -->
  <div class="p-3">
    <button
      onclick={handleOpenFile}
      class="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
    >
      ファイルを開く
    </button>
  </div>

  <!-- 最近開いたファイル -->
  <div class="flex-1 overflow-y-auto px-3">
    <h2 class="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
      最近開いたファイル
    </h2>
    {#if fileStore.recentFiles.length === 0}
      <p class="text-xs text-gray-400 dark:text-gray-500">
        まだファイルを開いていません
      </p>
    {:else}
      <ul class="space-y-1">
        {#each fileStore.recentFiles as entry (entry.id)}
          <li>
            <button
              onclick={() => handleOpenRecent(entry)}
              class="w-full truncate rounded px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              title={entry.path}
            >
              {entry.name}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</aside>
