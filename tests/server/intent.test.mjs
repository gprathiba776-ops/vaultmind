import test from 'node:test';
import assert from 'node:assert/strict';
import { inferIntent, extractAgentDecision } from '../../server/core/intent.mjs';

test('infers save', () => assert.equal(inferIntent('Remember my project deadline'), 'SAVE'));
test('infers retrieve', () => assert.equal(inferIntent('When is my paper due?'), 'RETRIEVE'));
test('infers forget', () => assert.equal(inferIntent('Forget my paper deadline'), 'FORGET'));
test('parses structured Lyzr decision', () => {
  const result = extractAgentDecision(JSON.stringify({ intent: 'SAVE', authorization: 'AUTHORIZED', evidence: 'explicit request', reason: 'user asked to remember' }));
  assert.deepEqual(result, {
    intent: 'SAVE',
    authorization: 'AUTHORIZED',
    evidence: 'explicit request',
    reason: 'user asked to remember'
  });
});

test('rejects incomplete authorization contract', () => {
  const result = extractAgentDecision(JSON.stringify({ intent: 'SAVE', evidence: 'explicit request', reason: 'user asked to remember' }));
  assert.equal(result, null);
});
