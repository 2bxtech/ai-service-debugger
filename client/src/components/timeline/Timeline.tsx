
import { useMemo } from 'react';
import { useLogStore } from '../../stores/logStore';
import { useFilterStore } from '../../stores/filterStore';
import { TimelineEvent } from './TimelineEvent';
import { TimelineFilters } from './TimelineFilters';
import type { LogEntry } from '../../types/log';

export function Timeline() {
  const { parsedResult } = useLogStore();
  const { filters } = useFilterStore();

  const filtered = useMemo(() => {
    if (!parsedResult) return [];
    let entries = parsedResult.entries;

    if (filters.services.length)
      entries = entries.filter((e) => filters.services.includes(e.service));
    if (filters.severities.length)
      entries = entries.filter((e) => filters.severities.includes(e.severity));
    if (filters.search)
      entries = entries.filter((e) =>
        e.message.toLowerCase().includes(filters.search.toLowerCase()) ||
        e.service.toLowerCase().includes(filters.search.toLowerCase())
      );

    return entries;
  }, [parsedResult, filters]);

  if (!parsedResult) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
        Load logs to see the timeline
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TimelineFilters />
      <div className="flex-1 overflow-auto px-4 py-2">
        {filtered.map((entry) => (
          <TimelineEvent key={entry.id} entry={entry} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            No log entries match your filters
          </p>
        )}
      </div>
      <div className="px-4 py-2 border-t border-gray-800 text-xs text-gray-500">
        Showing {filtered.length} of {parsedResult.entries.length} entries
      </div>
    </div>
  );
}