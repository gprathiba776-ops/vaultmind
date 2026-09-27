export const INTENTS = ['SAVE', 'RETRIEVE', 'DENY', 'FORGET'];

export function inferIntent(text) {
  const value = text.trim().toLowerCase();
  if (/\b(forget|delete|remove|erase|clear)\b/.test(value)) return 'FORGET';
  if (/^(please\s+)?(remember|save|store)\b/.test(value) || /^(please\s+)?(keep in mind)\b/.test(value) || /^(please\s+)?note (this|that|down)\b/.test(value)) return 'SAVE';
  return 'RETRIEVE';
}

export function normalizeIntent(value) {
  const normalized = String(value || '').trim().toUpperCase();
  return INTENTS.includes(normalized) ? normalized : null;
}

export function extractAgentDecision(responseText) {
  if (!responseText) return null;
  const candidates = [];
  const fenced = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) candidates.push(fenced[1]);
  candidates.push(responseText.trim());

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const intent = normalizeIntent(parsed.intent || parsed.memory_intent || parsed.action);
      if (!intent) continue;
      const authorization = String(parsed.authorization || '').trim().toUpperCase();
      if (!['AUTHORIZED', 'BLOCKED'].includes(authorization)) continue;
      return {
        intent,
        authorization,
        reason: String(parsed.reason || parsed.explanation || 'Lyzr returned a structured memory decision.'),
        evidence: String(parsed.evidence || 'Lyzr agent decision'),
      };
    } catch {
      // Continue to the next candidate. Unstructured responses are handled by guarded fallback.
    }
  }
  return null;
}
