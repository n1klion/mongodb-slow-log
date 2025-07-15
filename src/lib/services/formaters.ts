import type { ParsedLogLine } from "$lib/types";

export function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString();
}

export function getOperationClass(operation: string) {
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

export function getPlanClass(planSummary: string) {
  if (planSummary.includes("COLLSCAN")) return "bg-red-100 text-red-800";
  if (planSummary.includes("IXSCAN")) return "bg-green-100 text-green-800";
  return "bg-orange-100 text-orange-800";
}

export function getEfficiencyClass(efficiency: number) {
  if (efficiency < 1) return "text-red-600";
  if (efficiency < 10) return "text-orange-600";
  return "text-green-600";
}

export function getDurationClass(duration: number) {
  if (duration > 5000) return "text-red-600";
  if (duration > 1000) return "text-orange-600";
  return "text-green-600";
}

export function getPerformanceClass(score: number) {
  if (score >= 80) return "bg-green-100 text-green-800";
  if (score >= 60) return "bg-blue-100 text-blue-800";
  if (score >= 40) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

export function getPerformanceLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Improvement";
  return "Poor";
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function calculateScanEfficiency(query: ParsedLogLine) {
  if (query.docsExamined === 0) return 100;
  return Math.min(100, (query.docsReturned / query.docsExamined) * 100).toFixed(4);
}

export function getQueryComplexity(log: ParsedLogLine) {
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

export function formatNanoseconds(nanos: number) {
  const seconds = nanos / 1000000000;
  if (seconds < 1) {
    return (nanos / 1000000).toFixed(2) + " ms";
  }
  return seconds.toFixed(2) + " s";
}
