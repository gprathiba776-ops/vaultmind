/**
 * Omi-Ready Voice Architecture Service
 * Abstracts audio capture, ambient transcription, and speech recognition pipeline.
 */

export type VoiceState =
  | 'READY'
  | 'LISTENING'
  | 'PROCESSING'
  | 'TRANSCRIBING'
  | 'CONFIRM'
  | 'UNDERSTANDING'
  | 'DECIDING'
  | 'RESPONDING'
  | 'COMPLETE'
  | 'ERROR';

export interface VoiceServiceCallbacks {
  onStateChange: (state: VoiceState) => void;
  onTranscriptPartial?: (text: string) => void;
  onTranscriptComplete: (transcript: string) => void;
  onAmplitude?: (level: number) => void;
  onError?: (errorMessage: string) => void;
}

export interface VoiceSettings {
  voiceResponse: boolean; // default: false
  autoListen: boolean;    // default: false
  language: string;       // default: 'en-US'
}

class VoiceService {
  private currentState: VoiceState = 'READY';
  private recognition: any = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private animFrameId: number | null = null;
  private simulationTimer: any = null;
  private settings: VoiceSettings = {
    voiceResponse: false,
    autoListen: false,
    language: 'en-US'
  };

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public isSpeechSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...partial };
  }

  public getArchitectureInfo() {
    const isBrowserSupported = this.isSpeechRecognitionSupported();
    return {
      label: 'OMI-READY',
      browserCaptureLive: isBrowserSupported,
      agentProcessing: 'DEMO' as const,
      memoryStore: 'DEMO' as const,
      statusDetail: isBrowserSupported
        ? 'Voice capture: BROWSER LIVE · Agent: DEMO'
        : 'Voice capture: DEMO SIMULATION · Agent: DEMO'
    };
  }

  public getCurrentState(): VoiceState {
    return this.currentState;
  }

  /**
   * Start live microphone speech recognition
   */
  public startListening(callbacks: VoiceServiceCallbacks): void {
    this.stopListening();

    this.currentState = 'LISTENING';
    callbacks.onStateChange('LISTENING');

    // Attempt real audio analyser for live waveform
    this.startAudioAnalyser(callbacks.onAmplitude);

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      try {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = true;
        reco.lang = this.settings.language || 'en-US';

        let receivedFinal = false;

        reco.onresult = (event: any) => {
          let interim = '';
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptText = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcriptText;
            } else {
              interim += transcriptText;
            }
          }

          if (interim && callbacks.onTranscriptPartial) {
            callbacks.onTranscriptPartial(interim);
          }

          if (final && !receivedFinal) {
            receivedFinal = true;
            this.currentState = 'TRANSCRIBING';
            callbacks.onStateChange('TRANSCRIBING');
            this.stopAudioAnalyser();

            setTimeout(() => {
              this.currentState = 'CONFIRM';
              callbacks.onStateChange('CONFIRM');
              callbacks.onTranscriptComplete(final.trim());
            }, 300);
          }
        };

        reco.onerror = (e: any) => {
          console.warn('SpeechRecognition error:', e.error);
          this.stopAudioAnalyser();
          if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
            this.currentState = 'ERROR';
            callbacks.onStateChange('ERROR');
            if (callbacks.onError) {
              callbacks.onError('Microphone permission was denied. Please allow microphone access or select a demo scenario.');
            }
          } else if (e.error === 'no-speech') {
            this.currentState = 'READY';
            callbacks.onStateChange('READY');
            if (callbacks.onError) {
              callbacks.onError('No speech detected. Tap microphone to speak again.');
            }
          } else {
            this.currentState = 'ERROR';
            callbacks.onStateChange('ERROR');
            if (callbacks.onError) {
              callbacks.onError(`Speech recognition error: ${e.error}`);
            }
          }
        };

        reco.onend = () => {
          this.stopAudioAnalyser();
          if (this.currentState === 'LISTENING') {
            this.currentState = 'READY';
            callbacks.onStateChange('READY');
          }
        };

        reco.start();
        this.recognition = reco;
        return;
      } catch (err: any) {
        console.warn('SpeechRecognition failed to start:', err);
      }
    }

    // If SpeechRecognition is completely unavailable in the browser:
    this.stopAudioAnalyser();
    this.currentState = 'ERROR';
    callbacks.onStateChange('ERROR');
    if (callbacks.onError) {
      callbacks.onError('Voice recognition is unavailable in this browser. You can select one of the voice scenarios below or continue with text.');
    }
  }

  /**
   * Stop listening and cleanup all audio tracks
   */
  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // ignore
      }
      this.recognition = null;
    }
    this.stopAudioAnalyser();
    if (this.simulationTimer) {
      clearTimeout(this.simulationTimer);
      this.simulationTimer = null;
    }
    this.currentState = 'READY';
  }

  /**
   * Start realistic audio frequency analysis for responsive waveform
   */
  private startAudioAnalyser(onAmplitude?: (level: number) => void): void {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        this.mediaStream = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const loop = () => {
          if (!this.analyser) return;
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(1, Math.max(0, avg / 128));
          if (onAmplitude) {
            onAmplitude(normalized);
          }
          this.animFrameId = requestAnimationFrame(loop);
        };
        loop();
      })
      .catch((err) => {
        console.warn('AudioAnalyser mic stream not accessible:', err.name);
      });
  }

  private stopAudioAnalyser(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {
        // ignore
      }
      this.audioContext = null;
    }
    this.analyser = null;
  }

  /**
   * Text-to-Speech synthesis for VaultMind vocal response
   */
  public speakResponse(text: string, onEnd?: () => void): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = this.settings.language || 'en-US';

      // Pick a natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en')
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
  }
}

export const voiceService = new VoiceService();
