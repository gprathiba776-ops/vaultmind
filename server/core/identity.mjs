import crypto from 'node:crypto';
import { config } from '../config.mjs';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function secret() {
  if (!config.session.secret) {
    throw new Error('VAULTMIND_SESSION_SECRET is required outside development mode');
  }
  return config.session.secret;
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSessionToken(userId = `user_${crypto.randomUUID()}`) {
  const payload = base64url(JSON.stringify({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  }));
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, signature] = token.split('.', 2);
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!parsed?.sub || !parsed?.exp || parsed.exp <= Math.floor(Date.now() / 1000)) return null;
    return { userId: parsed.sub, expiresAt: parsed.exp };
  } catch {
    return null;
  }
}

export function sessionFromRequest(req) {
  const token = req.get('x-vaultmind-session');
  return verifySessionToken(token);
}

export function requireSession(req, res) {
  const session = sessionFromRequest(req);
  if (session) return session;
  res.status(401).json({
    error: 'A valid VaultMind session is required',
    code: 'SESSION_REQUIRED',
    requestId: req.requestId,
  });
  return null;
}

export function issueSession() {
  const userId = `user_${crypto.randomUUID()}`;
  return {
    token: createSessionToken(userId),
    userId,
    expiresInSeconds: TOKEN_TTL_SECONDS,
  };
}
