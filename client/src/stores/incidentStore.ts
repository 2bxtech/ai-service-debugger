
import { create } from 'zustand';
import type { AIAnalysis, DebugSession } from '../types/chat';
import type { ServiceGraph } from '../types/serviceGraph';

interface IncidentState {
  analysis: AIAnalysis | null;
  serviceGraph: ServiceGraph;
  isAnalyzing: boolean;

  runInitialAnalysis: (logs: string, graph: ServiceGraph) => Promise<void>;
  setServiceGraph: (graph: ServiceGraph) => void;
  clearIncident: () => void;
}

const EMPTY_GRAPH: ServiceGraph = { nodes: [], edges: [] };
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useIncidentStore = create<IncidentState>((set) => ({
  analysis: null,
  serviceGraph: EMPTY_GRAPH,
  isAnalyzing: false,

  runInitialAnalysis: async (logs, graph) => {
    set({ isAnalyzing: true });
    try {
      const res = await fetch(`${API_BASE}/analyze/initial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs, serviceGraph: graph }),
      });
      if (!res.ok) throw new Error(`Analysis failed: ${res.status}`);
      const data = await res.json();
      set({ analysis: data.analysis, isAnalyzing: false });
    } catch (err: any) {
      console.error('Analysis failed:', err);
      set({ isAnalyzing: false });
    }
  },

  setServiceGraph: (graph) => set({ serviceGraph: graph }),
  clearIncident: () => set({ analysis: null, serviceGraph: EMPTY_GRAPH }),
}));
