import React from 'react';
import { MemoryRecord } from '../types/memory';
import { useVaultMind } from '../context/VaultMindContext';
import { Sparkles, Trash2, Eye, ExternalLink, CheckCircle2, AlertOctagon } from 'lucide-react';

interface MemoryCardProps {
  memory: MemoryRecord;
  onInspect?: (memory: MemoryRecord) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onInspect }) => {
  const { setSelectedMemory, forgetMemoryById, executeInput, setCurrentView } = useVaultMind();

  const handleInspect = () => {
    if (onInspect) {
      onInspect(memory);
    } else {
      setSelectedMemory(memory);
    }
  };

  const handleRetrieve = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentView('recall');
  };

  const handleForget = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await forgetMemoryById(memory.id);
  };

  const isForgotten = memory.status === 'FORGOTTEN';

  return (
    <div
      onClick={handleInspect}
      className={`group relative overflow-hidden rounded-xl border p-5 transition-all cursor-pointer ${
        isForgotten
          ? 'bg-neutral-950/40 border-white/[0.04] opacity-50'
          : 'bg-neutral-900/50 hover:bg-neutral-900/80 border-white/[0.08] hover:border-emerald-500/40'
      }`}
    >
      {/* Category kicker and status */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">
          {memory.category}
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {isForgotten ? (
            <span className="flex items-center gap-1 text-purple-400 font-medium">
              <AlertOctagon className="w-3.5 h-3.5" />
              FORGOTTEN
            </span>
          ) : (
            <span className="flex items-center gap-1 text-neutral-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Primary Title */}
      <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-emerald-300 transition-colors mb-2">
        {memory.title}
      </h3>

      {/* Content Quote */}
      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed line-clamp-2 mb-3 font-normal">
        "{memory.content}"
      </p>

      {/* Structured Semantic Metadata */}
      <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400 py-2.5 border-t border-white/[0.06] mb-3">
        <div>
          <span className="text-neutral-500 font-medium uppercase text-[10px] block">Source</span>
          <span className="truncate block text-neutral-300">{memory.source}</span>
        </div>
        <div>
          <span className="text-neutral-500 font-medium uppercase text-[10px] block">Storage</span>
          <span className="truncate block text-neutral-300">{memory.vectorStatus.includes('Qdrant (Live') ? 'Qdrant' : 'Demo Memory Store'}</span>
        </div>
        <div>
          <span className="text-neutral-500 font-medium uppercase text-[10px] block">Memory ID</span>
          <span className="font-mono text-neutral-400 text-[10px] block truncate">{memory.id}</span>
        </div>
        <div>
          <span className="text-neutral-500 font-medium uppercase text-[10px] block">Created</span>
          <span className="text-neutral-400 text-[10px] block">{memory.createdAtFormatted.split('·')[0]}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1 text-xs border-t border-white/[0.04]">
        <button
          onClick={handleInspect}
          className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </button>

        <div className="flex items-center gap-3">
          {!isForgotten && (
            <button
              onClick={handleRetrieve}
              className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors font-medium"
              title="Test semantic retrieval for this memory"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recall</span>
            </button>
          )}

          {!isForgotten ? (
            <button
              onClick={handleForget}
              className="inline-flex items-center gap-1 text-neutral-400 hover:text-purple-400 transition-colors"
              title="Forget this memory"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Forget</span>
            </button>
          ) : (
            <span className="text-[11px] text-neutral-500 italic">Expunged</span>
          )}
        </div>
      </div>
    </div>
  );
};
