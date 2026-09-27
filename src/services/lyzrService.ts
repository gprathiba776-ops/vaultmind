import {
  AgentDecision,
  AgentTraceEvent,
  MemoryOperationDetails,
  MemoryRecord,
  PrivacyPolicyConfig,
  RetrievalMatch
} from '../types/memory';
import { analyzeIntentAndExecute, ProcessInputResult } from '../demo/demoAgent';
import { getBackendStatus, processWithBackend, BackendStatus } from './backendService';

export interface LyzrAgentResponse {
  isLive: boolean;
  agentId: string;
  decision: AgentDecision;
  operation: MemoryOperationDetails;
  trace: AgentTraceEvent[];
  response: string;
  retrievalMatches: RetrievalMatch[];
  createdMemory?: Partial<MemoryRecord>;
  forgottenMemoryId?: string;
  isLiveTrace?: boolean;
  latencyMs?: number;
}

export class LyzrService {
  private backendStatus: BackendStatus | null = null;

  public async refreshStatus(): Promise<BackendStatus | null> {
    try {
      this.backendStatus = await getBackendStatus();
      return this.backendStatus;
    } catch {
      this.backendStatus = null;
      return null;
    }
  }

  public getAgentDetails(): { isLive: boolean; agentId: string; statusLabel: string } {
    const configured = Boolean(this.backendStatus?.lyzr?.configured);
    return {
      isLive: configured,
      agentId: this.backendStatus?.lyzr?.agentId || 'vaultmind-orchestrator-01',
      statusLabel: configured ? 'LIVE LYZR MODE' : 'DEMO MODE'
    };
  }

  public getBackendStatus(): BackendStatus | null {
    return this.backendStatus;
  }

  public async processMessage(params: {
    message: string;
    mode: 'text' | 'voice';
    sessionId: string;
    activeMemories: MemoryRecord[];
    allMemories?: MemoryRecord[];
    policy: PrivacyPolicyConfig;
    userId: string;
  }): Promise<LyzrAgentResponse> {
    const { message, mode, sessionId, activeMemories, allMemories, policy, userId } = params;
    const liveBackend = Boolean(this.backendStatus?.lyzr?.configured || this.backendStatus?.qdrant?.reachable);

    if (liveBackend) {
      const data = await processWithBackend({ message, mode, sessionId });
      return {
        isLive: true,
        agentId: this.backendStatus?.lyzr?.agentId || 'vaultmind-server',
        decision: data.decision,
        operation: data.operation,
        trace: data.trace || [],
        response: data.response,
        retrievalMatches: data.retrievalMatches || [],
        createdMemory: data.createdMemory,
        forgottenMemoryId: data.forgottenMemoryId,
        isLiveTrace: Boolean(data.isLiveTrace),
        latencyMs: data.latencyMs,
      };
    }

    const result: ProcessInputResult = analyzeIntentAndExecute({
      input: message,
      mode,
      activeMemories,
      allMemories,
      policy,
      customEngineActive: false
    });

    return {
      isLive: false,
      agentId: 'vaultmind-demo-agent',
      ...result,
      isLiveTrace: false,
    };
  }
}

export const lyzrService = new LyzrService();
