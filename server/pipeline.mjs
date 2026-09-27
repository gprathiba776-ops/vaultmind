import crypto from 'node:crypto';
import { config } from './config.mjs';
import { hasExplicitMemoryRequest, privacyGate } from './core/policy.mjs';
import { inferIntent } from './core/intent.mjs';
import { invokeLyzr as defaultInvokeLyzr } from './integrations/lyzr.mjs';
import {
  deleteMemory as defaultDeleteMemory,
  isQdrantConfigured as defaultIsQdrantConfigured,
  searchMemories as defaultSearchMemories,
  saveMemory as defaultSaveMemory,
} from './integrations/qdrant.mjs';

const DEFAULT_USER_ID = 'vaultmind-demo-user';
const MUTATING_INTENTS = new Set(['SAVE', 'FORGET']);

function trace(runId, stage, event, status, detail, startedAt) {
  return {
    id: crypto.randomUUID(),
    runId,
    timestamp: new Date().toISOString(),
    elapsedMs: Math.max(0, Date.now() - startedAt),
    stage,
    event,
    status,
    detail,
  };
}

function titleFor(text) {
  const content = text.replace(/^\s*(remember|save|store|note|keep in mind)(?: that| this| my| to)?\s*/i, '').trim();
  return content.split(/\s+/).slice(0, 6).join(' ') || 'Saved Information';
}

function contentFor(text) {
  return text.replace(/^\s*(remember|save|store|note|keep in mind)(?: that| this| my| to)?\s*/i, '').trim();
}

function responseFor(intent, memory) {
  if (intent === 'SAVE') return `Saved intentionally. I'll remember ${memory?.title ? `the ${memory.title}.` : 'that.'}`;
  if (intent === 'RETRIEVE') return memory ? `I found a relevant memory: ${memory.content}` : "I don't have an active memory matching that request.";
  if (intent === 'DENY') return "I won't store sensitive credential information. Nothing was persisted.";
  return memory ? 'That memory has been forgotten.' : 'I could not find an active memory to forget.';
}

function runtimeStatus() {
  const liveLyzr = Boolean(config.lyzr.apiKey && config.lyzr.agentId);
  const qdrantConfigured = defaultIsQdrantConfigured();
  return { liveLyzr, qdrantConfigured, storageBackend: qdrantConfigured ? 'Qdrant' : 'Demo Memory Store' };
}

function baseResult({ runId, trace: traces, started, decision, operation, response, retrievalMatches = [], ...extra }) {
  const { liveLyzr } = runtimeStatus();
  return {
    runId,
    isLive: true,
    isLiveTrace: liveLyzr,
    decision,
    operation,
    trace: traces,
    response,
    retrievalMatches,
    latencyMs: Date.now() - started,
    ...extra,
  };
}

function blockedResult({ runId, traces, started, reason, evidence, storageBackend, response, intent = 'DENY' }) {
  return baseResult({
    runId,
    trace: traces,
    started,
    decision: {
      intent,
      authorization: 'BLOCKED',
      action: 'REJECT PERSISTENCE',
      evidence,
      reason,
      actionDetails: 'Server-side execution boundary blocked persistence.',
    },
    operation: {
      type: 'DENY',
      title: 'MEMORY WRITE BLOCKED',
      statusLabel: 'NOT EXECUTED',
      storageBackend,
      note: 'Nothing was stored.',
    },
    response,
  });
}

export async function processPipeline(
  { message, mode = 'text', sessionId, userId = DEFAULT_USER_ID, policy = {} },
  dependencies = {},
) {
  const started = Date.now();
  const runId = `run_${crypto.randomUUID()}`;
  const traces = [];
  const addTrace = (stage, event, status, detail) => traces.push(trace(runId, stage, event, status, detail, started));
  const invokeLyzr = dependencies.invokeLyzr || defaultInvokeLyzr;
  const isQdrantConfigured = dependencies.isQdrantConfigured || defaultIsQdrantConfigured;
  const searchMemories = dependencies.searchMemories || defaultSearchMemories;
  const saveMemory = dependencies.saveMemory || defaultSaveMemory;
  const deleteMemory = dependencies.deleteMemory || defaultDeleteMemory;
  const qdrantConfigured = isQdrantConfigured();
  const injectedLyzr = Boolean(dependencies.invokeLyzr);
  const liveLyzrConfigured = Boolean(config.lyzr.apiKey && config.lyzr.agentId);
  const liveLyzr = liveLyzrConfigured || injectedLyzr;
  const storageBackend = qdrantConfigured ? 'Qdrant' : 'Demo Memory Store';

  addTrace(mode === 'voice' ? 'VOICE INPUT' : 'USER INPUT', 'Input received', 'INFO', message);

  const effectivePolicy = {
    explicitMemoryRequests: true,
    sensitiveCredentialStorage: true,
  };
  const privacy = privacyGate(message, effectivePolicy);
  if (privacy.blocked) {
    addTrace('PRIVACY GATE', 'BLOCKED', 'BLOCKED', privacy.reason);
    addTrace('MEMORY ACTION', 'NOT EXECUTED', 'NOT EXECUTED', 'No embedding or persistent memory write was attempted.');
    addTrace('RESPONSE', 'Nothing stored', 'SUCCESS', 'Sensitive content was stopped before persistence.');
    return baseResult({
      runId,
      trace: traces,
      started,
      decision: {
        intent: 'DENY',
        authorization: 'BLOCKED',
        action: 'REJECT PERSISTENCE',
        evidence: mode === 'voice' ? 'Sensitive credential detected in voice transcript' : 'Sensitive credential information',
        reason: privacy.reason,
        actionDetails: 'Persistence prevented before memory storage.',
        sensitiveType: 'credential',
      },
      operation: {
        type: 'DENY',
        title: 'MEMORY WRITE BLOCKED',
        statusLabel: 'NOT EXECUTED',
        storageBackend,
        note: 'Nothing was stored.',
      },
      response: responseFor('DENY'),
    });
  }

  let lyzr = { configured: false, structuredDecision: null, response: null };
  if (liveLyzr) {
    try {
      lyzr = await invokeLyzr({ message, sessionId, userId });
      addTrace(
        'LYZR AGENT',
        'Reasoning completed',
        'SUCCESS',
        lyzr.structuredDecision
          ? 'Structured memory decision received.'
          : 'Agent response received; guarded intent fallback used because structured decision was not parseable.',
      );
    } catch (error) {
      addTrace('LYZR AGENT', 'Invocation failed', 'BLOCKED', error.message);
      throw new Error(`LYZR_UNAVAILABLE: ${error.message}`);
    }
  }

  const hasStructuredDecision = Boolean(lyzr.structuredDecision);
  const intent = lyzr.structuredDecision?.intent || inferIntent(message);
  const authorization = lyzr.structuredDecision?.authorization || 'AUTHORIZED';
  const reason = lyzr.structuredDecision?.reason || `Guarded intent classification selected ${intent}.`;
  const evidence = lyzr.structuredDecision?.evidence || 'VaultMind deterministic guardrail';

  if (liveLyzr && !hasStructuredDecision && MUTATING_INTENTS.has(intent)) {
    addTrace('EXECUTION GUARD', 'FAIL CLOSED', 'BLOCKED', 'Lyzr did not return the required structured decision contract; mutation was not executed.');
    return blockedResult({
      runId,
      traces,
      started,
      storageBackend,
      evidence: 'Malformed or unstructured Lyzr decision',
      reason: 'VaultMind requires an explicit structured decision before a memory mutation.',
      response: 'I could not safely execute that memory change because the agent decision was incomplete. Nothing was persisted or deleted.',
      intent: 'DENY',
    });
  }

  addTrace('MEMORY INTENT', intent, 'PASS', evidence);
  addTrace('PRIVACY GATE', authorization, authorization === 'BLOCKED' ? 'BLOCKED' : 'PASS', reason);

  if (['SAVE', 'FORGET'].includes(intent) && effectivePolicy.explicitMemoryRequests && !hasExplicitMemoryRequest(message, intent)) {
    addTrace('EXECUTION GUARD', 'EXPLICIT INTENT REQUIRED', 'BLOCKED', `The ${intent} action requires an explicit user memory instruction.`);
    return blockedResult({
      runId,
      traces,
      started,
      storageBackend,
      evidence: 'Implicit persistence mutation request',
      reason: `VaultMind requires an explicit ${intent} instruction before changing persistent memory.`,
      response: `I won't ${intent === 'SAVE' ? 'store' : 'delete'} that automatically. Please make the memory instruction explicit.`,
      intent: 'DENY',
    });
  }

  if (authorization === 'BLOCKED') {
    addTrace('MEMORY ACTION', 'NOT EXECUTED', 'NOT EXECUTED', 'The server rejected the persistence operation because the agent decision was BLOCKED.');
    return blockedResult({
      runId,
      traces,
      started,
      storageBackend,
      evidence,
      reason,
      response: "I won't store that information. Nothing was persisted.",
    });
  }

  let createdMemory;
  let forgottenMemoryId;
  let retrievalMatches = [];

  if (intent === 'SAVE') {
    createdMemory = {
      id: `mem_${crypto.randomUUID()}`,
      title: titleFor(message),
      content: contentFor(message),
      category: 'PROJECT',
      source: mode === 'voice' ? 'Voice transcript' : 'Explicit user instruction',
      status: 'ACTIVE',
      privacyDecision: 'AUTHORIZED',
      originalInstruction: message,
      createdAt: new Date().toISOString(),
      retrievalCount: 0,
      retrievalHistory: [],
    };

    if (qdrantConfigured) {
      const stored = await saveMemory(createdMemory, userId);
      createdMemory.qdrantPointId = stored.pointId;
      createdMemory.vectorStatus = `Persisted in Qdrant collection ${config.qdrant.collection}`;
      addTrace('MEMORY ACTION', 'STORE MEMORY', 'SUCCESS', `Vector point ${stored.pointId} persisted to Qdrant.`);
    } else {
      createdMemory.vectorStatus = 'Demo Memory Store';
      addTrace('MEMORY ACTION', 'STORE MEMORY', 'SUCCESS', 'Live Qdrant is not configured; persistent storage was not claimed.');
    }
  } else if (intent === 'RETRIEVE') {
    if (qdrantConfigured) {
      retrievalMatches = await searchMemories(message, 3, userId);
      addTrace('MEMORY SEARCH', `${retrievalMatches.length} MATCHES`, 'SUCCESS', 'Semantic vector search executed in Qdrant with ACTIVE-memory and user isolation filters.');
    } else {
      addTrace('MEMORY SEARCH', 'LIVE SEARCH UNAVAILABLE', 'INFO', 'Qdrant is not configured; use deterministic Demo Mode for local semantic scenarios.');
    }
  } else if (intent === 'FORGET' && qdrantConfigured) {
    const candidates = await searchMemories(message, 1, userId);
    const target = candidates[0];
    if (target?.pointId) {
      await deleteMemory(target.pointId);
      forgottenMemoryId = target.id;
      addTrace('MEMORY SEARCH', 'TARGET LOCATED', 'SUCCESS', `Selected ${target.id} for deletion.`);
      addTrace('MEMORY ACTION', 'DELETE MEMORY', 'SUCCESS', `Qdrant point ${target.pointId} deleted.`);
    } else {
      addTrace('MEMORY SEARCH', 'NO ACTIVE MATCH', 'INFO', 'No active memory matched the forget request.');
    }
  } else if (intent === 'FORGET') {
    addTrace('MEMORY ACTION', 'DELETE REQUEST', 'INFO', 'Demo Mode requires the frontend memory store to execute deletion.');
  }

  if (intent === 'RETRIEVE') {
    const first = retrievalMatches[0];
    const memory = first
      ? {
          id: first.id,
          title: first.payload.title,
          content: first.payload.content,
          semanticRepresentation: 'qdrant-semantic-memory',
          category: first.payload.category || 'PROJECT',
          createdAt: first.payload.created_at || new Date().toISOString(),
          createdAtFormatted: first.payload.created_at || '',
          source: first.payload.source || 'Qdrant semantic memory',
          status: first.payload.status || 'ACTIVE',
          vectorStatus: `Qdrant point ${first.pointId}`,
          privacyDecision: 'AUTHORIZED',
          whyStored: 'Persisted through the governed memory pipeline.',
          originalInstruction: first.payload.content || '',
          retrievalCount: 0,
          retrievalHistory: [],
          qdrantPointId: first.pointId,
        }
      : null;
    const uiRetrievalMatches = retrievalMatches.map((match) => ({
      memory: {
        id: match.id,
        title: match.payload?.title || 'Retrieved Memory',
        content: match.payload?.content || '',
        semanticRepresentation: 'qdrant-semantic-memory',
        category: match.payload?.category || 'PROJECT',
        createdAt: match.payload?.created_at || new Date().toISOString(),
        createdAtFormatted: match.payload?.created_at || '',
        source: match.payload?.source || 'Qdrant semantic memory',
        status: match.payload?.status || 'ACTIVE',
        vectorStatus: `Qdrant point ${match.pointId}`,
        privacyDecision: 'AUTHORIZED',
        whyStored: 'Persisted through the governed memory pipeline.',
        originalInstruction: match.payload?.content || '',
        retrievalCount: 0,
        retrievalHistory: [],
        qdrantPointId: match.pointId,
      },
      similarity: match.score,
      matchGrade: match.score >= 0.88 ? 'Strong semantic match' : match.score >= 0.75 ? 'Related context' : 'Supporting context',
      whyMatched: 'Semantic similarity search in the active user memory namespace.',
    }));
    if (memory) addTrace('CONTEXT ASSEMBLY', 'GROUNDING MEMORY', 'SUCCESS', `Selected ${memory.id} as the primary memory match.`);
    addTrace('RESPONSE', 'Response generated', 'SUCCESS', memory ? 'Response grounded in retrieved memory.' : 'Response generated without active memory context.');
    return baseResult({
      runId,
      trace: traces,
      started,
      decision: { intent, authorization, action: 'SEMANTIC SEARCH', evidence, reason, actionDetails: `Semantic retrieval against ${storageBackend}.`, matchedMemoryId: memory?.id, matchedTitle: memory?.title },
      operation: { type: intent, title: 'SEMANTIC RECALL', query: message, statusLabel: memory ? 'MATCH FOUND' : 'NO ACTIVE MATCH', matchBasis: 'Vector similarity', contextAssembled: memory ? 'Primary memory grounded response' : 'No active memory context', storageBackend },
      response: responseFor('RETRIEVE', memory),
      retrievalMatches: uiRetrievalMatches,
    });
  }

  if (intent === 'FORGET') {
    const forgotten = Boolean(forgottenMemoryId);
    addTrace('RESPONSE', forgotten ? 'Memory forgotten' : 'No active memory found', 'SUCCESS', forgotten ? 'Deletion completed at the persistence layer.' : 'No deletion was executed.');
    return baseResult({
      runId,
      trace: traces,
      started,
      decision: { intent, authorization, action: 'DELETE MEMORY', evidence, reason, actionDetails: forgotten ? `Deleted the matched persistent memory from ${storageBackend}.` : 'No active memory matched the forget request.' },
      operation: { type: intent, title: 'MEMORY DELETION', statusLabel: forgotten ? 'FORGOTTEN' : 'NO ACTIVE MATCH', memoryId: forgottenMemoryId, storageBackend },
      response: forgotten ? 'That memory has been forgotten.' : 'I could not find an active memory matching that request.',
      forgottenMemoryId,
    });
  }

  addTrace('RESPONSE', 'Response generated', 'SUCCESS', 'Response grounded in the resulting memory operation.');
  return baseResult({
    runId,
    trace: traces,
    started,
    decision: { intent, authorization, action: intent === 'SAVE' ? 'STORE MEMORY' : 'NO_OP', evidence, reason, actionDetails: `Memory action completed using ${storageBackend}.` },
    operation: { type: intent, title: intent === 'SAVE' ? 'MEMORY WRITE' : 'MEMORY OPERATION', statusLabel: createdMemory ? 'ACTIVE' : 'COMPLETED', memoryId: createdMemory?.id, storageBackend },
    response: responseFor(intent, createdMemory),
    createdMemory,
    forgottenMemoryId,
  });
}

export async function deleteQdrantMemory(pointId, dependencies = {}) {
  if (!pointId) throw new Error('pointId is required');
  const deleteMemory = dependencies.deleteMemory || defaultDeleteMemory;
  return deleteMemory(pointId);
}
