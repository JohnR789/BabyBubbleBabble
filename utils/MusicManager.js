import { useEffect, useRef, useContext, useCallback } from 'react';
import { AppState } from 'react-native';
import { Audio } from 'expo-av';
import { SettingsContext } from '../SettingsContext';
import { SOUNDS } from '../assets';
import { ensureAudioMode } from './SoundManager';

/** Toggle local debugging (kept false to silence logs) */
const DEBUG_MUSIC = false;
const makeLogger = (flag) => (...a) => { if (flag) console.log('[Music]', ...a); };

const lullabies = [
  SOUNDS.music.TinyToes,
  SOUNDS.music.SunnyDays,
  SOUNDS.music.SunnyDayParade,
  SOUNDS.music.TwinkleTickleToes,
  SOUNDS.music.HappyDayParade,
  SOUNDS.music.TwinkleToes,
  SOUNDS.music.SunnyDaysandSillyWays,
  SOUNDS.music.SkippingDreams,
  SOUNDS.music.BubbleBounce,
  SOUNDS.music.QuackQuackPlaytime,
];

export default function MusicManager({ forceOn, volume = 0.6, log = false }) {
  const ctx = useContext(SettingsContext);
  const musicOn = forceOn ?? (ctx?.musicOn ?? false);

  const mlog = makeLogger(DEBUG_MUSIC || log);

  const soundRef = useRef(null);
  const indexRef = useRef(0);
  const mountedRef = useRef(true);
  const appStateRef = useRef(AppState.currentState);
  const switchingRef = useRef(false);

  const cleanup = useCallback(async () => {
    const s = soundRef.current;
    soundRef.current = null;
    if (s) {
      try { s.setOnPlaybackStatusUpdate(null); } catch {}
      try { await s.stopAsync(); } catch {}
      try { await s.unloadAsync(); } catch {}
    }
  }, []);

  const nextIndex = useCallback((i) => (i + 1) % lullabies.length, []);

  const loadAndPlay = useCallback(async (i) => {
    if (!mountedRef.current || !musicOn) return;
    if (switchingRef.current) return;
    switchingRef.current = true;

    await ensureAudioMode();
    await cleanup();

    const s = new Audio.Sound();

    s.setOnPlaybackStatusUpdate((status) => {
      if (!mountedRef.current) return;
      if (!status.isLoaded) {
        if (status.error) {
          mlog('status error; advancing', status.error);
          loadAndPlay(nextIndex(indexRef.current)).catch(() => {});
        }
        return;
      }
      if (status.didJustFinish && musicOn) {
        loadAndPlay(nextIndex(indexRef.current)).catch(() => {});
      }
    });

    try {
      indexRef.current = i;
      await s.loadAsync(lullabies[i], { shouldPlay: false, volume }, false);
      soundRef.current = s;
      await s.setVolumeAsync(volume);
      await s.playAsync();
    } catch {
      try { await cleanup(); } catch {}
      if (mountedRef.current && musicOn) {
        loadAndPlay(nextIndex(i)).catch(() => {});
      }
    } finally {
      switchingRef.current = false;
    }
  }, [musicOn, volume, cleanup, mlog, nextIndex]);

  // Handle mount/unmount + AppState (pause on background, resume on active)
  useEffect(() => {
    mountedRef.current = true;

    const onChange = async (state) => {
      appStateRef.current = state;
      const s = soundRef.current;

      if (state !== 'active') {
        try { await s?.pauseAsync(); } catch {}
      } else {
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
          loadAndPlay(indexRef.current).catch(() => {});
        }
      }
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => { mountedRef.current = false; sub?.remove(); cleanup().catch(() => {}); };
  }, [musicOn, loadAndPlay, cleanup]);

  // React to musicOn toggle
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (musicOn) {
        await ensureAudioMode();
        if (appStateRef.current === 'active') {
          indexRef.current = Math.floor(Math.random() * lullabies.length);
          if (!cancelled) loadAndPlay(indexRef.current).catch(() => {});
        }
      } else {
        await cleanup();
      }
    })();
    return () => { cancelled = true; };
  }, [musicOn, loadAndPlay, cleanup]);

  // React to volume changes
  useEffect(() => {
    const s = soundRef.current;
    (async () => {
      try { await s?.setVolumeAsync(volume); } catch {}
    })();
  }, [volume]);

  return null;
}
