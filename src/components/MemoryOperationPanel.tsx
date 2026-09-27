import React from 'react';
import { MemoryOperationDetails } from '../types/memory';
import { Check, ShieldAlert, ArrowDown, Database, Sparkles, Trash2, XCircle } from 'lucide-react';

interface MemoryOperationPanelProps {
  operation: MemoryOperationDetails;
}

export const MemoryOperationPanel: React.FC<MemoryOperationPanelProps> = ({ operation }) => {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0c0f16] p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white tracking-wider uppercase">
            MEMORY OPERATION
          </span>
          <span className="text-neutral-600">/</span>
          <span className="text-xs text-neutral-400 font-mono">
            {operation.storageBackend}
          </span>
        </div>

        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
          operation.type === 'SAVE'
            ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
            : operation.type === 'RETRIEVE'
            ? 'text-sky-400 bg-sky-950/60 border-sky-800'
            : operation.type === 'DENY'
            ? 'text-amber-400 bg-amber-950/60 border-amber-800'
            : 'text-purple-400 bg-purple-950/60 border-purple-800'
        }`}>
          {operation.type} OPERATION
        </span>
      </div>

      {/* SAVE OPERATION */}
      {operation.type === 'SAVE' && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
            MEMORY WRITE
          </div>

          <div className="space-y-1.5 text-xs text-neutral-200">
            {(operation.checks || [
              'Intent authorized',
              'Memory representation created',
              'Persistent memory write completed'
            ]).map((check, idx) => (
              <div key={idx} className="flex items-center gap-2 text-emerald-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{check}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.06] text-xs">
            <div>
              <div className="text-[11px] font-medium uppercase text-neutral-400 mb-1">
                Memory Status
              </div>
              <div className="font-semibold text-emerald-300">
                {operation.statusLabel || 'ACTIVE'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium uppercase text-neutral-400 mb-1">
                Memory ID
              </div>
              <div className="font-mono text-neutral-200 text-[11px] truncate">
                {operation.memoryId || 'vm_demo_sentinel_z'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium uppercase text-neutral-400 mb-1">
                Storage
              </div>
              <div className="font-medium text-neutral-300">
                {operation.storageBackend}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RETRIEVE OPERATION */}
      {operation.type === 'RETRIEVE' && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-sky-400 tracking-wider uppercase">
            SEMANTIC RECALL
          </div>

          {operation.query && (
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] text-xs">
              <div className="text-[11px] font-medium uppercase text-neutral-400 mb-1">
                Query
              </div>
              <div className="text-white font-medium">"{operation.query}"</div>
            </div>
          )}

          <div className="flex flex-col items-center gap-1.5 py-1 text-neutral-500">
            <span className="text-[11px] font-mono tracking-wider text-sky-400/80">
              SEARCHING SEMANTIC MEMORY
            </span>
            <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
          </div>

          {operation.matchedTitle ? (
            <div className="p-3.5 rounded-lg bg-sky-950/20 border border-sky-800/40 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-sky-400 tracking-wider uppercase">
                  MATCH FOUND
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {operation.matchedDate || 'September 15th, 2026'}
                </span>
              </div>
              <div className="text-sm font-semibold text-white">
                {operation.matchedTitle}
              </div>
              {operation.matchedContent && (
                <div className="text-neutral-300 text-xs italic">
                  "{operation.matchedContent}"
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-neutral-400">
              {operation.note || 'No active memory matched this query.'}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/[0.06] text-xs">
            <div>
              <div className="text-[11px] font-medium uppercase text-neutral-400 mb-1">
                Match Basis
              </div>
              <div className="font-semibold text-neutral-200">
                {operation.matchBasis || 'Semantic similarity'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium uppercase text-neutral-400 mb-1">
                Context Assembled
              </div>
              <div className="font-medium text-sky-300">
                {operation.contextAssembled || '1 relevant memory'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DENY OPERATION */}
      {operation.type === 'DENY' && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-amber-400 tracking-wider uppercase">
            MEMORY WRITE BLOCKED
          </div>

          <div className="space-y-1.5 text-xs text-neutral-200">
            {(operation.checks || [
              'Sensitive information detected',
              'Privacy policy applied',
              'Persistent storage prevented'
            ]).map((check, idx) => (
              <div key={idx} className="flex items-center gap-2 text-amber-300">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{check}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
              <XCircle className="w-3.5 h-3.5" />
              <span>MEMORY WRITE: NOT EXECUTED</span>
            </div>
            <div className="text-neutral-300 text-xs">
              {operation.note || 'Nothing was stored.'}
            </div>
          </div>
        </div>
      )}

      {/* FORGET OPERATION */}
      {operation.type === 'FORGET' && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-purple-400 tracking-wider uppercase">
            MEMORY DELETION
          </div>

          <div className="space-y-1.5 text-xs text-neutral-200">
            {(operation.checks || [
              'Memory located',
              'Deletion authorized',
              'Memory removed'
            ]).map((check, idx) => (
              <div key={idx} className="flex items-center gap-2 text-purple-300">
                <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{check}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/[0.06] text-xs">
            <div>
              <div className="text-[11px] font-medium uppercase text-neutral-400 mb-1">
                Memory Status
              </div>
              <div className="font-semibold text-purple-400">
                {operation.statusLabel || 'FORGOTTEN'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium uppercase text-neutral-400 mb-1">
                Memory ID
              </div>
              <div className="font-mono text-neutral-300 text-[11px] truncate">
                {operation.memoryId || 'vm_demo_sentinel_z'}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
