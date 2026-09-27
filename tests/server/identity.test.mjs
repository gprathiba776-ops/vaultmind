import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionToken, verifySessionToken } from '../../server/core/identity.mjs';

test('session token round-trips a stable user identity', () => {
  const token = createSessionToken('user_test_123');
  const session = verifySessionToken(token);
  assert.equal(session.userId, 'user_test_123');
  assert.ok(session.expiresAt > Math.floor(Date.now() / 1000));
});

test('tampered session token is rejected', () => {
  const token = createSessionToken('user_test_123');
  const tampered = `${token.slice(0, -1)}x`;
  assert.equal(verifySessionToken(tampered), null);
});

test('malformed session token is rejected', () => {
  assert.equal(verifySessionToken('not-a-token'), null);
});
