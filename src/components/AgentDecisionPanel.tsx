import React from 'react';
import { AgentDecision, MemoryIntent } from '../types/memory';
import { ShieldCheck, ShieldAlert, Activity, ArrowRight } from 'lucide-react';
import { useVaultMind } from '../context/VaultMindContext';

interface AgentDecisionPanelProps {
  decision: AgentDecision;
  onOpenTrace?: () => void;
}

export const AgentDecisionPanel: React.FC<AgentDecisionPanelProps> = ({ decision, onOpenTrace }) => {
  const { setIsTraceOpen } = useVaultMind();

  const getIntentStyles = (intent: MemoryIntent) => {
    switch (intent) {
      case 'SAVE':
        return {
          badge: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60',
          accent: 'border-l-emerald-500',
          glow: 'bg-emerald-500/5',
          label: 'SAVE'
        };
      case 'RETRIEVE':
        return {
          badge: 'text-sky-400 bg-sky-950/50 border-sky-800/60',
          accent: 'border-l-sky-500',
          glow: 'bg-sky-500/5',
          label: 'RETRIEVE'
        };
      case 'DENY':
        return {
          badge: 'text-amber-400 bg-amber-950/50 border-amber-800/60',
          accent: 'border-l-amber-500',
          glow: 'bg-amber-500/5',
          label: 'DENY'
        };
      case 'FORGET':
        return {
          badge: 'text-purple-400 bg-purple-950/50 border-purple-800/60',
          accent: 'border-l-purple-500',
          glow: 'bg-purple-500/5',
          label: 'FORGET'
        };
    }
  };

  const style = getIntentStyles(decision.intent);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/[0.08] border-l-4 ${style.accent} bg-neutral-900/70 backdrop-blur-md p-5 transition-all shadow-xl`}>
      {/* Subtle contextual ambient wash */}
      <div className={`absolute -right-24 -top-24 w-64 h-64 rounded-full ${style.glow} blur-3xl pointer-events-none`} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold tracking-wider text-white uppercase">
            VAULTMIND DECISION
          </span>
          <span className="text-neutral-600">/</span>
          <span className="text-xs text-neutral-400">
            Governed Policy Evaluation
          </span>
        </div>

        <button
          onClick={() => {
            if (onOpenTrace) onOpenTrace();
            else setIsTraceOpen(true);
          }}
          className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-800/50 transition-colors self-start sm:self-auto font-medium"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>INSPECT AGENT TRACE</span>
          <ArrowRight className="w-3 h-3 text-emerald-400" />
        </button>
      </div>

      {/* Decision 4-Column Grid: INTENT, AUTHORIZATION, ACTION, EVIDENCE */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
        <div>
          <div className="text-[11px] font-medium tracking-wide uppercase text-neutral-400 mb-1.5">
            Intent
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded border ${style.badge}`}>
            {decision.intent}
          </span>
        </div>

        <div>
          <div className="text-[11px] font-medium tracking-wide uppercase text-neutral-400 mb-1.5">
            Authorization
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
            {decision.authorization === 'AUTHORIZED' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">AUTHORIZED</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300">BLOCKED</span>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium tracking-wide uppercase text-neutral-400 mb-1.5">
            Action
          </div>
          <div className="text-xs font-semibold text-white">
            {decision.action}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium tracking-wide uppercase text-neutral-400 mb-1.5">
            Evidence
          </div>
          <div className="text-xs text-neutral-300 leading-snug">
            {decision.evidence}
          </div>
        </div>
      </div>

      {/* Decision Explanation: WHY VAULTMIND CHOSE THIS */}
      <div className="pt-3 border-t border-white/[0.06] space-y-1.5">
        <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          WHY VAULTMIND CHOSE THIS
        </div>
        <p className="text-xs text-neutral-200 leading-relaxed font-normal">
          "{decision.reason}"
        </p>
      </div>
    </div>
  );
};
