import { useEffect, useRef, useContext } from 'react';
import { AppState } from 'react-native';
import { SettingsContext } from '../SettingsContext';
import { playMusic, pauseMusic } from './SoundManager';

export default function MusicManager({ forceOn = undefined }) {
  const ctx = useContext(SettingsContext);
  const musicOn = forceOn ?? (ctx?.musicOn ?? false);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      appStateRef.current = state;
      if (state !== 'active') {
        pauseMusic().catch(() => {});
      } else if (musicOn) {
        playMusic().catch(() => {});
      }
    });

    if (musicOn && appStateRef.current === 'active') {
      playMusic().catch(() => {});
    } else {
      pauseMusic().catch(() => {});
    }

    return () => {
      sub?.remove();
      pauseMusic().catch(() => {});
    };
  }, [musicOn]);

  return null;
}
