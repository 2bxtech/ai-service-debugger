
import { create } from 'zustand';
import type { ChatMessage } from '../types/chat';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;

  sendMessage: (content: string, logs: string, serviceGraph: any) => Promise<void>;
  clearChat: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,

  sendMessage: async (content, logs, serviceGraph) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      messages: [...s.messages, userMsg],
      isLoading: true,
    }));

    try {
      // Build conversation history for context
      const history = get()
        .messages.filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const res = await fetch(`${API_BASE}/analyze/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs,
          serviceGraph,
          conversationHistory: history.slice(0, -1), // Exclude the message we just added
          userMessage: content,
        }),
      });

      if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
        referencedLogLines: extractLogLineRefs(data.reply),
      };

      set((s) => ({
        messages: [...s.messages, aiMsg],
        isLoading: false,
      }));
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `Error: ${err.message}. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      set((s) => ({
        messages: [...s.messages, errMsg],
        isLoading: false,
      }));
    }
  },

  clearChat: () => set({ messages: [] }),
}));

// Extract log line references from AI response (timestamps it mentions)
function extractLogLineRefs(text: string): number[] {
  const tsPattern = /\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g;
  const matches = text.match(tsPattern);
  return matches ? Array.from(new Set(matches)).map((_, i) => i) : [];
}
