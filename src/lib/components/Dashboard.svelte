<script lang="ts">
  import Info from "$lib/components/icons/Info.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import Details from "$lib/components/DetailsModal.svelte";

  import type { ParsedLogLine } from "$lib/types";

  const perPageLimit = 20;

  const operationDictionary = {
    all: "All Operations",
    find: "Find",
    insert: "Insert",
    update: "Update",
    delete: "Delete",
    aggregate: "Aggregate",
  };

  const sortDictionary = {
    duration: "Duration",
    timestamp: "Timestamp",
    docs_examined: "Docs Examined",
    efficiency_ratio: "Efficiency",
  };

  const colNames = [
    "Action",
    "Timestamp",
    "Collection",
    "Operation",
    "Duration",
    "Plan",
    "Docs Examined",
    "Docs Returned",
    "Keys Examined",
    "Efficiency",
    "Command",
  ];

  let { logs }: { logs: ParsedLogLine[] } = $props();

  let search = $state("");
  let operation = $state("all");
  let minDuration = $state(0);
  let maxDuration = $state(0);
  let sort = $state("duration");
  let order = $state<"desc" | "asc">("desc");
  let currentPage = $state(1);
  let showModal = $state(false);
  let currentLog = $state<ParsedLogLine | null>(null);

  $effect.pre(() => {
    void search;
    void operation;
    void minDuration;
    void maxDuration;

    currentPage = 1;
  });

  function formatTimestamp(timestamp: string) {
    return new Date(timestamp).toLocaleString();
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

  function getPlanClass(planSummary: string) {
    if (planSummary.includes("COLLSCAN")) return "bg-red-100 text-red-800";
    if (planSummary.includes("IXSCAN")) return "bg-green-100 text-green-800";
    return "bg-orange-100 text-orange-800";
  }

  function getEfficiencyClass(efficiency: number) {
    if (efficiency < 1) return "text-red-600";
    if (efficiency < 10) return "text-orange-600";
    return "text-green-600";
  }

  function getDurationClass(duration: number) {
    if (duration > 5000) return "text-red-600";
    if (duration > 1000) return "text-orange-600";
    return "text-green-600";
  }

  function orderSort(logA: ParsedLogLine, logB: ParsedLogLine) {
    let a = logA;
    let b = logB;
    if (order === "desc") {
      a = logB;
      b = logA;
    }

    switch (sort) {
      case "duration":
        return a.duration - b.duration;
      case "timestamp":
        return Date.parse(a.timestamp) - Date.parse(b.timestamp);
      case "docs_examined":
        return a.docsExamined - b.docsExamined;
      case "efficiency_ratio":
        return a.efficiencyRatio - b.efficiencyRatio;
      default:
        return 0;
    }
  }

  function searchFilter(log: ParsedLogLine) {
    if (search.length <= 3) return true;
    return log.collection.toLowerCase().includes(search.toLowerCase());
  }

  function operationFilter(log: ParsedLogLine) {
    if (operation === "all") return true;
    return log.operation === operation;
  }

  function durationFilter(log: ParsedLogLine) {
    if (minDuration > 0 && log.duration < minDuration) return false;
    if (maxDuration > 0 && log.duration > maxDuration) return false;

    return true;
  }

  function setPage(page: number) {
    currentPage = page;
  }

  let preparedLogs = $derived(logs.toSorted(orderSort).filter(searchFilter).filter(operationFilter).filter(durationFilter));
  let preparedLogsPage = $derived(preparedLogs.slice((currentPage - 1) * perPageLimit, currentPage * perPageLimit));
</script>

<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
  <div>
    <label for="collectionFilter" class="block text-xs font-semibold text-gray-700 mb-1"> Collection </label>
    <input
      type="text"
      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Filter by collection..."
      bind:value={search}
    />
  </div>
  <div>
    <label for="operationFilter" class="block text-xs font-semibold text-gray-700 mb-1"> Operation </label>
    <select
      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      bind:value={operation}
    >
      {#each Object.entries(operationDictionary) as [key, value] (key)}
        <option value={key}>
          {value}
        </option>
      {/each}
    </select>
  </div>
  <div>
    <label for="minDuration" class="block text-xs font-semibold text-gray-700 mb-1"> Min Duration (ms) </label>
    <input
      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      type="number"
      placeholder="Min duration"
      bind:value={minDuration}
      step={100}
    />
  </div>
  <div>
    <label class="block text-xs font-semibold text-gray-700 mb-1" for="maxDuration"> Max Duration (ms) </label>
    <input
      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Max duration"
      type="number"
      bind:value={maxDuration}
      step={100}
    />
  </div>
  <div>
    <label for="sortBy" class="block text-xs font-semibold text-gray-700 mb-1"> Sort By </label>
    <select
      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      bind:value={sort}
    >
      {#each Object.entries(sortDictionary) as [key, value] (key)}
        <option value={key}>
          {value}
        </option>
      {/each}
    </select>
  </div>
  <div>
    <label for="sortOrder" class="block text-xs font-semibold text-gray-700 mb-1"> Order </label>
    <select
      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      bind:value={order}
    >
      <option value="desc">Descending</option>
      <option value="asc">Ascending</option>
    </select>
  </div>
</div>
<div class="overflow-x-auto">
  <table class="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
    <thead class="bg-gray-50 whitespace-nowrap">
      <tr>
        {#each colNames as name (name)}
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {name}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody class="bg-white divide-y divide-gray-200 whitespace-nowrap">
      {#each preparedLogsPage as log (log.id)}
        <tr class="hover:bg-gray-50 transition-colors duration-150">
          <td class="px-4 py-3">
            <button
              onclick={() => {
                currentLog = log;
                showModal = true;
              }}
              class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
            >
              <Info />
              More Info
            </button>
          </td>
          <td class="px-4 py-3 text-sm text-gray-900">
            {formatTimestamp(log.timestamp)}
          </td>
          <td class="px-4 py-3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {log.collection}
            </span>
          </td>
          <td class="px-4 py-3">
            <span
              class={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide ${getOperationClass(log.operation)}`}
            >
              {log.operation}
            </span>
          </td>
          <td class="px-4 py-3">
            <span class={`text-sm font-medium ${getDurationClass(log.duration)}`}>
              {log.duration.toLocaleString()} ms
            </span>
          </td>
          <td class="px-4 py-3">
            <span class={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${getPlanClass(log.planSummary)}`}>
              {log.planSummary}
            </span>
          </td>
          <td class="px-4 py-3 text-sm text-gray-900">
            {log.docsExamined.toLocaleString()}
          </td>
          <td class="px-4 py-3 text-sm text-gray-900">
            {log.docsReturned.toLocaleString()}
          </td>
          <td class="px-4 py-3 text-sm text-gray-900">
            {log.keysExamined.toLocaleString()}
          </td>
          <td class="px-4 py-3">
            <span class={`text-sm font-medium ${getEfficiencyClass(log.efficiencyRatio)}`}>
              {log.efficiencyRatio.toFixed(2)}%
            </span>
          </td>
          <td class="px-4 py-3">
            <div class="max-w-xs truncate text-xs font-mono bg-gray-100 px-2 py-1 rounded" title={log.commandJson}>
              {log.commandJson}
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination totalItems={preparedLogs.length} perPage={perPageLimit} {currentPage} {setPage} />
</div>

<Details bind:showModal log={currentLog} />
