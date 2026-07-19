import { useEffect, useRef, useContext, useMemo } from 'react';
import { AppState } from 'react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { SettingsContext } from '../SettingsContext';
import { SOUNDS } from '../assets';

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

export default function MusicManager({ forceOn = undefined, volume = 0.6, log = false }) {
  const ctx = useContext(SettingsContext);
  const musicOn = forceOn ?? (ctx?.musicOn ?? false);
  const mlog = makeLogger(DEBUG_MUSIC || log);

  const appStateRef = useRef(AppState.currentState);
  const indexRef = useRef(0);

  const initialSource = useMemo(
    () => lullabies[Math.floor(Math.random() * lullabies.length)],
    [],
  );
  const player = useAudioPlayer(initialSource);

  // Configure audio mode once on mount.
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    }).catch(() => {});
  }, []);

  // Apply volume and non-looping settings.
  useEffect(() => {
    player.loop = false;
    player.volume = volume;
  }, [player, volume]);

  // Play/pause and advance tracks.
  useEffect(() => {
    const playIndex = (i) => {
      indexRef.current = i;
      mlog('play', i);
      try {
        player.replace(lullabies[i]);
        player.play();
      } catch {}
    };

    const advance = () => {
      const next = (indexRef.current + 1) % lullabies.length;
      playIndex(next);
    };

    const onPlaybackStatus = (status) => {
      if (status?.didJustFinish && musicOn) {
        advance();
      }
    };

    const statusSub = player.addListener('playbackStatusUpdate', onPlaybackStatus);

    const onAppState = (state) => {
      appStateRef.current = state;
      if (state !== 'active') {
        try { player.pause(); } catch {}
      } else if (musicOn) {
        playIndex(indexRef.current);
      }
    };
    const appSub = AppState.addEventListener('change', onAppState);

    if (musicOn && appStateRef.current === 'active') {
      playIndex(indexRef.current);
    } else {
      try { player.pause(); } catch {}
    }

    return () => {
      try { statusSub?.remove(); } catch {}
      appSub?.remove();
      try { player.pause(); } catch {}
    };
  }, [musicOn, player, mlog]);

  return null;
}
