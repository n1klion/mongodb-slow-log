import { MongoLogSchema, type MongoLog, type ParsedLogLine } from "$lib/types";

export function parseLogLine(line: string): ParsedLogLine | null {
  try {
    const trimmedLine = line.trim();
    if (!trimmedLine || !trimmedLine.includes('"c":"COMMAND"') || !trimmedLine.includes("durationMillis")) {
      return null;
    }

    const jsonLog = JSON.parse(trimmedLine);
    const validatedLog = MongoLogSchema.parse(jsonLog);

    if (!validatedLog.attr.durationMillis || validatedLog.attr.durationMillis <= 0) {
      return null;
    }

    return extractLogData(validatedLog, trimmedLine);
  } catch (error) {
    console.warn("Failed to parse log line:", error instanceof Error ? error.message : "Unknown error");
    return null;
  }
}

export function extractLogData(jsonLog: MongoLog, rawLine: string): ParsedLogLine {
  const attr = jsonLog.attr;

  const timestamp = jsonLog.t.$date;

  const collection = attr.ns ? attr.ns.split(".").slice(1).join(".") || attr.ns : "Unknown";

  const operation = extractOperationType(attr.command);

  const duration = attr.durationMillis || 0;
  const docsExamined = attr.docsExamined || 0;
  const docsReturned = attr.nreturned || 0;
  const keysExamined = attr.keysExamined || 0;
  const planSummary = attr.planSummary || "Not available";
  const queryHash = attr.queryHash || "Not available";

  const efficiencyRatio = docsExamined > 0 ? (docsReturned / docsExamined) * 100 : 0;

  const commandJson = attr.command ? JSON.stringify(attr.command, null, 2) : "Not available";

  return {
    id: window.crypto.randomUUID(),
    timestamp,
    collection,
    operation,
    duration,
    planSummary,
    docsExamined,
    docsReturned,
    keysExamined,
    efficiencyRatio,
    queryHash,
    commandJson,
    rawLog: rawLine,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractOperationType(command: Record<string, any> | undefined): string {
  if (!command) return "Unknown";

  if (command.find) return "find";
  if (command.aggregate) return "aggregate";
  if (command.insert) return "insert";
  if (command.update) return "update";
  if (command.delete) return "delete";

  const keys = Object.keys(command);

  return keys.length > 0 ? keys[0] : "Unknown";
}

export function processLogFile(fileContent: string): ParsedLogLine[] {
  const lines = fileContent.split("\n").filter((line) => line.trim());
  const parsedLogs: ParsedLogLine[] = [];

  for (const line of lines) {
    const parsedLog = parseLogLine(line);
    if (parsedLog) {
      parsedLogs.push(parsedLog);
    }
  }

  return parsedLogs;
}
