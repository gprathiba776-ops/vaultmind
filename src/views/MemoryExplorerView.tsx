import React, { useState, useMemo } from 'react';
import { useVaultMind } from '../context/VaultMindContext';
import { MemoryCard } from '../components/MemoryCard';
import { Search, Filter, BookOpen, Plus, Sparkles, RefreshCw } from 'lucide-react';
import { MemoryCategory } from '../types/memory';

export const MemoryExplorerView: React.FC = () => {
  const { memories, qdrantStatus, executeInput, setCurrentView } = useVaultMind();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'FORGOTTEN'>('ACTIVE');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredMemories = useMemo(() => {
    let list = memories;

    // Status filter
    if (statusFilter !== 'ALL') {
      list = list.filter((m) => m.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      list = list.filter((m) => m.category === categoryFilter);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          m.semanticRepresentation.toLowerCase().includes(q) ||
          m.whyStored.toLowerCase().includes(q)
      );
    }

    return list;
  }, [memories, statusFilter, categoryFilter, searchQuery]);

  const categories: Array<MemoryCategory | 'ALL'> = [
    'ALL',
    'PROJECT',
    'RESEARCH',
    'MILESTONE',
    'ARCHITECTURE',
    'CONFIGURATION'
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Semantic Memory Explorer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Long-Term Vector Memory
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Explore, inspect, and audit persistent semantic knowledge indexed in {qdrantStatus.storageLabel}.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setCurrentView('command')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save New Memory</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Search & Functional Interactive Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories semantically or by entity..."
              className="w-full bg-[#0e1119] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Status Segmented Control (Interactive Filter buttons as allowed by skills) */}
          <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Active Vectors ({memories.filter((m) => m.status === 'ACTIVE').length})
            </button>
            <button
              onClick={() => setStatusFilter('FORGOTTEN')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === 'FORGOTTEN'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Forgotten ({memories.filter((m) => m.status === 'FORGOTTEN').length})
            </button>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-white/[0.08] text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Records
            </button>
          </div>

        </div>

        {/* Category Filter row */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
          <span className="text-neutral-500 font-medium shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors shrink-0 ${
                categoryFilter === cat
                  ? 'bg-white/[0.12] text-white font-semibold border border-white/[0.16]'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards Grid */}
      {filteredMemories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMemories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl border border-white/[0.06] bg-[#0e1119] p-8 space-y-3">
          <p className="text-sm font-medium text-white">No memory records found</p>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            No memories match your active filters or query. Try clearing your search or tell VaultMind to remember a new fact.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ACTIVE');
              setCategoryFilter('ALL');
            }}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium pt-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        </div>
      )}

    </div>
  );
};
