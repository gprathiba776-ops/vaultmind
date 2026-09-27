import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../../server/index.mjs';

let server;
let baseUrl;
let sessionToken;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
  const sessionResponse = await fetch(`${baseUrl}/api/session`);
  const sessionBody = await sessionResponse.json();
  sessionToken = sessionBody.token;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();
  return { response, body };
}

test('GET /api/health returns service health', async () => {
  const { response, body } = await request('/api/health');
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.service, 'vaultmind-server');
});

test('GET /api/status returns integration readiness', async () => {
  const { response, body } = await request('/api/status');
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.ok(body.lyzr);
  assert.ok(body.qdrant);
  assert.ok(body.embeddings);
});

test('GET /api/session issues a signed anonymous session', async () => {
  const { response, body } = await request('/api/session');
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.ok(body.token);
  assert.ok(body.userId.startsWith('user_'));
});

test('POST /api/agent/process requires a signed session', async () => {
  const { response, body } = await request('/api/agent/process', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'Remember this.' }),
  });
  assert.equal(response.status, 401);
  assert.equal(body.code, 'SESSION_REQUIRED');
});

test('POST /api/agent/process validates message', async () => {
  const { response, body } = await request('/api/agent/process', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-vaultmind-session': sessionToken }, body: JSON.stringify({}),
  });
  assert.equal(response.status, 400);
  assert.equal(body.error, 'message is required');
});

test('POST /api/agent/process executes deterministic demo SAVE', async () => {
  const { response, body } = await request('/api/agent/process', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-request-id': 'integration-test', 'x-vaultmind-session': sessionToken },
    body: JSON.stringify({ message: 'Remember that the demo starts at 10 AM.' }),
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-request-id'), 'integration-test');
  assert.equal(body.decision.intent, 'SAVE');
  assert.ok(body.runId);
  assert.ok(Array.isArray(body.trace));
});

test('POST /api/omi/webhook accepts empty event safely', async () => {
  const { response, body } = await request('/api/omi/webhook', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}),
  });
  assert.equal(response.status, 202);
  assert.equal(body.accepted, true);
  assert.equal(body.processed, false);
});

test('GET /api/omi/health reports adapter mode', async () => {
  const { response, body } = await request('/api/omi/health');
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.match(body.mode, /webhook/);
});

test('GET /api/openapi.json publishes API surface', async () => {
  const { response, body } = await request('/api/openapi.json');
  assert.equal(response.status, 200);
  assert.equal(body.openapi, '3.0.3');
  assert.ok(body.paths['/api/agent/process']);
  assert.ok(body.paths['/api/omi/webhook']);
  assert.ok(body.paths['/api/session']);
  assert.ok(body.components.securitySchemes.VaultMindSession);
});
