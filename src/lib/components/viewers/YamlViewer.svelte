<!--
  YAMLビューアコンポーネント

  shiki でシンタックスハイライト付きYAML表示。
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
      htmlContent = await codeToHtml(text, {
        lang: 'yaml',
        theme: 'github-dark'
      });
      loading = false;
    } catch (e) {
      error = `YAML読み込みエラー: ${e}`;
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
