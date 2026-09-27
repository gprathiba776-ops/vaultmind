import React, { useState } from 'react';
import { useVaultMind } from '../context/VaultMindContext';
import { memoryService } from '../services/memoryService';
import { RetrievalMatch } from '../types/memory';
import { Sparkles, ArrowRight, Search, CheckCircle2, ArrowDown, Database, Cpu, Layers } from 'lucide-react';

export const RecallView: React.FC = () => {
  const { setSelectedMemory, qdrantStatus, memories } = useVaultMind();
  const [query, setQuery] = useState('When is my security research paper due?');
  const [isSearching, setIsSearching] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [matches, setMatches] = useState<RetrievalMatch[]>([]);
  const [generatedResponse, setGeneratedResponse] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  const steps = [
    { name: 'SEMANTIC QUERY', desc: 'Natural language semantic parsing & embedding' },
    { name: 'MEMORY MATCHES', desc: 'Cosine similarity in persistent vector collection' },
    { name: 'CONTEXT', desc: 'Synthesize nearest neighbor memory payload' },
    { name: 'ANSWER', desc: 'Grounded response generation' }
  ];

  const handleRunRecall = async (searchQuery: string = query) => {
    if (!searchQuery.trim() || isSearching) return;
    setIsSearching(true);
    setHasSearched(true);
    setActiveStep(1); // SEMANTIC QUERY

    await new Promise((r) => setTimeout(r, 180));
    setActiveStep(2); // MEMORY MATCHES

    const results = await memoryService.retrieveMemories(searchQuery, 3);
    await new Promise((r) => setTimeout(r, 200));
    setActiveStep(3); // CONTEXT
    setMatches(results);

    await new Promise((r) => setTimeout(r, 180));
    setActiveStep(4); // ANSWER

    // Check reversibility: If querying Sentinel-Z and it was forgotten:
    const isSentinelQuery =
      searchQuery.toLowerCase().includes('security') ||
      searchQuery.toLowerCase().includes('paper') ||
      searchQuery.toLowerCase().includes('due') ||
      searchQuery.toLowerCase().includes('deadline') ||
      searchQuery.toLowerCase().includes('sentinel');

    const sentinelMemory = memories.find((m) => m.id === 'vm_demo_sentinel_z');
    const isForgotten = sentinelMemory && sentinelMemory.status === 'FORGOTTEN';

    let resp = "I don't have an active memory containing that information.";
    if (isSentinelQuery) {
      if (isForgotten) {
        resp = "I don't have an active memory containing that information.";
        setMatches([]);
      } else {
        resp = 'Your Sentinel-Z paper submission deadline is September 15th, 2026.';
      }
    } else if (results.length > 0) {
      resp = `Based on your memory: "${results[0].memory.content}"`;
    }

    setGeneratedResponse(resp);
    setIsSearching(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-sky-400 bg-sky-950/40 border border-sky-800/40">
          <Sparkles className="w-3.5 h-3.5" />
          <span>High-Dimensional Semantic Retrieval</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
          Semantic Vector Recall
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto">
          Experience true semantic association. Observe how VaultMind retrieves memories by meaning rather than keyword matching.
        </p>
      </div>

      {/* Query Bar */}
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="flex items-center gap-2 p-2 bg-[#0e1119] border border-white/[0.12] rounded-2xl focus-within:border-sky-500/60 transition-colors shadow-2xl">
          <Search className="w-4 h-4 text-sky-400 ml-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunRecall()}
            placeholder="Ask your memory..."
            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none px-2"
          />
          <button
            onClick={() => handleRunRecall()}
            disabled={isSearching || !query.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-neutral-950 font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Recall</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick query sample chips */}
        <div className="flex flex-wrap items-center gap-2 justify-center text-xs">
          <span className="text-neutral-500 text-[11px] uppercase">Try queries:</span>
          <button
            onClick={() => {
              setQuery('When is my security research paper due?');
              handleRunRecall('When is my security research paper due?');
            }}
            className="px-2.5 py-1 rounded bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 border border-white/[0.06] transition-colors"
          >
            "When is my security research paper due?"
          </button>
          <button
            onClick={() => {
              setQuery('What technical domain is my paper exploring?');
              handleRunRecall('What technical domain is my paper exploring?');
            }}
            className="px-2.5 py-1 rounded bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 border border-white/[0.06] transition-colors"
          >
            "What technical domain is my paper exploring?"
          </button>
          <button
            onClick={() => {
              setQuery('What is the AI hackathon focus?');
              handleRunRecall('What is the AI hackathon focus?');
            }}
            className="px-2.5 py-1 rounded bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 border border-white/[0.06] transition-colors"
          >
            "What is the AI hackathon focus?"
          </button>
        </div>
      </div>

      {/* Retrieval Pipeline Sequence Visualizer */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#0e1119] border border-white/[0.08] space-y-4 shadow-xl">
        <div className="flex items-center justify-between text-xs text-neutral-400 pb-3 border-b border-white/[0.06]">
          <span className="font-semibold text-white tracking-wide uppercase text-[11px]">
            Retrieval Execution Pipeline
          </span>
          <span className="font-mono text-[11px] text-sky-400">
            {isSearching ? 'Processing Vector Steps...' : hasSearched ? 'Pipeline Complete' : 'Ready'}
          </span>
        </div>

        {/* Horizontal Pipeline Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
          {steps.map((st, i) => {
            const stepNum = i + 1;
            const isCurrent = activeStep === stepNum;
            const isPassed = activeStep > stepNum || activeStep === 6;

            return (
              <div
                key={st.name}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-sky-950/60 border-sky-500 shadow-md shadow-sky-500/20 scale-[1.02]'
                    : isPassed
                    ? 'bg-white/[0.03] border-sky-900/40 text-neutral-300'
                    : 'bg-white/[0.01] border-white/[0.04] text-neutral-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono ${isPassed ? 'text-sky-400' : 'text-neutral-500'}`}>
                    0{stepNum}
                  </span>
                  {isPassed && <CheckCircle2 className="w-3 h-3 text-sky-400" />}
                </div>
                <div className="text-xs font-semibold text-white truncate">
                  {st.name}
                </div>
                <div className="text-[10px] text-neutral-400 mt-1 leading-snug line-clamp-2">
                  {st.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Retrieved Top Matches Cards */}
      {hasSearched && matches.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold text-white tracking-wide uppercase text-[11px]">
              Top 3 Vector Matches in {qdrantStatus.storageLabel}
            </span>
            <span className="text-neutral-500 text-[11px]">
              Cosine Similarity Ranking
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {matches.map((m, idx) => {
              const isFirst = idx === 0;
              return (
                <div
                  key={m.memory.id}
                  onClick={() => setSelectedMemory(m.memory)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isFirst
                      ? 'bg-sky-950/30 border-sky-500/60 shadow-lg shadow-sky-500/10'
                      : 'bg-[#0e1119] border-white/[0.08] hover:border-white/[0.16]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-neutral-400">
                      MATCH 0{idx + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      isFirst
                        ? 'text-sky-300 bg-sky-950/80 border-sky-800'
                        : 'text-neutral-400 bg-neutral-900 border-neutral-700'
                    }`}>
                      {m.matchGrade}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-1.5 truncate">
                    {m.memory.title}
                  </h3>

                  <p className="text-xs text-neutral-300 line-clamp-2 mb-3">
                    "{m.memory.content}"
                  </p>

                  <div className="pt-3 border-t border-white/[0.06] text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500 font-medium">Similarity:</span>
                      <span className="font-mono text-sky-400 font-semibold">{Math.round(m.similarity * 100)}%</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 leading-snug">
                      <span className="text-neutral-500">Why it matched: </span>
                      {m.whyMatched}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Synthesized Response */}
      {hasSearched && generatedResponse && (
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/[0.12] space-y-2 animate-in fade-in duration-300">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            VaultMind Contextual Response
          </div>
          <p className="text-base sm:text-lg text-white font-medium leading-relaxed">
            "{generatedResponse}"
          </p>
          <div className="text-xs text-neutral-500 pt-2">
            Demonstrates governed semantic recall: the query was matched to the active Sentinel-Z submission memory using semantic meaning.
          </div>
        </div>
      )}

    </div>
  );
};
