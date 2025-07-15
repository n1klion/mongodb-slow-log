<script lang="ts">
  import type { Snippet } from "svelte";

  let { label, children }: { label: string; children: Snippet } = $props();
</script>

<div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
  <span class="text-sm font-medium text-gray-600">{label}</span>
  <span class="text-sm font-mono text-gray-900">
    {@render children()}
  </span>
</div>
