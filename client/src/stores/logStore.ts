
import { create } from 'zustand';
import type { LogEntry, ParsedLogResult, Severity } from '../types/log';

interface LogState {
  rawInput: string;
  parsedResult: ParsedLogResult | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setRawInput: (input: string) => void;
  parseAndLoad: (raw: string) => Promise<void>;
  loadSample: (sampleId: string) => Promise<void>;
  clear: () => void;
}

const EMPTY_RESULT: ParsedLogResult = {
  entries: [],
  services: [],
  timeRange: { start: '', end: '' },
  severityCounts: { debug: 0, info: 0, warn: 0, error: 0, fatal: 0 },
  format: 'unknown',
  parseErrors: [],
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useLogStore = create<LogState>((set, get) => ({
  rawInput: '',
  parsedResult: null,
  isLoading: false,
  error: null,

  setRawInput: (input) => set({ rawInput: input }),

  parseAndLoad: async (raw: string) => {
    set({ isLoading: true, error: null, rawInput: raw });
    try {
      const res = await fetch(`${API_BASE}/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawLogs: raw }),
      });
      if (!res.ok) throw new Error(`Parse failed: ${res.status}`);
      const result: ParsedLogResult = await res.json();
      // Assign IDs if missing
      result.entries = result.entries.map((e, i) => ({
        ...e,
        id: e.id || `log-${i}`,
      }));
      set({ parsedResult: result, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  loadSample: async (sampleId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/samples/${sampleId}`);
      if (!res.ok) throw new Error(`Sample not found: ${sampleId}`);
      const data = await res.json();

      // Store the raw logs and service graph context
      const { logs, serviceGraph } = data;
      set({ rawInput: logs });

      // Parse the logs
      await get().parseAndLoad(logs);

      // Also update the incident store with the service graph
      // (cross-store communication via direct import)
      useIncidentStore.getState().setServiceGraph(serviceGraph);
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  clear: () => set({ rawInput: '', parsedResult: null, error: null }),
}));
