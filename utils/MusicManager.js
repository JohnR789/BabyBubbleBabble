import { useEffect, useContext, useRef } from 'react';
import { Audio } from 'expo-av';
import { SettingsContext } from '../SettingsContext';

// Keep your existing imports:
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

export default function MusicManager() {
  const ctx = useContext(SettingsContext);
  const musicOn = ctx?.musicOn ?? false;

  const musicRef = useRef(null);
  const currentIndexRef = useRef(0);

  async function cleanup() {
    if (musicRef.current) {
      try {
        await musicRef.current.stopAsync();
        await musicRef.current.unloadAsync();
      } catch {}
      musicRef.current = null;
    }
  }

  async function playIndex(i) {
    await cleanup();
    const sound = new Audio.Sound();
    try {
      await sound.loadAsync(lullabies[i]);
      musicRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish && musicOn) {
          currentIndexRef.current = (i + 1) % lullabies.length;
          playIndex(currentIndexRef.current);
        }
      });
      await sound.playAsync();
    } catch (error) {
      // silent fail is fine for UX here
    }
  }

  useEffect(() => {
    if (musicOn) {
      // randomize the FIRST track on every mount / toggle-on
      currentIndexRef.current = Math.floor(Math.random() * lullabies.length);
      playIndex(currentIndexRef.current);
    } else {
      cleanup();
    }
    return () => { cleanup(); };
  }, [musicOn]);

  return null;
}

