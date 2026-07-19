import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { SOUNDS } from '../assets';

/** Toggle for local debugging (kept false to silence logs) */
const DEBUG_AUDIO = false;
const debugLog = (...args) => { if (DEBUG_AUDIO) console.log('[SoundManager]', ...args); };

const SOURCES = {
  pop: SOUNDS.pops.pop1,
  giggle: SOUNDS.giggles.giggle1,
};

/* ------------------------------------------------------------------ */
/* Cache (key -> { sound, loaded, loading })                           */
/* ------------------------------------------------------------------ */
const cache = new Map();
let audioModeSet = false;
let sfxEnabled = true;

/* ------------------------------------------------------------------ */
/* Audio mode                                                         */
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
export function setSfxEnabled(enabled) {
  sfxEnabled = enabled;
}

export function isSfxEnabled() {
  return sfxEnabled;
}

export async function preloadCoreSfx() {
  try {
    await Promise.all([
      ensureLoaded('pop', SOURCES.pop),
      ensureLoaded('giggle', SOURCES.giggle),
    ]);
  } catch {}
}

export async function playPopSound() {
  if (!sfxEnabled) return;
  try {
    const s = await ensureLoaded('pop', SOURCES.pop);
    await safeReplay(s);
  } catch {}
}

export async function playGiggleSound() {
  if (!sfxEnabled) return;
  try {
    const s = await ensureLoaded('giggle', SOURCES.giggle);
    await safeReplay(s);
  } catch {}
}

export async function playAnimalSound(name) {
  if (!sfxEnabled) return;
  const src = SOUNDS.animalSounds[name];
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
  audioModeSet = false;
}
