export type Severity = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  id: string;
  timestamp: string;        // ISO 8601
  service: string;
  severity: Severity;
  message: string;
  traceId?: string;
  spanId?: string;
  metadata?: Record<string, unknown>;
  raw: string;              // Original line
  lineNumber: number;
}

export interface ParsedLogResult {
  entries: LogEntry[];
  services: string[];        // Unique services found
  timeRange: { start: string; end: string };
  severityCounts: Record<Severity, number>;
  format: 'json' | 'structured' | 'plaintext' | 'unknown';
  parseErrors: { line: number; raw: string; error: string }[];
}

export interface LogFilter {
  services: string[];
  severities: Severity[];
  timeRange: { start: string | null; end: string | null };
  search: string;
  showAIHighlighted: boolean;
}