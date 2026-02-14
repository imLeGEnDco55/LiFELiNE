import { useCallback } from 'react';
import { useFeedbackSettings } from './useFeedbackSettings';

type FeedbackType = 'success' | 'complete' | 'break' | 'tick';

const SOUNDS: Record<FeedbackType, { frequency: number; duration: number; type: OscillatorType }[]> = {
  success: [
    { frequency: 523.25, duration: 100, type: 'sine' }, // C5
    { frequency: 659.25, duration: 100, type: 'sine' }, // E5
    { frequency: 783.99, duration: 150, type: 'sine' }, // G5
  ],
  complete: [
    { frequency: 440, duration: 80, type: 'sine' },    // A4
    { frequency: 554.37, duration: 80, type: 'sine' }, // C#5
    { frequency: 659.25, duration: 80, type: 'sine' }, // E5
    { frequency: 880, duration: 200, type: 'sine' },   // A5
  ],
  break: [
    { frequency: 392, duration: 150, type: 'sine' },   // G4
    { frequency: 523.25, duration: 200, type: 'sine' }, // C5
  ],
  tick: [
    { frequency: 800, duration: 30, type: 'square' },
  ],
};

const HAPTIC_PATTERNS: Record<FeedbackType, number | number[]> = {
  success: [50, 50, 100],
  complete: [100, 50, 100, 50, 200],
  break: [80, 40, 80],
  tick: 10,
};

export function useFeedback() {
  const { settings } = useFeedbackSettings();

  const playSound = useCallback((type: FeedbackType) => {
    if (!settings.soundEnabled) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = SOUNDS[type];
      let startTime = audioContext.currentTime;

      notes.forEach((note) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = note.type;
        oscillator.frequency.setValueAtTime(note.frequency, startTime);

        // Envelope for smoother sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration / 1000);

        oscillator.start(startTime);
        oscillator.stop(startTime + note.duration / 1000);

        startTime += note.duration / 1000;
      });
    } catch (error) {
      console.warn('Audio feedback not available:', error);
    }
  }, [settings.soundEnabled]);

  const triggerHaptic = useCallback((type: FeedbackType) => {
    if (!settings.hapticEnabled) return;
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(HAPTIC_PATTERNS[type]);
      }
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }, [settings.hapticEnabled]);

  const triggerFeedback = useCallback((type: FeedbackType) => {
    playSound(type);
    triggerHaptic(type);
  }, [playSound, triggerHaptic]);

  return {
    playSound,
    triggerHaptic,
    triggerFeedback,
    // Convenience methods
    successFeedback: useCallback(() => triggerFeedback('success'), [triggerFeedback]),
    completeFeedback: useCallback(() => triggerFeedback('complete'), [triggerFeedback]),
    breakFeedback: useCallback(() => triggerFeedback('break'), [triggerFeedback]),
    tickFeedback: useCallback(() => triggerFeedback('tick'), [triggerFeedback]),
  };
}
