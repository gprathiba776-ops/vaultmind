import React, { useState } from 'react';
import { useVaultMind } from '../context/VaultMindContext';
import { X, RotateCcw, Download, Cpu, Database, Shield, Check, Info } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    resetSystemToDefault,
    lyzrStatus,
    qdrantStatus,
    memories,
    timeline
  } = useVaultMind();

  const [copied, setCopied] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  if (!isSettingsOpen) return null;

  const handleExportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      system: 'VaultMind Governed Memory',
      version: '1.0.0',
      activeCollection: qdrantStatus.collection,
      memories,
      timeline
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaultmind_memory_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    resetSystemToDefault();
    setResetConfirm(true);
    setTimeout(() => setResetConfirm(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0e1119] border border-white/[0.12] rounded-2xl shadow-2xl p-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white tracking-wide">
              System Architecture & Configuration
            </span>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-5 text-xs text-neutral-300">
          
          {/* Subsystem 1: Lyzr Reasoning Engine */}
          <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Lyzr Reasoning Layer</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                lyzrStatus.isLive
                  ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800'
                  : 'text-neutral-400 bg-neutral-900 border border-neutral-700'
              }`}>
                {lyzrStatus.statusLabel}
              </span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Orchestrates zero-shot intent detection, evaluates semantic memory conditions, and produces explainable decision payloads.
            </p>
            <div className="pt-1 text-[11px] font-mono text-neutral-500">
              Agent ID: <span className="text-neutral-300">{lyzrStatus.agentId}</span>
            </div>
          </div>

          {/* Subsystem 2: Qdrant Vector Store */}
          <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Database className="w-4 h-4 text-purple-400" />
                <span>Qdrant Vector Store</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                qdrantStatus.isLive
                  ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800'
                  : 'text-neutral-400 bg-neutral-900 border border-neutral-700'
              }`}>
                {qdrantStatus.storageLabel}
              </span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Houses persistent semantic memory embeddings with cosine similarity distance search and privacy payload filters.
            </p>
            <div className="pt-1 text-[11px] font-mono text-neutral-500">
              Target Collection: <span className="text-neutral-300">{qdrantStatus.collection}</span>
            </div>
          </div>

          {/* Environment Variables Documentation */}
          <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-1.5 font-medium text-white">
              <Info className="w-3.5 h-3.5 text-neutral-400" />
              <span>Live Mode Connection (.env)</span>
            </div>
            <div className="font-mono text-[10px] text-neutral-400 space-y-1 bg-black/60 p-2.5 rounded border border-white/[0.04] overflow-x-auto">
              <div>LYZR_API_KEY="server-only"</div>
              <div>LYZR_AGENT_ID="server-only"</div>
              <div>QDRANT_URL="server-only"</div>
              <div>QDRANT_API_KEY="server-only"</div>
              <div>VITE_API_BASE_URL="safe browser endpoint only"</div>
            </div>
          </div>

          {/* Actions: Reset & Export */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export Memory JSON</span>
            </button>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 border border-purple-800/50 transition-colors"
            >
              {resetConfirm ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Reset Applied!</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo State</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
