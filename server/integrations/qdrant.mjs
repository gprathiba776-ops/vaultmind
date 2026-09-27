import crypto from 'node:crypto';
import { config } from '../config.mjs';
import { embedText } from './embeddings.mjs';

function headers() {
  const result = { 'content-type': 'application/json' };
  if (config.qdrant.apiKey) result['api-key'] = config.qdrant.apiKey;
  return result;
}

function baseUrl() {
  return config.qdrant.url.replace(/\/$/, '');
}

async function qdrant(path, options = {}) {
  const response = await fetch(`${baseUrl()}${path}`, {
    ...options,
    headers: { ...headers(), ...(options.headers || {}) },
    signal: options.signal || AbortSignal.timeout(15000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Qdrant HTTP ${response.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

export function isQdrantConfigured() {
  return Boolean(config.qdrant.url && config.embeddings.apiKey);
}

export async function ensureCollection() {
  if (!isQdrantConfigured()) return false;
  const exists = await qdrant(`/collections/${encodeURIComponent(config.qdrant.collection)}/exists`);
  if (!exists?.result?.exists) {
    await qdrant(`/collections/${encodeURIComponent(config.qdrant.collection)}`, {
      method: 'PUT',
      body: JSON.stringify({
        vectors: { size: config.qdrant.vectorSize, distance: 'Cosine' },
      }),
    });
  }
  return true;
}

export async function saveMemory(memory, userId = 'vaultmind-demo-user') {
  await ensureCollection();
  const vector = await embedText(`${memory.title}\n${memory.content}`);
  const pointId = crypto.randomUUID();
  await qdrant(`/collections/${encodeURIComponent(config.qdrant.collection)}/points?wait=true`, {
    method: 'PUT',
    body: JSON.stringify({
      points: [{
        id: pointId,
        vector,
        payload: {
          memory_id: memory.id,
          user_id: userId,
          title: memory.title,
          content: memory.content,
          category: memory.category,
          status: 'ACTIVE',
          privacy_decision: 'AUTHORIZED',
          source: memory.source,
          created_at: memory.createdAt,
        },
      }],
    }),
  });
  return { pointId };
}

export async function searchMemories(query, limit = 3, userId = 'vaultmind-demo-user') {
  await ensureCollection();
  const vector = await embedText(query);
  const result = await qdrant(`/collections/${encodeURIComponent(config.qdrant.collection)}/points/query`, {
    method: 'POST',
    body: JSON.stringify({
      query: vector,
      limit,
      with_payload: true,
      score_threshold: 0.55,
      filter: {
        must: [
          { key: 'status', match: { value: 'ACTIVE' } },
          { key: 'user_id', match: { value: userId } },
        ],
      },
    }),
  });
  return (result?.result?.points || []).map((point) => ({
    id: point.payload?.memory_id,
    pointId: point.id,
    score: point.score,
    payload: point.payload || {},
  }));
}

export async function deleteMemory(pointId) {
  if (!isQdrantConfigured()) return false;
  await qdrant(`/collections/${encodeURIComponent(config.qdrant.collection)}/points/delete?wait=true`, {
    method: 'POST',
    body: JSON.stringify({ points: [pointId] }),
  });
  return true;
}

export async function health() {
  if (!isQdrantConfigured()) return { configured: false, reachable: false };
  try {
    await qdrant(`/collections/${encodeURIComponent(config.qdrant.collection)}`);
    return { configured: true, reachable: true };
  } catch (error) {
    return { configured: true, reachable: false, error: error.message };
  }
}
