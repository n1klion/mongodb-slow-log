<script lang="ts">
  import { fly } from "svelte/transition";

  let { title, code }: { title: string; code: string } = $props();

  let showNotification = $state(false);
  let copySuccess = $state(true);

  function prettifyJSON(jsonString: string) {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
      return "Error on parsing";
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(code);
      copySuccess = true;
      showNotification = true;

      setTimeout(() => {
        showNotification = false;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      copySuccess = false;
      showNotification = true;

      setTimeout(() => {
        showNotification = false;
      }, 3000);
    }
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg shadow-sm relative flex flex-col max-h-[80vh]">
  {#if showNotification}
    <div
      class="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-white {copySuccess ? 'bg-green-500' : 'bg-red-500'}"
      transition:fly={{ y: -20, duration: 300 }}
    >
      {#if copySuccess}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Copied to clipboard!
      {:else}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        Failed to copy
      {/if}
    </div>
  {/if}

  <!-- Fixed Header -->
  <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg flex justify-between items-center flex-shrink-0">
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

  <div class="font-mono text-sm overflow-y-auto flex-1/2">
    <pre class="p-2 bg-gray-50"><code>{prettifyJSON(code)}</code></pre>
  </div>
</div>
