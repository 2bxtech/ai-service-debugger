
import { create } from 'zustand';
import type { LogFilter, Severity } from '../types/log';

interface FilterState {
  filters: LogFilter;
  setServiceFilter: (services: string[]) => void;
  setSeverityFilter: (severities: Severity[]) => void;
  setTimeRange: (start: string | null, end: string | null) => void;
  setSearch: (query: string) => void;
  toggleAIHighlighted: () => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: LogFilter = {
  services: [],
  severities: [],
  timeRange: { start: null, end: null },
  search: '',
  showAIHighlighted: false,
};

export const useFilterStore = create<FilterState>((set) => ({
  filters: { ...DEFAULT_FILTERS },

  setServiceFilter: (services) =>
    set((s) => ({ filters: { ...s.filters, services } })),

  setSeverityFilter: (severities) =>
    set((s) => ({ filters: { ...s.filters, severities } })),

  setTimeRange: (start, end) =>
    set((s) => ({ filters: { ...s.filters, timeRange: { start, end } } })),

  setSearch: (search) =>
    set((s) => ({ filters: { ...s.filters, search } })),

  toggleAIHighlighted: () =>
    set((s) => ({ filters: { ...s.filters, showAIHighlighted: !s.filters.showAIHighlighted } })),

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
}));