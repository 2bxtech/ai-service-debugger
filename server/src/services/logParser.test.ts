import assert from 'node:assert/strict';
import test from 'node:test';
import { parseLogLine, parseLogs } from './logParser';

test('parses ISO logs with bracketed and unbracketed services', () => {
  const bracketed = parseLogLine(
    '2026-07-25T10:30:00.000Z ERROR [payment-service] request failed',
    1,
  );
  const unbracketed = parseLogLine(
    '2026-07-25T10:31:00.000Z WARN auth-service latency elevated',
    2,
  );

  assert.equal(bracketed?.service, 'payment-service');
  assert.equal(bracketed?.severity, 'error');
  assert.equal(unbracketed?.service, 'auth-service');
  assert.equal(unbracketed?.severity, 'warn');
});

test('maps syslog-like service and severity captures correctly', () => {
  const entry = parseLogLine(
    'Jan 15 14:23:01 payment-service ERROR connection failed',
    7,
  );

  assert.deepEqual(entry, {
    timestamp: 'Jan 15 14:23:01',
    service: 'payment-service',
    severity: 'error',
    message: 'connection failed',
    raw: 'Jan 15 14:23:01 payment-service ERROR connection failed',
    lineNumber: 7,
  });
});

test('normalizes syslog-like WARNING and CRIT severities', () => {
  const warning = parseLogLine(
    'Jan 15 14:23:01 worker WARNING queue delayed',
    1,
  );
  const critical = parseLogLine(
    'Jan 15 14:23:02 database CRIT storage unavailable',
    2,
  );

  assert.equal(warning?.severity, 'warn');
  assert.equal(critical?.severity, 'fatal');
});

test('preserves JSON aliases and defaults', () => {
  const result = parseLogs(
    [
      '{"@timestamp":"2026-07-25T10:00:00Z","severity":"ERROR","logger":"api","msg":"failed"}',
      '{"time":"2026-07-25T10:01:00Z","service":"worker","message":"started"}',
    ].join('\n'),
  );

  assert.equal(result.entries[0].timestamp, '2026-07-25T10:00:00Z');
  assert.equal(result.entries[0].service, 'api');
  assert.equal(result.entries[0].severity, 'error');
  assert.equal(result.entries[0].message, 'failed');
  assert.equal(result.entries[1].severity, 'info');
});

test('aggregates mixed input and retains original line numbers', () => {
  const result = parseLogs(
    [
      '2026-07-25T10:00:00Z INFO [api] started',
      '',
      'not a recognized log',
      'Jan 15 14:23:01 worker CRIT queue unavailable',
    ].join('\n'),
  );

  assert.deepEqual(result.services, ['api', 'worker']);
  assert.equal(result.entries[1].lineNumber, 4);
  assert.equal(result.severityCounts.info, 1);
  assert.equal(result.severityCounts.fatal, 1);
  assert.equal(result.parseErrors[0].line, 3);
  assert.equal(result.format, 'structured');
});

test('returns the existing unknown result shape for unrecognized input', () => {
  const result = parseLogs('not a recognized log');

  assert.deepEqual(result.entries, []);
  assert.deepEqual(result.services, []);
  assert.deepEqual(result.timeRange, { start: '', end: '' });
  assert.equal(result.format, 'unknown');
  assert.equal(result.parseErrors.length, 1);
});
