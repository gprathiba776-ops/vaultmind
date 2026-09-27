import React from 'react';
import { useVaultMind } from '../context/VaultMindContext';
import { MemoryRecord } from '../types/memory';
import { X, Trash2, ShieldCheck, Database, History, Terminal, CheckCircle2, RotateCcw } from 'lucide-react';

export const MemoryInspector: React.FC = () => {
  const { selectedMemory, setSelectedMemory, forgetMemoryById, restoreMemoryById, qdrantStatus } = useVaultMind();

  if (!selectedMemory) return null;

  const isForgotten = selectedMemory.status === 'FORGOTTEN';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl h-full bg-[#0d1017] border-l border-white/[0.08] shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#090b10]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                {selectedMemory.category}
              </span>
              <span className="text-neutral-600">/</span>
              <span className="text-xs text-neutral-400 font-mono">
                {selectedMemory.id}
              </span>
            </div>
            <h2 className="text-base font-semibold text-white mt-1 truncate">
              {selectedMemory.title}
            </h2>
          </div>

          <button
            onClick={() => setSelectedMemory(null)}
            aria-label="Close memory inspector"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status & Privacy Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-neutral-300">Privacy Decision:</span>
              <span className="font-semibold text-emerald-300">{selectedMemory.privacyDecision}</span>
            </div>

            <div>
              {isForgotten ? (
                <span className="text-purple-400 font-semibold uppercase">Status: Forgotten</span>
              ) : (
                <span className="text-emerald-400 font-semibold uppercase">Status: Active Vector</span>
              )}
            </div>
          </div>

          {/* Stored Content */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Memory Content
            </div>
            <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] text-sm text-neutral-200 leading-relaxed">
              "{selectedMemory.content}"
            </div>
          </div>

          {/* Semantic Representation */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              {qdrantStatus.isLive ? 'Semantic representation — Qdrant' : 'Semantic representation — Demo Mode'}
            </div>
            <div className="p-3 rounded-lg bg-black/60 border border-white/[0.06] font-mono text-xs text-emerald-400/90 leading-relaxed overflow-x-auto">
              {selectedMemory.semanticRepresentation}
            </div>
          </div>

          {/* Provenance & Original Instruction */}
          <div className="space-y-3 p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs">
            <div>
              <span className="text-neutral-500 font-medium">Original User Instruction: </span>
              <span className="text-neutral-200">"{selectedMemory.originalInstruction}"</span>
            </div>
            <div>
              <span className="text-neutral-500 font-medium">Source: </span>
              <span className="text-neutral-200">{selectedMemory.source}</span>
            </div>
            <div>
              <span className="text-neutral-500 font-medium">Why Stored: </span>
              <span className="text-neutral-300">{selectedMemory.whyStored}</span>
            </div>
            <div>
              <span className="text-neutral-500 font-medium">Created At: </span>
              <span className="text-neutral-300 font-mono">{selectedMemory.createdAtFormatted}</span>
            </div>
          </div>

          {/* Vector Memory Status */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              Vector Memory Status
            </div>
            <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs space-y-1.5">
              <div className="text-neutral-200 font-medium">
                {selectedMemory.vectorStatus}
              </div>
              <div className="text-neutral-500 text-[11px]">
                High-dimensional embedding representation indexed in Qdrant collection for semantic similarity retrieval.
              </div>
            </div>
          </div>

          {/* Retrieval History */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-sky-400" />
                Retrieval History ({selectedMemory.retrievalCount} recalls)
              </span>
            </div>

            {selectedMemory.retrievalHistory && selectedMemory.retrievalHistory.length > 0 ? (
              <div className="space-y-2">
                {selectedMemory.retrievalHistory.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span className="font-mono">{item.timestamp}</span>
                      <span className="text-sky-400 font-semibold">{Math.round(item.similarityScore * 100)}% similarity</span>
                    </div>
                    <div className="text-white font-medium">"{item.query}"</div>
                    <div className="text-neutral-400 text-[11px]">{item.whyMatched}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-neutral-500 text-center">
                No external inquiries have queried this memory yet.
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/[0.08] bg-[#090b10] flex items-center justify-between">
          <button
            onClick={() => setSelectedMemory(null)}
            className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Close
          </button>

          {!isForgotten ? (
            <button
              onClick={() => forgetMemoryById(selectedMemory.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-purple-300 bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/60 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Forget This Memory</span>
            </button>
          ) : !qdrantStatus.isLive ? (
            <button
              onClick={() => restoreMemoryById(selectedMemory.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Demo Memory</span>
            </button>
          ) : (
            <span className="text-[11px] text-neutral-500">Deleted from live Qdrant</span>
          )}
        </div>

      </div>
    </div>
  );
};
