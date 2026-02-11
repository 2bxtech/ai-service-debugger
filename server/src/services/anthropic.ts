
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface AnalyzeRequest {
  logs: string;
  serviceGraph: {
    nodes: { id: string; name: string; type: string }[];
    edges: { source: string; target: string; protocol: string; label?: string }[];
  };
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  userMessage?: string; // For follow-up questions
}

export async function analyzeIncident(req: AnalyzeRequest): Promise<string> {
  const systemPrompt = buildSystemPrompt(req);
  const messages = buildMessages(req);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find(b => b.type === 'text');
  return textBlock?.text ?? 'Unable to generate analysis.';
}

export async function analyzeInitial(req: AnalyzeRequest): Promise<string> {
  const systemPrompt = buildSystemPrompt(req);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 3000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Analyze these production logs and provide a structured incident analysis.

Respond in this exact JSON format:
{
  "summary": "One-paragraph incident summary",
  "rootCause": {
    "service": "service-name",
    "description": "What actually went wrong",
    "confidence": "high|medium|low",
    "evidenceLogLines": [line numbers as integers]
  },
  "severity": "fatal|error|warn",
  "blastRadius": ["list", "of", "affected", "services"],
  "cascadeChain": ["origin-service", "next-affected", "..."],
  "suggestedActions": [
    { "action": "Concrete action to take", "priority": "immediate|short-term|investigate" }
  ],
  "timeline": [
    { "timestamp": "ISO timestamp", "event": "What happened", "significance": "trigger|symptom|context" }
  ]
}

LOGS:
${req.logs}`,
      },
    ],
  });

  const textBlock = response.content.find(b => b.type === 'text');
  return textBlock?.text ?? '{}';
}
