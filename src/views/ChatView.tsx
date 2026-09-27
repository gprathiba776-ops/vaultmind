import React, { useState, useRef, useEffect } from 'react';
import { useVaultMind } from '../context/VaultMindContext';
import { AgentDecisionPanel } from '../components/AgentDecisionPanel';
import { Send, Mic, Activity, ArrowRight, User, Bot, Sparkles, ShieldCheck } from 'lucide-react';

export const ChatView: React.FC = () => {
  const {
    interactionHistory,
    executeInput,
    isProcessing,
    setIsVoiceModalOpen,
    setIsTraceOpen,
    setSelectedMemory
  } = useVaultMind();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interactionHistory, isProcessing]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isProcessing) return;
    const text = inputVal.trim();
    setInputVal('');
    await executeInput(text, 'text');
  };

  const getDecisionTag = (intent: string) => {
    switch (intent) {
      case 'SAVE':
        return { color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60', label: 'MEMORY SAVED' };
      case 'RETRIEVE':
        return { color: 'text-sky-400 bg-sky-950/60 border-sky-800/60', label: 'MEMORY RECALLED' };
      case 'DENY':
        return { color: 'text-amber-400 bg-amber-950/60 border-amber-800/60', label: 'PERSISTENCE REFUSED' };
      case 'FORGET':
        return { color: 'text-purple-400 bg-purple-950/60 border-purple-800/60', label: 'MEMORY EXPUNGED' };
      default:
        return { color: 'text-neutral-400 bg-neutral-900 border-neutral-700', label: intent };
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 py-4">
      
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Interactive Memory Stream</span>
          <span className="text-neutral-600">·</span>
          <span>Every turn evaluates intent & privacy policy</span>
        </div>
        <div className="text-[11px] font-mono text-neutral-500">
          {interactionHistory.length} turns recorded
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {interactionHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-neutral-400">
            <Bot className="w-10 h-10 text-emerald-400/60" />
            <h3 className="text-base font-semibold text-white">
              VaultMind Governed Memory Chat
            </h3>
            <p className="text-xs max-w-sm text-neutral-400">
              Start chatting or instruct VaultMind to remember facts, query previous knowledge, or remove sensitive context.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => executeInput('Remember that my Sentinel-Z paper submission deadline is September 15th, 2026.', 'text')}
                className="px-2.5 py-1 text-xs rounded bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 border border-white/[0.08]"
              >
                Save Sentinel-Z deadline
              </button>
              <button
                onClick={() => executeInput('When do I need to submit my security research paper?', 'text')}
                className="px-2.5 py-1 text-xs rounded bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 border border-white/[0.08]"
              >
                Recall paper deadline
              </button>
            </div>
          </div>
        ) : (
          [...interactionHistory].reverse().map((record) => {
            const tag = getDecisionTag(record.decision.intent);
            return (
              <div key={record.id} className="space-y-4">
                
                {/* User message */}
                <div className="flex justify-end">
                  <div className="max-w-xl rounded-2xl rounded-tr-sm bg-white/[0.08] border border-white/[0.1] px-4 py-3 text-sm text-white space-y-1">
                    <div className="flex items-center justify-between gap-3 text-[10px] text-neutral-400">
                      <span className="font-semibold uppercase">{record.inputMode === 'voice' ? 'Voice' : 'User'}</span>
                      <span className="font-mono">{record.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{record.userInput}</p>
                  </div>
                </div>

                {/* Assistant response + decision badge */}
                <div className="flex justify-start">
                  <div className="max-w-2xl rounded-2xl rounded-tl-sm bg-[#0e1119] border border-white/[0.08] p-4 text-sm text-white space-y-3">
                    
                    {/* Decision Mini-Kicker */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06] text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${tag.color}`}>
                          {tag.label}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {record.decision.reason}
                        </span>
                      </div>

                      <button
                        onClick={() => setIsTraceOpen(true)}
                        className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <Activity className="w-3 h-3 text-emerald-400" />
                        <span>Trace</span>
                      </button>
                    </div>

                    {/* Response Text */}
                    <p className="text-sm text-neutral-100 leading-relaxed">
                      {record.response}
                    </p>

                    {/* Affected Memory or Retrieved Context */}
                    {record.affectedMemory && (
                      <div
                        onClick={() => setSelectedMemory(record.affectedMemory || null)}
                        className="p-2.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/[0.06] cursor-pointer transition-colors flex items-center justify-between text-xs"
                      >
                        <div className="truncate mr-2">
                          <span className="text-neutral-400">Target Memory: </span>
                          <span className="font-medium text-white">{record.affectedMemory.title}</span>
                        </div>
                        <span className="text-emerald-400 text-[11px] shrink-0">Inspect →</span>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            );
          })
        )}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm bg-[#0e1119] border border-emerald-500/30 p-3.5 text-xs text-emerald-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Evaluating memory intent and privacy gates...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="pt-2 border-t border-white/[0.08]">
        <div className="flex items-center gap-2 bg-[#0e1119] border border-white/[0.12] rounded-xl p-1.5 focus-within:border-emerald-500/60 transition-colors">
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="p-2 text-neutral-400 hover:text-emerald-400 rounded-lg hover:bg-white/[0.04] transition-colors"
            title="Voice input (Omi-Ready)"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Instruct VaultMind (e.g., 'Remember my submission deadline...', 'What is my topic?')"
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none px-2"
          />

          <button
            type="submit"
            disabled={!inputVal.trim() || isProcessing}
            className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

    </div>
  );
};
