import '@testing-library/jest-dom/vitest';

// Polyfill Web Speech Synthesis for test environment
if (typeof window !== 'undefined') {
  class MockSpeechSynthesisUtterance {
    text: string;
    rate = 1;
    pitch = 1;
    volume = 1;
    voice = null;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(text = '') {
      this.text = text;
    }
  }

  (window as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
  (global as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

  if (!window.speechSynthesis) {
    const mockSpeechSynthesis = {
      speak: (utterance: any) => {
        if (utterance && utterance.onend) {
          setTimeout(() => utterance.onend(), 10);
        }
      },
      cancel: () => {},
      pause: () => {},
      resume: () => {},
      getVoices: () => [
        { name: 'Google US English', lang: 'en-US', default: true },
      ],
      onvoiceschanged: null,
      pending: false,
      speaking: false,
      paused: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    };
    (window as any).speechSynthesis = mockSpeechSynthesis;
    (global as any).speechSynthesis = mockSpeechSynthesis;
  }

  // AudioContext polyfill
  if (!window.AudioContext) {
    window.AudioContext = class MockAudioContext {
      state = 'suspended';
      currentTime = 0;
      destination = {};
      createOscillator() {
        return {
          type: 'sine',
          connect: () => {},
          start: () => {},
          stop: () => {},
          frequency: {
            setValueAtTime: () => {},
            exponentialRampToValueAtTime: () => {},
          },
        };
      }
      createGain() {
        return {
          connect: () => {},
          gain: {
            setValueAtTime: () => {},
            linearRampToValueAtTime: () => {},
            exponentialRampToValueAtTime: () => {},
          },
        };
      }
      resume() {
        return Promise.resolve();
      }
      close() {
        return Promise.resolve();
      }
    } as unknown as typeof AudioContext;
  }
}
