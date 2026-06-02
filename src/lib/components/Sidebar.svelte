<!--
  サイドバーコンポーネント

  ファイル選択ダイアログの起動と、最近開いたファイルのタブ風表示を担当。
  設計意図: ファイルを開く導線を1箇所に集約し、ユーザーの操作をシンプルにする。
-->
<script lang="ts">
  import { open } from '@tauri-apps/plugin-dialog';
  import { fileStore, type FileEntry } from '$lib/stores/fileStore.svelte';
  import { settingsStore } from '$lib/stores/settingsStore.svelte';
  import { getFileMeta } from '$lib/utils/fileReader';
  import { getViewerType } from '$lib/utils/fileType';

  /**
   * 拡張子に応じたアイコンを返す（タブバーと共通）
   */
  function getFileIcon(extension: string): string {
    const iconMap: Record<string, string> = {
      pdf: '📕',
      md: '📝',
      markdown: '📝',
      png: '🖼️',
      jpg: '🖼️',
      jpeg: '🖼️',
      gif: '🖼️',
      webp: '🖼️',
      svg: '🖼️',
      csv: '📊',
      tsv: '📊',
      json: '{}',
      yaml: '⚙️',
      yml: '⚙️',
      html: '🌐',
      htm: '🌐'
    };
    return iconMap[extension] ?? '📄';
  }

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

  /** 最近開いたファイルをタブで開く */
  function handleOpenRecent(entry: FileEntry) {
    fileStore.openFile({ ...entry, openedAt: new Date() });
  }

  /** 最近開いたファイルを履歴から削除する */
  function handleRemoveRecent(id: string) {
    fileStore.removeFromRecent(id);
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

  <!-- 最近開いたファイル（タブ風表示） -->
  {#if fileStore.recentFiles.length > 0}
    <div class="flex-1 overflow-y-auto">
      {#each fileStore.recentFiles as entry (entry.id)}
        {@const isOpen = fileStore.openFiles.some((f) => f.id === entry.id)}
        {@const isActive = entry.id === fileStore.activeFileId}
        <div
          class="group flex items-center gap-1 border-b border-gray-200 dark:border-gray-700
                 {isActive
                   ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                   : isOpen
                   ? 'bg-gray-100 dark:bg-gray-750 text-gray-600 dark:text-gray-300'
                   : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}"
        >
          <!-- クリックでファイルを開く / アクティブ切替 -->
          <button
            onclick={() => handleOpenRecent(entry)}
            class="flex flex-1 items-center gap-1.5 px-3 py-2 text-xs font-medium min-w-0 transition-colors"
            title={entry.path}
          >
            <span class="shrink-0">{getFileIcon(entry.extension)}</span>
            <span class="truncate">{entry.name}</span>
          </button>

          <!-- 履歴から削除ボタン -->
          <button
            onclick={(e: MouseEvent) => { e.stopPropagation(); handleRemoveRecent(entry.id); }}
            class="mr-2 shrink-0 rounded p-0.5 text-gray-400 opacity-0 group-hover:opacity-100
                   hover:bg-gray-300 hover:text-gray-700
                   dark:hover:bg-gray-600 dark:hover:text-gray-200 transition-all"
            title="履歴から削除"
          >
            <svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3l6 6M9 3l-6 6" />
            </svg>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</aside>
