import { MemoryRecord, RetrievalMatch, TimelineEvent } from '../types/memory';
import { INITIAL_DEMO_MEMORIES, INITIAL_TIMELINE_EVENTS } from '../demo/demoData';
import { computeSemanticSimilarity } from '../demo/demoAgent';

const STORAGE_KEY_MEMORIES = 'vaultmind_memories_v1';
const STORAGE_KEY_TIMELINE = 'vaultmind_timeline_v1';

export class MemoryService {
  private qdrantCollection = 'vaultmind_memories';

  // Browser storage is intentionally demo-only. Live Qdrant access belongs behind the server trust boundary.
  public isQdrantLive(): boolean {
    return false;
  }

  public getStorageDetails(): { isLive: boolean; storageLabel: string; collection: string } {
    const live = this.isQdrantLive();
    return {
      isLive: live,
      storageLabel: live ? 'Qdrant Vector Cluster' : 'Demo Memory Store',
      collection: this.qdrantCollection
    };
  }

  /**
   * Load current memories from local persistence or seed defaults
   */
  public listMemories(): MemoryRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MEMORIES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read stored memories, using initial set', e);
    }
    return [...INITIAL_DEMO_MEMORIES];
  }

  /**
   * Persist list of memories to local store
   */
  public persistMemories(memories: MemoryRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(memories));
    } catch (e) {
      console.warn('Could not persist memories', e);
    }
  }

  /**
   * Retrieve memory by ID
   */
  public getMemory(id: string): MemoryRecord | undefined {
    const all = this.listMemories();
    return all.find((m) => m.id === id);
  }

  /**
   * Save or upsert a memory
   */
  public async saveMemory(memory: Partial<MemoryRecord>): Promise<MemoryRecord> {
    const all = this.listMemories();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord: MemoryRecord = {
      id: memory.id || `mem_${Date.now().toString(36)}`,
      title: memory.title || 'Saved Information',
      content: memory.content || '',
      semanticRepresentation:
        memory.semanticRepresentation ||
        `semantic_entity(title="${memory.title}", hash="${Math.random().toString(16).slice(2, 8)}")`,
      category: memory.category || 'PROJECT',
      createdAt: memory.createdAt || now.toISOString(),
      createdAtFormatted:
        memory.createdAtFormatted ||
        `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${timeStr} UTC`,
      source: memory.source || 'User instruction',
      status: 'ACTIVE',
      vectorStatus: memory.vectorStatus || 'Demo Memory Store',
      privacyDecision: 'AUTHORIZED',
      whyStored: memory.whyStored || 'The user explicitly requested persistent memory.',
      originalInstruction: memory.originalInstruction || memory.content || '',
      retrievalCount: 0,
      retrievalHistory: [],
      qdrantPointId: memory.qdrantPointId
    };

    const existingIndex = all.findIndex((m) => m.id === newRecord.id);
    if (existingIndex >= 0) {
      all[existingIndex] = newRecord;
    } else {
      all.unshift(newRecord);
    }

    this.persistMemories(all);
    return newRecord;
  }

  /**
   * Semantically retrieve matching memories with similarity scores
   */
  public async retrieveMemories(query: string, limit = 3): Promise<RetrievalMatch[]> {
    const all = this.listMemories().filter((m) => m.status === 'ACTIVE');
    const matches: RetrievalMatch[] = all.map((m) => {
      const { score, why } = computeSemanticSimilarity(query, m);
      let matchGrade: 'Strong semantic match' | 'Related context' | 'Supporting context' = 'Supporting context';
      if (score >= 0.88) {
        matchGrade = 'Strong semantic match';
      } else if (score >= 0.75) {
        matchGrade = 'Related context';
      }
      return {
        memory: m,
        similarity: score,
        matchGrade,
        whyMatched: why
      };
    });

    matches.sort((a, b) => b.similarity - a.similarity);
    const top = matches.slice(0, limit);

    // Record retrieval in history for the top match
    if (top.length > 0 && top[0].similarity >= 0.5) {
      const primary = top[0];
      const now = new Date();
      const updated = all.map((m) => {
        if (m.id === primary.memory.id) {
          const newCount = (m.retrievalCount || 0) + 1;
          const history = m.retrievalHistory || [];
          return {
            ...m,
            retrievalCount: newCount,
            lastRetrievedAt: now.toISOString(),
            retrievalHistory: [
              {
                timestamp: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC`,
                query,
                similarityScore: primary.similarity,
                matchGrade: primary.matchGrade,
                whyMatched: primary.whyMatched
              },
              ...history
            ].slice(0, 5)
          };
        }
        return m;
      });
      this.persistMemories(updated);
    }

    return top;
  }

  /**
   * Forget a memory in the application memory state
   */
  public async forgetMemory(id: string): Promise<boolean> {
    const all = this.listMemories();
    const index = all.findIndex((m) => m.id === id);
    if (index >= 0) {
      all[index] = {
        ...all[index],
        status: 'FORGOTTEN',
        vectorStatus: 'Point deletion requested; storage-provider physical erasure is not asserted'
      };
      this.persistMemories(all);
      return true;
    }
    return false;
  }

  /**
   * Restore a previously forgotten memory (for user control in Privacy Center)
   */
  public async restoreMemory(id: string): Promise<boolean> {
    const all = this.listMemories();
    const index = all.findIndex((m) => m.id === id);
    if (index >= 0) {
      all[index] = {
        ...all[index],
        status: 'ACTIVE',
        vectorStatus: 'Restored only in local Demo Memory Store; live Qdrant deletion is not reversed'
      };
      this.persistMemories(all);
      return true;
    }
    return false;
  }

  /**
   * Search memories by keyword or semantic query
   */
  public searchMemories(query: string): MemoryRecord[] {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return this.listMemories();
    }
    const all = this.listMemories();
    return all.filter((m) => {
      return (
        m.title.toLowerCase().includes(trimmed) ||
        m.content.toLowerCase().includes(trimmed) ||
        m.category.toLowerCase().includes(trimmed) ||
        m.semanticRepresentation.toLowerCase().includes(trimmed) ||
        m.whyStored.toLowerCase().includes(trimmed)
      );
    });
  }

  /**
   * Timeline Events API
   */
  public listTimeline(): TimelineEvent[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TIMELINE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read stored timeline', e);
    }
    return [...INITIAL_TIMELINE_EVENTS];
  }

  public addTimelineEvent(event: Omit<TimelineEvent, 'id'>): TimelineEvent {
    const all = this.listTimeline();
    const newEvent: TimelineEvent = {
      ...event,
      id: `tl_${Date.now().toString(36)}`
    };
    all.unshift(newEvent);
    try {
      localStorage.setItem(STORAGE_KEY_TIMELINE, JSON.stringify(all));
    } catch (e) {
      console.warn('Could not persist timeline', e);
    }
    return newEvent;
  }

  /**
   * Reset store back to clean demo seed state
   */
  public resetToDemo(): void {
    localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(INITIAL_DEMO_MEMORIES));
    localStorage.setItem(STORAGE_KEY_TIMELINE, JSON.stringify(INITIAL_TIMELINE_EVENTS));
  }
}

export const memoryService = new MemoryService();
