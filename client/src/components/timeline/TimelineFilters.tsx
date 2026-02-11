
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useLogStore } from '../../stores/logStore';
import { useFilterStore } from '../../stores/filterStore';
import type { Severity } from '../../types/logs';

const SEVERITIES: Severity[] = ['debug', 'info', 'warn', 'error', 'fatal'];
const SEV_LABEL_COLORS: Record<Severity, string> = {
  debug: 'bg-gray-700 text-gray-300',
  info: 'bg-blue-900/50 text-blue-300',
  warn: 'bg-yellow-900/50 text-yellow-300',
  error: 'bg-red-900/50 text-red-300',
  fatal: 'bg-red-800/50 text-red-200',
};

export interface TimelineFiltersRef {
  focusSearch: () => void;
}

export const TimelineFilters = forwardRef<TimelineFiltersRef>((props, ref) => {
  const { parsedResult } = useLogStore();
  const { filters, setSeverityFilter, setServiceFilter, setSearch } = useFilterStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusSearch: () => {
      searchInputRef.current?.focus();
    },
  }));

  if (!parsedResult) return null;

  const toggleSeverity = (sev: Severity) => {
    const current = filters.severities;
    const next = current.includes(sev)
      ? current.filter((s) => s !== sev)
      : [...current, sev];
    setSeverityFilter(next);
  };

  const toggleService = (svc: string) => {
    const current = filters.services;
    const next = current.includes(svc)
      ? current.filter((s) => s !== svc)
      : [...current, svc];
    setServiceFilter(next);
  };

  return (
    <div className="px-4 py-3 border-b border-gray-800 space-y-2">
      {/* Search */}
      <input
        ref={searchInputRef}
        type="text"
        value={filters.search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search logs..."
        className="w-full px-3 py-1.5 text-xs bg-gray-900 border border-gray-700 rounded-md
          text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {/* Severity toggles */}
      <div className="flex gap-1.5">
        {SEVERITIES.map((sev) => {
          const count = parsedResult.severityCounts[sev] || 0;
          const isActive = filters.severities.length === 0 || filters.severities.includes(sev);
          return (
            <button
              key={sev}
              onClick={() => toggleSeverity(sev)}
              className={`px-2 py-1 text-[10px] rounded-md uppercase font-bold transition-all
                ${isActive ? SEV_LABEL_COLORS[sev] : 'bg-gray-900 text-gray-600'}`}
            >
              {sev} ({count})
            </button>
          );
        })}
      </div>

      {/* Service toggles */}
      <div className="flex gap-1.5 flex-wrap">
        {parsedResult.services.map((svc) => {
          const isActive = filters.services.length === 0 || filters.services.includes(svc);
          return (
            <button
              key={svc}
              onClick={() => toggleService(svc)}
              className={`px-2 py-1 text-[10px] rounded-md transition-all
                ${isActive ? 'bg-gray-700 text-gray-200' : 'bg-gray-900 text-gray-600'}`}
            >
              {svc}
            </button>
          );
        })}
      </div>
    </div>
  );
});
