
import type { LogEntry, Severity } from '../../types/logs';

const SEVERITY_COLORS: Record<Severity, string> = {
  debug: 'text-gray-500 bg-gray-500/10',
  info: 'text-blue-400 bg-blue-400/10',
  warn: 'text-yellow-400 bg-yellow-400/10',
  error: 'text-red-400 bg-red-400/10',
  fatal: 'text-red-300 bg-red-500/20 ring-1 ring-red-500/30',
};

const SEVERITY_DOT: Record<Severity, string> = {
  debug: 'bg-gray-500',
  info: 'bg-blue-400',
  warn: 'bg-yellow-400',
  error: 'bg-red-400',
  fatal: 'bg-red-400 animate-pulse',
};

export function TimelineEvent({ entry }: { entry: LogEntry }) {
  const colorClass = SEVERITY_COLORS[entry.severity] || SEVERITY_COLORS.info;
  const dotClass = SEVERITY_DOT[entry.severity] || SEVERITY_DOT.info;

  const time = entry.timestamp.split('T')[1]?.replace('Z', '') || entry.timestamp;

  return (
    <div className={`flex items-start gap-3 py-1.5 px-2 rounded-md text-xs font-mono ${colorClass} mb-1 group`}>
      {/* Timeline dot */}
      <div className="flex flex-col items-center pt-1.5">
        <div className={`w-2 h-2 rounded-full ${dotClass}`} />
      </div>

      {/* Timestamp */}
      <span className="text-gray-500 shrink-0 w-24 pt-0.5">{time}</span>

      {/* Service badge */}
      <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-400">
        {entry.service}
      </span>

      {/* Severity */}
      <span className="shrink-0 w-11 uppercase text-[10px] font-bold pt-0.5">
        {entry.severity}
      </span>

      {/* Message */}
      <span className="flex-1 text-gray-300 break-all">{entry.message}</span>

      {/* Line number */}
      <span className="text-gray-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        L{entry.lineNumber}
      </span>
    </div>
  );
}