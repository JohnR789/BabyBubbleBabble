// utils/SoundManager.js
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

/** Toggle for local debugging (kept false to silence logs) */
const DEBUG_AUDIO = false;
const debugLog = (...args) => { if (DEBUG_AUDIO) console.log('[SoundManager]', ...args); };

/* ------------------------------------------------------------------ */
/* Sources                                                            */
/* ------------------------------------------------------------------ */
const SOURCES = {
  pop:    require('../assets/sounds/pops/pop1.mp3'),
  giggle: require('../assets/sounds/giggles/giggle1.mp3'),
};

const animalSounds = {
  duck:  require('../assets/sounds/animal_sounds/duck.mp3'),
  sheep: require('../assets/sounds/animal_sounds/sheep.wav'),
  frog:  require('../assets/sounds/animal_sounds/frog.mp3'),
  horse: require('../assets/sounds/animal_sounds/horse.wav'),
  cow:   require('../assets/sounds/animal_sounds/cow.wav'),
};

/* ------------------------------------------------------------------ */
/* Cache (key -> { sound, loaded, loading })                          */
/* ------------------------------------------------------------------ */
const cache = new Map();
let audioModeSet = false;

/* ------------------------------------------------------------------ */
/* Audio mode                                                         */
/*  - iOS: uses iOS keys only                                         */
/*  - Android: avoids interruptionModeAndroid (was causing warning)   */
/* ------------------------------------------------------------------ */
export async function ensureAudioMode() {
  if (audioModeSet) return;

  try {
    if (Platform.OS === 'ios') {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        staysActiveInBackground: false,
      });
    } else if (Platform.OS === 'android') {
      await Audio.setAudioModeAsync({
        // NOTE: We intentionally do NOT set interruptionModeAndroid to avoid
        //       "invalid value" warnings on newer SDKs.
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
    } else {
      await Audio.setAudioModeAsync({});
    }

    audioModeSet = true;
    debugLog('Audio mode configured');
  } catch {
    // Swallow to keep logs clean in production
  }
}

/* ------------------------------------------------------------------ */
/* Load / replay helpers                                              */
/* ------------------------------------------------------------------ */
async function ensureLoaded(key, src) {
  await ensureAudioMode();

  let entry = cache.get(key);
  if (!entry) {
    entry = { sound: new Audio.Sound(), loaded: false, loading: null };
    cache.set(key, entry);
  }

  if (!entry.loaded) {
    if (!entry.loading) {
      entry.loading = entry.sound
        .loadAsync(src, { shouldPlay: false, volume: 1.0 }, false)
        .then(() => { entry.loaded = true; })
        .catch(() => {
          // Reset entry so future attempts can try again
          entry.loading = null;
          entry.loaded = false;
          throw new Error('load failed');
        });
    }
    await entry.loading;
  }

  return entry.sound;
}

async function safeReplay(sound) {
  try {
    await sound.replayAsync();
  } catch {
    try { await sound.setPositionAsync(0); } catch {}
    try { await sound.playAsync(); } catch {}
  }
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */
export async function preloadCoreSfx() {
  try {
    await Promise.all([
      ensureLoaded('pop', SOURCES.pop),
      ensureLoaded('giggle', SOURCES.giggle),
    ]);
  } catch {}
}

export async function playPopSound() {
  try {
    const s = await ensureLoaded('pop', SOURCES.pop);
    await safeReplay(s);
  } catch {}
}

export async function playGiggleSound() {
  try {
    const s = await ensureLoaded('giggle', SOURCES.giggle);
    await safeReplay(s);
  } catch {}
}

export async function playAnimalSound(name) {
  const src = animalSounds[name];
  if (!src) return;
  try {
    const s = await ensureLoaded(name, src);
    await safeReplay(s);
  } catch {}
}

export async function unloadAll() {
  for (const [, entry] of cache) {
    try {
      if (entry.loading) await entry.loading;
      await entry.sound.unloadAsync();
    } catch {}
  }
  cache.clear();
  audioModeSet = false; // allow re-init after full unload
}



