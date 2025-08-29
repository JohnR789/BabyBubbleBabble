// utils/SoundManager.js
import { Audio } from 'expo-av';

// -------- Sources --------
const SOURCES = {
  pop: require('../assets/sounds/pops/pop1.mp3'),
  giggle: require('../assets/sounds/giggles/giggle1.mp3'),
};

const animalSounds = {
  duck_quack: require('../assets/sounds/animal_sounds/duck.mp3'),
  sheep_baa:  require('../assets/sounds/animal_sounds/sheep.wav'),
  frog_ribbit: require('../assets/sounds/animal_sounds/frog.mp3'),
  horse:       require('../assets/sounds/animal_sounds/horse.wav'),
  cow:         require('../assets/sounds/animal_sounds/cow.wav'),
};

// -------- Simple cache (key → { sound, loading }) --------
const cache = {};
let audioModeSet = false;

async function ensureAudioMode() {
  if (audioModeSet) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    audioModeSet = true;
  } catch {}
}

async function ensureLoaded(key, src) {
  await ensureAudioMode();
  let entry = cache[key];
  if (!entry) entry = cache[key] = { sound: new Audio.Sound(), loading: null };

  if (!entry.loading) {
    entry.loading = entry.sound
      .loadAsync(src, { shouldPlay: false, volume: 1.0 }, false)
      .catch((e) => {
        console.warn(`[SoundManager] Failed to load "${key}":`, e);
        cache[key] = { sound: new Audio.Sound(), loading: null };
        throw e;
      });
  }
  await entry.loading;
  return entry.sound;
}

async function safeReplay(sound) {
  try {
    await sound.replayAsync();
  } catch {
    try { await sound.setPositionAsync(0); } catch {}
    await sound.playAsync();
  }
}

export async function ensurePopLoaded()    { return ensureLoaded('pop', SOURCES.pop); }
export async function ensureGiggleLoaded() { return ensureLoaded('giggle', SOURCES.giggle); }

export async function preloadCoreSfx() {
  try { await Promise.all([ensurePopLoaded(), ensureGiggleLoaded()]); } catch {}
}

export async function playPopSound() {
  try { await safeReplay(await ensureLoaded('pop', SOURCES.pop)); }
  catch (e) { console.warn('Error playing pop sound:', e); }
}

export async function playGiggleSound() {
  try { await safeReplay(await ensureLoaded('giggle', SOURCES.giggle)); }
  catch (e) { console.warn('Error playing giggle sound:', e); }
}

export async function playAnimalSound(name) {
  const src = animalSounds[name];
  if (!src) { console.warn(`Animal sound not found: ${name}`); return; }
  try { await safeReplay(await ensureLoaded(name, src)); }
  catch (e) { console.warn(`Failed to load/play sound for ${name}:`, e); }
}

export async function unloadAll() {
  for (const key of Object.keys(cache)) {
    const entry = cache[key];
    try {
      await entry.loading;
      if (entry.sound) await entry.sound.unloadAsync();
    } catch {}
    delete cache[key];
  }
}



