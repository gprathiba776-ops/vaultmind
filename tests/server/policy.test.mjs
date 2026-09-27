import test from 'node:test';
import assert from 'node:assert/strict';
import { privacyGate, detectSensitive, hasExplicitMemoryRequest } from '../../server/core/policy.mjs';

test('blocks password before persistence', () => {
  const result = privacyGate('Remember my bank password is [REDACTED].', { sensitiveCredentialStorage: true });
  assert.equal(result.blocked, true);
  assert.equal(result.category, 'SENSITIVE_CREDENTIAL');
});

test('allows ordinary project memory', () => {
  const result = privacyGate('Remember that the Sentinel-Z paper is due September 15th.', { sensitiveCredentialStorage: true });
  assert.equal(result.blocked, false);
});

test('sensitive detector is case insensitive', () => {
  assert.ok(detectSensitive('My API KEY is [REDACTED].'));
});

test('credential blocking cannot be disabled by a client policy flag', () => {
  const result = privacyGate('Remember my API key is [REDACTED].', { sensitiveCredentialStorage: false });
  assert.equal(result.blocked, true);
});

test('SAVE requires an explicit persistence instruction', () => {
  assert.equal(hasExplicitMemoryRequest('Remember this project deadline.', 'SAVE'), true);
  assert.equal(hasExplicitMemoryRequest('This project deadline is September 15th.', 'SAVE'), false);
});

test('FORGET requires an explicit deletion instruction', () => {
  assert.equal(hasExplicitMemoryRequest('Forget my project deadline.', 'FORGET'), true);
  assert.equal(hasExplicitMemoryRequest('What is my project deadline?', 'FORGET'), false);
});
