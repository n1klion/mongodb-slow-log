import { z } from "zod";

export const MongoLogSchema = z.object({
  t: z.object({
    $date: z.string(),
  }),
  s: z.string(),
  c: z.string(),
  id: z.number(),
  ctx: z.string(),
  msg: z.string(),
  attr: z.object({
    type: z.string().optional(),
    ns: z.string().optional(),
    command: z.record(z.string(), z.any()).optional(),
    durationMillis: z.number().optional(),
    planSummary: z.string().optional(),
    docsExamined: z.number().optional(),
    nreturned: z.number().optional(),
    keysExamined: z.number().optional(),
    queryHash: z.string().optional(),
  }),
});

export type MongoLog = z.infer<typeof MongoLogSchema>;

export interface ParsedLogLine {
  id: string;
  timestamp: string;
  collection: string;
  operation: string;
  duration: number;
  planSummary: string;
  docsExamined: number;
  docsReturned: number;
  keysExamined: number;
  efficiencyRatio: number;
  queryHash: string;
  commandJson: string;
  rawLog: string;
}
