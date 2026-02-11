export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  referencedLogLines?: number[];  // Line numbers AI is discussing
  isLoading?: boolean;
}

export interface AIAnalysis {
  summary: string;
  rootCause: {
    service: string;
    description: string;
    confidence: 'high' | 'medium' | 'low';
    evidenceLogLines: number[];
  };
  severity: Severity;
  blastRadius: string[];         // Affected services
  cascadeChain: string[];        // Service A → B → C
  suggestedActions: {
    action: string;
    priority: 'immediate' | 'short-term' | 'investigate';
  }[];
  timeline: {
    timestamp: string;
    event: string;
    significance: 'trigger' | 'symptom' | 'context';
  }[];
}

export interface DebugSession {
  id: string;
  startedAt: string;
  logs: ParsedLogResult;
  analysis: AIAnalysis | null;
  messages: ChatMessage[];
  serviceGraph: ServiceGraph;
}