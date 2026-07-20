import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setSfxEnabled } from './utils/SoundManager';

const STORAGE_KEY = '@BBB:settings';

export interface Settings {
  musicOn: boolean;
  sfxOn: boolean;
  reducedMotion: boolean;
  nightMode: boolean;
}

interface SettingsContextValue extends Settings {
  setMusicOn: (value: boolean) => void;
  setSfxOn: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setNightMode: (value: boolean) => void;
}

const defaultSettings: Settings = {
  musicOn: true,
  sfxOn: true,
  reducedMotion: false,
  nightMode: false,
};

export const SettingsContext = createContext<SettingsContextValue>({
  ...defaultSettings,
  setMusicOn: () => {},
  setSfxOn: () => {},
  setReducedMotion: () => {},
  setNightMode: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw) as Partial<Settings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      })
      .catch(() => {
        // Storage failures should not block play.
      })
      .finally(() => setLoaded(true));
    return () => { mounted = false; };
  }, []);

  const save = useCallback((next: Settings) => {
    setSettings(next);
    setSfxEnabled(next.sfxOn);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setMusicOn = useCallback((musicOn: boolean) => save({ ...settings, musicOn }), [settings, save]);
  const setSfxOn = useCallback((sfxOn: boolean) => save({ ...settings, sfxOn }), [settings, save]);
  const setReducedMotion = useCallback((reducedMotion: boolean) => save({ ...settings, reducedMotion }), [settings, save]);
  const setNightMode = useCallback((nightMode: boolean) => save({ ...settings, nightMode }), [settings, save]);

  const value: SettingsContextValue = {
    ...settings,
    setMusicOn,
    setSfxOn,
    setReducedMotion,
    setNightMode,
  };

  useEffect(() => {
    if (loaded) {
      setSfxEnabled(settings.sfxOn);
    }
  }, [loaded, settings.sfxOn]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
