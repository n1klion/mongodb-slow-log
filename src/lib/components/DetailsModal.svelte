<script lang="ts">
  import Modal from "$lib/components/Modal.svelte";
  import MetricRow from "$lib/components/MetricRow.svelte";

  import Overview from "$lib/components/icons/Overview.svelte";
  import Performance from "$lib/components/icons/Performance.svelte";
  import Command from "$lib/components/icons/Command.svelte";
  import RawLog from "$lib/components/icons/RawLog.svelte";
  import ArrowUpDown from "$lib/components/icons/ArrowUpDown.svelte";
  import CheckCircle from "$lib/components/icons/CheckCircle.svelte";
  import Clock from "$lib/components/icons/Clock.svelte";
  import ClockFill from "$lib/components/icons/ClockFill.svelte";
  import ExclamationTriangle from "$lib/components/icons/ExclamationTriangle.svelte";
  import ExclamationTriangleFill from "$lib/components/icons/ExclamationTriangleFill.svelte";
  import GraphUp from "$lib/components/icons/GraphUp.svelte";
  import InfoCircle from "$lib/components/icons/InfoCircle.svelte";
  import Sea from "$lib/components/icons/Sea.svelte";

  import type { ParsedLogLine } from "$lib/types";

  let { showModal = $bindable(), log }: { showModal: boolean; log: ParsedLogLine | null } = $props();
  let activeTab = $state(1);

  let tabs = [
    {
      label: "Overview",
      position: 1,
      icon: Overview,
    },
    {
      label: "Performance",
      position: 2,
      icon: Performance,
    },
    {
      label: "Command",
      position: 3,
      icon: Command,
    },
    {
      label: "Raw log",
      position: 4,
      icon: RawLog,
    },
  ];

  function onCloseModalAction() {
    activeTab = 1;
  }

  function formatTimestamp(timestamp: string) {
    return Date.parse(timestamp).toLocaleString();
  }

  function getDurationClass(duration: number) {
    if (duration > 5000) return "text-red-600 font-semibold";
    if (duration > 1000) return "text-orange-600 font-semibold";
    return "text-green-600";
  }

  function getPerformanceClass(score: number) {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-blue-100 text-blue-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  }

  function getPerformanceLabel(score: number) {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Improvement";
    return "Poor";
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function getPlanClass(planSummary: string) {
    if (planSummary.includes("COLLSCAN")) return "bg-red-100 text-red-800";
    if (planSummary.includes("IXSCAN")) return "bg-green-100 text-green-800";
    return "bg-orange-100 text-orange-800";
  }

  function getEfficiencyClass(efficiency: number) {
    if (efficiency < 0.001) return "text-red-600 font-semibold";
    if (efficiency < 0.01) return "text-orange-600 font-semibold";
    return "text-green-600";
  }

  function calculateScanEfficiency(query: ParsedLogLine) {
    if (query.docsExamined === 0) return 100;
    return Math.min(100, (query.docsReturned / query.docsExamined) * 100).toFixed(4);
  }

  function getQueryComplexity(log: ParsedLogLine) {
    let complexity = "Simple";

    if (log.planSummary.includes("SORT") || log.planSummary.includes("GROUP")) {
      complexity = "Moderate";
    }

    if (log.docsExamined > 10000000 || log.duration > 60000) {
      complexity = "Complex";
    }

    if (log.planSummary.includes("COLLSCAN") && log.docsExamined > 100000000) {
      complexity = "Very Complex";
    }

    return complexity;
  }

  function formatNanoseconds(nanos: number) {
    const seconds = nanos / 1000000000;
    if (seconds < 1) {
      return (nanos / 1000000).toFixed(2) + " ms";
    }
    return seconds.toFixed(2) + " s";
  }

  function getRecommendationClass(type: string) {
    switch (type) {
      case "danger":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  }

  function getOperationClass(operation: string) {
    switch (operation) {
      case "find":
        return "bg-blue-100 text-blue-800";
      case "insert":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-orange-100 text-orange-800";
      case "delete":
        return "bg-red-100 text-red-800";
      case "aggregate":
        return "bg-purple-100 text-purple-800";
      case "getmore":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  let generateRecommendations = $derived(() => {
    if (!log) return [];

    const recommendations = [];

    if (log.docsExamined > 100000000) {
      recommendations.push({
        type: "danger",
        icon: "exclamation-triangle-fill",
        message: "CRITICAL: Query examined over 100M documents! This is extremely inefficient and could impact database performance.",
      });
    }

    if (log.duration > 1800000) {
      recommendations.push({
        type: "danger",
        icon: "clock-fill",
        message: "CRITICAL: Query took over 30 minutes to execute. Consider immediate optimization.",
      });
    }

    if (log.planSummary.includes("COLLSCAN")) {
      recommendations.push({
        type: "danger",
        icon: "exclamation-triangle-fill",
        message: "Add an index to avoid collection scan - this is the most critical optimization needed",
      });
    }

    if (log.efficiencyRatio < 0.001) {
      recommendations.push({
        type: "warning",
        icon: "exclamation-triangle",
        message: "Extremely low efficiency ratio - query is examining far too many documents relative to what it returns",
      });
    } else if (log.efficiencyRatio < 0.01) {
      recommendations.push({
        type: "warning",
        icon: "exclamation-triangle",
        message: "Low efficiency ratio - consider optimizing query filters to return more relevant documents",
      });
    }

    if (log.operation === "getMore") {
      recommendations.push({
        type: "info",
        icon: "info-circle",
        message: "This is a getMore operation - consider the original find query for optimization opportunities",
      });

      if (log.docsExamined > log.docsReturned * 1000) {
        recommendations.push({
          type: "warning",
          icon: "arrow-up-down",
          message: "getMore operation is examining many more documents than returned - check cursor efficiency",
        });
      }
    }

    if (log.docsExamined > log.docsReturned * 1000) {
      recommendations.push({
        type: "warning",
        icon: "graph-up",
        message: "Consider adding compound indexes to reduce the number of documents examined",
      });
    }

    if (log.duration > 300000) {
      recommendations.push({
        type: "warning",
        icon: "clock",
        message: "Query duration is very high - consider query optimization, indexing, or breaking into smaller operations",
      });
    }

    if (log.planSummary.includes("IXSCAN") && log.keysExamined > log.docsReturned * 100) {
      recommendations.push({
        type: "info",
        icon: "search",
        message: "Index is being used but many keys are examined - consider more selective indexes",
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: "success",
        icon: "check-circle",
        message: "Query performance looks acceptable - no immediate optimizations needed",
      });
    }

    return recommendations;
  });

  let rawLogData = $derived(() => {
    if (!log) return {};

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

  let performanceScore = $derived(() => {
    if (!log) return 0;

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

  function copyToClipboard(data: string) {
    navigator.clipboard.writeText(data).catch((err) => {
      console.error("Failed to copy to clipboard:", err);
    });
  }
</script>

<Modal bind:showModal onClose={onCloseModalAction}>
  {#snippet header()}
    {#if !log}
      <p>Log not found</p>
    {:else}
      <div class="flex items-center gap-4">
        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide {getOperationClass(log.operation)}">
          {log.operation}
        </span>
        <span class="text-lg font-medium text-gray-900">{log.collection}</span>
      </div>
    {/if}
  {/snippet}

  {#if !log}
    <p>Log not found</p>
  {:else}
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

      <!-- Tab Content -->
      <div class="mt-6">
        <div class="tab-content {activeTab === 1 ? '' : 'hidden'}">
          <div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    {rawLogData().database || "N/A"}
                  </MetricRow>
                  <MetricRow label="Connection">
                    {rawLogData().ctx || "N/A"}
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
                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-semibold {getPlanClass(log.planSummary)}"
                      >${log.planSummary}</span
                    >
                  </MetricRow>
                  <MetricRow label="Query Hash">
                    <span class="font-mono text-xs">{log.queryHash}</span>
                  </MetricRow>
                  <MetricRow label="Plan Cache Key">
                    <span class="font-mono text-xs">{rawLogData().planCacheKey || "N/A"}</span>
                  </MetricRow>
                  <MetricRow label="Query Framework">
                    {rawLogData().queryFramework || "N/A"}
                  </MetricRow>
                  <MetricRow label="Cursor ID">
                    <span class="font-mono text-xs">{rawLogData().cursorid || "N/A"}</span>
                  </MetricRow>
                  <MetricRow label="Multi Planner">
                    {rawLogData().fromMultiPlanner ? "Yes" : "No"}
                  </MetricRow>
                </div>
              </div>
            </div>
            <!-- Overview content will be loaded here -->
          </div>
        </div>

        <div class="tab-content {activeTab === 2 ? '' : 'hidden'}">
          <div>
            <div class="space-y-6">
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
                      {rawLogData().numYields ? rawLogData().numYields.toLocaleString() : "N/A"}
                    </MetricRow>
                    <MetricRow label="Response Length">
                      {rawLogData().reslen ? formatBytes(rawLogData().reslen) : "N/A"}
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
                      <span class="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold {getPerformanceClass(performanceScore())}">
                        {getPerformanceLabel(performanceScore())} ({performanceScore()}/100)
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
                      {rawLogData().cpuNanos ? formatNanoseconds(rawLogData().cpuNanos) : "N/A"}
                    </MetricRow>
                    <MetricRow label="Data Read">
                      {rawLogData().storage?.data?.bytesRead ? formatBytes(rawLogData().storage.data.bytesRead) : "N/A"}
                    </MetricRow>
                  </div>
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
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      ></path>
                    </svg>
                    Recommendations
                  </h3>
                </div>
                <div class="p-4 space-y-3">
                  {#each generateRecommendations() as rec (rec.message)}
                    <div class="p-3 rounded-lg border {getRecommendationClass(rec.type)} flex items-start gap-2">
                      {#if rec.icon === "exclamation-triangle-fill"}<ExclamationTriangleFill />{/if}
                      {#if rec.icon === "clock-fill"}<ClockFill />{/if}
                      {#if rec.icon === "exclamation-triangle"}<ExclamationTriangle />{/if}
                      {#if rec.icon === "info-circle"}<InfoCircle />{/if}
                      {#if rec.icon === "arrow-up-down"}<ArrowUpDown />{/if}
                      {#if rec.icon === "graph-up"}<GraphUp />{/if}
                      {#if rec.icon === "clock"}<Clock />{/if}
                      {#if rec.icon === "sea"}<Sea />{/if}
                      {#if rec.icon === "check-circle"}<CheckCircle />{/if}
                      <span class="text-sm">{rec.message}</span>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Command Tab -->
        <div class="tab-content {activeTab === 3 ? '' : 'hidden'}">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg flex justify-between items-center">
              <h3 class="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                </svg>
                MongoDB Command
              </h3>
              <button
                class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors duration-200 flex items-center gap-1"
                onclick={() => copyToClipboard(log.rawLog)}
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
              <div class="bg-gray-900 rounded-lg p-4 h-full overflow-y-auto font-mono text-sm">
                <pre class="text-orange-300 whitespace-pre-wrap">{JSON.stringify(JSON.parse(log.commandJson), null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Raw Log Tab -->
        <div class="tab-content {activeTab === 4 ? '' : 'hidden'}">
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
                Raw Log Entry
              </h3>
              <button
                class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors duration-200 flex items-center gap-1"
                onclick={() => copyToClipboard(log.rawLog)}
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
                <pre class="text-orange-300 whitespace-pre-wrap">{JSON.stringify(JSON.parse(log.rawLog), null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</Modal>
