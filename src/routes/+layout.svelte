<script lang="ts">
  import "./../app.css";

  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<main class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-4">
  {@render children()}
</main>
