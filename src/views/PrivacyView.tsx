import React from 'react';
import { useVaultMind } from '../context/VaultMindContext';
import { ShieldCheck, ShieldAlert, Lock, UserCheck, Trash2, Eye, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

export const PrivacyView: React.FC = () => {
  const { privacyPolicy, updatePrivacyPolicy, memories, restoreMemoryById } = useVaultMind();

  const forgottenCount = memories.filter((m) => m.status === 'FORGOTTEN').length;
  const activeCount = memories.filter((m) => m.status === 'ACTIVE').length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      
      {/* Section Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/40">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>User-Controlled Memory Governance</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          YOUR MEMORY. YOUR RULES.
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl font-normal">
          VaultMind puts privacy at the agent decision layer. Before any data reaches vector storage or context retrieval, it passes through user-defined boundaries.
        </p>
      </div>

      {/* 4 Policy Concepts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Concept 1: What VaultMind May Remember */}
        <div className="p-6 rounded-2xl bg-[#0e1119] border border-white/[0.08] space-y-3">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>What VaultMind May Remember</span>
          </div>
          <h3 className="text-base font-semibold text-white">
            Intentional Context & Milestones
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Project deadlines, technical research directions, user milestones, system architecture configurations, and explicit instructions intended for long-term semantic retrieval.
          </p>
          <div className="pt-2 text-xs text-neutral-500 font-mono">
            Requires explicit user trigger or authorized ambient ingestion.
          </div>
        </div>

        {/* Concept 2: What VaultMind Must Not Remember */}
        <div className="p-6 rounded-2xl bg-[#0e1119] border border-amber-900/40 bg-amber-950/10 space-y-3">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>What VaultMind Must Not Remember</span>
          </div>
          <h3 className="text-base font-semibold text-white">
            Zero-Persistence Sensitive Data
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Bank passwords, private keys, API secrets, authentication tokens, government identification, and payment instruments.
          </p>
          <div className="pt-2 text-xs text-amber-400/90 font-mono">
            Strictly blocked: Zero bytes persisted; rejected at the reasoning gate.
          </div>
        </div>

        {/* Concept 3: What Requires Explicit Consent */}
        <div className="p-6 rounded-2xl bg-[#0e1119] border border-white/[0.08] space-y-3">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-sky-400 uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>What Requires Explicit Consent</span>
          </div>
          <h3 className="text-base font-semibold text-white">
            Ambient Voice & Passive Transcription
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Continuous microphone streams from Omi hardware require active user opt-in. Each ingested voice fragment is flagged with audio provenance.
          </p>
          <div className="pt-2 text-xs text-neutral-500 font-mono">
            User retains per-stream toggles and inspection rights.
          </div>
        </div>

        {/* Concept 4: What You Can Forget */}
        <div className="p-6 rounded-2xl bg-[#0e1119] border border-purple-900/40 bg-purple-950/10 space-y-3">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-purple-400 uppercase tracking-wider">
            <Trash2 className="w-4 h-4" />
            <span>What You Can Forget</span>
          </div>
          <h3 className="text-base font-semibold text-white">
            User-Controlled Memory Deletion
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Any active memory can be targeted for deletion. In live mode, VaultMind requests deletion of the corresponding Qdrant point and removes it from the active retrieval path.
          </p>
          <div className="pt-2 text-xs text-purple-400/90 font-mono">
            Application-level deletion is surfaced immediately; storage-provider physical erasure is not claimed.
          </div>
        </div>

      </div>

      {/* User Controls Interface (Not generic dashboard widgets, but interactive toggles) */}
      <div className="p-6 rounded-2xl bg-[#0e1119] border border-white/[0.08] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-base font-semibold text-white">
              Active Memory Governance Policies
            </h2>
            <p className="text-xs text-neutral-400">
              Configure how the Lyzr agent reasoning layer enforces persistence rules.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          
          {/* Control 1: Explicit Memory Requests */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="space-y-1">
              <div className="text-sm font-medium text-white">EXPLICIT MEMORY REQUESTS</div>
              <div className="text-xs text-neutral-400">
                Only store memories when user deliberately specifies (e.g. "Remember that...", "Save this...").
              </div>
            </div>
            <button
              onClick={() => updatePrivacyPolicy({ explicitMemoryRequests: !privacyPolicy.explicitMemoryRequests })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                privacyPolicy.explicitMemoryRequests
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              {privacyPolicy.explicitMemoryRequests ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Control 2: Sensitive Credential Persistence */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="space-y-1">
              <div className="text-sm font-medium text-white">SENSITIVE CREDENTIAL PERSISTENCE</div>
              <div className="text-xs text-neutral-400">
                Automatically intercept passwords, tokens, and bank credentials; enforce zero retention.
              </div>
            </div>
            <button
              onClick={() => updatePrivacyPolicy({ sensitiveCredentialStorage: !privacyPolicy.sensitiveCredentialStorage })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                privacyPolicy.sensitiveCredentialStorage
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              {privacyPolicy.sensitiveCredentialStorage ? 'Blocked' : 'Permitted'}
            </button>
          </div>

          {/* Control 3: Forget Requests */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="space-y-1">
              <div className="text-sm font-medium text-white">FORGET REQUESTS</div>
              <div className="text-xs text-neutral-400">
                Permit natural language forget commands ("Forget my Sentinel-Z deadline") to trigger vector deletion.
              </div>
            </div>
            <button
              onClick={() => updatePrivacyPolicy({ forgetRequestsEnabled: !privacyPolicy.forgetRequestsEnabled })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                privacyPolicy.forgetRequestsEnabled
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              {privacyPolicy.forgetRequestsEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Control 4: Memory Inspection */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="space-y-1">
              <div className="text-sm font-medium text-white">MEMORY INSPECTION</div>
              <div className="text-xs text-neutral-400">
                Allow user to view semantic representations, retrieval history, and provenance metadata.
              </div>
            </div>
            <button
              onClick={() => updatePrivacyPolicy({ memoryInspectionEnabled: !privacyPolicy.memoryInspectionEnabled })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                privacyPolicy.memoryInspectionEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              {privacyPolicy.memoryInspectionEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

        </div>

        <div className="pt-4 border-t border-white/[0.06] text-xs text-neutral-300 font-medium">
          "VaultMind treats persistence as a decision, not a default."
        </div>
      </div>

      {/* Responsible AI Transparency Notice */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-neutral-400 space-y-1.5">
        <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-neutral-400" />
          <span>Responsible AI & Accuracy Notice</span>
        </div>
        <p className="leading-relaxed">
          VaultMind implements a privacy-first architecture with user-controlled memory boundaries and explicit authorization gates. Sensitive credential persistence is actively blocked in this demo policy.
        </p>
      </div>

    </div>
  );
};
