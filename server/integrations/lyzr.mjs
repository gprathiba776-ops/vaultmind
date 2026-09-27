import { config } from '../config.mjs';
import { extractAgentDecision } from '../core/intent.mjs';

export async function invokeLyzr({ message, sessionId, userId = 'vaultmind-demo-user' }) {
  if (!config.lyzr.apiKey || !config.lyzr.agentId) {
    return { configured: false, structuredDecision: null, response: null, raw: null };
  }

  const response = await fetch(config.lyzr.apiUrl, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-api-key': config.lyzr.apiKey,
    },
    body: JSON.stringify({
      user_id: userId,
      agent_id: config.lyzr.agentId,
      session_id: sessionId,
      message,
    }),
    signal: AbortSignal.timeout(30000),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`Lyzr Agent API returned HTTP ${response.status}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { response: raw };
  }

  const responseText = typeof parsed === 'string' ? parsed : (parsed.response || parsed.message || parsed.output || raw);
  return {
    configured: true,
    structuredDecision: extractAgentDecision(responseText),
    response: String(responseText || ''),
    raw: parsed,
  };
}
