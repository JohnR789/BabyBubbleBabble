import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { SOUNDS } from '../assets';

const DEBUG_AUDIO = false;
const debugLog = (...args) => { if (DEBUG_AUDIO) console.log('[SoundManager]', ...args); };

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
    Object.entries(SOUNDS.effects).forEach(([key, src]) => {
      getPlayer(`effect:${key}`, src);
    });
    getPlayer('music:ambient', SOUNDS.music.ambient);
  } catch {}
}

export async function playEffect(name) {
  if (!sfxEnabled) return;
  const src = SOUNDS.effects[name];
  if (!src) return;
  try {
    await ensureAudioMode();
    replay(getPlayer(`effect:${name}`, src));
  } catch {}
}

export async function playPop() { return playEffect('pop'); }
export async function playSnap() { return playEffect('snap'); }
export async function playPlop() { return playEffect('plop'); }
export async function playScoop() { return playEffect('scoop'); }
export async function playWaterPour() { return playEffect('waterPour'); }
export async function playRattle() { return playEffect('rattle'); }
export async function playBell() { return playEffect('bell'); }
export async function playDrum() { return playEffect('drum'); }
export async function playSuccess() { return playEffect('success'); }

export async function playMusic() {
  try {
    await ensureAudioMode();
    const p = getPlayer('music:ambient', SOUNDS.music.ambient);
    p.loop = true;
    p.play();
  } catch {}
}

export async function pauseMusic() {
  try {
    const p = cache.get('music:ambient');
    p?.pause();
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
