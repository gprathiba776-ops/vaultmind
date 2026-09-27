function segmentText(segments) {
  if (!Array.isArray(segments)) return '';
  return segments
    .map((segment) => {
      if (typeof segment === 'string') return segment;
      return segment?.text || segment?.transcript || '';
    })
    .filter(Boolean)
    .join(' ')
    .trim();
}

export function extractTranscript(payload = {}) {
  const candidates = [
    payload.text,
    payload.transcript,
    payload.transcript_text,
    payload.data?.text,
    payload.data?.transcript,
    segmentText(payload.transcript_segments),
    segmentText(payload.data?.transcript_segments),
  ];
  return candidates.find((value) => typeof value === 'string' && value.trim())?.trim() || '';
}

export function normalizeOmiEvent(payload = {}) {
  return {
    transcript: extractTranscript(payload),
    conversationId: payload.conversation_id || payload.conversationId || payload.data?.conversation_id || payload.data?.conversationId || null,
    source: payload.source || payload.data?.source || 'omi',
    userId: payload.user_id || payload.userId || payload.data?.user_id || payload.data?.userId || null,
    language: payload.language || payload.data?.language || 'en',
    startedAt: payload.started_at || payload.data?.started_at || null,
    finishedAt: payload.finished_at || payload.data?.finished_at || null,
  };
}
