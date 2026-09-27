import React from 'react';
import { useVaultMind } from '../context/VaultMindContext';
import { AgentTraceEvent } from '../types/memory';
import { X, CheckCircle2, AlertOctagon, Terminal, ArrowRight, ShieldCheck, Database, Cpu, Lock } from 'lucide-react';

export const AgentTraceDrawer: React.FC = () => {
  const { isTraceOpen, setIsTraceOpen, lastInteraction, interactionHistory, lyzrStatus } = useVaultMind();

  if (!isTraceOpen) return null;

  const currentInteraction = lastInteraction || interactionHistory[0];
  const traceEvents: AgentTraceEvent[] = currentInteraction?.trace || [];
  const isLive = currentInteraction?.isLiveTrace ?? lyzrStatus.isLive;

  const getStatusBadge = (status: AgentTraceEvent['status']) => {
    switch (status) {
      case 'PASS':
      case 'SUCCESS':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
      case 'BLOCKED':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/80';
      case 'NOT EXECUTED':
        return 'text-red-400 bg-red-950/60 border-red-800/80';
      case 'INFO':
      default:
        return 'text-sky-400 bg-sky-950/60 border-sky-800/80';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl h-full bg-[#0d1017] border-l border-white/[0.08] shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#090b10]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">
                AGENT TRACE
              </span>
              <span className="text-neutral-600">·</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider border ${
                isLive
                  ? 'text-emerald-300 bg-emerald-950/60 border-emerald-700'
                  : 'text-neutral-300 bg-white/[0.06] border-white/[0.1]'
              }`}>
                {isLive ? 'LIVE TRACE' : 'DEMO TRACE'}
              </span>
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              Chronological execution sequence & memory decision points
            </div>
          </div>

          <button
            onClick={() => setIsTraceOpen(false)}
            aria-label="Close trace drawer"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trace List Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {currentInteraction ? (
            <div className="space-y-4">
              
              {/* Interaction Target Context */}
              <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] text-xs space-y-1">
                <div className="text-[11px] font-medium uppercase text-neutral-400">
                  Target Interaction
                </div>
                <div className="text-white font-medium">
                  "{currentInteraction.userInput}"
                </div>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-500 font-mono flex-wrap">
                  <span>Intent: {currentInteraction.decision.intent}</span>
                  <span>·</span>
                  <span>Authorization: {currentInteraction.decision.authorization}</span>
                  {traceEvents[0]?.runId && <><span>·</span><span>Run: {traceEvents[0].runId.slice(0, 18)}</span></>}
                </div>
              </div>

              {/* Chronological Pipeline Sequence */}
              <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/[0.08]">
                {traceEvents.map((ev, index) => {
                  const badgeClass = getStatusBadge(ev.status);

                  return (
                    <div key={ev.id || index} className="relative pl-9 group">
                      {/* Timeline dot */}
                      <div className="absolute left-2.5 top-3 -translate-x-1/2 w-3 h-3 rounded-full bg-[#0d1017] border-2 border-emerald-400" />

                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] group-hover:border-white/[0.12] transition-colors space-y-1.5">
                        
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white tracking-wide">
                              {ev.stage}
                            </span>
                            <span className="text-neutral-600">/</span>
                            <span className="text-xs text-neutral-300 font-medium">
                              {ev.event}
                            </span>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeClass}`}>
                            {ev.status}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                          {ev.detail}
                        </p>

                        {ev.codeSnippet && (
                          <div className="mt-2 p-2 rounded bg-black/60 border border-white/[0.06] font-mono text-[11px] text-emerald-400/90 overflow-x-auto">
                            {ev.codeSnippet}
                          </div>
                        )}

                        <div className="pt-1 text-[10px] font-mono text-neutral-500 text-right">
                          {ev.timestamp}{typeof ev.elapsedMs === 'number' ? ` · +${ev.elapsedMs}ms` : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="py-16 text-center text-neutral-500 text-xs">
              No recent interaction trace recorded. Submit a memory directive on the Command page to observe the agent loop.
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#090b10] flex items-center justify-between text-xs text-neutral-400">
          <span className="font-mono text-[11px]">VaultMind Agent Observability</span>
          <button
            onClick={() => setIsTraceOpen(false)}
            className="px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.12] text-white rounded text-xs transition-colors"
          >
            Close Trace
          </button>
        </div>

      </div>
    </div>
  );
};
