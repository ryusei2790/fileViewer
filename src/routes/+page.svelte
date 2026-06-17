<!--
  メインページ

  アプリケーション全体のレイアウトを定義する。
  左サイドバー + 右メインエリア（TabBar + ビューア/ドロップゾーン）の構成。
  設計意図:
  - fileStore.activeFile の状態に応じてビューアを動的に切り替える
  - サイドバー縁にmacOS風の折りたたみハンドルを配置（settingsStore.sidebarCollapsedで制御）
  - Cmd+\ でサイドバー開閉のキーボードショートカットを提供
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { fileStore } from '$lib/stores/fileStore.svelte';
  import { settingsStore } from '$lib/stores/settingsStore.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import FileDropZone from '$lib/components/FileDropZone.svelte';
  import ZoomContainer from '$lib/components/ZoomContainer.svelte';
  import PdfViewer from '$lib/components/viewers/PdfViewer.svelte';
  import MarkdownViewer from '$lib/components/viewers/MarkdownViewer.svelte';
  import ImageViewer from '$lib/components/viewers/ImageViewer.svelte';
  import CsvViewer from '$lib/components/viewers/CsvViewer.svelte';
  import JsonViewer from '$lib/components/viewers/JsonViewer.svelte';
  import YamlViewer from '$lib/components/viewers/YamlViewer.svelte';
  import HtmlViewer from '$lib/components/viewers/HtmlViewer.svelte';
  import TextViewer from '$lib/components/viewers/TextViewer.svelte';

  /**
   * Cmd+\（macOS定番のサイドバー開閉ショートカット）に対応する
   * 設計意図: ブラウザ既定の動作を阻害せず、Cmd/Ctrl+\ のみインターセプトする
   */
  onMount(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        settingsStore.toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class="relative flex h-screen w-screen overflow-hidden bg-white text-gray-900 transition-colors duration-300 dark:bg-gray-800 dark:text-gray-100">
  <!-- 左サイドバー -->
  <Sidebar />

  <!--
    サイドバー開閉ハンドル
    設計意図:
    - サイドバー外側に絶対配置することで、折りたたみ後もアクセス可能にする
    - 矢印アイコンの回転で開閉方向を直感的に示す（macOS Finder風）
    - hover時に背景色とスケールでフィードバック
  -->
  <button
    onclick={() => settingsStore.toggleSidebar()}
    class="group absolute top-1/2 z-20 flex h-12 w-6 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-gray-200 bg-gray-50/80 text-gray-500 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-gray-100 hover:text-gray-800 hover:shadow dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
    style:left={settingsStore.sidebarCollapsed ? '0px' : '14rem'}
    style:transition="left 280ms cubic-bezier(0.32, 0.72, 0, 1), background-color 200ms ease-out, color 200ms ease-out, box-shadow 200ms ease-out"
    title={settingsStore.sidebarCollapsed ? 'サイドバーを開く (⌘\\)' : 'サイドバーを閉じる (⌘\\)'}
    aria-label={settingsStore.sidebarCollapsed ? 'サイドバーを開く' : 'サイドバーを閉じる'}
  >
    <!-- 矢印: 折りたたみ時は右向き、展開時は左向き -->
    <svg
      class="h-3 w-3 transition-transform duration-200 group-hover:scale-110"
      style:transform={settingsStore.sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'}
      style:transition="transform 200ms ease-out"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M4 2l4 4-4 4" />
    </svg>
  </button>

  <!-- 右メインエリア -->
  <div class="flex flex-1 flex-col overflow-hidden">
    <!-- コンテンツエリア -->
    <main class="flex-1 overflow-hidden">
      {#if fileStore.activeFile}
        <!--
          ZoomContainer: 全ビューア共通のズーム操作を提供。
          {#key} の外側に置くことで、タブ切り替え時に ZoomContainer が再マウントされず
          wheel/keydown リスナーが維持される。zoom 値は fileStore のタブごとの状態から取得。
        -->
        <ZoomContainer>
          <!--
            ビューア切り替え
            {#key} で activeFileId が変わるたびにビューアを再マウントし、
            前のファイルの状態が残らないようにする。
            fade transition で「白いフラッシュ」を緩和し、滑らかに切り替える。
          -->
          {#key fileStore.activeFileId}
            <div in:fade={{ duration: 180 }} out:fade={{ duration: 120 }} class="h-full w-full">
              {#if fileStore.activeFile.viewerType === 'pdf'}
                <PdfViewer path={fileStore.activeFile.path} />
              {:else if fileStore.activeFile.viewerType === 'markdown'}
                <MarkdownViewer path={fileStore.activeFile.path} />
              {:else if fileStore.activeFile.viewerType === 'image'}
                <ImageViewer path={fileStore.activeFile.path} extension={fileStore.activeFile.extension} />
              {:else if fileStore.activeFile.viewerType === 'csv'}
                <CsvViewer path={fileStore.activeFile.path} />
              {:else if fileStore.activeFile.viewerType === 'json'}
                <JsonViewer path={fileStore.activeFile.path} />
              {:else if fileStore.activeFile.viewerType === 'yaml'}
                <YamlViewer path={fileStore.activeFile.path} />
              {:else if fileStore.activeFile.viewerType === 'html'}
                <HtmlViewer path={fileStore.activeFile.path} />
              {:else}
                <TextViewer path={fileStore.activeFile.path} extension={fileStore.activeFile.extension} />
              {/if}
            </div>
          {/key}
        </ZoomContainer>
      {:else}
        <!-- ファイル未選択時: ドラッグ&ドロップゾーン -->
        <div in:fade={{ duration: 200 }} class="h-full w-full">
          <FileDropZone />
        </div>
      {/if}
    </main>
  </div>
</div>
