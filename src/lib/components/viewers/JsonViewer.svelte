<!--
  JSONビューアコンポーネント

  shiki でシンタックスハイライト付きJSON表示。
  読み込んだJSONを整形（pretty print）してから表示する。
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { readFileText } from '$lib/utils/fileReader';
  import { codeToHtml } from 'shiki';

  interface Props {
    path: string;
  }
  let { path }: Props = $props();

  let htmlContent = $state('');
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      const text = await readFileText(path);
      // JSONを整形（パースできない場合はそのまま表示）
      let formatted: string;
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        formatted = text;
      }

      htmlContent = await codeToHtml(formatted, {
        lang: 'json',
        theme: 'github-dark'
      });
      loading = false;
    } catch (e) {
      error = `JSON読み込みエラー: ${e}`;
      loading = false;
    }
  });
</script>

<div class="h-full overflow-auto bg-gray-900 p-4">
  {#if loading}
    <p class="text-gray-400">読み込み中...</p>
  {:else if error}
    <p class="text-red-500">{error}</p>
  {:else}
    <div class="text-sm [&>pre]:!bg-transparent [&>pre]:p-0">
      {@html htmlContent}
    </div>
  {/if}
</div>
