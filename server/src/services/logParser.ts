export interface ParsedLine {
  timestamp: string;
  severity: string;
  service: string;
  message: string;
  raw: string;
  lineNumber: number;
}

export interface ParseError {
  line: number;
  raw: string;
  error: string;
}

export interface ParseLogsResult {
  entries: ParsedLine[];
  services: string[];
  timeRange: { start: string; end: string };
  severityCounts: Record<string, number>;
  format: 'structured' | 'unknown';
  parseErrors: ParseError[];
}

interface TextPattern {
  expression: RegExp;
  mapMatch: (match: RegExpMatchArray) => Omit<ParsedLine, 'raw' | 'lineNumber'>;
}

function normalizeSeverity(severity: string): string {
  return severity
    .toLowerCase()
    .replace('warning', 'warn')
    .replace('crit', 'fatal');
}

const TEXT_PATTERNS: TextPattern[] = [
  {
    // 2025-01-15T14:23:01.003Z ERROR [payment-service] message
    expression:
      /^(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)\s+(DEBUG|INFO|WARN|ERROR|FATAL)\s+\[([^\]]+)\]\s+(.+)$/i,
    mapMatch: match => ({
      timestamp: match[1],
      severity: normalizeSeverity(match[2]),
      service: match[3],
      message: match[4],
    }),
  },
  {
    // 2025-01-15T14:23:01.003Z ERROR payment-service message
    expression:
      /^(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)\s+(DEBUG|INFO|WARN|ERROR|FATAL)\s+(\S+)\s+(.+)$/i,
    mapMatch: match => ({
      timestamp: match[1],
      severity: normalizeSeverity(match[2]),
      service: match[3],
      message: match[4],
    }),
  },
  {
    // Jan 15 14:23:01 payment-service ERROR message
    expression:
      /^(\w{3}\s+\d+\s+[\d:]+)\s+(\S+)\s+(DEBUG|INFO|WARN|WARNING|ERROR|FATAL|CRIT)\s+(.+)$/i,
    mapMatch: match => ({
      timestamp: match[1],
      service: match[2],
      severity: normalizeSeverity(match[3]),
      message: match[4],
    }),
  },
];

export function parseLogLine(
  line: string,
  lineNumber: number,
): ParsedLine | null {
  for (const pattern of TEXT_PATTERNS) {
    const match = line.match(pattern.expression);
    if (match) {
      return {
        ...pattern.mapMatch(match),
        raw: line,
        lineNumber,
      };
    }
  }

  try {
    const json = JSON.parse(line);
    const severity = normalizeSeverity(json.level || json.severity || 'info');
    const service = json.service || json.logger || 'unknown';

    return {
      timestamp: json.timestamp || json.time || json['@timestamp'] || '',
      severity,
      service,
      message: json.message || json.msg || JSON.stringify(json),
      raw: line,
      lineNumber,
    };
  } catch {
    return null;
  }
}

export function parseLogs(rawLogs: string): ParseLogsResult {
  const lines = rawLogs.split('\n');
  const entries: ParsedLine[] = [];
  const parseErrors: ParseError[] = [];
  const services = new Set<string>();
  const severityCounts: Record<string, number> = {
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
    fatal: 0,
  };

  lines.forEach((line, index) => {
    if (!line.trim()) return;

    const lineNumber = index + 1;
    const entry = parseLogLine(line, lineNumber);
    if (!entry) {
      parseErrors.push({
        line: lineNumber,
        raw: line,
        error: 'Unrecognized format',
      });
      return;
    }

    entries.push(entry);
    services.add(entry.service);
    severityCounts[entry.severity] =
      (severityCounts[entry.severity] || 0) + 1;
  });

  const timestamps = entries
    .map(entry => entry.timestamp)
    .filter(Boolean)
    .sort();

  return {
    entries,
    services: Array.from(services),
    timeRange: {
      start: timestamps[0] || '',
      end: timestamps[timestamps.length - 1] || '',
    },
    severityCounts,
    format: entries.length > 0 ? 'structured' : 'unknown',
    parseErrors,
  };
}
