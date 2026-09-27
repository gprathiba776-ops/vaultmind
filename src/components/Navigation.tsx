import React from 'react';
import { useVaultMind, ActiveView } from '../context/VaultMindContext';
import { Mic, Search, Settings2, Sparkles, ShieldCheck, Terminal, BookOpen, Clock, Activity, MessageSquare } from 'lucide-react';

export const Navigation: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    setIsCommandPaletteOpen,
    setIsVoiceModalOpen,
    setIsSettingsOpen,
    lyzrStatus,
    qdrantStatus
  } = useVaultMind();

  const navItems: Array<{ id: ActiveView; label: string; icon: React.ReactNode }> = [
    { id: 'command', label: 'Command', icon: <Terminal className="w-4 h-4" /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'memory', label: 'Memory', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'recall', label: 'Recall', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090b10]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Single text element wordmark with operational status dot */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('command')}
            className="flex items-center gap-2.5 text-left group"
          >
            <span className="font-semibold tracking-wider text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors">
              VAULTMIND
            </span>
          </button>
          
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-white/[0.08] text-xs text-neutral-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {lyzrStatus.isLive && qdrantStatus.isLive ? (
              <span className="font-mono text-[11px] text-emerald-400 font-medium">LIVE · LYZR · QDRANT</span>
            ) : lyzrStatus.isLive ? (
              <span className="font-mono text-[11px] text-sky-300 font-medium">LIVE · LYZR · DEMO MEMORY</span>
            ) : qdrantStatus.isLive ? (
              <span className="font-mono text-[11px] text-purple-300 font-medium">LIVE · QDRANT · DEMO AGENT</span>
            ) : (
              <span className="font-mono text-[11px] text-neutral-300 font-medium">LOCAL MEMORY · DEMO MODE</span>
            )}
          </div>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap rounded-md ${
                  isActive
                    ? 'text-white bg-white/[0.08]'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-emerald-400/80 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            aria-label="Open command palette"
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-md transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden md:inline">Command</span>
            <kbd className="px-1 py-0.5 text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-700 rounded font-mono">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => setIsVoiceModalOpen(true)}
            title="Start voice capture (Omi-Ready)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 rounded-md transition-colors"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Omi Voice</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
            className="p-1.5 text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-md transition-colors"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
