<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { listen } from "@tauri-apps/api/event";
  import { invoke } from "@tauri-apps/api/core";
  import { fileStore } from "$lib/stores/fileStore.svelte";
  import { pathsToFileEntries } from "$lib/utils/pathToFileEntry";

  let { children } = $props();

  onMount(async () => {
    // 初回起動時: CLI 引数として渡されたパスをワンショットで取得する
    // emit より後に listen が登録されるため push ではなく pull 方式を採用する
    const initialPaths = await invoke<string[]>("get_initial_paths");
    if (initialPaths.length > 0) {
      const entries = await pathsToFileEntries(initialPaths);
      fileStore.openMultipleFiles(entries);
    }

    // 2回目以降の fv 起動時: single-instance callback が emit するイベントを受信する
    const unlisten = await listen<string[]>("open-files", async (event) => {
      const entries = await pathsToFileEntries(event.payload);
      fileStore.openMultipleFiles(entries);
    });

    // onMount の戻り値がクリーンアップ関数として呼ばれる（コンポーネント破棄時）
    return unlisten;
  });
</script>

{@render children()}
