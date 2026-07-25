import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_ANTHROPIC_MODEL,
  getAnthropicConfig,
} from './anthropic';

test('defaults to Claude Sonnet 5', () => {
  const config = getAnthropicConfig({
    ANTHROPIC_API_KEY: 'test-key',
  });

  assert.equal(config.model, DEFAULT_ANTHROPIC_MODEL);
  assert.equal(config.model, 'claude-sonnet-5');
});

test('uses a configured model override', () => {
  const config = getAnthropicConfig({
    ANTHROPIC_API_KEY: ' test-key ',
    ANTHROPIC_MODEL: ' claude-opus-5 ',
  });

  assert.deepEqual(config, {
    apiKey: 'test-key',
    model: 'claude-opus-5',
  });
});

test('rejects a missing API key', () => {
  assert.throws(
    () => getAnthropicConfig({}),
    /ANTHROPIC_API_KEY is required/,
  );
});
