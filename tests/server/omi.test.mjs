import test from 'node:test';
import assert from 'node:assert/strict';
import { extractTranscript, normalizeOmiEvent } from '../../server/core/omi.mjs';

test('extracts Omi transcript text', () => {
  assert.equal(extractTranscript({ transcript: 'Remember my deadline' }), 'Remember my deadline');
});

test('extracts transcript segments', () => {
  assert.equal(extractTranscript({ transcript_segments: [{ text: 'Remember' }, { text: 'my deadline' }] }), 'Remember my deadline');
});

test('normalizes Omi metadata', () => {
  const event = normalizeOmiEvent({ data: { text: 'hello', conversation_id: 'conv_1', user_id: 'user_1' }, language: 'en' });
  assert.equal(event.transcript, 'hello');
  assert.equal(event.conversationId, 'conv_1');
  assert.equal(event.userId, 'user_1');
});
