<script lang="ts">
  import Modal from "$lib/components/Modal.svelte";
  import MetricRow from "$lib/components/MetricRow.svelte";
  import CodeTab from "$lib/components/CodeTab.svelte";

  import Overview from "$lib/components/icons/Overview.svelte";
  import Command from "$lib/components/icons/Command.svelte";
  import RawLog from "$lib/components/icons/RawLog.svelte";

  import {
    formatTimestamp,
    getOperationClass,
    getPlanClass,
    getEfficiencyClass,
    getDurationClass,
    getPerformanceClass,
    getPerformanceLabel,
    formatBytes,
    calculateScanEfficiency,
    getQueryComplexity,
    formatNanoseconds,
  } from "$lib/services/formaters";

  import type { ParsedLogLine } from "$lib/types";

  let tabs = [
    {
      label: "Overview",
      position: 1,
      icon: Overview,
    },
    {
      label: "Command",
      position: 2,
      icon: Command,
    },
    {
      label: "Raw log",
      position: 3,
      icon: RawLog,
    },
  ];

  let { showModal = $bindable(), log }: { showModal: boolean; log: ParsedLogLine } = $props();
  let activeTab = $state(1);

  let rawLogData = $derived.by(() => {
    try {
      const rawLog = JSON.parse(log.rawLog);
      const attr = rawLog.attr || {};

      return {
        database: attr.command?.$db || rawLog.attr?.ns?.split(".")[0],
        ctx: rawLog.ctx,
        planCacheKey: attr.planCacheKey,
        queryFramework: attr.queryFramework,
        cursorid: attr.cursorid,
        fromMultiPlanner: attr.fromMultiPlanner,
        numYields: attr.numYields,
        reslen: attr.reslen,
        cpuNanos: attr.cpuNanos,
        storage: attr.storage,
        locks: attr.locks,
        readConcern: attr.readConcern,
        protocol: attr.protocol,
        remote: attr.remote,
      };
    } catch (e) {
      console.warn("Could not parse raw log:", e);
      return {};
    }
  });

  let performanceScore = $derived.by(() => {
    let score = 100;

    if (log.efficiencyRatio < 0.0001) score -= 40;
    else if (log.efficiencyRatio < 0.001) score -= 30;
    else if (log.efficiencyRatio < 0.01) score -= 15;

    if (log.planSummary.includes("COLLSCAN")) score -= 25;

    if (log.duration > 3600000) score -= 30;
    else if (log.duration > 1800000) score -= 20;
    else if (log.duration > 300000) score -= 10;
    else if (log.duration > 60000) score -= 5;

    if (log.docsExamined > 1000000000) score -= 25;
    else if (log.docsExamined > 100000000) score -= 15;
    else if (log.docsExamined > 10000000) score -= 10;
    else if (log.docsExamined > 1000000) score -= 5;

    return Math.max(0, score);
  });

  function onCloseModalAction() {
    activeTab = 1;
  }
</script>

<Modal bind:showModal onClose={onCloseModalAction}>
  {#snippet header()}
    <div class="flex items-center gap-4">
      <span class="inline-flex items-center px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide {getOperationClass(log.operation)}">
        {log.operation}
      </span>
      <span class="text-lg font-medium text-gray-900">{log.collection}</span>
    </div>
  {/snippet}

  <div class="mb-2">
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        {#each tabs as tab (tab.label)}
          <button
            onclick={() => (activeTab = tab.position)}
            class="cursor-pointer tab-link gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center {activeTab ===
            tab.position
              ? 'border-blue-500 text-blue-600 active'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          >
            <tab.icon />
            {tab.label}
          </button>
        {/each}
      </nav>
    </div>

    <div class="mt-6">
      <div class="tab-content {activeTab === 1 ? '' : 'hidden'}">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
              <h3 class="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Timing Information
              </h3>
            </div>
            <div class="p-4 space-y-3">
              <MetricRow label="Timestamp">
                {formatTimestamp(log.timestamp)}
              </MetricRow>
              <MetricRow label="Duration">
                <span class={getDurationClass(log.duration)}>{log.duration.toLocaleString()}ms</span>
              </MetricRow>
              <MetricRow label="Collection">
                {log.collection}
              </MetricRow>
              <MetricRow label="Operation">
                {log.operation}
              </MetricRow>
              <MetricRow label="Database">
                {rawLogData.database || "N/A"}
              </MetricRow>
              <MetricRow label="Connection">
                {rawLogData.ctx || "N/A"}
              </MetricRow>
            </div>
          </div>
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
              <h3 class="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  ></path>
                </svg>
                Execution Plan
              </h3>
            </div>
            <div class="p-4 space-y-3">
              <MetricRow label="Plan Summary">
                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-semibold {getPlanClass(log.planSummary)}">{log.planSummary}</span
                >
              </MetricRow>
              <MetricRow label="Query Hash">
                <span class="font-mono text-xs">{log.queryHash}</span>
              </MetricRow>
              <MetricRow label="Plan Cache Key">
                <span class="font-mono text-xs">{rawLogData.planCacheKey || "N/A"}</span>
              </MetricRow>
              <MetricRow label="Query Framework">
                {rawLogData.queryFramework || "N/A"}
              </MetricRow>
              <MetricRow label="Cursor ID">
                <span class="font-mono text-xs">{rawLogData.cursorid || "N/A"}</span>
              </MetricRow>
              <MetricRow label="Multi Planner">
                {rawLogData.fromMultiPlanner ? "Yes" : "No"}
              </MetricRow>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
              <h3 class="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  ></path>
                </svg>
                Document Metrics
              </h3>
            </div>
            <div class="p-4 space-y-3">
              <MetricRow label="Documents Examined">
                {log.docsExamined.toLocaleString()}
              </MetricRow>
              <MetricRow label="Documents Returned">
                {log.docsReturned.toLocaleString()}
              </MetricRow>
              <MetricRow label="Keys Examined">
                {log.keysExamined.toLocaleString()}
              </MetricRow>
              <MetricRow label="Efficiency Ratio">
                <span class={getEfficiencyClass(log.efficiencyRatio)}>{(log.efficiencyRatio * 100).toFixed(4)}%</span>
              </MetricRow>
              <MetricRow label="Number of Yields">
                {rawLogData.numYields ? rawLogData.numYields.toLocaleString() : "N/A"}
              </MetricRow>
              <MetricRow label="Response Length">
                {rawLogData.reslen ? formatBytes(rawLogData.reslen) : "N/A"}
              </MetricRow>
            </div>
          </div>
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
              <h3 class="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Performance Analysis
              </h3>
            </div>
            <div class="p-4 space-y-3">
              <MetricRow label="Performance Score">
                <span class="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold {getPerformanceClass(performanceScore)}">
                  {getPerformanceLabel(performanceScore)} ({performanceScore}/100)
                </span>
              </MetricRow>
              <MetricRow label="Scan Efficiency">
                {calculateScanEfficiency(log)}%
              </MetricRow>
              <MetricRow label="Index Usage">
                {log.planSummary.includes("IXSCAN") ? "✅ Good" : "❌ Poor"}
              </MetricRow>
              <MetricRow label="Query Complexity">
                {getQueryComplexity(log)}
              </MetricRow>
              <MetricRow label="CPU Time">
                {rawLogData.cpuNanos ? formatNanoseconds(rawLogData.cpuNanos) : "N/A"}
              </MetricRow>
              <MetricRow label="Data Read">
                {rawLogData.storage?.data?.bytesRead ? formatBytes(rawLogData.storage.data.bytesRead) : "N/A"}
              </MetricRow>
            </div>
          </div>
        </div>
      </div>

      <div class="tab-content {activeTab === 2 ? '' : 'hidden'}">
        <CodeTab title="MongoDB Command" code={log.commandJson} />
      </div>

      <div class="tab-content {activeTab === 3 ? '' : 'hidden'}">
        <CodeTab title="Raw Log Entry" code={log.rawLog} />
      </div>
    </div>
  </div>
</Modal>
