/**
 * Web Speech API and Web Audio API helper for ElderEase AI
 * Configured specifically for senior hearing comfort (unhurried 0.8x pace, warm tone)
 */

class SpeechService {
  private isVoiceEnabled = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioCtx: AudioContext | null = null;

  public setVoiceEnabled(enabled: boolean) {
    this.isVoiceEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public getVoiceEnabled(): boolean {
    return this.isVoiceEnabled;
  }

  public speak(text: string, onEnd?: () => void, force = false): void {
    if (!this.isVoiceEnabled && !force) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    this.stop();

    try {
      const cleanText = text.replace(/[*_#`[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Senior-friendly pacing: slightly slower, reassuring tone
      utterance.rate = 0.82;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select a natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Karen')) && v.lang.startsWith('en')
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.currentUtterance = null;
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays a pleasant harmonic chime when medication is taken
   */
  public playSuccessChime(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.18); // E5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now + 0.15); // E5
      osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.45); // G5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.15);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.9);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  /**
   * Plays emergency alert countdown pulse sound
   */
  public playEmergencyBeep(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Emergency beep error:', e);
    }
  }
}

export const speechService = new SpeechService();
