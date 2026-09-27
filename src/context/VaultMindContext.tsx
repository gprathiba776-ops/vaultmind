import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  AgentDecision,
  InteractionRecord,
  MemoryRecord,
  PrivacyPolicyConfig,
  TimelineEvent
} from '../types/memory';
import { memoryService } from '../services/memoryService';
import { lyzrService } from '../services/lyzrService';
import { BackendStatus, ensureBackendSession } from '../services/backendService';

function getVaultUserId(): string {
  const key = 'vaultmind_user_id';
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = `user_${crypto.randomUUID()}`;
  window.localStorage.setItem(key, created);
  return created;
}

export type ActiveView = 'command' | 'chat' | 'memory' | 'recall' | 'privacy' | 'activity';

interface VaultMindContextType {
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  memories: MemoryRecord[];
  activeMemories: MemoryRecord[];
  timeline: TimelineEvent[];
  interactionHistory: InteractionRecord[];
  lastInteraction: InteractionRecord | null;
  isProcessing: boolean;
  processingStep: string;
  selectedMemory: MemoryRecord | null;
  setSelectedMemory: (mem: MemoryRecord | null) => void;
  isTraceOpen: boolean;
  setIsTraceOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (open: boolean) => void;
  privacyPolicy: PrivacyPolicyConfig;
  updatePrivacyPolicy: (updates: Partial<PrivacyPolicyConfig>) => void;
  executeInput: (input: string, mode?: 'text' | 'voice') => Promise<InteractionRecord>;
  forgetMemoryById: (id: string) => Promise<void>;
  restoreMemoryById: (id: string) => Promise<void>;
  resetSystemToDefault: () => void;
  lyzrStatus: { isLive: boolean; statusLabel: string; agentId: string };
  qdrantStatus: { isLive: boolean; storageLabel: string; collection: string };
  backendStatus: BackendStatus | null;
}

const DEFAULT_POLICY: PrivacyPolicyConfig = {
  explicitMemoryRequests: true,
  sensitiveCredentialStorage: true, // true means policy is active (credentials are BLOCKED)
  forgetRequestsEnabled: true,
  memoryInspectionEnabled: true,
  ambientTranscriptIngestion: true,
  zeroRetentionSensitive: true
};

const VaultMindContext = createContext<VaultMindContextType | undefined>(undefined);

export const VaultMindProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ActiveView>('command');
  const [memories, setMemories] = useState<MemoryRecord[]>(() => memoryService.listMemories());
  const [timeline, setTimeline] = useState<TimelineEvent[]>(() => memoryService.listTimeline());
  const [interactionHistory, setInteractionHistory] = useState<InteractionRecord[]>([]);
  const [lastInteraction, setLastInteraction] = useState<InteractionRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('Idle');
  const [selectedMemory, setSelectedMemory] = useState<MemoryRecord | null>(null);
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState<PrivacyPolicyConfig>(DEFAULT_POLICY);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);

  const activeMemories = useMemo(() => {
    return memories.filter((m) => m.status === 'ACTIVE');
  }, [memories]);

  const fallbackLyzrStatus = useMemo(() => lyzrService.getAgentDetails(), [backendStatus]);
  const fallbackQdrantStatus = useMemo(() => memoryService.getStorageDetails(), []);
  const lyzrStatus = backendStatus ? {
    isLive: backendStatus.lyzr.configured,
    statusLabel: backendStatus.lyzr.configured ? 'LIVE LYZR MODE' : 'DEMO MODE',
    agentId: backendStatus.lyzr.agentId || 'vaultmind-orchestrator-01'
  } : fallbackLyzrStatus;
  const qdrantStatus = backendStatus ? {
    isLive: Boolean(backendStatus.qdrant.reachable),
    storageLabel: backendStatus.qdrant.reachable ? 'Qdrant Vector Cluster' : 'Demo Memory Store',
    collection: backendStatus.qdrant.collection
  } : fallbackQdrantStatus;


  useEffect(() => {
    ensureBackendSession().catch(() => undefined);
    lyzrService.refreshStatus().then((status) => {
      if (status) setBackendStatus(status);
    });
  }, []);

  // Keyboard shortcut listener: Cmd/Ctrl + K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (selectedMemory) setSelectedMemory(null);
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
        if (isVoiceModalOpen) setIsVoiceModalOpen(false);
        if (isSettingsOpen) setIsSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMemory, isCommandPaletteOpen, isVoiceModalOpen, isSettingsOpen]);

  const updatePrivacyPolicy = (updates: Partial<PrivacyPolicyConfig>) => {
    setPrivacyPolicy((prev) => ({ ...prev, ...updates }));
  };

  const executeInput = async (input: string, mode: 'text' | 'voice' = 'text'): Promise<InteractionRecord> => {
    if (!input.trim() || isProcessing) {
      throw new Error('Invalid input or system is currently processing');
    }

    setIsProcessing(true);
    setProcessingStep('PROCESSING...');

    const sessionId = `session_${Date.now().toString(36)}`;

    // Simulate animated realistic agent trace steps (fast and responsive)
    await new Promise((res) => setTimeout(res, 220));
    setProcessingStep('UNDERSTANDING...');
    await new Promise((res) => setTimeout(res, 220));
    setProcessingStep('MEMORY INTENT...');
    await new Promise((res) => setTimeout(res, 220));
    setProcessingStep('PRIVACY CHECK...');
    await new Promise((res) => setTimeout(res, 220));

    await ensureBackendSession();

    const agentResult = await lyzrService.processMessage({
      message: input,
      mode,
      sessionId,
      activeMemories: memories.filter((m) => m.status === 'ACTIVE'),
      allMemories: memories,
      policy: privacyPolicy,
      userId: getVaultUserId()
    });

    setProcessingStep('EXECUTING...');
    await new Promise((res) => setTimeout(res, 180));

    let affectedMemoryRecord: MemoryRecord | undefined;

    // Handle Intent Execution
    if (agentResult.decision.intent === 'SAVE' && agentResult.createdMemory) {
      const saved = await memoryService.saveMemory(agentResult.createdMemory);
      affectedMemoryRecord = saved;
      setMemories(memoryService.listMemories());

      // Add timeline event
      memoryService.addTimelineEvent({
        timestamp: new Date().toISOString(),
        timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: 'SAVE',
        subject: saved.title,
        summary: `Semantic memory written to ${qdrantStatus.storageLabel}`,
        status: 'COMPLETED',
        memoryId: saved.id,
        source: mode
      });
      setTimeline(memoryService.listTimeline());
    } else if (agentResult.decision.intent === 'FORGET' && agentResult.forgottenMemoryId) {
      await memoryService.forgetMemory(agentResult.forgottenMemoryId);
      setMemories(memoryService.listMemories());

      memoryService.addTimelineEvent({
        timestamp: new Date().toISOString(),
        timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: 'FORGET',
        subject: agentResult.decision.matchedTitle || 'Target Memory',
        summary: 'Live memory deletion completed at the configured storage boundary',
        status: 'DELETED',
        memoryId: agentResult.forgottenMemoryId,
        source: mode
      });
      setTimeline(memoryService.listTimeline());
    } else if (agentResult.decision.intent === 'DENY') {
      memoryService.addTimelineEvent({
        timestamp: new Date().toISOString(),
        timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: 'DENY',
        subject: `Sensitive ${agentResult.decision.sensitiveType || 'credential'}`,
        summary: 'Persistence refused under zero-credential privacy policy',
        status: 'BLOCKED',
        source: mode
      });
      setTimeline(memoryService.listTimeline());
    } else if (agentResult.decision.intent === 'RETRIEVE') {
      // If we matched a memory
      const topMatch = agentResult.retrievalMatches[0];
      if (topMatch) {
        affectedMemoryRecord = topMatch.memory;
        memoryService.addTimelineEvent({
          timestamp: new Date().toISOString(),
          timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: 'RETRIEVE',
          subject: topMatch.memory.title,
          summary: `Recalled via semantic search (${Math.round(topMatch.similarity * 100)}% match)`,
          status: 'COMPLETED',
          memoryId: topMatch.memory.id,
          source: mode
        });
        setTimeline(memoryService.listTimeline());
        setMemories(memoryService.listMemories());
      } else {
        memoryService.addTimelineEvent({
          timestamp: new Date().toISOString(),
          timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: 'RETRIEVE',
          subject: 'Semantic Query',
          summary: 'Inquiry processed; no active vector match found',
          status: 'COMPLETED',
          source: mode
        });
        setTimeline(memoryService.listTimeline());
      }
    }

    const interaction: InteractionRecord = {
      id: `int_${Date.now().toString(36)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      userInput: input,
      inputMode: mode,
      decision: agentResult.decision,
      operation: agentResult.operation,
      trace: agentResult.trace,
      response: agentResult.response,
      retrievalMatches: agentResult.retrievalMatches,
      affectedMemory: affectedMemoryRecord,
      isLiveTrace: agentResult.isLiveTrace
    };

    setLastInteraction(interaction);
    setInteractionHistory((prev) => [interaction, ...prev]);

    setIsProcessing(false);
    setProcessingStep('COMPLETED');

    return interaction;
  };

  const forgetMemoryById = async (id: string) => {
    const mem = memoryService.getMemory(id);
    if (!mem) return;
    await memoryService.forgetMemory(id);
    setMemories(memoryService.listMemories());
    memoryService.addTimelineEvent({
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: 'FORGET',
      subject: mem.title,
      summary: 'Manual deletion via Memory Inspector',
      status: 'DELETED',
      memoryId: id
    });
    setTimeline(memoryService.listTimeline());
    if (selectedMemory && selectedMemory.id === id) {
      setSelectedMemory(memoryService.getMemory(id) || null);
    }
  };

  const restoreMemoryById = async (id: string) => {
    const mem = memoryService.getMemory(id);
    if (!mem) return;
    await memoryService.restoreMemory(id);
    setMemories(memoryService.listMemories());
    memoryService.addTimelineEvent({
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: 'SAVE',
      subject: mem.title,
      summary: 'Demo memory restored from local demo state',
      status: 'COMPLETED',
      memoryId: id
    });
    setTimeline(memoryService.listTimeline());
    if (selectedMemory && selectedMemory.id === id) {
      setSelectedMemory(memoryService.getMemory(id) || null);
    }
  };

  const resetSystemToDefault = () => {
    memoryService.resetToDemo();
    setMemories(memoryService.listMemories());
    setTimeline(memoryService.listTimeline());
    setInteractionHistory([]);
    setLastInteraction(null);
    setSelectedMemory(null);
  };

  return (
    <VaultMindContext.Provider
      value={{
        currentView,
        setCurrentView,
        memories,
        activeMemories,
        timeline,
        interactionHistory,
        lastInteraction,
        isProcessing,
        processingStep,
        selectedMemory,
        setSelectedMemory,
        isTraceOpen,
        setIsTraceOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isVoiceModalOpen,
        setIsVoiceModalOpen,
        privacyPolicy,
        updatePrivacyPolicy,
        executeInput,
        forgetMemoryById,
        restoreMemoryById,
        resetSystemToDefault,
        lyzrStatus,
        qdrantStatus,
        backendStatus
      }}
    >
      {children}
    </VaultMindContext.Provider>
  );
};

export const useVaultMind = (): VaultMindContextType => {
  const context = useContext(VaultMindContext);
  if (!context) {
    throw new Error('useVaultMind must be used within a VaultMindProvider');
  }
  return context;
};
