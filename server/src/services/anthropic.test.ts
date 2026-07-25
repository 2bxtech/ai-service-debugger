import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeIncident, analyzeInitial, AnalyzeRequest } from './anthropic';

const request: AnalyzeRequest = {
  logs: '2026-07-25T00:00:00Z ERROR [api] upstream unavailable',
  serviceGraph: {
    nodes: [{ id: 'api', name: 'api', type: 'service' }],
    edges: [],
  },
  userMessage: 'What should I check next?',
};

function recordingClient(responseText: string) {
  const calls: Record<string, unknown>[] = [];
  const client = {
    messages: {
      create: async (params: Record<string, unknown>) => {
        calls.push(params);
        return {
          content: [{ type: 'text', text: responseText }],
        };
      },
    },
  };

  return { client, calls };
}

test('initial analysis uses the configured model override', async () => {
  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.ANTHROPIC_MODEL = 'claude-opus-5';
  const { client, calls } = recordingClient('{"summary":"test"}');

  const result = await analyzeInitial(request, client as never);

  assert.equal(result, '{"summary":"test"}');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].model, 'claude-opus-5');
});

test('follow-up chat uses the same configured model override', async () => {
  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.ANTHROPIC_MODEL = 'claude-opus-5';
  const { client, calls } = recordingClient('Check the upstream service.');

  const result = await analyzeIncident(request, client as never);

  assert.equal(result, 'Check the upstream service.');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].model, 'claude-opus-5');
});
