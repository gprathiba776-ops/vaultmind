const SESSION_KEY = 'vaultmind_session_token';

export interface BackendStatus {
  ok: boolean;
  mode: 'DEMO' | 'SERVER' | string;
  lyzr: { configured: boolean; agentId: string; endpoint?: string };
  qdrant: { configured: boolean; reachable?: boolean; collection: string; url?: string | null };
  embeddings: { configured: boolean; model: string; dimensions: number };
  omi: { webhookConfigured: boolean; apiConfigured: boolean };
}

function apiBase(): string {
  const configured = import.meta.env.VITE_API_BASE_URL;
  return configured ? String(configured).replace(/\/$/, '') : '';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = window.localStorage.getItem(SESSION_KEY);
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-vaultmind-session': token } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`Backend HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

export async function getBackendStatus(): Promise<BackendStatus> {
  return request<BackendStatus>('/api/status');
}

export async function ensureBackendSession(): Promise<string> {
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const data = await request<{ token: string }>('/api/session');
  window.localStorage.setItem(SESSION_KEY, data.token);
  return data.token;
}

export async function processWithBackend(payload: {
  message: string;
  mode: 'text' | 'voice';
  sessionId: string;
}) {
  return request<any>('/api/agent/process', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

