// utils/MusicManager.js
import { useEffect, useRef, useContext } from 'react';
import { AppState, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { SettingsContext } from '../SettingsContext';
import { ensureAudioMode } from './SoundManager';

/** Toggle local debugging (kept false to silence logs) */
const DEBUG_MUSIC = false;
const makeLogger = (flag) => (...a) => { if (flag) console.log('[Music]', ...a); };

const lullabies = [
  require('../assets/sounds/music/TinyToes.mp3'),
  require('../assets/sounds/music/SunnyDays.mp3'),
  require('../assets/sounds/music/SunnyDayParade.mp3'),
  require('../assets/sounds/music/TwinkleTickleToes.mp3'),
  require('../assets/sounds/music/HappyDayParade.mp3'),
  require('../assets/sounds/music/TwinkleToes.mp3'),
  require('../assets/sounds/music/SunnyDaysandSillyWays.mp3'),
  require('../assets/sounds/music/SkippingDreams.mp3'),
  require('../assets/sounds/music/BubbleBounce.mp3'),
  require('../assets/sounds/music/QuackQuackPlaytime.mp3'),
];

export default function MusicManager({ forceOn, volume = 0.6, log = false }) {
  const ctx = useContext(SettingsContext);
  const musicOn = forceOn ?? (ctx?.musicOn ?? false);

  const mlog = makeLogger(DEBUG_MUSIC || log);

  const soundRef = useRef(null);          // Audio.Sound | null
  const indexRef = useRef(0);             // current track index
  const mountedRef = useRef(true);        // component mounted flag
  const appStateRef = useRef(AppState.currentState);
  const switchingRef = useRef(false);     // guards next-track reentry

  async function cleanup() {
    const s = soundRef.current;
    soundRef.current = null;
    if (s) {
      try { s.setOnPlaybackStatusUpdate(null); } catch {}
      try { await s.stopAsync(); } catch {}
      try { await s.unloadAsync(); } catch {}
    }
  }

  const nextIndex = (i) => (i + 1) % lullabies.length;

  async function loadAndPlay(i) {
    if (!mountedRef.current || !musicOn) return;
    if (switchingRef.current) return;
    switchingRef.current = true;

    await ensureAudioMode();
    await cleanup();

    const s = new Audio.Sound();

    s.setOnPlaybackStatusUpdate((status) => {
      if (!mountedRef.current) return;
      // Keep logs quiet in production; toggle DEBUG_MUSIC/log to see details.
      if (!status.isLoaded) {
        // If a file fails, skip ahead gracefully
        if (status.error) {
          mlog('status error; advancing', status.error);
          void loadAndPlay(nextIndex(indexRef.current));
        }
        return;
      }
      if (status.didJustFinish && musicOn) {
        void loadAndPlay(nextIndex(indexRef.current));
      }
    });

    try {
      indexRef.current = i;
      await s.loadAsync(lullabies[i], { shouldPlay: false, volume }, false);
      soundRef.current = s;
      await s.setVolumeAsync(volume);
      await s.playAsync();
    } catch {
      // Advance on any load/play error
      try { await cleanup(); } catch {}
      if (mountedRef.current && musicOn) {
        void loadAndPlay(nextIndex(i));
      }
    } finally {
      switchingRef.current = false;
    }
  }

  // Handle mount/unmount + AppState (pause on background, resume on active)
  useEffect(() => {
    mountedRef.current = true;

    const onChange = async (state) => {
      appStateRef.current = state;
      const s = soundRef.current;

      if (state !== 'active') {
        // Proactively pause on background/inactive to avoid OS conflicts
        try { await s?.pauseAsync(); } catch {}
      } else {
        // Came back foreground: if music is on, resume or start fresh
        if (!musicOn) return;
        if (s) {
          try {
            const st = await s.getStatusAsync();
            if (st.isLoaded && !st.isPlaying) {
              await s.playAsync();
            }
          } catch {}
        } else {
          indexRef.current = Math.floor(Math.random() * lullabies.length);
          void loadAndPlay(indexRef.current);
        }
      }
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => { mountedRef.current = false; sub?.remove(); void cleanup(); };
  }, [musicOn]);

  // React to musicOn toggle
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (musicOn) {
        await ensureAudioMode();
        // If app is active, start (or ensure) playback
        if (appStateRef.current === 'active') {
          indexRef.current = Math.floor(Math.random() * lullabies.length);
          if (!cancelled) void loadAndPlay(indexRef.current);
        }
      } else {
        await cleanup();
      }
    })();
    return () => { cancelled = true; };
  }, [musicOn]);

  // React to volume changes
  useEffect(() => {
    const s = soundRef.current;
    (async () => {
      try { await s?.setVolumeAsync(volume); } catch {}
    })();
  }, [volume]);

  // This component renders nothing
  return null;
}
