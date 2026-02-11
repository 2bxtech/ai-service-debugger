
import { create } from 'zustand';

type Panel = 'logs' | 'chat' | 'graph' | 'analysis';

interface UIState {
  theme: 'dark' | 'light';
  activePanel: Panel;
  sidebarOpen: boolean;

  toggleTheme: () => void;
  setActivePanel: (panel: Panel) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  activePanel: 'analysis',
  sidebarOpen: true,

  toggleTheme: () =>
    set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

  setActivePanel: (panel) => set({ activePanel: panel }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));