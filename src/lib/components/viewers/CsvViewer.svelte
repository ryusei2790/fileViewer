<!--
  CSVビューアコンポーネント

  papaparse でCSV/TSVを解析し、テーブルとして表示する。
  設計意図: スプレッドシート的な見やすいテーブル表示。
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { readFileText } from '$lib/utils/fileReader';
  import Papa from 'papaparse';

  interface Props {
    path: string;
  }
  let { path }: Props = $props();

  let headers = $state<string[]>([]);
  let rows = $state<string[][]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      const text = await readFileText(path);
      const result = Papa.parse<string[]>(text, {
        header: false,
        skipEmptyLines: true
      });

      if (result.data.length > 0) {
        // 1行目をヘッダーとして扱う
        headers = result.data[0];
        rows = result.data.slice(1);
      }
      loading = false;
    } catch (e) {
      error = `CSV読み込みエラー: ${e}`;
      loading = false;
    }
  });
</script>

<div class="h-full overflow-auto bg-white dark:bg-gray-800">
  {#if loading}
    <div class="flex items-center justify-center py-20">
      <p class="text-gray-500 dark:text-gray-400">読み込み中...</p>
    </div>
  {:else if error}
    <div class="flex items-center justify-center py-20">
      <p class="text-red-500">{error}</p>
    </div>
  {:else}
    <table class="w-full border-collapse text-sm">
      <thead class="sticky top-0">
        <tr>
          {#each headers as header, i (i)}
            <th class="border border-gray-200 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-700
                       dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
              {header}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each rows as row, rowIndex (rowIndex)}
          <tr class="hover:bg-gray-50 dark:hover:bg-gray-750">
            {#each row as cell, colIndex (colIndex)}
              <td class="border border-gray-200 px-3 py-1.5 text-gray-600 dark:border-gray-600 dark:text-gray-300">
                {cell}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
    <p class="p-2 text-xs text-gray-400 dark:text-gray-500">
      {rows.length} 行 × {headers.length} 列
    </p>
  {/if}
</div>
