<!--
  Markdownビューアコンポーネント

  marked でMarkdownをHTMLに変換し、highlight.js でコードブロックをハイライト。
  Markdown内の画像参照（相対パス）を検出し、Tauri経由でbase64 data URLに変換して表示する。
  設計意図: GFM（GitHub Flavored Markdown）対応で開発者にとって自然な表示を実現。
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { readFileText, readFileBinary, resolveRelativePath } from '$lib/utils/fileReader';
  import { getImageMimeType } from '$lib/utils/fileType';
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

  /**
   * 画像srcがローカルファイルパスかどうかを判定する
   * http(s)やdata URLは外部リソースなので変換不要
   */
  function isLocalPath(src: string): boolean {
    return !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:');
  }

  /**
   * 拡張子からMIMEタイプを取得する（パスから拡張子を抽出）
   */
  function getMimeFromPath(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
    return getImageMimeType(ext);
  }

  /**
   * HTML内の<img>タグのsrcをbase64 data URLに置換する
   *
   * 処理フロー:
   * 1. 正規表現でHTML内の全<img>タグを検出
   * 2. ローカルパスのみを対象にフィルタ
   * 3. 相対パスを絶対パスに解決（Rustコマンド）
   * 4. 画像をbase64で読み込み
   * 5. srcをdata URLに置換
   */
  async function resolveLocalImages(html: string, mdFilePath: string): Promise<string> {
    // <img ... src="xxx" ...> のsrc属性を抽出
    const imgRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g;
    const matches: { fullMatch: string; src: string }[] = [];

    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      matches.push({ fullMatch: match[0], src: match[1] });
    }

    if (matches.length === 0) return html;

    // ローカルパスの画像のみ処理
    const localImages = matches.filter((m) => isLocalPath(m.src));

    // 全画像を並列で読み込み
    const replacements = await Promise.allSettled(
      localImages.map(async ({ fullMatch, src }) => {
        const absolutePath = await resolveRelativePath(mdFilePath, src);
        const base64 = await readFileBinary(absolutePath);
        const mime = getMimeFromPath(absolutePath);
        const dataUrl = `data:${mime};base64,${base64}`;
        // src属性をdata URLに置換した<img>タグを返す
        const newTag = fullMatch.replace(`src="${src}"`, `src="${dataUrl}"`);
        return { original: fullMatch, replaced: newTag };
      })
    );

    let result = html;
    for (const r of replacements) {
      if (r.status === 'fulfilled') {
        result = result.replace(r.value.original, r.value.replaced);
      }
      // 読み込み失敗した画像はそのまま（alt textが表示される）
    }

    return result;
  }

  onMount(async () => {
    try {
      const text = await readFileText(path);
      let html = await marked.parse(text);
      // Markdown内の画像参照をbase64 data URLに変換
      html = await resolveLocalImages(html, path);
      htmlContent = html;
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
