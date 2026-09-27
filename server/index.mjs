import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { config, integrationStatus } from './config.mjs';
import { normalizeOmiEvent } from './core/omi.mjs';
import { processPipeline } from './pipeline.mjs';
import { health as qdrantHealth } from './integrations/qdrant.mjs';
import { issueSession, requireSession } from './core/identity.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '..', 'dist');

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '256kb' }));
  app.use((req, res, next) => {
    const requestId = req.get('x-request-id') || crypto.randomUUID();
    res.setHeader('x-request-id', requestId);
    res.setHeader('x-content-type-options', 'nosniff');
    res.setHeader('referrer-policy', 'no-referrer');
    res.setHeader('x-frame-options', 'DENY');
    req.requestId = requestId;
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'vaultmind-server', time: new Date().toISOString() });
  });

  app.get('/api/session', (_req, res) => {
    res.json({ ok: true, ...issueSession() });
  });

  app.get('/api/status', async (_req, res, next) => {
    try {
      const status = integrationStatus();
      const qdrant = await qdrantHealth();
      res.json({
        ok: true,
        ...status,
        qdrant: { ...status.qdrant, ...qdrant },
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/agent/process', async (req, res, next) => {
    const session = requireSession(req, res);
    if (!session) return;
    try {
      const { message, mode = 'text', sessionId } = req.body || {};
      if (typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'message is required', code: 'MESSAGE_REQUIRED', requestId: req.requestId });
      }
      const result = await processPipeline({
        message: message.trim(),
        mode: mode === 'voice' ? 'voice' : 'text',
        sessionId: sessionId || `session_${Date.now().toString(36)}`,
        userId: session.userId,
        policy: {},
      });
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  });

  app.post('/api/omi/webhook', async (req, res, next) => {
    if (config.omi.webhookToken) {
      const supplied = req.get('x-omi-webhook-token');
      if (!supplied || supplied !== config.omi.webhookToken) {
        return res.status(401).json({ error: 'Invalid Omi webhook token', code: 'OMI_UNAUTHORIZED', requestId: req.requestId });
      }
    }

    const event = normalizeOmiEvent(req.body || {});
    if (!event.transcript) {
      return res.status(202).json({ accepted: true, processed: false, reason: 'No transcript text found' });
    }
    if (!event.userId && !event.conversationId) {
      return res.status(400).json({ error: 'Omi event requires user_id or conversation_id for memory isolation', code: 'OMI_IDENTITY_REQUIRED', requestId: req.requestId });
    }

    try {
      const userId = event.userId || `omi_${crypto.createHash('sha256').update(event.conversationId).digest('hex').slice(0, 24)}`;
      const result = await processPipeline({
        message: event.transcript,
        mode: 'voice',
        sessionId: event.conversationId || `omi_${Date.now().toString(36)}`,
        userId,
        policy: { sensitiveCredentialStorage: true },
      });
      return res.status(200).json({ accepted: true, processed: true, conversationId: event.conversationId, result });
    } catch (error) {
      return next(error);
    }
  });

  app.get('/api/omi/health', (_req, res) => {
    res.json({
      ok: true,
      mode: config.omi.webhookToken ? 'protected-webhook' : 'development-webhook',
      note: 'Omi transcript adapter; configure the Omi Integration App to POST transcript events here.',
    });
  });

  app.get('/api/openapi.json', (_req, res) => {
    res.json({
      openapi: '3.0.3',
      info: { title: 'VaultMind API', version: '1.1.0' },
      paths: {
        '/api/health': { get: { summary: 'Service health' } },
        '/api/session': { get: { summary: 'Issue an anonymous signed user session' } },
        '/api/status': { get: { summary: 'Integration readiness' } },
        '/api/agent/process': { post: { summary: 'Run a governed memory decision', security: [{ VaultMindSession: [] }] } },
        '/api/omi/webhook': { post: { summary: 'Process an authenticated Omi transcript event' } },
        '/api/omi/health': { get: { summary: 'Omi adapter health' } },
      },
      components: {
        securitySchemes: {
          VaultMindSession: { type: 'apiKey', in: 'header', name: 'x-vaultmind-session' },
        },
      },
    });
  });

  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(distPath, 'index.html'), (error) => {
      if (error) next(error);
    });
  });

  app.use((error, req, res, _next) => {
    const message = error.message || 'Internal server error';
    const status = message.startsWith('LYZR_UNAVAILABLE') ? 502 : 500;
    console.error(JSON.stringify({ event: 'request_error', requestId: req.requestId, error: message }));
    res.status(status).json({ error: message, requestId: req.requestId, code: status === 502 ? 'LYZR_UNAVAILABLE' : 'INTERNAL_ERROR' });
  });

  return app;
}

export const app = createApp();

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(config.port, config.host, () => {
    console.log(`VaultMind server listening on http://${config.host}:${config.port}`);
  });
}
