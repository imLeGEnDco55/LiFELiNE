import { useLocalStorage } from './useLocalStorage';

export interface FeedbackSettings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

const DEFAULT_SETTINGS: FeedbackSettings = {
  soundEnabled: true,
  hapticEnabled: true,
};

export function useFeedbackSettings() {
  const [settings, setSettings] = useLocalStorage<FeedbackSettings>('deadliner-feedback-settings', DEFAULT_SETTINGS);

  const toggleSound = () => {
    setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const toggleHaptic = () => {
    setSettings(prev => ({ ...prev, hapticEnabled: !prev.hapticEnabled }));
  };

  return {
    settings,
    toggleSound,
    toggleHaptic,
  };
}
