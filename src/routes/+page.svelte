<script lang="ts">
  import Upload from "$lib/components/Upload.svelte";
  import Dashboard from "$lib/components/Dashboard.svelte";
  import Statistics from "$lib/components/Statistics.svelte";

  import type { ParsedLogLine } from "$lib/types";

  let logs = $state<ParsedLogLine[]>([]);

  function setLogs(newLogs: ParsedLogLine[]) {
    newLogs.forEach((log) => {
      logs.push(log);
    });
  }
</script>

<svelte:head>
  <title>MongoDB slow log</title>
</svelte:head>

{#if logs.length === 0}
  <Upload {setLogs} />
{:else}
  <div class="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 w-full p-4">
    <Statistics {logs} />
    <Dashboard {logs} />
  </div>
{/if}
