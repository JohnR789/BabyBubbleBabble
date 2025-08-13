import { useEffect, useContext, useRef } from 'react';
import { Audio } from 'expo-av';
import { SettingsContext } from '../SettingsContext';

// Preload all 10 lullaby files
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
  const { musicOn } = useContext(SettingsContext);
  const musicRef = useRef(null);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    // Cleanup function to unload sound
    async function cleanup() {
      if (musicRef.current) {
        try {
          await musicRef.current.stopAsync();
          await musicRef.current.unloadAsync();
          musicRef.current = null;
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }

    // Play the lullaby at current index and set up onPlaybackStatusUpdate
    async function playLullaby(index) {
      await cleanup();

      const sound = new Audio.Sound();
      try {
        await sound.loadAsync(lullabies[index]);
        musicRef.current = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish && musicOn) {
            // Play next lullaby, loop back to 0 after last
            currentIndexRef.current = (index + 1) % lullabies.length;
            playLullaby(currentIndexRef.current);
          }
        });

        await sound.playAsync();
      } catch (error) {
        console.log('Failed to load/play lullaby:', error);
      }
    }

    if (musicOn) {
      playLullaby(currentIndexRef.current);
    } else {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [musicOn]);

  return null;
}
