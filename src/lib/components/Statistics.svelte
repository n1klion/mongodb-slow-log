<script lang="ts">
  import StatisticCard from "$lib/components/StatisticCard.svelte";

  import type { ParsedLogLine } from "$lib/types";

  let { logs }: { logs: ParsedLogLine[] } = $props();

  function avgDuration() {
    const totalDuration = logs.reduce((acc, log) => acc + log.duration, 0);
    return Math.round(totalDuration / logs.length);
  }

  function maxDuration() {
    return Math.max(...logs.map((log) => log.duration));
  }

  function uniqueCollectionsCount() {
    return [...new Set(logs.map((log) => log.collection))].length;
  }

  function fullScanQueriesCount() {
    return logs.filter((log) => log.planSummary === "COLLSCAN").length;
  }

  function avgEfficiency() {
    const totalEfficiency = logs.reduce((acc, log) => acc + log.efficiencyRatio, 0);
    return totalEfficiency / logs.length;
  }
</script>

<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
  <StatisticCard title="Total Slow Queries" value={logs.length.toString()} />
  <StatisticCard title="Average Duration" value={`${avgDuration().toLocaleString()} ms`} />
  <StatisticCard title="Max Duration" value={`${maxDuration().toLocaleString()} ms`} />
  <StatisticCard title="Unique Collections" value={uniqueCollectionsCount().toString()} />
  <StatisticCard title="COLLSCAN Queries" value={fullScanQueriesCount().toString()} />
  <StatisticCard title="Average Efficiency" value={`${avgEfficiency().toFixed(2)}%`} />
</div>
