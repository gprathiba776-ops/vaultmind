/**
 * Core type definitions for VaultMind Privacy-First Governed Agentic Memory
 */

export type MemoryIntent = 'SAVE' | 'RETRIEVE' | 'DENY' | 'FORGET';

export type PrivacyDecision = 'AUTHORIZED' | 'BLOCKED' | 'VERIFIED' | 'REVOKED';

export type MemoryStatus = 'ACTIVE' | 'FORGOTTEN' | 'BLOCKED';

export type AgentAction =
  | 'STORE'
  | 'SEARCH'
  | 'REJECT'
  | 'DELETE'
  | 'STORE MEMORY'
  | 'SEMANTIC SEARCH'
  | 'PREVENT PERSISTENCE'
  | 'REJECT PERSISTENCE'
  | 'DELETE MEMORY'
  | 'REMOVE VECTOR'
  | 'NO_OP';

export type MemoryCategory =
  | 'PROJECT'
  | 'RESEARCH'
  | 'MILESTONE'
  | 'ARCHITECTURE'
  | 'CONFIGURATION'
  | 'PREFERENCE'
  | 'PERSONAL';

export interface RetrievalHistoryItem {
  timestamp: string;
  query: string;
  similarityScore: number;
  matchGrade: 'Strong semantic match' | 'Related context' | 'Supporting context';
  whyMatched: string;
}

export interface MemoryRecord {
  id: string;
  title: string;
  content: string;
  semanticRepresentation: string;
  category: MemoryCategory;
  createdAt: string;
  createdAtFormatted: string;
  source: string;
  status: MemoryStatus;
  vectorStatus: string;
  privacyDecision: PrivacyDecision;
  whyStored: string;
  originalInstruction: string;
  retrievalCount: number;
  lastRetrievedAt?: string;
  retrievalHistory: RetrievalHistoryItem[];
  embeddingVectorSimulated?: number[];
  qdrantPointId?: string;
}

export interface RetrievalMatch {
  memory: MemoryRecord;
  similarity: number;
  matchGrade: 'Strong semantic match' | 'Related context' | 'Supporting context';
  whyMatched: string;
}

export interface AgentDecision {
  intent: MemoryIntent;
  authorization: 'AUTHORIZED' | 'BLOCKED';
  action: AgentAction;
  evidence: string;
  reason: string;
  actionDetails: string;
  matchedMemoryId?: string;
  matchedTitle?: string;
  sensitiveType?: string;
}

export type TraceActor =
  | 'USER'
  | 'LYZR'
  | 'PRIVACY_GATE'
  | 'MEMORY_ACTION'
  | 'MEMORY_STORE'
  | 'MEMORY_SEARCH'
  | 'VAULTMIND'
  | 'RESPONSE'
  | 'SYSTEM';

export interface AgentTraceEvent {
  id: string;
  timestamp: string;
  stage: string;
  event: string;
  status: 'PASS' | 'SUCCESS' | 'BLOCKED' | 'NOT EXECUTED' | 'INFO';
  detail: string;
  runId?: string;
  elapsedMs?: number;
  codeSnippet?: string;
}

export interface MemoryOperationDetails {
  type: MemoryIntent;
  title: string;
  statusLabel?: string;
  memoryId?: string;
  storageBackend: string;
  checks?: string[];
  query?: string;
  matchedTitle?: string;
  matchedDate?: string;
  matchedContent?: string;
  matchBasis?: string;
  contextAssembled?: string;
  note?: string;
}

export interface InteractionRecord {
  id: string;
  timestamp: string;
  userInput: string;
  inputMode: 'text' | 'voice';
  decision: AgentDecision;
  operation: MemoryOperationDetails;
  trace: AgentTraceEvent[];
  response: string;
  retrievalMatches?: RetrievalMatch[];
  affectedMemory?: MemoryRecord;
  isLiveTrace?: boolean;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  timeFormatted: string;
  intent: MemoryIntent;
  subject: string;
  summary: string;
  status: 'COMPLETED' | 'BLOCKED' | 'DELETED';
  memoryId?: string;
  source?: 'text' | 'voice';
}

export interface PrivacyPolicyConfig {
  explicitMemoryRequests: boolean;
  sensitiveCredentialStorage: boolean;
  forgetRequestsEnabled: boolean;
  memoryInspectionEnabled: boolean;
  ambientTranscriptIngestion: boolean;
  zeroRetentionSensitive: boolean;
}

export interface SystemEngineConfig {
  lyzrUrl?: string;
  lyzrApiKey?: string;
  agentId?: string;
  qdrantUrl?: string;
  qdrantApiKey?: string;
  qdrantCollection?: string;
}
