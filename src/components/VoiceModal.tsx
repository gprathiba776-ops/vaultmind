import React, { useState, useEffect, useRef } from 'react';
import { useVaultMind } from '../context/VaultMindContext';
import { voiceService, VoiceState, VoiceSettings } from '../services/voiceService';
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Terminal,
  Activity,
  AlertCircle
} from 'lucide-react';

export const VoiceModal: React.FC = () => {
  const {
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    executeInput,
    setCurrentView,
    lastInteraction,
    setIsTraceOpen
  } = useVaultMind();

  const [voiceState, setVoiceState] = useState<VoiceState>('READY');
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [amplitude, setAmplitude] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>(() => voiceService.getSettings());
  const [isSpeaking, setIsSpeaking] = useState(false);

  const arch = voiceService.getArchitectureInfo();
  const micButtonRef = useRef<HTMLButtonElement | null>(null);

  // Demo Scenarios
  const demoScenarios = [
    {
      id: 'voice_save',
      tag: 'VOICE SAVE',
      title: 'Remember Project Deadline',
      text: 'Remember that my Sentinel-Z paper submission deadline is September 15th.',
      action: 'SAVE',
      accent: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300 hover:border-emerald-400'
    },
    {
      id: 'voice_retrieve',
      tag: 'VOICE RETRIEVE',
      title: 'Recall Paper Deadline',
      text: 'When is my security research paper due?',
      action: 'RETRIEVE',
      accent: 'border-sky-500/50 bg-sky-950/20 text-sky-300 hover:border-sky-400'
    },
    {
      id: 'voice_deny',
      tag: 'VOICE DENY',
      title: 'Attempt Credential Storage',
      text: 'Remember my bank password is [REDACTED].',
      action: 'DENY',
      accent: 'border-amber-500/50 bg-amber-950/20 text-amber-300 hover:border-amber-400'
    },
    {
      id: 'voice_forget',
      tag: 'VOICE FORGET',
      title: 'Expunge Stored Memory',
      text: 'Forget my Sentinel-Z deadline.',
      action: 'FORGET',
      accent: 'border-purple-500/50 bg-purple-950/20 text-purple-300 hover:border-purple-400'
    }
  ];

  useEffect(() => {
    if (isVoiceModalOpen) {
      setVoiceState('READY');
      setTranscript('');
      setInterimText('');
      setErrorMessage(null);
      setAmplitude(0);
      setIsSpeaking(false);
      // Focus mic button for accessibility
      setTimeout(() => {
        micButtonRef.current?.focus();
      }, 100);
    } else {
      voiceService.stopListening();
      voiceService.stopSpeaking();
    }
  }, [isVoiceModalOpen]);

  if (!isVoiceModalOpen) return null;

  const handleStartListening = () => {
    setErrorMessage(null);
    setTranscript('');
    setInterimText('');
    setVoiceState('LISTENING');

    voiceService.startListening({
      onStateChange: (st) => setVoiceState(st),
      onTranscriptPartial: (partial) => setInterimText(partial),
      onTranscriptComplete: (final) => {
        setTranscript(final);
        setInterimText('');
        setVoiceState('CONFIRM');
      },
      onAmplitude: (amp) => setAmplitude(amp),
      onError: (err) => {
        setErrorMessage(err);
      }
    });
  };

  const handleStopListening = () => {
    voiceService.stopListening();
    if (interimText.trim() && !transcript.trim()) {
      setTranscript(interimText.trim());
      setVoiceState('CONFIRM');
    } else if (!transcript.trim()) {
      setVoiceState('READY');
    }
  };

  const handleConfirmTranscript = async () => {
    const textToSend = transcript.trim() || interimText.trim();
    if (!textToSend) return;

    setVoiceState('DECIDING');

    try {
      const interaction = await executeInput(textToSend, 'voice');
      setVoiceState('COMPLETE');

      // If voice response is enabled, speak out the response
      if (settings.voiceResponse) {
        setIsSpeaking(true);
        voiceService.speakResponse(interaction.response, () => {
          setIsSpeaking(false);
        });
      }

      // Auto close and surface Command workspace after brief confirmation
      setTimeout(() => {
        setIsVoiceModalOpen(false);
        setCurrentView('command');
      }, 1100);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to process voice interaction through VaultMind pipeline.');
      setVoiceState('ERROR');
    }
  };

  const handleSelectScenario = (text: string) => {
    voiceService.stopListening();
    setTranscript(text);
    setInterimText('');
    setVoiceState('CONFIRM');
  };

  const handleSettingToggle = (key: keyof VoiceSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    voiceService.updateSettings(updated);
  };

  const handlePlayVoiceResponse = () => {
    if (!lastInteraction) return;
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      voiceService.speakResponse(lastInteraction.response, () => {
        setIsSpeaking(false);
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="VaultMind Voice Interface"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
    >
      <div className="w-full max-w-xl bg-[#0c0f17] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#090b10]">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
              VAULTMIND VOICE
            </span>
            <span className="text-neutral-600">·</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-950/70 border border-emerald-700/60 text-emerald-300">
              {arch.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Voice Settings"
              aria-label="Voice Settings"
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                showSettings
                  ? 'bg-white/[0.15] border-white/[0.3] text-white'
                  : 'bg-white/[0.04] border-white/[0.08] text-neutral-400 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsVoiceModalOpen(false)}
              aria-label="Close voice modal"
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.1] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status & Architecture Ledger */}
        <div className="px-5 py-2.5 bg-black/40 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${voiceState === 'LISTENING' ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-neutral-300 font-semibold">
                Voice capture: {arch.browserCaptureLive ? 'LIVE' : 'DEMO'}
              </span>
            </span>
            <span className="text-neutral-600">·</span>
            <span>Agent: DEMO</span>
            <span className="text-neutral-600">·</span>
            <span>Memory: DEMO</span>
          </div>

          <span className="text-[10px] text-neutral-400">
            SpeechRecognition API
          </span>
        </div>

        {/* Collapsible Voice Settings */}
        {showSettings && (
          <div className="px-5 py-3.5 bg-[#090c14] border-b border-white/[0.08] text-xs space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="font-semibold text-neutral-300 uppercase tracking-wider text-[10px]">
              Voice Configuration
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[10px] text-neutral-400 uppercase font-medium">Input Source</div>
                <div className="text-white font-mono text-[11px] font-semibold mt-0.5">Browser Mic</div>
              </div>

              <button
                type="button"
                onClick={() => handleSettingToggle('voiceResponse')}
                className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-left transition-colors cursor-pointer"
              >
                <div className="text-[10px] text-neutral-400 uppercase font-medium">Voice Response</div>
                <div className="flex items-center gap-1.5 text-white font-mono text-[11px] font-semibold mt-0.5">
                  {settings.voiceResponse ? (
                    <span className="text-emerald-400 font-bold">ON</span>
                  ) : (
                    <span className="text-neutral-400">OFF (Default)</span>
                  )}
                </div>
              </button>

              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[10px] text-neutral-400 uppercase font-medium">Auto-Listen</div>
                <div className="text-neutral-400 font-mono text-[11px] mt-0.5">OFF</div>
              </div>

              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[10px] text-neutral-400 uppercase font-medium">Language</div>
                <div className="text-white font-mono text-[11px] mt-0.5">English (US)</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Interactive Stage */}
        <div className="p-5 sm:p-6 space-y-6 flex-1 flex flex-col items-center text-center">
          
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Speak Naturally
            </h2>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto font-normal">
              "Speak naturally. VaultMind decides what deserves memory."
            </p>
          </div>

          {/* Large Central Microphone Control */}
          <div className="relative flex flex-col items-center justify-center my-2">
            
            {/* Pulsing Aura Rings when Listening */}
            {voiceState === 'LISTENING' && (
              <>
                <div
                  className="absolute rounded-full bg-emerald-500/10 pointer-events-none transition-all duration-75"
                  style={{
                    width: `${120 + amplitude * 90}px`,
                    height: `${120 + amplitude * 90}px`,
                    animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }}
                />
                <div
                  className="absolute rounded-full bg-emerald-500/20 pointer-events-none transition-all duration-75"
                  style={{
                    width: `${96 + amplitude * 60}px`,
                    height: `${96 + amplitude * 60}px`
                  }}
                />
              </>
            )}

            {voiceState === 'TRANSCRIBING' && (
              <div className="absolute w-24 h-24 rounded-full border-2 border-dashed border-sky-400/60 animate-spin pointer-events-none" />
            )}

            {voiceState === 'DECIDING' && (
              <div className="absolute w-24 h-24 rounded-full border-2 border-emerald-400/80 animate-ping pointer-events-none" />
            )}

            <button
              ref={micButtonRef}
              type="button"
              onClick={voiceState === 'LISTENING' ? handleStopListening : handleStartListening}
              disabled={voiceState === 'DECIDING'}
              aria-label={voiceState === 'LISTENING' ? 'Stop listening' : 'Start speaking'}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#0c0f17] ${
                voiceState === 'LISTENING'
                  ? 'bg-emerald-500 text-neutral-950 scale-105 shadow-emerald-500/30'
                  : voiceState === 'TRANSCRIBING'
                  ? 'bg-sky-950 border-2 border-sky-400 text-sky-300'
                  : voiceState === 'CONFIRM'
                  ? 'bg-emerald-950 border-2 border-emerald-400 text-emerald-300'
                  : voiceState === 'DECIDING'
                  ? 'bg-neutral-800 border-2 border-neutral-600 text-neutral-400'
                  : 'bg-[#151a24] hover:bg-[#1b2230] border-2 border-emerald-500/60 text-emerald-300 hover:scale-105'
              }`}
            >
              {voiceState === 'LISTENING' ? (
                <Mic className="w-8 h-8 animate-pulse text-neutral-950" />
              ) : voiceState === 'TRANSCRIBING' ? (
                <RotateCcw className="w-8 h-8 animate-spin text-sky-400" />
              ) : voiceState === 'CONFIRM' ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              ) : (
                <Mic className="w-8 h-8 text-emerald-300" />
              )}
            </button>

            {/* Subtle Live Audio Waveform Bars (Reacts when speaking) */}
            {voiceState === 'LISTENING' && (
              <div className="flex items-center gap-1 mt-5 h-7">
                {[0.4, 0.7, 1.0, 0.6, 0.9, 0.5, 0.8, 0.3, 0.6].map((mult, idx) => {
                  const h = Math.max(4, Math.round((amplitude * mult + 0.15) * 24));
                  return (
                    <span
                      key={idx}
                      className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                      style={{ height: `${h}px` }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Current State Indicator */}
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold tracking-wider uppercase text-white">
              {voiceState === 'READY' && 'READY TO LISTEN'}
              {voiceState === 'LISTENING' && 'LISTENING... (TAP WHEN DONE)'}
              {voiceState === 'TRANSCRIBING' && 'TRANSCRIBING AUDIO...'}
              {voiceState === 'CONFIRM' && 'CONFIRM RECOGNIZED VOICE'}
              {voiceState === 'DECIDING' && 'VAULTMIND IS DECIDING...'}
              {voiceState === 'COMPLETE' && 'MEMORY DECISION EXECUTED ✓'}
              {voiceState === 'ERROR' && 'VOICE CAPTURE NOTICE'}
            </div>

            <div className="text-xs text-neutral-400 font-normal">
              {voiceState === 'READY' && 'Tap the microphone to speak naturally'}
              {voiceState === 'LISTENING' && (interimText ? `"${interimText}"` : 'Listening for your voice...')}
              {voiceState === 'TRANSCRIBING' && 'Converting speech to text...'}
              {voiceState === 'CONFIRM' && 'Verify transcript before sending to VaultMind decision layer'}
              {voiceState === 'DECIDING' && 'Routing transcript through Intent & Privacy Policy checks...'}
              {voiceState === 'COMPLETE' && 'Interaction logged in Command workspace and Agent Trace.'}
              {voiceState === 'ERROR' && (errorMessage || 'Please try again or select a demo scenario.')}
            </div>
          </div>

          {/* Transcript Verification Card (CONFIRM State) */}
          {(voiceState === 'CONFIRM' || transcript) && (
            <div className="w-full bg-[#111520] border border-white/[0.1] rounded-xl p-4 text-left space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pb-1 border-b border-white/[0.06]">
                <span className="font-bold text-white uppercase flex items-center gap-1.5">
                  <Mic className="w-3 h-3 text-emerald-400" />
                  USER VOICE TRANSCRIPT
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  USE THIS INPUT
                </span>
              </div>

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={2}
                placeholder="Transcribed voice will appear here..."
                className="w-full bg-black/40 border border-white/[0.08] rounded-lg p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500/60 leading-relaxed resize-none font-medium"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setTranscript('');
                    setVoiceState('READY');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Try Again
                </button>

                <button
                  type="button"
                  onClick={handleConfirmTranscript}
                  disabled={!transcript.trim()}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <span>Send to VaultMind</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Graceful Fallback Notice if Error */}
          {voiceState === 'ERROR' && (
            <div className="w-full p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-left text-xs text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Microphone notice</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed font-normal">
                {errorMessage || 'Voice recognition is unavailable in this browser. You can select one of the voice scenarios below or continue with text.'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleStartListening}
                  className="px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-medium border border-amber-500/30 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    setIsVoiceModalOpen(false);
                    setCurrentView('command');
                  }}
                  className="px-3 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-medium border border-white/[0.1] transition-colors"
                >
                  Continue with text
                </button>
              </div>
            </div>
          )}

          {/* Section 6: Four Voice Demonstration Scenarios */}
          <div className="w-full text-left space-y-2 pt-2 border-t border-white/[0.08]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase text-neutral-400">
                Voice Demonstration Scenarios
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                Click to simulate spoken utterance
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoScenarios.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleSelectScenario(sc.text)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${sc.accent}`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                    <span className="font-bold tracking-wider">{sc.tag}</span>
                    <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-xs font-medium text-white truncate">
                    "{sc.text}"
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Voice Response Area & Speaker Button if Last Interaction exists */}
          {lastInteraction && (
            <div className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.06] text-left space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span className="font-semibold text-neutral-300 uppercase tracking-wider text-[10px]">
                  Last VaultMind Vocal Response
                </span>
                <button
                  type="button"
                  onClick={handlePlayVoiceResponse}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono font-medium transition-colors"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Stop speaking</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>▶ Play response</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-neutral-200 italic font-normal">
                "{lastInteraction.response}"
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.08] bg-[#090b10] flex items-center justify-between text-xs text-neutral-400">
          <span className="text-[11px] text-neutral-400">
            VaultMind hears naturally · You control what persists
          </span>

          <button
            type="button"
            onClick={() => {
              setIsVoiceModalOpen(false);
              setCurrentView('command');
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Go to Command →
          </button>
        </div>

      </div>
    </div>
  );
};
