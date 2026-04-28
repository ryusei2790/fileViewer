<!--
  PDFビューアコンポーネント

  pdfjs-dist を使���してPDFをページ単位でCanvas描画する。
  設計意図: ページ単位の遅延レンダリングで大容量PDF対応。
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { readFileBinary } from '$lib/utils/fileReader';
  import * as pdfjsLib from 'pdfjs-dist';

  interface Props {
    path: string;
  }
  let { path }: Props = $props();

  let container: HTMLDivElement;
  let loading = $state(true);
  let error = $state<string | null>(null);
  let pageCount = $state(0);

  // pdfjs ワーカーをローカルバンドルから読み込む
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).href;

  onMount(async () => {
    try {
      // base64でPDFを読み込む
      const base64 = await readFileBinary(path);
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      pageCount = pdf.numPages;

      // 全ページをCanvas描画
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.classList.add('mx-auto', 'mb-4', 'shadow-md');

        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport }).promise;

        container.appendChild(canvas);
      }

      loading = false;
    } catch (e) {
      error = `PDF読み込みエラー: ${e}`;
      loading = false;
    }
  });
</script>

<div class="h-full overflow-y-auto bg-gray-200 p-4 dark:bg-gray-900">
  {#if loading}
    <div class="flex items-center justify-center py-20">
      <p class="text-gray-500 dark:text-gray-400">PDF読み込み中...</p>
    </div>
  {/if}
  {#if error}
    <div class="flex items-center justify-center py-20">
      <p class="text-red-500">{error}</p>
    </div>
  {/if}
  <div bind:this={container}></div>
  {#if !loading && !error}
    <p class="text-center text-xs text-gray-400 dark:text-gray-500">
      {pageCount} ページ
    </p>
  {/if}
</div>
