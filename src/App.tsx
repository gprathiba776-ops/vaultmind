/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VaultMindProvider, useVaultMind } from './context/VaultMindContext';
import { Navigation } from './components/Navigation';
import { CommandCenterView } from './views/CommandCenterView';
import { ChatView } from './views/ChatView';
import { MemoryExplorerView } from './views/MemoryExplorerView';
import { RecallView } from './views/RecallView';
import { PrivacyView } from './views/PrivacyView';
import { ActivityView } from './views/ActivityView';
import { MemoryInspector } from './components/MemoryInspector';
import { AgentTraceDrawer } from './components/AgentTraceDrawer';
import { CommandPalette } from './components/CommandPalette';
import { VoiceModal } from './components/VoiceModal';
import { SettingsModal } from './components/SettingsModal';

const AppContent: React.FC = () => {
  const { currentView } = useVaultMind();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'command':
        return <CommandCenterView />;
      case 'chat':
        return <ChatView />;
      case 'memory':
        return <MemoryExplorerView />;
      case 'recall':
        return <RecallView />;
      case 'privacy':
        return <PrivacyView />;
      case 'activity':
        return <ActivityView />;
      default:
        return <CommandCenterView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-[#e2e8f0] flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Bar Navigation */}
      <Navigation />

      {/* Main Viewport Content */}
      <main className="flex-1 pb-16">
        {renderCurrentView()}
      </main>

      {/* Global Modals & Slide-overs */}
      <MemoryInspector />
      <AgentTraceDrawer />
      <CommandPalette />
      <VoiceModal />
      <SettingsModal />

      {/* Quiet Product Footer */}
      <footer className="w-full border-t border-white/[0.06] bg-[#07090d] py-6 px-4 sm:px-8 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">VAULTMIND</span>
            <span>·</span>
            <span>Privacy-First Governed Agentic Memory</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span>Lyzr Reasoning Layer</span>
            <span>·</span>
            <span>Qdrant Persistent Semantic Memory</span>
            <span>·</span>
            <span>Omi-Ready Voice Layer</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <VaultMindProvider>
      <AppContent />
    </VaultMindProvider>
  );
}
