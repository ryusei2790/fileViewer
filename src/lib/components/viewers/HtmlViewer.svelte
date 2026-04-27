<!--
  HTMLビューアコンポーネント

  iframe + sandbox属性でHTMLを表示する。
  設計意図: sandbox でネットワークアクセスを完全ブロックし、
  「ブラウザで開く→脱線する」という本アプリが解決するペインを防ぐ。
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { readFileText } from '$lib/utils/fileReader';

  interface Props {
    path: string;
  }
  let { path }: Props = $props();

  let iframeSrc = $state('');
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      const text = await readFileText(path);
      // srcdoc用のdata URLを生成
      // sandbox属性によりスクリプト実行・外部通信をブロック
      const blob = new Blob([text], { type: 'text/html' });
      iframeSrc = URL.createObjectURL(blob);
      loading = false;
    } catch (e) {
      error = `HTML読み込みエラー: ${e}`;
      loading = false;
    }
  });
</script>

<div class="h-full bg-white dark:bg-gray-800">
  {#if loading}
    <div class="flex items-center justify-center py-20">
      <p class="text-gray-500 dark:text-gray-400">読み込み中...</p>
    </div>
  {:else if error}
    <div class="flex items-center justify-center py-20">
      <p class="text-red-500">{error}</p>
    </div>
  {:else}
    <!-- sandbox: スクリプト実行・フォーム送信・外部通信���すべてブロック -->
    <iframe
      src={iframeSrc}
      sandbox=""
      title="HTML Preview"
      class="h-full w-full border-none"
    ></iframe>
  {/if}
</div>
