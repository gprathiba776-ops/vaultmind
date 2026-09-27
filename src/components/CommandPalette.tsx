import React, { useState } from 'react';
import { useVaultMind } from '../context/VaultMindContext';
import { Search, Sparkles, ShieldCheck, Clock, BookOpen, Mic, X, ArrowRight, CornerDownLeft, Key } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setCurrentView,
    executeInput,
    setIsVoiceModalOpen,
    setIsSettingsOpen,
    setIsTraceOpen
  } = useVaultMind();

  const [search, setSearch] = useState('');

  if (!isCommandPaletteOpen) return null;

  const quickScenarios = [
    {
      step: 'Step 1 (SAVE)',
      label: 'Remember Sentinel-Z deadline',
      text: 'Remember that my Sentinel-Z paper submission deadline is September 15th, 2026.',
      actionType: 'SAVE'
    },
    {
      step: 'Step 2 (RETRIEVE)',
      label: 'When do I need to submit my security research paper?',
      text: 'When do I need to submit my security research paper?',
      actionType: 'RETRIEVE'
    },
    {
      step: 'Step 3 (DENY)',
      label: 'Remember my bank password (policy test)',
      text: 'Remember my bank password is [REDACTED].',
      actionType: 'DENY'
    },
    {
      step: 'Step 4 (FORGET)',
      label: 'Forget the Sentinel-Z deadline',
      text: 'Forget the Sentinel-Z deadline.',
      actionType: 'FORGET'
    },
  ];

  const handleSelectScenario = async (text: string) => {
    setIsCommandPaletteOpen(false);
    setCurrentView('command');
    await executeInput(text, 'text');
  };

  const handleNavigate = (view: any) => {
    setCurrentView(view);
    setIsCommandPaletteOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-xl bg-[#0e1119] border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-[#090b10]">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && search.trim()) {
                setIsCommandPaletteOpen(false);
                setCurrentView('command');
                await executeInput(search.trim(), 'text');
                setSearch('');
              }
            }}
            placeholder="Type a command, query, or instruct VaultMind..."
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-700 rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Content list */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          
          {/* 4-Step Scenario Quick Run */}
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Governed Memory Scenarios (Deterministic 4-Steps)
            </div>
            <div className="space-y-1">
              {quickScenarios.map((sc, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectScenario(sc.text)}
                  className="w-full text-left flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.06] text-xs text-neutral-200 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-mono text-[11px] text-neutral-400 shrink-0">{sc.step}</span>
                    <span className="text-white group-hover:text-emerald-300 font-medium truncate">{sc.label}</span>
                  </div>
                  <CornerDownLeft className="w-3.5 h-3.5 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Navigation Commands */}
          <div className="pt-2 border-t border-white/[0.06]">
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Navigation & Actions
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavigate('command')}
                className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.06] text-xs text-neutral-200 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Ask VaultMind</span>
              </button>
              <button
                onClick={() => handleNavigate('memory')}
                className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.06] text-xs text-neutral-200 transition-colors"
              >
                <Search className="w-4 h-4 text-sky-400" />
                <span>Search memory</span>
              </button>
              <button
                onClick={() => handleSelectScenario('Remember that my Sentinel-Z paper submission deadline is September 15th, 2026.')}
                className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.06] text-xs text-neutral-200 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Save memory</span>
              </button>
              <button
                onClick={() => handleSelectScenario('Forget my Sentinel-Z deadline.')}
                className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.06] text-xs text-neutral-200 transition-colors"
              >
                <CornerDownLeft className="w-4 h-4 text-purple-400" />
                <span>Forget memory</span>
              </button>
              <button
                onClick={() => handleNavigate('privacy')}
                className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.06] text-xs text-neutral-200 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Open privacy</span>
              </button>
              <button
                onClick={() => handleNavigate('activity')}
                className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.06] text-xs text-neutral-200 transition-colors"
              >
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Open activity</span>
              </button>
              <button
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  setIsVoiceModalOpen(true);
                }}
                className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.06] text-xs text-neutral-200 transition-colors"
              >
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>Start Omi Voice</span>
              </button>
              <button
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  setIsTraceOpen(true);
                }}
                className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.06] text-xs text-neutral-200 transition-colors"
              >
                <Key className="w-4 h-4 text-sky-400" />
                <span>Inspect latest trace</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#090b10] border-t border-white/[0.08] flex items-center justify-between text-[11px] text-neutral-500">
          <span>Navigate with click or arrow keys</span>
          <span>Press ESC to close</span>
        </div>

      </div>
    </div>
  );
};
