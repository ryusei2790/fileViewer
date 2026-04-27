<!--
  画像ビューアコンポーネント

  PNG/JPG/GIF/WebP はバイナリ読み込み→base64 data URL。
  SVG はテキスト読み込み→base64 data URL（XSSを防ぐためinnerHTMLではなくimg表示）。
  設計意図: シンプルにimg表示。ズームなどは将来拡張。
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { readFile } from '$lib/utils/fileReader';
  import { getReadMode, getImageMimeType } from '$lib/utils/fileType';

  interface Props {
    path: string;
    extension: string;
  }
  let { path, extension }: Props = $props();

  let imageSrc = $state('');
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      const content = await readFile(path, extension);
      const mime = getImageMimeType(extension);
      const readMode = getReadMode(extension);

      if (readMode === 'text') {
        // SVG: テキストをbase64エンコードしてdata URLにする
        imageSrc = `data:${mime};base64,${btoa(content)}`;
      } else {
        // バイナリ: 既にbase64なのでdata URLに組み立てるだけ
        imageSrc = `data:${mime};base64,${content}`;
      }
      loading = false;
    } catch (e) {
      error = `画像読み込みエラー: ${e}`;
      loading = false;
    }
  });
</script>

<div class="flex h-full items-center justify-center overflow-auto bg-gray-100 p-4 dark:bg-gray-900">
  {#if loading}
    <p class="text-gray-500 dark:text-gray-400">読み込み中...</p>
  {:else if error}
    <p class="text-red-500">{error}</p>
  {:else}
    <img src={imageSrc} alt="Preview" class="max-h-full max-w-full object-contain shadow-lg" />
  {/if}
</div>
