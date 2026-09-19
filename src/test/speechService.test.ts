import { describe, it, expect, vi, beforeEach } from 'vitest';
import { speechService } from '../services/speech';

describe('SpeechService', () => {
  beforeEach(() => {
    speechService.setVoiceEnabled(true);
  });

  it('toggles voice enabled state correctly', () => {
    speechService.setVoiceEnabled(false);
    expect(speechService.getVoiceEnabled()).toBe(false);

    speechService.setVoiceEnabled(true);
    expect(speechService.getVoiceEnabled()).toBe(true);
  });

  it('safely handles speak when voices are enabled', () => {
    const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');
    speechService.speak('Test senior prompt', undefined, true);
    expect(speakSpy).toHaveBeenCalled();
  });

  it('safely plays success chime without crashing', () => {
    expect(() => speechService.playSuccessChime()).not.toThrow();
  });

  it('safely plays emergency beep without crashing', () => {
    expect(() => speechService.playEmergencyBeep()).not.toThrow();
  });

  it('safely stops audio and speech', () => {
    const cancelSpy = vi.spyOn(window.speechSynthesis, 'cancel');
    speechService.stop();
    expect(cancelSpy).toHaveBeenCalled();
  });
});
