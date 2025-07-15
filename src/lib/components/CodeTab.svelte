<script lang="ts">
  let { title, code }: { title: string; code: string } = $props();

  function prettifyJSON(jsonString: string) {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
      return "Error on parsing";
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(code).catch((err) => {
      console.error("Failed to copy to clipboard:", err);
    });
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg shadow-sm">
  <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg flex justify-between items-center">
    <h3 class="text-sm font-semibold text-gray-800 flex items-center gap-2">
      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        ></path>
      </svg>
      {title}
    </h3>
    <button
      class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors duration-200 flex items-center gap-1"
      onclick={copyToClipboard}
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        ></path>
      </svg>
      Copy
    </button>
  </div>
  <div class="p-4 h-[70vh]">
    <div class="bg-gray-900 rounded-lg p-4 h-full overflow-y-auto font-mono text-sm" id="rawLogContainer">
      <pre class="text-orange-300 whitespace-pre-wrap">{prettifyJSON(code)}</pre>
    </div>
  </div>
</div>
