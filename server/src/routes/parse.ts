
import { Router, Request, Response } from 'express';

export const parseRouter = Router();

interface ParsedLine {
  timestamp: string;
  severity: string;
  service: string;
  message: string;
  raw: string;
  lineNumber: number;
}

// Regex patterns for common log formats
const LOG_PATTERNS = [
  // ISO timestamp + severity + service: 2025-01-15T14:23:01.003Z ERROR [payment-service] message
  /^(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)\s+(DEBUG|INFO|WARN|ERROR|FATAL)\s+\[([^\]]+)\]\s+(.+)$/i,
  // ISO timestamp + severity + service (no brackets): 2025-01-15T14:23:01.003Z ERROR payment-service message
  /^(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)\s+(DEBUG|INFO|WARN|ERROR|FATAL)\s+(\S+)\s+(.+)$/i,
  // Syslog-like: Jan 15 14:23:01 service ERROR message
  /^(\w{3}\s+\d+\s+[\d:]+)\s+(\S+)\s+(DEBUG|INFO|WARN|WARNING|ERROR|FATAL|CRIT)\s+(.+)$/i,
];

parseRouter.post('/', (req: Request, res: Response) => {
  const { rawLogs } = req.body;
  if (!rawLogs) return res.status(400).json({ error: 'rawLogs required' });

  const lines = rawLogs.split('\n').filter((l: string) => l.trim());
  const entries: ParsedLine[] = [];
  const errors: { line: number; raw: string; error: string }[] = [];
  const services = new Set<string>();
  const severityCounts: Record<string, number> = { debug: 0, info: 0, warn: 0, error: 0, fatal: 0 };

  lines.forEach((line: string, idx: number) => {
    let matched = false;
    for (const pattern of LOG_PATTERNS) {
      const m = line.match(pattern);
      if (m) {
        const severity = m[2].toLowerCase().replace('warning', 'warn').replace('crit', 'fatal');
        const service = m[3];
        services.add(service);
        severityCounts[severity] = (severityCounts[severity] || 0) + 1;
        entries.push({
          timestamp: m[1],
          severity,
          service,
          message: m[4],
          raw: line,
          lineNumber: idx + 1,
        });
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Try JSON log format
      try {
        const json = JSON.parse(line);
        const severity = (json.level || json.severity || 'info').toLowerCase();
        const service = json.service || json.logger || 'unknown';
        services.add(service);
        severityCounts[severity] = (severityCounts[severity] || 0) + 1;
        entries.push({
          timestamp: json.timestamp || json.time || json['@timestamp'] || '',
          severity,
          service,
          message: json.message || json.msg || JSON.stringify(json),
          raw: line,
          lineNumber: idx + 1,
        });
      } catch {
        errors.push({ line: idx + 1, raw: line, error: 'Unrecognized format' });
      }
    }
  });

  const timestamps = entries.map(e => e.timestamp).filter(Boolean).sort();

  res.json({
    entries,
    services: Array.from(services),
    timeRange: { start: timestamps[0] || '', end: timestamps[timestamps.length - 1] || '' },
    severityCounts,
    format: entries.length > 0 ? 'structured' : 'unknown',
    parseErrors: errors,
  });
});

