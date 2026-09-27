import React, { useState } from 'react';
import { useVaultMind } from '../context/VaultMindContext';
import { MemoryIntent, TimelineEvent } from '../types/memory';
import { Clock, Filter, ArrowUpRight, ShieldAlert, CheckCircle2, Trash2, Sparkles, Activity, Mic } from 'lucide-react';

export const ActivityView: React.FC = () => {
  const { timeline, memories, setSelectedMemory, setIsTraceOpen } = useVaultMind();
  const [filter, setFilter] = useState<MemoryIntent | 'ALL'>('ALL');

  const filteredTimeline = filter === 'ALL'
    ? timeline
    : timeline.filter((item) => item.intent === filter);

  const getIntentTag = (intent: MemoryIntent) => {
    switch (intent) {
      case 'SAVE':
        return {
          label: 'SAVE',
          badge: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
          dot: 'bg-emerald-400',
          desc: 'Memory created & written to Qdrant'
        };
      case 'RETRIEVE':
        return {
          label: 'RETRIEVE',
          badge: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
          dot: 'bg-sky-400',
          desc: 'Memory recalled via semantic search'
        };
      case 'DENY':
        return {
          label: 'DENY',
          badge: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
          dot: 'bg-amber-400',
          desc: 'Persistence prevented by privacy gate'
        };
      case 'FORGET':
        return {
          label: 'FORGET',
          badge: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
          dot: 'bg-purple-400',
          desc: 'Memory located & vector deleted'
        };
    }
  };

  const handleInspect = (event: TimelineEvent) => {
    if (event.memoryId) {
      const mem = memories.find((m) => m.id === event.memoryId);
      if (mem) {
        setSelectedMemory(mem);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Intelligent Activity Timeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Memory Event Ledger
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Auditable chronological record of all SAVE, RETRIEVE, DENY, and FORGET agent operations.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl self-start sm:self-auto text-xs">
          {(['ALL', 'SAVE', 'RETRIEVE', 'DENY', 'FORGET'] as const).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                filter === item
                  ? 'bg-white/[0.12] text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/[0.08] space-y-6">
        {filteredTimeline.length > 0 ? (
          filteredTimeline.map((item) => {
            const tag = getIntentTag(item.intent);
            const hasLinkedMemory = Boolean(item.memoryId && memories.find((m) => m.id === item.memoryId));

            return (
              <div key={item.id} className="relative group">
                
                {/* Node Bullet */}
                <div className={`absolute -left-6 sm:-left-8 top-3 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#090b10] border-2 border-white/40 flex items-center justify-center group-hover:scale-125 transition-transform ${
                  item.intent === 'SAVE'
                    ? 'border-emerald-400'
                    : item.intent === 'RETRIEVE'
                    ? 'border-sky-400'
                    : item.intent === 'DENY'
                    ? 'border-amber-400'
                    : 'border-purple-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${tag.dot}`} />
                </div>

                {/* Event Card */}
                <div
                  onClick={() => setIsTraceOpen(true)}
                  className="p-4 rounded-xl bg-[#0e1119] hover:bg-[#121622] border border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-2 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${tag.badge}`}>
                        {item.source === 'voice' ? (
                          <span className="flex items-center gap-1 font-mono tracking-wide">
                            <Mic className="w-2.5 h-2.5 text-emerald-400" />
                            VOICE · {tag.label}
                          </span>
                        ) : (
                          tag.label
                        )}
                      </span>
                      <span className="text-xs font-semibold text-white truncate">
                        {item.subject}
                      </span>
                    </div>

                    <span className="font-mono text-xs text-neutral-400 tabular-nums">
                      {item.timeFormatted}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300">
                    {item.summary}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[11px] text-neutral-400">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTraceOpen(true);
                      }}
                      className="font-mono text-neutral-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
                    >
                      <Activity className="w-3 h-3 text-emerald-400" />
                      <span>Inspect Trace</span>
                    </button>

                    {hasLinkedMemory && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspect(item);
                        }}
                        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                      >
                        <span>Inspect Memory</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-neutral-400 rounded-xl border border-white/[0.06] bg-[#0e1119]">
            No timeline events match the selected filter.
          </div>
        )}
      </div>

    </div>
  );
};
