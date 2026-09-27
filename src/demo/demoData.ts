import { MemoryRecord, TimelineEvent } from '../types/memory';

export const INITIAL_DEMO_MEMORIES: MemoryRecord[] = [
  {
    id: 'vm_demo_sentinel_z',
    title: 'Sentinel-Z Project Deadline',
    content: 'Sentinel-Z paper submission deadline is September 15th, 2026.',
    semanticRepresentation: 'project_submission_deadline(entity: "Sentinel-Z", milestone: "camera-ready paper", date: "2026-09-15T23:59:59Z", topic: "security research")',
    category: 'PROJECT',
    createdAt: '2026-09-10T14:22:00Z',
    createdAtFormatted: 'Sep 10, 2026 · 14:22 UTC',
    source: 'Explicit user instruction',
    status: 'ACTIVE',
    vectorStatus: 'Vector representation stored in Demo Memory Store',
    privacyDecision: 'AUTHORIZED',
    whyStored: 'VaultMind detected an explicit user instruction to retain this information.',
    originalInstruction: 'Remember that my Sentinel-Z paper submission deadline is September 15th, 2026.',
    retrievalCount: 4,
    lastRetrievedAt: '2026-09-24T08:15:00Z',
    retrievalHistory: [
      {
        timestamp: '2026-09-24 · 08:15 UTC',
        query: 'When is my security research paper due?',
        similarityScore: 0.94,
        matchGrade: 'Strong semantic match',
        whyMatched: 'High semantic alignment between "security research paper due" and "Sentinel-Z paper submission deadline".'
      },
      {
        timestamp: '2026-09-20 · 11:04 UTC',
        query: 'What deadlines are coming up this month?',
        similarityScore: 0.88,
        matchGrade: 'Strong semantic match',
        whyMatched: 'Temporal relevance and milestone entity resolution.'
      }
    ]
  },
  {
    id: 'mem_security_02',
    title: 'Zero-Trust Cloud Security Topic',
    content: 'Research paper topic is zero-trust cloud security, decentralized authorization models, and verifiable attestation.',
    semanticRepresentation: 'research_focus(domain: "cloud_security", methodology: ["zero_trust", "decentralized_authz", "verifiable_attestation"], linked_to: "Sentinel-Z")',
    category: 'RESEARCH',
    createdAt: '2026-09-08T09:15:00Z',
    createdAtFormatted: 'Sep 08, 2026 · 09:15 UTC',
    source: 'User instruction (Chat Context)',
    status: 'ACTIVE',
    vectorStatus: 'Vector representation stored in Qdrant (Collection: vaultmind_memories)',
    privacyDecision: 'AUTHORIZED',
    whyStored: 'Technical research direction intentionally saved for contextual recall.',
    originalInstruction: 'Note down that my paper topic is zero-trust cloud security and decentralized authorization models.',
    retrievalCount: 2,
    lastRetrievedAt: '2026-09-22T16:30:00Z',
    retrievalHistory: [
      {
        timestamp: '2026-09-22 · 16:30 UTC',
        query: 'What technical domain is my current paper exploring?',
        similarityScore: 0.91,
        matchGrade: 'Strong semantic match',
        whyMatched: 'Direct semantic correspondence with research domain query.'
      }
    ]
  },
  {
    id: 'mem_hackathon_03',
    title: 'AI Safety Hackathon Submission',
    content: 'User is preparing a high-stakes AI safety hackathon project focused on explainable autonomous memory governance.',
    semanticRepresentation: 'milestone(initiative: "AI Safety Hackathon", track: "Autonomous Agent Memory Governance", deliverable: "Interactive Command Center")',
    category: 'MILESTONE',
    createdAt: '2026-09-05T18:40:00Z',
    createdAtFormatted: 'Sep 05, 2026 · 18:40 UTC',
    source: 'Ambient transcript (Omi-Ready Voice Layer)',
    status: 'ACTIVE',
    vectorStatus: 'Vector representation stored in Qdrant (Collection: vaultmind_memories)',
    privacyDecision: 'AUTHORIZED',
    whyStored: 'Ambient voice transcript ingested with verified user consent for project context.',
    originalInstruction: 'I am building VaultMind for the upcoming AI safety hackathon to tackle memory control.',
    retrievalCount: 3,
    lastRetrievedAt: '2026-09-23T10:12:00Z',
    retrievalHistory: []
  },
  {
    id: 'mem_arch_04',
    title: 'VaultMind Qdrant Vector Architecture',
    content: 'VaultMind architecture uses Qdrant for semantic vector indexing with payload filtering on privacy classification.',
    semanticRepresentation: 'system_architecture(vector_db: "Qdrant", collection: "vaultmind_memories", embedding_dim: 1536, payload_filters: ["privacy_level", "owner_id", "status"])',
    category: 'ARCHITECTURE',
    createdAt: '2026-09-02T11:00:00Z',
    createdAtFormatted: 'Sep 02, 2026 · 11:00 UTC',
    source: 'User instruction (Architecture Review)',
    status: 'ACTIVE',
    vectorStatus: 'Vector representation stored in Qdrant (Collection: vaultmind_memories)',
    privacyDecision: 'AUTHORIZED',
    whyStored: 'Architectural specification intentionally persisted for system reference.',
    originalInstruction: 'Keep in mind our architecture uses Qdrant for semantic vector indexing.',
    retrievalCount: 1,
    lastRetrievedAt: '2026-09-18T14:05:00Z',
    retrievalHistory: []
  },
  {
    id: 'mem_lyzr_05',
    title: 'Lyzr Agent Configuration & Reasoning Gate',
    content: 'Lyzr agent configuration: zero-shot intent classifier with strict privacy filters and deterministic decision orchestration.',
    semanticRepresentation: 'agent_config(framework: "Lyzr", pipeline: ["intent_detector", "privacy_evaluator", "vector_tool_caller"], mode: "deterministic_guardrails")',
    category: 'CONFIGURATION',
    createdAt: '2026-08-28T16:20:00Z',
    createdAtFormatted: 'Aug 28, 2026 · 16:20 UTC',
    source: 'User instruction (System Setup)',
    status: 'ACTIVE',
    vectorStatus: 'Vector representation stored in Qdrant (Collection: vaultmind_memories)',
    privacyDecision: 'AUTHORIZED',
    whyStored: 'System orchestration parameters recorded for agent consistency.',
    originalInstruction: 'Remember the Lyzr agent configuration uses zero-shot intent classification with privacy filters.',
    retrievalCount: 2,
    lastRetrievedAt: '2026-09-15T09:40:00Z',
    retrievalHistory: []
  }
];

export const INITIAL_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'tl_ev_01',
    timestamp: '2026-09-24T08:15:00Z',
    timeFormatted: '08:15 AM',
    intent: 'RETRIEVE',
    subject: 'Security paper deadline',
    summary: 'Memory recalled via semantic search (Sentinel-Z Project Deadline, 94% match)',
    status: 'COMPLETED',
    memoryId: 'mem_sentinel_01'
  },
  {
    id: 'tl_ev_02',
    timestamp: '2026-09-22T16:30:00Z',
    timeFormatted: '04:30 PM',
    intent: 'RETRIEVE',
    subject: 'Research paper topic inquiry',
    summary: 'Memory recalled (Zero-Trust Cloud Security Topic, 91% match)',
    status: 'COMPLETED',
    memoryId: 'mem_security_02'
  },
  {
    id: 'tl_ev_03',
    timestamp: '2026-09-10T14:22:00Z',
    timeFormatted: '02:22 PM',
    intent: 'SAVE',
    subject: 'Sentinel-Z submission deadline',
    summary: 'Semantic memory written to Qdrant collection',
    status: 'COMPLETED',
    memoryId: 'mem_sentinel_01'
  },
  {
    id: 'tl_ev_04',
    timestamp: '2026-09-08T09:15:00Z',
    timeFormatted: '09:15 AM',
    intent: 'SAVE',
    subject: 'Research paper topic definition',
    summary: 'Semantic memory written to Qdrant collection',
    status: 'COMPLETED',
    memoryId: 'mem_security_02'
  }
];
