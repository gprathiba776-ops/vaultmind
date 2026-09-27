import React, { useState } from 'react';
import { useVaultMind } from '../context/VaultMindContext';
import { AgentDecisionPanel } from '../components/AgentDecisionPanel';
import { MemoryOperationPanel } from '../components/MemoryOperationPanel';
import { MemoryCard } from '../components/MemoryCard';
import { Mic, ArrowRight, Activity, RefreshCw, CheckCircle2, ShieldAlert, Volume2, VolumeX, Terminal } from 'lucide-react';
import { voiceService } from '../services/voiceService';

export const CommandCenterView: React.FC = () => {
  const {
    executeInput,
    isProcessing,
    processingStep,
    lastInteraction,
    activeMemories,
    setIsTraceOpen,
    setIsVoiceModalOpen,
    setCurrentView,
    qdrantStatus
  } = useVaultMind();

  const [inputVal, setInputVal] = useState('');
  const [buttonState, setButtonState] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [hasActiveInteraction, setHasActiveInteraction] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [voiceResponseEnabled, setVoiceResponseEnabled] = useState(false);
  const [isSpeakingResponse, setIsSpeakingResponse] = useState(false);

  const handlePlayResponse = () => {
    if (!lastInteraction) return;
    if (isSpeakingResponse) {
      voiceService.stopSpeaking();
      setIsSpeakingResponse(false);
    } else {
      setIsSpeakingResponse(true);
      voiceService.speakResponse(lastInteraction.response, () => {
        setIsSpeakingResponse(false);
      });
    }
  };

  const guidedSteps = [
    {
      num: '01',
      title: 'REMEMBER',
      subtitle: 'Save a deadline intentionally',
      text: 'Remember that my Sentinel-Z paper submission deadline is September 15th, 2026.',
      action: 'SAVE',
      accent: 'border-emerald-500/60 bg-emerald-950/25 text-emerald-300'
    },
    {
      num: '02',
      title: 'RECALL',
      subtitle: 'Ask indirectly about that deadline',
      text: 'When do I need to submit my security research paper?',
      action: 'RETRIEVE',
      accent: 'border-sky-500/60 bg-sky-950/25 text-sky-300'
    },
    {
      num: '03',
      title: 'PROTECT',
      subtitle: 'Try to store sensitive information',
      text: 'Remember my bank password is [REDACTED].',
      action: 'DENY',
      accent: 'border-amber-500/60 bg-amber-950/25 text-amber-300'
    },
    {
      num: '04',
      title: 'FORGET',
      subtitle: 'Remove the stored memory',
      text: 'Forget my Sentinel-Z deadline.',
      action: 'FORGET',
      accent: 'border-purple-500/60 bg-purple-950/25 text-purple-300'
    }
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isProcessing) return;
    const text = inputVal.trim();
    setButtonState('processing');

    try {
      await executeInput(text, 'text');
      setHasActiveInteraction(true);
      setButtonState('completed');
    } catch (err) {
      console.error(err);
      setButtonState('failed');
    }
  };

  const handleGuidedClick = async (stepNum: string, text: string) => {
    if (isProcessing) return;
    setSelectedScenario(stepNum);
    setInputVal(text);
    setButtonState('processing');

    try {
      await executeInput(text, 'text');
      setHasActiveInteraction(true);
      setButtonState('completed');
    } catch (err) {
      console.error(err);
      setButtonState('failed');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
          VAULTMIND
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto font-normal">
          Remember intentionally. Retrieve intelligently. Protect privately.
        </p>

        {/* Four System State Indicators */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-neutral-300">SAVE</span> Intentional
          </span>
          <span className="text-neutral-600">·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="font-semibold text-neutral-300">RETRIEVE</span> Semantic
          </span>
          <span className="text-neutral-600">·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-semibold text-neutral-300">DENY</span> Zero-Persistence
          </span>
          <span className="text-neutral-600">·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="font-semibold text-neutral-300">FORGET</span> Zeroization
          </span>
        </div>
      </div>

      {/* Primary Interaction: Large Conversational Command Input */}
      <div className="relative max-w-3xl mx-auto space-y-5">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-2xl border border-white/[0.12] bg-[#0e1119]/80 backdrop-blur-xl shadow-2xl p-2.5 transition-all focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/30"
        >
          <div className="p-2 sm:p-3">
            <textarea
              rows={3}
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                if (buttonState !== 'idle' && !isProcessing) {
                  setButtonState('idle');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Tell VaultMind something worth remembering..."
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between px-2 pt-2 pb-1 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-emerald-300 border border-white/[0.08] transition-colors"
            >
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span>Voice Capture</span>
              <span className="text-[10px] text-neutral-500 font-mono">OMI-READY</span>
            </button>

            {/* Dynamic Button States:
                Initial: ASK VAULTMIND →
                During: PROCESSING... / UNDERSTANDING... / MEMORY INTENT... / PRIVACY CHECK... / EXECUTING...
                Complete: DECISION COMPLETE ✓
                Failed: ACTION FAILED
            */}
            <button
              type="submit"
              disabled={isProcessing}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
                isProcessing
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-emerald-500/10'
                  : buttonState === 'failed'
                  ? 'bg-red-950 text-red-300 border border-red-700'
                  : buttonState === 'completed'
                  ? 'bg-emerald-400 hover:bg-emerald-300 text-neutral-950 shadow-emerald-500/20'
                  : inputVal.trim()
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/20'
                  : 'bg-white/[0.08] hover:bg-white/[0.12] text-neutral-300 border border-white/[0.1]'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span className="font-mono text-[11px] sm:text-xs uppercase">{processingStep || 'PROCESSING...'}</span>
                </>
              ) : buttonState === 'failed' ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>ACTION FAILED</span>
                </>
              ) : buttonState === 'completed' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-neutral-950" />
                  <span>DECISION COMPLETE ✓</span>
                </>
              ) : (
                <>
                  <span>ASK VAULTMIND</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Guided Demo Section: TRY VAULTMIND */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-400">
              TRY VAULTMIND
            </span>
            <span className="text-[11px] text-neutral-500 font-mono">
              Deterministic 4-Step Scenario
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {guidedSteps.map((step) => {
              const isSelected = selectedScenario === step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => handleGuidedClick(step.num, step.text)}
                  disabled={isProcessing}
                  className={`group p-3 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-60 ${
                    isSelected
                      ? `${step.accent} shadow-md`
                      : 'bg-[#0c0f16] hover:bg-[#121622] border-white/[0.08] hover:border-white/[0.2]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className={isSelected ? 'font-bold' : 'text-neutral-500 group-hover:text-neutral-300'}>
                      {step.num}
                    </span>
                    <span className={`text-[10px] font-bold tracking-wider uppercase ${
                      isSelected
                        ? ''
                        : step.action === 'SAVE'
                        ? 'text-emerald-400'
                        : step.action === 'RETRIEVE'
                        ? 'text-sky-400'
                        : step.action === 'DENY'
                        ? 'text-amber-400'
                        : 'text-purple-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  <div className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-neutral-200 group-hover:text-white'}`}>
                    {step.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ACTIVE AGENT WORKSPACE (Directly underneath TRY VAULTMIND) */}
      {hasActiveInteraction && lastInteraction ? (
        <div className="max-w-3xl mx-auto space-y-5 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          
          {/* Workspace Header */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wider uppercase text-white">
                ACTIVE AGENT WORKSPACE
              </span>
            </div>

            <button
              onClick={() => setIsTraceOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-800/40 transition-colors font-medium shadow-sm cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>INSPECT AGENT TRACE</span>
            </button>
          </div>

          {/* Active Input Header: Clearly labels VOICE INPUT or COMMAND INPUT */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-white/[0.08] bg-[#0c0f16] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              {lastInteraction.inputMode === 'voice' ? (
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center gap-1.5 shadow-sm">
                  <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  VOICE INPUT
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-white/[0.06] border border-white/[0.1] text-neutral-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                  COMMAND INPUT
                </span>
              )}
              <span className="text-xs sm:text-sm font-medium text-white italic">
                "{lastInteraction.userInput}"
              </span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto text-[11px] font-mono text-neutral-400">
              <span>{lastInteraction.timestamp}</span>
            </div>
          </div>

          {/* 1. VaultMind Decision (4-column explainable decision) */}
          <AgentDecisionPanel
            decision={lastInteraction.decision}
            onOpenTrace={() => setIsTraceOpen(true)}
          />

          {/* 2. Memory Operation Panel (contextual operation details) */}
          <MemoryOperationPanel
            operation={lastInteraction.operation}
          />

          {/* 3. Inspect Agent Trace Dedicated Action Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-emerald-500/30 bg-[#0e171e] text-neutral-200 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Activity className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Inspect Granular Agent Trace</div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  Full step-by-step reasoning, intent classification & policy validation logs
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsTraceOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>INSPECT AGENT TRACE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4. VaultMind Response */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0c0f16] p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-400 pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-wide uppercase text-[11px]">
                  VaultMind Response
                </span>
                <span className="font-mono text-[11px] text-neutral-500">
                  {lastInteraction.timestamp}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Voice Response Toggle */}
                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                  <span className="text-neutral-400">Voice responses:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !voiceResponseEnabled;
                      setVoiceResponseEnabled(next);
                      voiceService.updateSettings({ voiceResponse: next });
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      voiceResponseEnabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-white/[0.04] text-neutral-400 border border-white/[0.08]'
                    }`}
                  >
                    {voiceResponseEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Speaker Button */}
                <button
                  type="button"
                  onClick={handlePlayResponse}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-emerald-300 border border-white/[0.08] transition-colors cursor-pointer"
                >
                  {isSpeakingResponse ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>▶ Play response</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-sm sm:text-base text-neutral-100 leading-relaxed font-normal">
              "{lastInteraction.response}"
            </p>
          </div>

        </div>
      ) : (
        /* Empty State on initial load */
        <div className="max-w-3xl mx-auto rounded-xl border border-white/[0.08] bg-[#0c0f16]/60 p-6 sm:p-7 text-center space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            READY FOR MEMORY DECISION
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 font-normal max-w-md mx-auto">
            Select a scenario above or enter a directive to initiate the privacy-first memory loop.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] text-neutral-500 font-mono">
            <span>INPUT</span>
            <span>→</span>
            <span>INTENT</span>
            <span>→</span>
            <span>PRIVACY</span>
            <span>→</span>
            <span>DECIDE</span>
            <span>→</span>
            <span>ACTION</span>
          </div>
        </div>
      )}

      {/* Governed Memory Preview */}
      <div className="space-y-4 pt-6 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Persistent Semantic Memory
            </h2>
            <p className="text-xs text-neutral-400">
              Active memory vectors stored in {qdrantStatus.storageLabel}
            </p>
          </div>

          <button
            onClick={() => setCurrentView('memory')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Explore Memory Explorer ({activeMemories.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeMemories.slice(0, 4).map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      </div>

    </div>
  );
};
