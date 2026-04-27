<!--
  メインページ

  アプリケーション全体のレイアウトを定義する。
  左サイドバー + 右メインエリア（TabBar + ビューア/ドロップゾーン）の構成。
  設計意図: fileStore.activeFile の状態に応じてビューアを動的に切り替える。
-->
<script lang="ts">
  import { fileStore } from '$lib/stores/fileStore';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import TabBar from '$lib/components/TabBar.svelte';
  import FileDropZone from '$lib/components/FileDropZone.svelte';
  import PdfViewer from '$lib/components/viewers/PdfViewer.svelte';
  import MarkdownViewer from '$lib/components/viewers/MarkdownViewer.svelte';
  import ImageViewer from '$lib/components/viewers/ImageViewer.svelte';
  import CsvViewer from '$lib/components/viewers/CsvViewer.svelte';
  import JsonViewer from '$lib/components/viewers/JsonViewer.svelte';
  import YamlViewer from '$lib/components/viewers/YamlViewer.svelte';
  import HtmlViewer from '$lib/components/viewers/HtmlViewer.svelte';
  import TextViewer from '$lib/components/viewers/TextViewer.svelte';
</script>

<div class="flex h-screen w-screen overflow-hidden bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
  <!-- 左サイドバー -->
  <Sidebar />

  <!-- 右メインエリア -->
  <div class="flex flex-1 flex-col overflow-hidden">
    <!-- タブバー -->
    <TabBar />

    <!-- コンテンツエリア -->
    <main class="flex-1 overflow-hidden">
      {#if fileStore.activeFile}
        <!--
          ビューア切り替え
          {#key} で activeFileId が変わるたびにビューアを再マウントし、
          前のファイルの状態が残らないようにする。
        -->
        {#key fileStore.activeFileId}
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
        {/key}
      {:else}
        <!-- ファイル未選択時: ドラッグ&ドロップゾーン -->
        <FileDropZone />
      {/if}
    </main>
  </div>
</div>
