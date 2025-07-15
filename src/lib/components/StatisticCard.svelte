<script lang="ts">
  let { value, title }: { value: string; title: string } = $props();
</script>

<div class="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-300">
  <div class="text-2xl font-bold text-gray-800">{value}</div>
  <div class="text-xs text-gray-600 opacity-90">{title}</div>
</div>
