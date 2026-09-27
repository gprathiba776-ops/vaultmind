const SENSITIVE_PATTERNS = [
  /\bpassword\b/i,
  /\bpasswd\b/i,
  /\bpin\s*(?:number|code)?\b/i,
  /\b(?:cvv|cvc)\b/i,
  /\bcredit\s*card\b/i,
  /\bdebit\s*card\b/i,
  /\bsocial\s*security\b/i,
  /\bssn\b/i,
  /\bapi\s*key\b/i,
  /\bsecret\s*key\b/i,
  /\bprivate\s*key\b/i,
  /\bauth(?:entication)?\s*token\b/i,
  /\bbearer\s+token\b/i,
  /\bseed\s+phrase\b/i,
];

export function detectSensitive(text) {
  const match = SENSITIVE_PATTERNS.find((pattern) => pattern.test(text));
  return match ? match.source : null;
}

export function hasExplicitMemoryRequest(text, intent) {
  const value = String(text || '').trim();
  if (intent === 'SAVE') return /^(please\s+)?(remember|save|store)\b/i.test(value) || /^(please\s+)?(keep in mind)\b/i.test(value) || /^(please\s+)?note\s+(this|that|down)\b/i.test(value);
  if (intent === 'FORGET') return /\b(forget|delete|remove|erase|clear)\b/i.test(value);
  return true;
}

export function privacyGate(text, _policy = {}) {
  const sensitive = detectSensitive(text);
  // Credential persistence is a server invariant. Client-provided policy flags can never disable it.
  const blocked = Boolean(sensitive);
  return {
    allowed: !blocked,
    blocked,
    category: blocked ? 'SENSITIVE_CREDENTIAL' : null,
    reason: blocked
      ? 'Sensitive credential information is not eligible for persistent memory.'
      : 'No blocked credential class detected by the persistence policy.',
  };
}
