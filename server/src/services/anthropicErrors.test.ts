import assert from 'node:assert/strict';
import test from 'node:test';
import Anthropic, { APIError } from '@anthropic-ai/sdk';
import { toProviderHttpError } from './anthropicErrors';

function apiError(status: number, message: string): APIError {
  return Anthropic.APIError.generate(
    status,
    { error: { type: 'api_error', message } },
    message,
    new Headers(),
  );
}

test('maps authentication failures without exposing provider details', () => {
  const result = toProviderHttpError(apiError(401, 'secret provider detail'));

  assert.equal(result.status, 502);
  assert.equal(result.message, 'AI provider authentication failed');
  assert.equal(result.message.includes('secret'), false);
});

test('maps an unavailable model to a service error', () => {
  const result = toProviderHttpError(apiError(404, 'model not found'));

  assert.equal(result.status, 503);
  assert.equal(result.message, 'Configured AI model is unavailable');
});

test('maps rate limits and provider outages', () => {
  assert.deepEqual(
    {
      status: toProviderHttpError(apiError(429, 'rate limited')).status,
      message: toProviderHttpError(apiError(429, 'rate limited')).message,
    },
    {
      status: 429,
      message: 'AI provider rate limit exceeded',
    },
  );

  const outage = toProviderHttpError(apiError(500, 'provider outage'));
  assert.equal(outage.status, 503);
  assert.equal(outage.message, 'AI provider temporarily unavailable');
});

test('sanitizes unexpected failures', () => {
  const result = toProviderHttpError(new Error('sensitive internal detail'));

  assert.deepEqual(result, {
    status: 500,
    message: 'Analysis failed',
  });
});
