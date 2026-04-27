<!--
  タブバーコンポーネント

  開いているファイルをタブとして横並びに表示する。
  アクティブタブのハイライト、タブ切替、タブ閉じ（×ボタン）を提供する。
  設計意図: ブラウザのタブと同じ操作感で複数ファイルを切り替えられるようにする。
-->
<script lang="ts">
  import { fileStore } from '$lib/stores/fileStore';

  /**
   * 拡張子に応じたアイコンを返す
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
</script>

{#if fileStore.openFiles.length > 0}
  <div class="flex border-b border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-850 overflow-x-auto">
    {#each fileStore.openFiles as file (file.id)}
      <div
        class="group flex items-center gap-1 border-r border-gray-200 dark:border-gray-700
               {file.id === fileStore.activeFileId
                 ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                 : 'bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850'}"
      >
        <!-- タブ本体（クリックでアクティブ切替） -->
        <button
          onclick={() => fileStore.setActive(file.id)}
          class="flex items-center gap-1.5 px-3 py-2 text-xs font-medium max-w-40 transition-colors"
          title={file.path}
        >
          <span class="shrink-0">{getFileIcon(file.extension)}</span>
          <span class="truncate">{file.name}</span>
        </button>

        <!-- 閉じるボタン -->
        <button
          onclick={(e: MouseEvent) => { e.stopPropagation(); fileStore.closeFile(file.id); }}
          class="mr-1 rounded p-0.5 text-gray-400 opacity-0 group-hover:opacity-100
                 hover:bg-gray-300 hover:text-gray-700
                 dark:hover:bg-gray-600 dark:hover:text-gray-200 transition-all"
          title="閉じる"
        >
          <svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      </div>
    {/each}
  </div>
{/if}
