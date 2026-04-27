<!--
  Markdownビューアコンポーネント

  marked でMarkdownをHTMLに変換し、highlight.js でコードブロックをハイライト。
  設計意図: GFM（GitHub Flavored Markdown）対応で開発者にとって自然な表示を実現。
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { readFileText } from '$lib/utils/fileReader';
  import { Marked } from 'marked';
  import { markedHighlight } from 'marked-highlight';
  import hljs from 'highlight.js';
  import 'highlight.js/styles/github-dark.css';

  interface Props {
    path: string;
  }
  let { path }: Props = $props();

  let htmlContent = $state('');
  let loading = $state(true);
  let error = $state<string | null>(null);

  // marked に highlight.js を統合
  const marked = new Marked(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code: string, lang: string) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    })
  );

  onMount(async () => {
    try {
      const text = await readFileText(path);
      htmlContent = await marked.parse(text);
      loading = false;
    } catch (e) {
      error = `Markdown読み込みエラー: ${e}`;
      loading = false;
    }
  });
</script>

<div class="h-full overflow-y-auto bg-white p-8 dark:bg-gray-800">
  {#if loading}
    <p class="text-gray-500 dark:text-gray-400">読み込み中...</p>
  {:else if error}
    <p class="text-red-500">{error}</p>
  {:else}
    <article class="prose prose-gray max-w-none dark:prose-invert">
      {@html htmlContent}
    </article>
  {/if}
</div>
