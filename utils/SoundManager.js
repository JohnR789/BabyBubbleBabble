import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { SOUNDS } from '../assets';

const DEBUG_AUDIO = false;
const debugLog = (...args) => { if (DEBUG_AUDIO) console.log('[SoundManager]', ...args); };

const POP_KEYS = ['pop1', 'pop2', 'pop3'];

let audioModeSet = false;
let sfxEnabled = true;
const cache = new Map();

async function ensureAudioMode() {
  if (audioModeSet) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    });
    audioModeSet = true;
    debugLog('Audio mode configured');
  } catch {
    // Swallow to keep play functional in unsupported environments.
  }
}

function getPlayer(key, src) {
  if (!cache.has(key)) {
    debugLog('Creating player for', key);
    cache.set(key, createAudioPlayer(src));
  }
  return cache.get(key);
}

function replay(player) {
  try {
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {}
}

export function setSfxEnabled(enabled) {
  sfxEnabled = enabled;
}

export function isSfxEnabled() {
  return sfxEnabled;
}

export async function preloadCoreSfx() {
  try {
    await ensureAudioMode();
    getPlayer('giggle', SOUNDS.giggles.giggle1);
    POP_KEYS.forEach((k) => getPlayer(`pop:${k}`, SOUNDS.pops[k]));
  } catch {}
}

export async function playPopSound() {
  if (!sfxEnabled) return;
  try {
    await ensureAudioMode();
    const key = POP_KEYS[Math.floor(Math.random() * POP_KEYS.length)];
    replay(getPlayer(`pop:${key}`, SOUNDS.pops[key]));
  } catch {}
}

export async function playGiggleSound() {
  if (!sfxEnabled) return;
  try {
    await ensureAudioMode();
    replay(getPlayer('giggle', SOUNDS.giggles.giggle1));
  } catch {}
}

export async function playAnimalSound(name) {
  if (!sfxEnabled) return;
  const src = SOUNDS.animalSounds[name];
  if (!src) return;
  try {
    await ensureAudioMode();
    replay(getPlayer(`animal:${name}`, src));
  } catch {}
}

export async function playBounceSound() {
  if (!sfxEnabled) return;
  try {
    await ensureAudioMode();
    replay(getPlayer('effect:bounce', SOUNDS.effects.bounce));
  } catch {}
}

export async function playSplashSound() {
  if (!sfxEnabled) return;
  try {
    await ensureAudioMode();
    replay(getPlayer('effect:splash', SOUNDS.effects.splash));
  } catch {}
}

export async function playSnapSound() {
  if (!sfxEnabled) return;
  try {
    await ensureAudioMode();
    replay(getPlayer('effect:snap', SOUNDS.effects.snap));
  } catch {}
}

export async function playClackSound() {
  if (!sfxEnabled) return;
  try {
    await ensureAudioMode();
    replay(getPlayer('effect:clack', SOUNDS.effects.clack));
  } catch {}
}

export async function playChimeSound() {
  if (!sfxEnabled) return;
  try {
    await ensureAudioMode();
    replay(getPlayer('effect:chime', SOUNDS.effects.chime));
  } catch {}
}

export async function unloadAll() {
  for (const [, player] of cache) {
    try {
      player.remove();
    } catch {}
  }
  cache.clear();
  audioModeSet = false;
}
