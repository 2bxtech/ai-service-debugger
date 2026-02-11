
function buildSystemPrompt(req: AnalyzeRequest): string {
  const graphDescription = formatServiceGraph(req.serviceGraph);

  return `You are an expert Site Reliability Engineer and production debugging assistant for a microservices platform. You help engineers diagnose incidents quickly and accurately.

## Your Capabilities
- Analyze structured and unstructured log data to identify root causes
- Distinguish root causes from symptoms and cascade failures
- Assess blast radius using service dependency graphs
- Provide concrete, actionable debugging steps (never generic advice)
- Reference specific log lines by their timestamp when explaining findings

## Service Architecture
${graphDescription}

## Analysis Principles
1. **Root cause vs. symptoms**: The first error chronologically isn't always the root cause. Trace the causal chain.
2. **Cascade awareness**: When Service A fails, check what depends on it. Failures in downstream services are symptoms, not independent issues.
3. **Temporal correlation**: Look for events that cluster in time. Configuration changes immediately preceding errors are suspicious.
4. **Resource patterns**: Connection pool exhaustion, memory pressure, and CPU saturation create distinct log signatures.
5. **Recovery signals**: Note when systems recover and what triggered recovery — this confirms root cause.

## Response Style
- Be direct and specific. Engineers are debugging under pressure.
- Always cite log timestamps as evidence.
- When uncertain, say so and suggest what additional data would help.
- Prioritize actionable insights over comprehensive analysis.`;
}

function formatServiceGraph(graph: AnalyzeRequest['serviceGraph']): string {
  if (!graph?.nodes?.length) return 'No service graph provided.';

  const nodeDesc = graph.nodes
    .map(n => `- ${n.name} (${n.id}): type=${n.type}`)
    .join('\n');

  const edgeDesc = graph.edges
    .map(e => `- ${e.source} → ${e.target} [${e.protocol}]${e.label ? ` (${e.label})` : ''}`)
    .join('\n');

  return `### Services\n${nodeDesc}\n\n### Dependencies\n${edgeDesc}`;
}

function buildMessages(req: AnalyzeRequest): { role: 'user' | 'assistant'; content: string }[] {
  const messages: { role: 'user' | 'assistant'; content: string }[] = [];

  // Initial context message with logs
  messages.push({
    role: 'user',
    content: `I'm investigating a production incident. Here are the logs:\n\n${req.logs}`,
  });

  // Add conversation history if this is a follow-up
  if (req.conversationHistory?.length) {
    messages.push(...req.conversationHistory);
  }

  // Add the current user question
  if (req.userMessage) {
    messages.push({ role: 'user', content: req.userMessage });
  }

  return messages;
}

export { buildSystemPrompt, buildMessages, formatServiceGraph };