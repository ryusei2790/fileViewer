<!--
  テキスト/コードビューアコンポーネント

  shiki でシンタックスハ��ライト付きコード表示。
  拡張子からプログラミング言語を自動判定する。
  対応外の拡張子はplaintextとして表示。
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { readFileText } from '$lib/utils/fileReader';
  import { codeToHtml } from 'shiki';

  interface Props {
    path: string;
    extension: string;
  }
  let { path, extension }: Props = $props();

  let htmlContent = $state('');
  let loading = $state(true);
  let error = $state<string | null>(null);

  /**
   * 拡張子からshikiの言語IDに変換する
   */
  function extensionToLang(ext: string): string {
    const langMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'jsx',
      ts: 'typescript',
      tsx: 'tsx',
      rs: 'rust',
      py: 'python',
      go: 'go',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      h: 'c',
      sh: 'bash',
      css: 'css',
      html: 'html',
      xml: 'xml',
      sql: 'sql',
      toml: 'toml',
      yaml: 'yaml',
      yml: 'yaml',
      json: 'json',
      md: 'markdown',
      txt: 'text',
      log: 'text',
      env: 'bash',
      gitignore: 'text',
      dockerfile: 'dockerfile'
    };
    return langMap[ext.toLowerCase()] ?? 'text';
  }

  onMount(async () => {
    try {
      const text = await readFileText(path);
      const lang = extensionToLang(extension);

      htmlContent = await codeToHtml(text, {
        lang,
        theme: 'github-dark'
      });
      loading = false;
    } catch (e) {
      error = `ファイル読み込みエラー: ${e}`;
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
